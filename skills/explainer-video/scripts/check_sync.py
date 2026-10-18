#!/usr/bin/env python3
"""Check that the picture changes while each line is spoken, measured on the rendered video.

Usage:
  python3 check_sync.py <project_dir> [--video out/final.mp4] [--timeline audio/timeline.json]
                        [--storyboard storyboard.json] [--min-change 0.4] [--mask-bottom 0.2]

For every narration line it decodes the video between the line's start and end (5 frames a
second, small and grey, with the subtitle band masked out) and measures how much of the picture
changes compared with the first frame of the line: the share of pixels that moved by more than
a few grey levels. A line under --min-change percent is reported as STATIC: the narration moves
on while the picture stands still, which is what viewers read as "nothing is happening".

A shot may hold on purpose (a photo the viewer must read, a pause after a reveal). Give it a
"hold" field with the reason in the storyboard; its lines are then reported as HOLD, not STATIC.
Exit code 1 when a line is STATIC without a hold.
"""
import argparse, json, subprocess, sys
from pathlib import Path

import numpy as np

FPS, W, H = 5, 192, 108
LEVEL = 10  # grey levels a pixel must move by to count as changed


def decode(video):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps={FPS},scale={W}:{H},format=gray",
         "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.int16)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--video", default="out/final.mp4")
    ap.add_argument("--timeline", default="audio/timeline.json")
    ap.add_argument("--storyboard", default="storyboard.json")
    ap.add_argument("--min-change", type=float, default=0.4, help="percent of pixels that must change during a line")
    ap.add_argument("--mask-bottom", type=float, default=0.2, help="share of the frame height kept out (subtitles)")
    a = ap.parse_args()
    proj = Path(a.project)
    timeline = json.loads((proj / a.timeline).read_text(encoding="utf-8"))
    holds = {}
    sb = proj / a.storyboard
    if sb.exists():
        holds = {s["id"]: s["hold"] for s in json.loads(sb.read_text(encoding="utf-8"))["shots"] if s.get("hold")}

    frames = decode(proj / a.video)
    keep = int(H * (1 - a.mask_bottom))
    frames = frames[:, :keep, :]
    n = len(frames)

    static, rows = 0, []
    for shot in timeline["shots"]:
        for line in shot.get("lines", []):
            t0, t1 = shot["start"] + line["start"], shot["start"] + line["end"]
            i0, i1 = int(t0 * FPS), min(n, int(np.ceil(t1 * FPS)) + 1)
            if i1 - i0 < 2:
                continue
            base = frames[i0]
            change = max(float((np.abs(f - base) > LEVEL).mean()) * 100 for f in frames[i0 + 1:i1])
            if change >= a.min_change:
                status = "ok"
            elif shot["id"] in holds:
                status = "HOLD"
            else:
                status, static = "STATIC", static + 1
            rows.append((line["id"], shot["id"], t0, t1, change, status))

    print(f"{'line':6} {'shot':5} {'from':>7} {'to':>7} {'changed':>8}")
    for lid, sid, t0, t1, change, status in rows:
        note = f"  ({holds[sid]})" if status == "HOLD" else ""
        print(f"{lid:6} {sid:5} {t0:7.2f} {t1:7.2f} {change:7.2f}%  {status}{note}")

    # Longest stretch where the picture (outside the subtitle band) does not change at all.
    still = [float((np.abs(frames[i] - frames[i - 1]) > LEVEL).mean()) * 100 < 0.05 for i in range(1, n)]
    run = best = start = best_start = 0
    for i, s in enumerate(still):
        if s:
            if run == 0:
                start = i
            run += 1
            if run > best:
                best, best_start = run, start
        else:
            run = 0
    print(f"\nlongest still stretch: {best / FPS:.1f} s from {best_start / FPS:.1f} s")
    print(f"{static} line(s) STATIC. A line with no visible change needs a picture change or a \"hold\" reason in the storyboard.")
    sys.exit(1 if static else 0)


if __name__ == "__main__":
    main()
