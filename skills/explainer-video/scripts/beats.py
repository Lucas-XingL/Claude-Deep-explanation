#!/usr/bin/env python3
"""Find the beats of a music track, so cuts and text can land on them.

Usage:
  pip install librosa soundfile
  python3 beats.py audio/bgm.mp3 [--out audio/beats.json] [--snap audio/timeline.json --window 0.25]

Writes {"tempo": bpm, "beats": [s, …], "downbeats": [s, …], "strong": [s, …]}.
  beats      every beat from librosa's tracker
  downbeats  every 4th beat starting from the strongest phase (assumes 4/4)
  strong     beats whose onset strength is in the top quarter (good for big cuts)
With --snap, also prints, for every shot boundary in the timeline, the nearest beat
within --window seconds, and the shift needed (use it to adjust a shot's pre/post).
"""
import argparse, json
import numpy as np


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio")
    ap.add_argument("--out", default=None)
    ap.add_argument("--snap", default=None)
    ap.add_argument("--window", type=float, default=0.25)
    a = ap.parse_args()

    import librosa
    y, sr = librosa.load(a.audio, sr=22050, mono=True)
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, frames = librosa.beat.beat_track(onset_envelope=onset, sr=sr)
    beats = librosa.frames_to_time(frames, sr=sr)
    strength = onset[frames] if len(frames) else np.array([])
    phase = int(np.argmax([strength[i::4].sum() for i in range(4)])) if len(frames) >= 8 else 0
    downbeats = beats[phase::4]
    strong = beats[strength >= np.quantile(strength, 0.75)] if len(strength) else beats

    res = {"tempo": round(float(np.atleast_1d(tempo)[0]), 2),
           "beats": [round(float(t), 3) for t in beats],
           "downbeats": [round(float(t), 3) for t in downbeats],
           "strong": [round(float(t), 3) for t in strong]}
    out = a.out or a.audio.rsplit(".", 1)[0] + ".beats.json"
    with open(out, "w") as f:
        json.dump(res, f, indent=1)
    print(f"tempo {res['tempo']} BPM, {len(beats)} beats → {out}")

    if a.snap:
        tl = json.load(open(a.snap, encoding="utf-8"))
        arr = np.array(res["beats"])
        print("shot boundary → nearest beat (shift)")
        for s in tl["shots"][1:]:
            t = s["start"]
            if len(arr) == 0:
                break
            k = int(np.argmin(np.abs(arr - t)))
            d = arr[k] - t
            mark = "" if abs(d) <= a.window else "  (outside window)"
            print(f"  {s['id']}  {t:7.2f} → {arr[k]:7.2f}  ({d:+.2f}s){mark}")


if __name__ == "__main__":
    main()
