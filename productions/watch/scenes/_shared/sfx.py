#!/usr/bin/env python3
"""Escapement ticks for the watch film, timed from the same model as the pictures.

Usage: python3 sfx.py <timeline.json> <out.wav>
Each shot maps film time to movement time (tau); a tick sounds at every drop, when the
escape wheel falls onto the next pallet (beat fraction 0.85 in movement() of model.js).
"""
import json, math, sys, wave
import numpy as np

SR = 48000
HZ, AMP, LIFT = 4.0, 280.0, 50.0
DELTA = math.asin(min(1, LIFT / 2 / AMP))

# Film-time → movement-time per shot id, matching the shot files (S01/S02 real time, S03 at 1/16).
TAU = {
    "S01": lambda t: t,
    "S02": lambda t: 11.67 + t,
    "S03": lambda t: 0.02 + t / 16,
}
SLOW = {"S03"}


def drop_taus(tau0, tau1):
    """Movement times of the drops between tau0 and tau1."""
    out = []
    k = max(0, math.floor((2 * math.pi * HZ * tau0 + DELTA) / math.pi) - 1)
    while True:
        psi = k * math.pi - DELTA + 0.85 * 2 * DELTA
        tau = psi / (2 * math.pi * HZ)
        if tau > tau1:
            break
        if tau >= tau0:
            out.append((tau, k))
        k += 1
    return out


def click(freq, dur, level):
    n = int(dur * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(int(freq))
    body = np.exp(-t / (dur / 5)) * np.sin(2 * np.pi * freq * t) + 0.5 * np.exp(-t / 0.0015) * rng.uniform(-1, 1, n)
    return level * body


def main():
    tl = json.load(open(sys.argv[1]))
    total = tl["total"]
    out = np.zeros(int((total + 1) * SR))
    for shot in tl["shots"]:
        f = TAU.get(shot["id"])
        if not f:
            continue
        t0, d = shot["start"], shot["duration"]
        # invert tau(t) by sampling: tau is linear in t for every shot here
        a, b = f(0), f(d)
        for tau, k in drop_taus(a, b):
            ft = (tau - a) / (b - a) * d
            i = int((t0 + ft) * SR)
            if shot["id"] in SLOW:
                s = click(2600 if k % 2 else 2050, 0.09, 0.9)
            else:
                s = click(3200, 0.025, 0.25)
            j = min(len(out), i + len(s))
            out[i:j] += s[: j - i]
    out = np.clip(out, -1, 1)
    data = (np.stack([out, out], axis=1) * 32767 * 0.8).astype(np.int16)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print("wrote", sys.argv[2])


if __name__ == "__main__":
    main()
