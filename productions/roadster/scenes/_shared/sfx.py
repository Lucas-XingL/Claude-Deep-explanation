#!/usr/bin/env python3
"""Roadster sound effects: a whoosh for the flip, fan hum when it comes apart, and cold-gas hiss
whose loudness follows the thrust curve of scenes/thrust (thrustAt there).

Usage: python3 sfx.py <timeline.json> <out.wav>
"""
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def ease_io(k):
    k = np.clip(k, 0, 1)
    return np.where(k < 0.5, 4 * k ** 3, 1 - (-2 * k + 2) ** 3 / 2)


def seg(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def band_noise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def main():
    tl = json.load(open(sys.argv[1]))
    total = tl["total"]
    out = np.zeros(int((total + 1) * SR))
    for shot in tl["shots"]:
        L = {l["id"]: l for l in shot["lines"]}
        i0 = int(shot["start"] * SR)
        n = int(shot["duration"] * SR)
        t = np.arange(n) / SR
        if shot["id"] == "S01" and "L002" in L:
            f0 = L["L002"]["start"] + 1.6
            env = np.exp(-((t - (f0 + 0.85)) / 0.55) ** 2)
            out[i0:i0 + n] += 0.5 * env * band_noise(n, 300, 3000)
            x0 = L["L004"]["start"] + 0.2
            hum = seg(t, x0, x0 + 1.5) * 0.12 * np.sin(2 * np.pi * 180 * t) * (1 + 0.3 * np.sin(2 * np.pi * 9 * t))
            out[i0:i0 + n] += hum
        if shot["id"] == "S02":
            l18, l19 = L["L018"]["start"], L["L019"]["start"]
            rear = np.where(t < l19, ease_io(seg(t, l18 + 0.4, l18 + 2.6)), 0) * (1 - seg(t, l19 - 0.3, l19))
            down = np.where(t >= l19, ease_io(seg(t, l19 + 0.9, l19 + 3.4)), 0) * (1 - seg(t, shot["duration"] - 0.6, shot["duration"]))
            env = 0.55 * rear + 0.65 * down
            out[i0:i0 + n] += env * (0.7 * band_noise(n, 1500, 9000) + 0.3 * band_noise(n, 80, 400))
    out = np.clip(out, -1, 1)
    data = (np.stack([out, out], axis=1) * 32767 * 0.8).astype(np.int16)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print("wrote", sys.argv[2])


if __name__ == "__main__":
    main()
