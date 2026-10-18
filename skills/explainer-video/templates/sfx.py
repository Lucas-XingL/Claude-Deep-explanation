#!/usr/bin/env python3
"""Sound effects timed from the film's model, so sound and picture agree by construction.

Copy to scenes/_shared/sfx.py and edit EVENTS below. Then:
  python3 scenes/_shared/sfx.py audio/timeline.json audio/sfx.wav
  python3 <skill>/scripts/assemble.py . --sfx audio/sfx.wav --sfx-volume 0.5 …

Two kinds of sound, both built from numpy (nothing to license):
  hits(shot, times)       short clicks at given shot-relative times (a tick, a latch, a drop)
  bed(shot, env(t), kind) continuous noise whose loudness follows an envelope (hiss, wind, hum)
The times and envelopes must come from the same functions the scene draws from: for the watch,
the escapement drops of movement(tau); for the Roadster, the scene's thrust curve.
"""
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def click(freq=3000, dur=0.03, level=0.3):
    t = np.arange(int(dur * SR)) / SR
    return level * (np.exp(-t / (dur / 5)) * np.sin(2 * np.pi * freq * t) + 0.5 * np.exp(-t / 0.0015) * rng.uniform(-1, 1, len(t)))


def band_noise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def seg(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


# ---- edit here: what sounds in which shot --------------------------------------------------------
def EVENTS(shot, L):
    """Return a list of ("hits", [times], click kwargs) or ("bed", envelope array fn, (lo, hi), level)."""
    out = []
    if shot["id"] == "S01" and "L001" in L:
        out.append(("hits", [L["L001"]["start"] + 0.5], {"freq": 2400, "dur": 0.08, "level": 0.6}))
    if shot["id"] == "S02":
        l = L.get("L002", {"start": 0, "end": shot["duration"]})
        out.append(("bed", lambda t: seg(t, l["start"], l["start"] + 1.5) * (1 - seg(t, l["end"], l["end"] + 0.6)), (1500, 9000), 0.5))
    return out


def main():
    tl = json.load(open(sys.argv[1]))
    out = np.zeros(int((tl["total"] + 1) * SR))
    for shot in tl["shots"]:
        L = {l["id"]: l for l in shot["lines"]}
        i0, n = int(shot["start"] * SR), int(shot["duration"] * SR)
        t = np.arange(n) / SR
        for ev in EVENTS(shot, L):
            if ev[0] == "hits":
                for ht in ev[1]:
                    s = click(**ev[2]); i = i0 + int(ht * SR); j = min(len(out), i + len(s))
                    out[i:j] += s[: j - i]
            else:
                _, env, (lo, hi), level = ev
                out[i0:i0 + n] += level * env(t) * band_noise(n, lo, hi)
    out = np.clip(out, -1, 1)
    data = (np.stack([out, out], axis=1) * 32767 * 0.8).astype(np.int16)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print("wrote", sys.argv[2])


if __name__ == "__main__":
    main()
