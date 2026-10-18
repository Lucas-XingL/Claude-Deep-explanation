#!/usr/bin/env python3
"""Synthesize a quiet ambient music bed when no licensed track is available.

Usage:
  python3 make_bed.py out.wav --seconds 60 [--mood calm|tension|bright] [--bpm 72] [--seed 1]

A slow chord pad (detuned sines with soft attack), a sub-bass on the chord root and an
optional soft pulse on the beat, with a simple feedback-delay reverb. It is generated from
scratch, so there is nothing to license; it is meant to sit under narration (assemble.py
lowers it further and ducks it under the voice), not to stand on its own.
"""
import argparse, wave
import numpy as np

SR = 48000
MOODS = {
    # chord progressions as semitone offsets from A2 (110 Hz); 4 beats per chord
    "calm": [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]],      # Am F C G
    "tension": [[0, 3, 7, 10], [1, 5, 8, 13], [0, 3, 7, 10], [-2, 1, 5, 10]],
    "bright": [[3, 7, 10, 15], [-2, 2, 5, 10], [0, 3, 7, 12], [-4, 0, 3, 8]],
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out")
    ap.add_argument("--seconds", type=float, default=60)
    ap.add_argument("--mood", choices=list(MOODS), default="calm")
    ap.add_argument("--bpm", type=float, default=72)
    ap.add_argument("--pulse", type=float, default=0.25, help="0 = no beat pulse")
    ap.add_argument("--seed", type=int, default=1)
    a = ap.parse_args()

    rng = np.random.default_rng(a.seed)
    n = int(a.seconds * SR)
    t = np.arange(n) / SR
    beat = 60 / a.bpm
    chord_len = 4 * beat
    prog = MOODS[a.mood]
    out = np.zeros(n)
    for ci in range(int(np.ceil(a.seconds / chord_len)) + 1):
        t0 = ci * chord_len
        i0, i1 = int(t0 * SR), min(n, int((t0 + chord_len + 2.5) * SR))
        if i0 >= n:
            break
        tt = t[i0:i1] - t0
        env = np.minimum(1, tt / 1.6) * np.exp(-np.maximum(0, tt - chord_len) / 0.9)
        notes = prog[ci % len(prog)]
        for k, semi in enumerate(notes):
            f = 220 * 2 ** (semi / 12)
            for det in (-0.12, 0, 0.12):
                ph = rng.uniform(0, 2 * np.pi)
                out[i0:i1] += env * 0.06 * np.sin(2 * np.pi * f * (1 + det / 100) * tt + ph) / (1 + 0.3 * k)
        root = 55 * 2 ** (notes[0] / 12)
        out[i0:i1] += env * 0.09 * np.sin(2 * np.pi * root * tt)
    if a.pulse > 0:
        for b in np.arange(0, a.seconds, beat):
            i0 = int(b * SR)
            i1 = min(n, i0 + int(0.35 * SR))
            tt = t[i0:i1] - b
            out[i0:i1] += a.pulse * 0.08 * np.exp(-tt / 0.08) * np.sin(2 * np.pi * 55 * tt)
    # Gentle low-pass and a feedback-delay reverb.
    k = 24
    out = np.convolve(out, np.ones(k) / k, mode="same")
    for d, g in ((0.113, 0.35), (0.271, 0.25), (0.419, 0.18)):
        di = int(d * SR)
        out[di:] += g * out[:-di]
    fade = int(2.0 * SR)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    out = out / (np.abs(out).max() + 1e-9) * 0.5
    data = (np.stack([out, out], axis=1) * 32767).astype(np.int16)
    with wave.open(a.out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print(f"wrote {a.out} ({a.seconds:.1f}s, {a.mood})")


if __name__ == "__main__":
    main()
