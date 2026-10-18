#!/usr/bin/env python3
"""Generate one audio file per script line: audio/lines/<Lxxx>.<ext>.

Usage:
  # Any TTS you have, as a command template ({text} is shell-quoted for you):
  python3 tts_lines.py <project_dir> --cmd 'my-tts --voice zh_male --text {text} --out {out}' --ext wav

  # edge-tts (pip install edge-tts; needs network access to Microsoft's service). Also saves
  # each line's word timings as audio/lines/<Lxxx>.words.json, so scenes can act on a word:
  python3 tts_lines.py <project_dir> --engine edge-tts --voice zh-CN-YunxiNeural --rate +0%

  # Placeholder tones, to test the pipeline without a TTS:
  python3 tts_lines.py <project_dir> --engine placeholder

Options:
  --script script.md   which script to read (script.vertical.md for the vertical cut)
  --only L003,L004     regenerate only these lines
  --force              overwrite existing files
The spoken text is the line with {Fxx} tags removed, or the <读作：…> text when present.
Other engines have no word timings; check_tts.py --save-words can add them from speech recognition.
"""
import argparse, shlex, shutil, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from timeline import parse_script  # noqa: E402


# edge-tts through its Python API, which also reports when each word starts (WordBoundary).
EDGE = r"""
import asyncio, json, sys, edge_tts
text, voice, rate, out, words = sys.argv[1:6]
async def run():
    try:
        c = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    except TypeError:  # edge-tts < 7 sends word boundaries by default
        c = edge_tts.Communicate(text, voice, rate=rate)
    found = []
    with open(out, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                found.append({"text": ch["text"], "start": round(ch["offset"] / 1e7, 3),
                              "end": round((ch["offset"] + ch["duration"]) / 1e7, 3)})
    with open(words, "w", encoding="utf-8") as f:
        json.dump(found, f, ensure_ascii=False)
asyncio.run(run())
"""


def edge_python():
    """The Python that has edge_tts: this one, or the one behind the edge-tts command."""
    try:
        import edge_tts  # noqa: F401
        return sys.executable
    except ImportError:
        cli = shutil.which("edge-tts")
        if cli:
            first = Path(cli).read_text(errors="ignore").splitlines()[0]
            if first.startswith("#!") and "python" in first:
                return first[2:].strip().split()[0]
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--script", default="script.md")
    ap.add_argument("--out", default="audio/lines")
    ap.add_argument("--engine", choices=["cmd", "edge-tts", "placeholder"], default=None)
    ap.add_argument("--cmd", help="command template with {text} and {out}")
    ap.add_argument("--ext", default=None, help="output extension (default: wav, mp3 for edge-tts)")
    ap.add_argument("--voice", default="zh-CN-YunxiNeural")
    ap.add_argument("--rate", default="+0%")
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()

    engine = a.engine or ("cmd" if a.cmd else None)
    if engine is None:
        sys.exit("choose --engine edge-tts|placeholder or pass --cmd")
    if engine == "cmd" and not a.cmd:
        sys.exit("--engine cmd needs --cmd")
    ext = a.ext or ("mp3" if engine == "edge-tts" else "wav")

    proj = Path(a.project)
    lines = parse_script(proj / a.script)
    only = {x.strip() for x in a.only.split(",") if x.strip()}
    out_dir = proj / a.out
    out_dir.mkdir(parents=True, exist_ok=True)

    done = 0
    for lid, info in lines.items():
        if only and lid not in only:
            continue
        out = out_dir / f"{lid}.{ext}"
        if out.exists() and not a.force:
            continue
        text = info["say"]
        out.with_suffix(".words.json").unlink(missing_ok=True)  # stale word timings of an older take
        if engine == "placeholder":
            # A soft tone as long as the line would take to read (≈4.2 chars/s).
            dur = max(1.0, len(text) / 4.2)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i",
                            f"sine=frequency=330:sample_rate=48000:duration={dur:.2f}",
                            "-af", "volume=0.15,afade=t=in:d=0.05,afade=t=out:st={:.2f}:d=0.1".format(dur - 0.1),
                            str(out)], check=True)
        elif engine == "edge-tts":
            py = edge_python()
            if py:
                subprocess.run([py, "-c", EDGE, text, a.voice, a.rate, str(out),
                                str(out.with_suffix(".words.json"))], check=True)
            else:  # only the command line is available: audio without word timings
                subprocess.run(["edge-tts", "--voice", a.voice, f"--rate={a.rate}", "--text", text,
                                "--write-media", str(out)], check=True)
        else:
            cmd = a.cmd.replace("{text}", shlex.quote(text)).replace("{out}", shlex.quote(str(out)))
            subprocess.run(cmd, shell=True, check=True)
        done += 1
        print(f"{lid}  {text[:30]}")
    print(f"generated {done} files in {out_dir}")


if __name__ == "__main__":
    main()
