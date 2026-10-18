#!/usr/bin/env python3
"""Assemble the film: conform every shot clip to its timeline slot, concatenate,
mix narration + ducked music, normalise loudness, add subtitles.

Usage:
  python3 assemble.py <project_dir> [--out out/final.mp4] [--bgm audio/bgm.mp3]
                      [--bgm-volume 0.22] [--no-duck] [--subs burn|soft|none]
                      [--font "Noto Sans CJK SC"] [--font-size 0] [--lufs -16]
                      [--storyboard storyboard.json] [--timeline audio/timeline.json]

Each shot's clip is <project>/scenes/<id>/clip.mp4 unless the storyboard shot has
"clip" (or a "source" ending in .mp4). A missing clip becomes a slate showing the
shot id and its "visual" text, so an animatic can be cut before any scene exists.
Clips are scaled and padded to the frame, trimmed or held on their last frame to
the exact slot length, so cuts land where timeline.json says.
"""
import argparse, json, shutil, subprocess, sys, tempfile
from pathlib import Path


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-3000:])
        sys.exit(f"command failed: {' '.join(cmd[:6])} …")
    return r


def esc_filter_path(p):
    return str(p).replace("\\", "/").replace(":", r"\:").replace("'", r"\'")


def esc_drawtext(s):
    return s.replace("\\", "\\\\").replace(":", r"\:").replace("'", "’").replace("%", r"\%")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--storyboard", default="storyboard.json")
    ap.add_argument("--timeline", default="audio/timeline.json")
    ap.add_argument("--narration", default="audio/narration.wav")
    ap.add_argument("--subtitles", default="audio/subs.srt")
    ap.add_argument("--out", default="out/final.mp4")
    ap.add_argument("--bgm", default=None)
    ap.add_argument("--bgm-volume", type=float, default=0.22)
    ap.add_argument("--sfx", default=None, help="a sound-effects track as long as the film (ticks, whooshes)")
    ap.add_argument("--sfx-volume", type=float, default=0.6)
    ap.add_argument("--no-duck", action="store_true")
    ap.add_argument("--subs", choices=["burn", "soft", "none"], default="burn")
    ap.add_argument("--font", default="Noto Sans CJK SC")
    ap.add_argument("--font-size", type=float, default=0, help="ASS size; 0 = 18 for landscape, 12 for portrait")
    ap.add_argument("--lufs", type=float, default=-16.0)
    ap.add_argument("--crf", type=int, default=18)
    a = ap.parse_args()

    proj = Path(a.project).resolve()
    board = json.loads((proj / a.storyboard).read_text(encoding="utf-8"))
    tl = json.loads((proj / a.timeline).read_text(encoding="utf-8"))
    meta = board.get("meta", {})
    W, H, FPS = int(meta.get("width", 1920)), int(meta.get("height", 1080)), int(meta.get("fps", 30))
    by_id = {s["id"]: s for s in board["shots"]}
    total = float(tl["total"])
    out = (proj / a.out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="assemble_"))

    font_file = None
    try:
        # Use the named font if it is installed, else any font that really has Chinese glyphs.
        installed = subprocess.run(["fc-list", a.font, "file"], capture_output=True, text=True).stdout.strip()
        pattern = a.font if installed else ":lang=zh-cn"
        font_file = subprocess.run(["fc-match", "-f", "%{file}", pattern],
                                   capture_output=True, text=True).stdout.strip() or None
    except FileNotFoundError:
        pass

    # 1. Conform each shot to its slot.
    parts, slates = [], []
    for s in tl["shots"]:
        sid, dur = s["id"], float(s["duration"])
        b = by_id.get(sid, {})
        clip = b.get("clip") or (b.get("source") if str(b.get("source", "")).endswith(".mp4") else None)
        clip = proj / (clip or f"scenes/{sid}/clip.mp4")
        part = work / f"{sid}.mp4"
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,"
              f"fps={FPS},setsar=1,tpad=stop_mode=clone:stop_duration={dur:.3f},format=yuv420p")
        if clip.exists():
            cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(clip), "-vf", vf]
        else:
            slates.append(sid)
            text = esc_drawtext(f"{sid}  {b.get('visual', '')}"[:60])
            draw = f"drawtext=text='{text}':fontcolor=0xE8E4DA:fontsize={H // 22}:x=(w-tw)/2:y=(h-th)/2"
            if font_file:
                draw += f":fontfile='{esc_filter_path(font_file)}'"
            cmd = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c=0x1d1c1a:s={W}x{H}:r={FPS}:d={dur:.3f}",
                   "-vf", f"{draw},format=yuv420p"]
        cmd += ["-t", f"{dur:.3f}", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "14",
                "-r", str(FPS), str(part)]
        run(cmd)
        parts.append(part)

    # 2. Concatenate (all parts share codec settings, so stream copy is exact).
    listing = work / "list.txt"
    listing.write_text("".join(f"file '{p}'\n" for p in parts), encoding="utf-8")
    video = work / "video.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(video)])

    # 3. Audio: narration, music looped under it and ducked by it, loudness normalised.
    narr = proj / a.narration
    inputs = ["-i", str(video)]
    fc, amap = [], None
    have_narr = narr.exists()
    if have_narr:
        inputs += ["-i", str(narr)]
    if a.bgm:
        inputs += ["-stream_loop", "-1", "-i", str(proj / a.bgm)]
    bgm_idx = 2 if have_narr else 1
    sfx_idx = 1 + int(have_narr) + int(bool(a.bgm))
    if a.sfx:
        inputs += ["-i", str(proj / a.sfx)]
        fc.append(f"[{sfx_idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume={a.sfx_volume},apad,atrim=0:{total:.3f}[fx]")
    fxin = "[fx]" if a.sfx else ""
    nmix = lambda base: base + (1 if a.sfx else 0)
    if have_narr and a.bgm:
        fc.append(f"[1:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[nv][nsc]")
        fc.append(f"[{bgm_idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume={a.bgm_volume}[m]")
        if a.no_duck:
            fc.append("[m]anull[md]")
        else:
            fc.append("[m][nsc]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=500[md]")
        fc.append(f"[nv][md]{fxin}amix=inputs={nmix(2)}:normalize=0:duration=longest,atrim=0:{total:.3f},"
                  f"loudnorm=I={a.lufs}:TP=-1.5:LRA=11[aout]")
        amap = "[aout]"
    elif have_narr:
        fc.append(f"[1:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=0:{total:.3f}[nv]")
        fc.append(f"[nv]{fxin}amix=inputs={nmix(1)}:normalize=0:duration=first,loudnorm=I={a.lufs}:TP=-1.5:LRA=11[aout]")
        amap = "[aout]"
    elif a.bgm:
        fc.append(f"[1:a]aresample=48000,aformat=channel_layouts=stereo,volume={a.bgm_volume},atrim=0:{total:.3f},"
                  f"afade=t=out:st={max(0, total - 2):.3f}:d=2,loudnorm=I={a.lufs}:TP=-1.5:LRA=11[aout]")
        amap = "[aout]"

    # 4. Subtitles.
    srt = proj / a.subtitles
    vmap, vcodec = "0:v", ["-c:v", "copy"]
    extra_sub = []
    if a.subs == "burn" and srt.exists():
        size = a.font_size or (18 if W >= H else 12)
        # White text on a translucent dark box: readable on paper-white and on dark scenes alike.
        style = (f"FontName={a.font},FontSize={size},PrimaryColour=&H00FFFFFF,OutlineColour=&H59000000,"
                 f"BackColour=&H59000000,BorderStyle=3,Outline=0.8,Shadow=0,MarginV={int(16 if W >= H else 40)}")
        fc.append(f"[0:v]subtitles='{esc_filter_path(srt)}':force_style='{style}'[vout]")
        vmap, vcodec = "[vout]", ["-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p"]
    elif a.subs == "soft" and srt.exists():
        extra_sub = ["-i", str(srt)]

    cmd = ["ffmpeg", "-v", "error", "-y"] + inputs + extra_sub
    if fc:
        cmd += ["-filter_complex", ";".join(fc)]
    cmd += ["-map", vmap]
    if amap:
        cmd += ["-map", amap, "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    if extra_sub:
        sub_idx = len([x for x in inputs if x == "-i"])
        cmd += ["-map", f"{sub_idx}:s", "-c:s", "mov_text", "-metadata:s:s:0", "language=chi"]
    cmd += vcodec + ["-t", f"{total:.3f}", "-movflags", "+faststart", str(out)]
    run(cmd)
    shutil.rmtree(work, ignore_errors=True)

    print(f"wrote {out}  ({total:.2f}s, {len(parts)} shots, {W}×{H}@{FPS})")
    if slates:
        print(f"slates (no clip yet): {', '.join(slates)}")
    if not have_narr:
        print("no narration.wav: video has music only or no audio")


if __name__ == "__main__":
    main()
