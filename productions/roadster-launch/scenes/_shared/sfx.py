#!/usr/bin/env python3
"""Roadster launch film: sound effects on the same word times the scenes use.

  S04  the four fans spin up on 风扇 (a hum whose pitch follows the spin-up), the skirts drop on 裙边
  S05  the fans keep running while air is pulled out from under the car
  S06  a slow whoosh while the section turns upside down
  S07  air rushing back in through the gap on 漏气
  S08  a soft mechanical click as the body comes apart
  S09  the valve opens on 阀门 and the jet hisses; a whoosh for the turn on 转起来
  S10  a burst of jet on 离地 for the hop over the cars, a thump on landing
  S11  a long hiss that fades as the gas runs out (MODEL.hoverAt: loudness follows the thrust)
  S13  one soft fan swell on 倒挂靠吸 and a jet puff on 翻身靠喷

Usage: python3 sfx.py audio/timeline.json audio/sfx.wav
"""
import json, re, subprocess, sys, wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)
SKIP = re.compile(r"[\s，。！？；：、,.!?;:“”\"'（）()《》—…·-]")


def word_time(line, phrase):
    """When a phrase is spoken in a line (shot-relative seconds), the same matching as atWord."""
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


def seg(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def band_noise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def fan_hum(t, spin):
    """Four fans: a blade-pass tone whose pitch and level follow the spin (0..1)."""
    phase = 2 * np.pi * np.cumsum(60 + 160 * spin) / SR
    tone = np.sin(phase) + 0.35 * np.sin(2 * phase) + 0.15 * np.sin(3 * phase)
    return spin * (0.10 * tone + 0.05 * band_noise(len(t), 200, 2500))


def thump(n, at, f0=70, decay=0.18, level=0.5):
    t = np.arange(n) / SR - at
    env = np.where(t >= 0, np.exp(-np.maximum(t, 0) / decay), 0)
    return level * env * np.sin(2 * np.pi * f0 * np.maximum(t, 0))


def hover_thrust(seconds):
    """Normalised thrust while hovering on the gas, from the film's model (scenes/_shared/model.js)."""
    model = Path(__file__).with_name("model.js")
    js = ("global.window={};require(process.argv[1]);const M=window.MODEL;const out=[];"
          "for(let i=0;i<=%d;i++){out.push(M.hoverAt(i*0.05).thrust)}console.log(JSON.stringify(out))" % int(seconds / 0.05))
    vals = np.array(json.loads(subprocess.run(["node", "-e", js, str(model)], capture_output=True, text=True, check=True).stdout))
    return vals / vals.max()


def main():
    tl = json.load(open(sys.argv[1]))
    out = np.zeros(int((tl["total"] + 1) * SR))
    for shot in tl["shots"]:
        sid, L = shot["id"], {l["id"]: l for l in shot["lines"]}
        i0, n = int(shot["start"] * SR), int(shot["duration"] * SR)
        t = np.arange(n) / SR
        D = shot["duration"]
        add = lambda sig: out.__setitem__(slice(i0, i0 + n), out[i0:i0 + n] + sig)
        if sid == "S04":
            f = word_time(L["L006"], "风扇")
            add(fan_hum(t, seg(t, f - 0.2, f + 1.6) ** 1.5))
            add(thump(n, word_time(L["L006"], "裙边") + 0.1, f0=90, level=0.35))
        elif sid == "S05":
            add(fan_hum(t, np.ones(n)) * (1 - 0.3 * seg(t, D - 1, D)))
            k = word_time(L["L007"], "抽走")
            add(0.08 * seg(t, k, k + 1.5) * (1 - seg(t, D - 1.5, D)) * band_noise(n, 400, 4000))
        elif sid == "S06":
            add(0.05 * fan_hum(t, np.ones(n)) / 0.15)
            a = word_time(L["L008"], "倒挂")
            env = np.exp(-((t - (a + 1.2)) / 0.9) ** 2)
            add(0.25 * env * band_noise(n, 200, 1800))
        elif sid == "S07":
            add(0.04 * fan_hum(t, np.ones(n)) / 0.15)
            k = word_time(L["L011"], "漏气")
            env = seg(t, k - 0.3, k + 0.2) * np.exp(-np.maximum(t - k - 0.2, 0) / 1.2)
            add(0.35 * env * band_noise(n, 600, 6000))
        elif sid == "S08":
            k = word_time(L["L012"], "推进器")
            add(thump(n, k, f0=160, decay=0.06, level=0.25))
        elif sid == "S09":
            v = word_time(L["L014"], "阀门")
            jet = seg(t, v + 0.3, v + 0.5) * (1 - seg(t, D - 0.8, D))
            add(0.30 * jet * (0.7 * band_noise(n, 1500, 9000) + 0.3 * band_noise(n, 80, 500)))
            r = word_time(L["L015"], "转起来")
            add(0.22 * np.exp(-((t - (r + 0.6)) / 0.7) ** 2) * band_noise(n, 200, 2000))
        elif sid == "S10":
            k = word_time(L["L017"], "离地")
            burst = seg(t, k - 0.1, k + 0.1) * (1 - seg(t, k + 1.6, k + 2.4))
            add(0.38 * burst * (0.7 * band_noise(n, 1500, 9000) + 0.3 * band_noise(n, 80, 500)))
            add(thump(n, min(D - 0.5, word_time(L["L017"], "飞过去") + 0.9), f0=60, level=0.45))
        elif sid == "S11":
            a, b = word_time(L["L019"], "悬停"), L["L019"]["end"]
            thr = hover_thrust(12)
            idx = np.clip(((t - a) / 0.05).astype(int), 0, len(thr) - 1)
            env = np.where((t >= a) & (t <= b + 0.5), thr[idx], 0) * seg(t, a, a + 0.3) * (1 - seg(t, b, b + 0.5))
            add(0.22 * env * band_noise(n, 1200, 8000))
        elif sid == "S13":
            s = word_time(L["L023"], "倒挂靠吸")
            add(0.6 * fan_hum(t, np.exp(-((t - s - 0.6) / 0.6) ** 2)))
            p = word_time(L["L023"], "翻身靠喷")
            add(0.18 * np.exp(-((t - p - 0.4) / 0.25) ** 2) * band_noise(n, 1500, 8000))
    out = np.clip(out, -1, 1)
    data = (np.stack([out, out], axis=1) * 32767 * 0.8).astype(np.int16)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print("wrote", sys.argv[2])


if __name__ == "__main__":
    main()
