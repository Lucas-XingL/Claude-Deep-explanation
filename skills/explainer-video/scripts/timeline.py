#!/usr/bin/env python3
"""Build the narration timeline from storyboard.json, script.md and per-line audio.

Usage:
  python3 timeline.py <project_dir> [--storyboard storyboard.json] [--script script.md]
                      [--lines audio/lines] [--gap 0.25] [--section-gap 0.6]
                      [--max-chars 16] [--tail 1.0]

Reads   <project>/storyboard.json, <project>/script.md, <project>/audio/lines/<Lxxx>.(wav|mp3|m4a)
Writes  <project>/audio/timeline.json   shot and line start/end times (seconds)
        <project>/audio/narration.wav   all lines placed on one track (48 kHz mono)
        <project>/audio/subs.srt        subtitles, long lines split at punctuation

Lines missing audio get an estimated duration (chars / 4.2 per second) and are
reported, so the visuals can be blocked out before the voice-over exists.
"""
import argparse, json, re, subprocess, sys, tempfile
from pathlib import Path

LINE_RE = re.compile(r"^\[(L\d+)\]\s*(.+?)\s*$")
FACT_RE = re.compile(r"\{F\d+\}")
SAY_RE = re.compile(r"<读作：(.+?)>")
AUDIO_EXT = (".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg")
SR = 48000


def parse_script(path):
    """Return {line_id: {"text", "say", "section"}} in file order."""
    lines, section = {}, 0
    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if s.startswith("## "):
            section += 1
            continue
        m = LINE_RE.match(s)
        if not m:
            continue
        lid, body = m.groups()
        say = SAY_RE.search(body)
        text = SAY_RE.sub("", FACT_RE.sub("", body)).strip()
        lines[lid] = {"text": text, "say": say.group(1).strip() if say else text, "section": section}
    return lines


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def find_audio(lines_dir, lid):
    for ext in AUDIO_EXT:
        p = Path(lines_dir) / f"{lid}{ext}"
        if p.exists():
            return p
    return None


def split_sub(text, max_chars):
    """Split a line into subtitle chunks of at most max_chars, preferring punctuation."""
    text = text.strip()
    if len(text) <= max_chars:
        return [text]
    parts = [p for p in re.split(r"(?<=[，。！？；：、,.!?;:])", text) if p.strip()]
    chunks, cur = [], ""
    for p in parts:
        if len(cur) + len(p) <= max_chars:
            cur += p
            continue
        if cur:
            chunks.append(cur)
        while len(p) > max_chars:
            # Cut at a space if there is one, never inside a Latin word or a number.
            cut = p.rfind(" ", 1, max_chars + 1)
            if cut <= 0:
                cut = max_chars
                while 0 < cut < len(p) and re.match(r"[A-Za-z0-9.%]", p[cut]) and re.match(r"[A-Za-z0-9.%]", p[cut - 1]):
                    cut -= 1
                if cut == 0:
                    cut = max_chars
            chunks.append(p[:cut])
            p = p[cut:].lstrip()
        cur = p
    if cur:
        chunks.append(cur)
    return [c.strip().rstrip("，、,;；") for c in chunks if c.strip()]


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--storyboard", default="storyboard.json")
    ap.add_argument("--script", default="script.md")
    ap.add_argument("--lines", default="audio/lines")
    ap.add_argument("--out", default="audio")
    ap.add_argument("--gap", type=float, default=0.25, help="pause between lines in one section")
    ap.add_argument("--section-gap", type=float, default=0.6, help="pause when the script section changes")
    ap.add_argument("--max-chars", type=int, default=16, help="subtitle chunk length (use 12 for 9:16)")
    ap.add_argument("--tail", type=float, default=1.0, help="extra seconds held on the last shot")
    a = ap.parse_args()

    proj = Path(a.project)
    board = json.loads((proj / a.storyboard).read_text(encoding="utf-8"))
    script = parse_script(proj / a.script)
    lines_dir = proj / a.lines
    out_dir = proj / a.out
    out_dir.mkdir(parents=True, exist_ok=True)

    t = 0.0
    prev_section = None
    shots_out, lines_out, missing, placed = [], [], [], []
    for i, shot in enumerate(board["shots"]):
        sid = shot["id"]
        ids = shot.get("lines", [])
        start = t
        if not ids:
            if "duration" not in shot:
                sys.exit(f"{sid}: no lines, so it needs a duration")
            t += float(shot["duration"])
        else:
            t += float(shot.get("pre", 0.3))
            for j, lid in enumerate(ids):
                if lid not in script:
                    sys.exit(f"{sid}: line {lid} is not in {a.script}")
                info = script[lid]
                if j > 0:
                    t += a.section_gap if info["section"] != prev_section else a.gap
                audio = find_audio(lines_dir, lid)
                if audio:
                    dur = probe_duration(audio)
                    placed.append((audio, t))
                else:
                    dur = max(1.0, len(info["say"]) / 4.2)
                    missing.append(lid)
                lines_out.append({"id": lid, "shot": sid, "text": info["text"], "start": round(t, 3),
                                  "end": round(t + dur, 3), "audio": str(audio.relative_to(proj)) if audio else None})
                t += dur
                prev_section = info["section"]
            t += float(shot.get("post", 0.2))
        if i == len(board["shots"]) - 1:
            t += a.tail
        shot_lines = [{"id": l["id"], "start": round(l["start"] - start, 3), "end": round(l["end"] - start, 3),
                       "text": l["text"]} for l in lines_out if l["shot"] == sid]
        shots_out.append({"id": sid, "start": round(start, 3), "end": round(t, 3),
                          "duration": round(t - start, 3), "lines": shot_lines})

    total = round(t, 3)
    meta = board.get("meta", {})
    (out_dir / "timeline.json").write_text(json.dumps(
        {"total": total, "fps": meta.get("fps", 30), "width": meta.get("width"), "height": meta.get("height"),
         "shots": shots_out, "lines": lines_out}, ensure_ascii=False, indent=2), encoding="utf-8")

    # Subtitles: split each line, share its time in proportion to characters.
    srt, n = [], 0
    for l in lines_out:
        chunks = split_sub(l["text"], a.max_chars)
        total_chars = sum(len(c) for c in chunks) or 1
        cs = l["start"]
        for c in chunks:
            ce = cs + (l["end"] - l["start"]) * len(c) / total_chars
            n += 1
            srt.append(f"{n}\n{srt_time(cs)} --> {srt_time(ce)}\n{c}\n")
            cs = ce
    (out_dir / "subs.srt").write_text("\n".join(srt), encoding="utf-8")

    # Narration track: silence of the full length, each line mixed in at its start.
    narr = out_dir / "narration.wav"
    if placed:
        cmd = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", f"{total}", "-i", f"anullsrc=r={SR}:cl=mono"]
        filters, labels = [], ["[0:a]"]
        for k, (audio, start) in enumerate(placed, start=1):
            cmd += ["-i", str(audio)]
            ms = int(round(start * 1000))
            filters.append(f"[{k}:a]aresample={SR},aformat=channel_layouts=mono,adelay={ms}:all=1[a{k}]")
            labels.append(f"[a{k}]")
        filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first[out]")
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
            f.write(";".join(filters))
            script_path = f.name
        cmd += ["-filter_complex_script", script_path, "-map", "[out]", "-ar", str(SR), "-ac", "1", str(narr)]
        subprocess.run(cmd, check=True)
        Path(script_path).unlink()

    print(f"total {total:.2f}s, {len(shots_out)} shots, {len(lines_out)} lines")
    for s in shots_out:
        print(f"  {s['id']}  {s['start']:7.2f} → {s['end']:7.2f}  ({s['duration']:.2f}s)")
    if missing:
        print(f"no audio yet for {len(missing)} lines (estimated): {', '.join(missing)}")
    print(f"wrote {out_dir/'timeline.json'}, {out_dir/'subs.srt'}" + (f", {narr}" if placed else ""))


if __name__ == "__main__":
    main()
