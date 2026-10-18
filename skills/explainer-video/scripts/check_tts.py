#!/usr/bin/env python3
"""Listen back to the generated narration: transcribe every line and compare it with the script,
so misread numbers, names and polyphonic characters are caught before rendering.

Usage:
  pip install faster-whisper
  python3 check_tts.py <project_dir> [--script script.md] [--lines audio/lines] [--model small] [--save-words]

Prints, per line, the similarity between script text and transcript (0–1) and flags lines
below --threshold (default 0.85) with both texts side by side. Numbers are compared after
the transcript's Arabic digits are kept as-is, so a script written in Chinese numerals may
show a lower score for lines with numbers: read those flagged lines and judge by ear/eye.

--save-words writes <Lxxx>.words.json from the recognised word times for lines that have none
(voices from engines other than edge-tts), so scenes can still act on a word (atWord).
"""
import argparse, difflib, json, re, sys, wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from timeline import parse_script, find_audio  # noqa: E402

PUNCT = re.compile(r"[\s，。！？；：、,.!?;:“”\"'（）()《》—…·-]")


def norm(s):
    return PUNCT.sub("", s)


def load(path):
    """Decode any audio to 16 kHz mono float32 via ffmpeg (no PyAV dependency)."""
    import subprocess, numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--script", default="script.md")
    ap.add_argument("--lines", default="audio/lines")
    ap.add_argument("--model", default="small")
    ap.add_argument("--threshold", type=float, default=0.85)
    ap.add_argument("--save-words", action="store_true", help="write word timings for lines that have none")
    a = ap.parse_args()

    from faster_whisper import WhisperModel
    proj = Path(a.project)
    lines = parse_script(proj / a.script)
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    flagged = 0
    for lid, info in lines.items():
        audio = find_audio(proj / a.lines, lid)
        if not audio:
            print(f"{lid}  (no audio)")
            continue
        segs, _ = model.transcribe(load(audio), language="zh", initial_prompt="以下是普通话的句子。" + info["text"][:0],
                                   word_timestamps=a.save_words)
        segs = list(segs)
        heard = "".join(s.text for s in segs).strip()
        words_file = audio.with_suffix(".words.json")
        if a.save_words and not words_file.exists():
            words = [{"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
                     for s in segs for w in (s.words or []) if w.word.strip()]
            words_file.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
        score = difflib.SequenceMatcher(None, norm(info["say"]), norm(heard)).ratio()
        mark = "  ←" if score < a.threshold else ""
        print(f"{lid}  {score:.2f}{mark}")
        if score < a.threshold:
            flagged += 1
            print(f"      script: {info['say']}\n      heard:  {heard}")
    print(f"{flagged} line(s) to listen to")


if __name__ == "__main__":
    main()
