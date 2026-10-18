#!/usr/bin/env python3
"""Synthesize the film's music when no licensed track is available: a score that follows the film.

Usage:
  # A score built on the film's own timeline (recommended):
  python3 make_bed.py audio/bed.wav --timeline audio/timeline.json --storyboard storyboard.json \
          [--mood calm|tension|bright] [--bpm 72] [--accent-times 12.3,40.1] [--seed 1]
  # A plain bed of a given length:
  python3 make_bed.py out.wav --seconds 60 [--mood calm|tension|bright] [--bpm 72] [--pulse 0.25]

With --timeline the score has a structure instead of one loop:
  - a short motif at the start, and the same motif again at the ending (the last section, or the
    last 15 % of the film): the ending answers the opening;
  - a new chord at every storyboard section boundary, with a soft whoosh into it;
  - layers that build with the film: pad, then bass, then a pulse, then a light arpeggio, easing
    back in the last section;
  - an accent (a rising swell and a low boom) on every storyboard "accents" entry: "L010" for the
    start of a line, "L007:大气" for the moment that word is spoken (word timings from the
    timeline), plus any --accent-times;
  - a cadence into the home chord and a fade over the last seconds.
It covers the whole film exactly (no looping, no padding). It is made from scratch, so there is
nothing to license. assemble.py lowers it and ducks it under the voice.
"""
import argparse, json, re, wave
from pathlib import Path

import numpy as np

SR = 48000
MOODS = {
    # chord progressions as semitone offsets from A2 (110 Hz); the first chord is home
    "calm": [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]],      # Am F C G
    "tension": [[0, 3, 7, 10], [1, 5, 8, 13], [0, 3, 7, 10], [-2, 1, 5, 10]],
    "bright": [[3, 7, 10, 15], [-2, 2, 5, 10], [0, 3, 7, 12], [-4, 0, 3, 8]],
}
CADENCE = {"calm": [-1, 2, 7, 11], "tension": [-1, 2, 5, 11], "bright": [-2, 2, 5, 10]}  # chord before home
MOTIF = {"calm": [12, 15, 19, 17, 15], "tension": [12, 13, 15, 12, 10], "bright": [15, 19, 22, 20, 15]}
SKIP = re.compile(r"[\s，。！？；：、,.!?;:“”\"'（）()《》—…·-]")


def word_time(line, phrase):
    """When `phrase` is spoken in a timeline line; its position in the text without word timings."""
    p = SKIP.sub("", phrase)
    if line.get("words"):
        s, at = "", []
        for w in line["words"]:
            cs = SKIP.sub("", w["text"])
            for k, c in enumerate(cs):
                s += c
                at.append(w["start"] + (w["end"] - w["start"]) * k / len(cs))
        if p in s:
            return at[s.index(p)]
    txt = SKIP.sub("", line.get("text", ""))
    k = txt.find(p)
    return line["start"] if k < 0 else line["start"] + (line["end"] - line["start"]) * k / max(1, len(txt))


def tone(f, tt, partials=((1, 1.0),), phase=0.0):
    return sum(a * np.sin(2 * np.pi * f * r * tt + phase) for r, a in partials)


def add(out, i0, sig):
    i1 = min(len(out), i0 + len(sig))
    if i1 > i0 >= 0:
        out[i0:i1] += sig[: i1 - i0]


def plan(a):
    """Sections, accents and length from the timeline and storyboard (or one section of --seconds)."""
    if not a.timeline:
        return a.seconds, [(0.0, a.seconds)], []
    tl = json.loads(Path(a.timeline).read_text(encoding="utf-8"))
    total = float(tl["total"])
    board = json.loads(Path(a.storyboard).read_text(encoding="utf-8")) if a.storyboard else {"shots": []}
    by_id = {s["id"]: s for s in board.get("shots", [])}
    sections, current = [], None
    for s in tl["shots"]:
        name = by_id.get(s["id"], {}).get("section", s["id"])
        if name != current:
            sections.append([s["start"], s["end"]])
            current = name
        else:
            sections[-1][1] = s["end"]
    sections[-1][1] = total
    lines = {l["id"]: l for l in tl.get("lines", [])}
    accents = [float(x) for x in a.accent_times.split(",") if x.strip()]
    for s in board.get("shots", []):
        for ref in s.get("accents", []):
            lid, _, phrase = ref.partition(":")
            if lid in lines:
                accents.append(word_time(lines[lid], phrase) if phrase else lines[lid]["start"])
    return total, [tuple(x) for x in sections], sorted(accents)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out")
    ap.add_argument("--timeline", help="audio/timeline.json: build the score on the film's structure")
    ap.add_argument("--storyboard", help="storyboard.json: sections and accents")
    ap.add_argument("--accent-times", default="", help="extra accents, seconds, comma-separated")
    ap.add_argument("--seconds", type=float, default=60, help="length without --timeline")
    ap.add_argument("--mood", choices=list(MOODS), default="calm")
    ap.add_argument("--bpm", type=float, default=72)
    ap.add_argument("--pulse", type=float, default=0.25, help="beat pulse level (0 = none)")
    ap.add_argument("--seed", type=int, default=1)
    a = ap.parse_args()

    rng = np.random.default_rng(a.seed)
    total, sections, accents = plan(a)
    n = int(total * SR)
    left, right = np.zeros(n), np.zeros(n)
    beat = 60 / a.bpm
    chord_len = 4 * beat
    prog, structured = MOODS[a.mood], bool(a.timeline)

    # How full the arrangement is: builds to about three quarters of the film, eases back for the
    # ending (the last section, or at least the last 15 %).
    end_zone = max(sections[-1][0], total * 0.85)

    def intensity(t):
        if not structured:
            return 0.6
        return 0.35 + 0.65 * min(1, t / total / 0.75) if t < end_zone else 0.5

    # Chords: a new chord at every section start; the last two chords are the cadence and home.
    events = []
    for k, (s0, s1) in enumerate(sections):
        for j, c in enumerate(np.arange(s0, s1, chord_len)):
            events.append((float(c), prog[(k + j) % len(prog)]))
    if structured and total > 3 * chord_len:
        end_home = total - chord_len * 1.5
        events = [e for e in events if e[0] < end_home - chord_len] + [(end_home - chord_len, CADENCE[a.mood]), (end_home, prog[0])]
    for i, (t0, notes) in enumerate(events):
        t1 = events[i + 1][0] if i + 1 < len(events) else total
        dur = t1 - t0
        tt = np.arange(int((dur + 2.5) * SR)) / SR
        env = np.minimum(1, tt / 1.4) * np.exp(-np.maximum(0, tt - dur) / 0.9)
        lvl = intensity(t0)
        for k, semi in enumerate(notes):
            f = 220 * 2 ** (semi / 12)
            for det, pan in ((-0.12, 0.8), (0, 0.5), (0.12, 0.2)):
                sig = env * 0.055 * tone(f * (1 + det / 100), tt, phase=rng.uniform(0, 6.28)) / (1 + 0.3 * k)
                add(left, int(t0 * SR), sig * pan * 2)
                add(right, int(t0 * SR), sig * (1 - pan) * 2)
        if lvl > 0.45:  # bass on the root
            bass = env * 0.09 * min(1, (lvl - 0.45) / 0.2) * tone(55 * 2 ** (notes[0] / 12), tt)
            add(left, int(t0 * SR), bass); add(right, int(t0 * SR), bass)
        if lvl > 0.75:  # a light arpeggio in eighth notes
            for b, semi in enumerate(np.arange(0, dur, beat / 2)):
                f = 440 * 2 ** (notes[b % len(notes)] / 12)
                pt = np.arange(int(0.5 * SR)) / SR
                pl = 0.035 * min(1, (lvl - 0.75) / 0.15) * np.exp(-pt / 0.18) * tone(f, pt, ((1, 1), (2, 0.25)))
                side = 0.3 + 0.4 * (b % 2)
                add(left, int((t0 + semi) * SR), pl * side * 2); add(right, int((t0 + semi) * SR), pl * (1 - side) * 2)
    # Pulse on the beat once the film has built up (or always, for a plain bed).
    if a.pulse > 0:
        for b in np.arange(0, total, beat):
            lvl = intensity(b)
            if structured and lvl <= 0.6:
                continue
            g = a.pulse * (min(1, (lvl - 0.6) / 0.2) if structured else 1)
            pt = np.arange(int(0.35 * SR)) / SR
            sig = g * 0.08 * np.exp(-pt / 0.08) * np.sin(2 * np.pi * 55 * pt)
            add(left, int(b * SR), sig); add(right, int(b * SR), sig)
    if structured:
        # Motif at the start and again in the last section: a soft bell.
        for t0 in (0.6, end_zone + 0.4):
            for k, semi in enumerate(MOTIF[a.mood]):
                pt = np.arange(int(1.6 * SR)) / SR
                bell = 0.07 * np.exp(-pt / 0.5) * tone(220 * 2 ** (semi / 12), pt, ((1, 1), (2.76, 0.3), (5.4, 0.08)))
                add(left, int((t0 + k * beat * 0.75) * SR), bell * (0.6 if k % 2 else 0.4) * 2)
                add(right, int((t0 + k * beat * 0.75) * SR), bell * (0.4 if k % 2 else 0.6) * 2)
        # A soft whoosh into every section, and a swell plus a low boom on every accent.
        def noise_swell(length, rise):
            pt = np.arange(int(length * SR)) / SR
            nz = np.convolve(rng.standard_normal(len(pt)), np.ones(40) / 40, mode="same")
            return nz * np.where(pt < rise, (pt / rise) ** 2, np.exp(-(pt - rise) / 0.25))
        for s0, _ in sections[1:]:
            w = 0.05 * noise_swell(1.2, 0.8)
            add(left, int((s0 - 0.8) * SR), w); add(right, int((s0 - 0.8) * SR), w)
        for t_acc in accents:
            w = 0.07 * noise_swell(1.0, 0.7)
            add(left, int((t_acc - 0.7) * SR), w); add(right, int((t_acc - 0.7) * SR), w)
            pt = np.arange(int(1.6 * SR)) / SR
            f = 40 + 50 * np.exp(-pt / 0.15)
            boom = 0.22 * np.exp(-pt / 0.45) * np.sin(2 * np.pi * np.cumsum(f) / SR)
            add(left, int(t_acc * SR), boom); add(right, int(t_acc * SR), boom)

    # Gentle low-pass, a short stereo reverb, fades, and a level that leaves room for the voice.
    out = []
    for ch, delays in ((left, ((0.113, 0.35), (0.271, 0.25), (0.419, 0.18))), (right, ((0.127, 0.35), (0.293, 0.25), (0.401, 0.18)))):
        ch = np.convolve(ch, np.ones(24) / 24, mode="same")
        for d, g in delays:
            di = int(d * SR)
            ch[di:] += g * ch[:-di]
        out.append(ch)
    out = np.stack(out, axis=1)
    fade_in, fade_out = int(1.5 * SR), int((3.0 if structured else 2.0) * SR)
    out[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    out[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
    out = out / (np.abs(out).max() + 1e-9) * 0.5
    with wave.open(a.out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
    print(f"wrote {a.out} ({total:.1f}s, {a.mood})")
    if structured:
        print("sections: " + ", ".join(f"{s0:.1f}" for s0, _ in sections) + "  accents: " + (", ".join(f"{x:.1f}" for x in accents) or "none"))


if __name__ == "__main__":
    main()
