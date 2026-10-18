#!/usr/bin/env python3
"""Build the plan page (plan/index.html) the user confirms before the full film is made.

Usage:
  python3 make_plan.py <project_dir> [--storyboard storyboard.json] [--script script.md]
                       [--timeline plan/est/timeline.json] [--voice L001,L002] [--bare]

Reads storyboard.json (meta question/throughline/answer, shots with their directing fields and
optional "frames": [{"image": "...png", "caption": "..."}]), script.md, research/facts.md,
brief.md, choices.md, plan/decisions.md and scenes/_shared/model.js (its report() output).

Timing: audio/timeline.json when every line has been voiced, otherwise an estimate made with
timeline.py into plan/est/ (no audio needed). --voice copies those lines' audio from
audio/lines/ into the page so the user can hear the voice before the rest is made.

plan/decisions.md holds the questions for the user, one "## question" each, options as
"- [推荐] …" or "- …", other lines as a note.

Writes plan/index.html plus plan/frames/ and plan/voice/. Open it in a browser, or publish the
plan/ folder. --bare leaves out the <!doctype>/<html>/<head> wrapper, for hosts that add their own.
"""
import argparse, datetime, html, json, re, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from timeline import LINE_RE, FACT_RE, SAY_RE  # same parsing as the timeline

LEVEL_RE = re.compile(r"(?<![A-Za-z])[A-EGIRS](?![A-Za-z])")
AUDIO_EXT = (".mp3", ".wav", ".m4a")


def md(text):
    """A small Markdown subset (headings, lists, bold, code, links, paragraphs) to HTML."""
    out, list_tag, rows = [], None, []
    def inline(s):
        s = html.escape(s)
        s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
        s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
        return re.sub(r"\[(.+?)\]\((https?://[^)\s]+)\)", r'<a href="\2">\1</a>', s)
    def flush_table():
        if rows:
            body = "".join("<tr>" + "".join(f"<{'th' if i == 0 else 'td'}>{inline(c)}</{'th' if i == 0 else 'td'}>"
                                            for c in r) + "</tr>" for i, r in enumerate(rows))
            out.append(f'<div class="tbl"><table>{body}</table></div>')
            rows.clear()
    for raw in text.splitlines():
        line = raw.rstrip()
        if line.lstrip().startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if not all(re.fullmatch(r":?-{3,}:?", c) for c in cells):
                rows.append(cells)
            continue
        flush_table()
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if m:
            tag = "ol" if m.group(2)[0].isdigit() else "ul"
            if list_tag != tag:
                if list_tag:
                    out.append(f"</{list_tag}>")
                out.append(f"<{tag}>")
                list_tag = tag
            out.append(f"<li>{inline(m.group(3))}</li>")
            continue
        if list_tag:
            out.append(f"</{list_tag}>")
            list_tag = None
        h = re.match(r"^(#{1,3})\s+(.*)$", line)
        if h:
            out.append(f"<h{len(h.group(1)) + 1}>{inline(h.group(2))}</h{len(h.group(1)) + 1}>")
        elif line.strip():
            out.append(f"<p>{inline(line.strip())}</p>")
    if list_tag:
        out.append(f"</{list_tag}>")
    flush_table()
    return "\n".join(out)


def read_facts(path):
    facts, col = {}, {"事实": 1, "等级": 2, "来源": 3}
    if not path.exists():
        return facts
    for raw in path.read_text(encoding="utf-8").splitlines():
        cells = [c.strip() for c in raw.strip().strip("|").split("|")]
        if cells and cells[0] == "编号":
            col = {name: i for i, name in enumerate(cells)}
            continue
        if not cells or not re.fullmatch(r"F\d+", cells[0]):
            continue
        get = lambda name: cells[col[name]] if name in col and col[name] < len(cells) else ""
        facts[cells[0]] = {"id": cells[0], "text": get("事实"), "level": "/".join(dict.fromkeys(LEVEL_RE.findall(get("等级")))),
                           "scope": get("口径"), "source": get("来源")}
    return facts


def read_script(path, facts):
    sections, current = [], None
    for raw in path.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if s.startswith("## "):
            current = [s[3:].strip(), []]
            sections.append(current)
            continue
        m = LINE_RE.match(s)
        if not m:
            continue
        if current is None:
            current = ["", []]
            sections.append(current)
        lid, body = m.groups()
        fids = re.findall(r"F\d+", " ".join(FACT_RE.findall(body)))
        current[1].append({"id": lid, "text": SAY_RE.sub("", FACT_RE.sub("", body)).strip(),
                           "facts": [{"id": f, "level": facts.get(f, {}).get("level", "")} for f in fids]})
    return sections


def read_decisions(path):
    out = []
    if not path.exists():
        return out
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("## "):
            out.append({"q": line[3:].strip(), "options": [], "note": ""})
        elif out and re.match(r"^[-*]\s+", line):
            text = re.sub(r"^[-*]\s+", "", line)
            rec = text.startswith("[推荐]")
            out[-1]["options"].append({"text": text.replace("[推荐]", "", 1).strip(), "rec": rec})
        elif out and line:
            out[-1]["note"] = (out[-1]["note"] + " " + line).strip()
    return out


def model_report(proj):
    js = proj / "scenes/_shared/model.js"
    if not js.exists():
        return ""
    code = ("global.window={};require(process.argv[1]);"
            "for(const k of Object.keys(window)){const m=window[k];if(m&&typeof m.report==='function'){m.report();break}}")
    try:
        r = subprocess.run(["node", "-e", code, str(js)], capture_output=True, text=True, timeout=20)
        return r.stdout.strip() or r.stderr.strip()
    except (OSError, subprocess.TimeoutExpired) as e:
        return f"model.js 运行失败：{e}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--storyboard", default="storyboard.json")
    ap.add_argument("--script", default="script.md")
    ap.add_argument("--timeline", help="default: audio/timeline.json if every line is voiced, else an estimate in plan/est/")
    ap.add_argument("--voice", default="", help="comma-separated line ids whose audio goes into the page")
    ap.add_argument("--bare", action="store_true", help="no <!doctype>/<html>/<head> wrapper")
    a = ap.parse_args()
    proj = Path(a.project).resolve()
    plan = proj / "plan"
    plan.mkdir(exist_ok=True)

    board = json.loads((proj / a.storyboard).read_text(encoding="utf-8"))
    facts = read_facts(proj / "research/facts.md")
    script = read_script(proj / a.script, facts)
    all_lines = [l for _, ls in script for l in ls]

    # Timing: measured when every line in the storyboard has audio, otherwise estimated.
    used = [lid for s in board["shots"] for lid in s.get("lines", [])]
    voiced = all(any((proj / "audio/lines" / f"{lid}{e}").exists() for e in AUDIO_EXT) for lid in used)
    if a.timeline:
        tl_path, measured = proj / a.timeline, voiced
    elif voiced and (proj / "audio/timeline.json").exists():
        tl_path, measured = proj / "audio/timeline.json", True
    else:
        subprocess.run([sys.executable, str(HERE / "timeline.py"), str(proj), "--storyboard", a.storyboard,
                        "--script", a.script, "--out", "plan/est"], check=True, capture_output=True)
        tl_path, measured = plan / "est/timeline.json", False
    tl = {s["id"]: s for s in json.loads(tl_path.read_text(encoding="utf-8"))["shots"]}

    # Frames: copy each shot's images next to the page.
    frames_dir = plan / "frames"
    shutil.rmtree(frames_dir, ignore_errors=True)
    frames_dir.mkdir()
    shots, minutes = [], 20.0  # voice, timeline, assembly and checks
    for s in board["shots"]:
        t = tl.get(s["id"], {"start": 0, "end": 0})
        frames = []
        for k, fr in enumerate(s.get("frames", [])):
            src = proj / fr.get("image", "")
            if src.is_file():
                dst = frames_dir / f"{s['id']}_{k + 1}{src.suffix.lower()}"
                shutil.copyfile(src, dst)
                frames.append({"src": f"frames/{dst.name}", "caption": fr.get("caption", "")})
        # Rough minutes left for this shot (4-core container, measured on the samples): anatomy
        # renders take about 2 min per film second, code scenes about 0.3; a scene that is not
        # written yet adds about 30 min (2D) or 15 min (keyframes for an existing anatomy model).
        dur = t["end"] - t["start"]
        source = s.get("source", "")
        anatomy = "motion/shots/" in source or source.endswith(".mjs")
        if not (proj / "scenes" / s["id"] / "clip.mp4").exists():
            minutes += dur * (2 if anatomy else 0.3)
            if not anatomy and source and not (proj / source).exists():
                minutes += 30
            if anatomy and not (proj / source).exists():
                minutes += 15
        shots.append({k: s.get(k) for k in ("id", "section", "route", "asset", "visual", "camera", "new_info", "subject",
                                            "relation", "change", "result", "hold", "onscreen", "risks")}
                     | {"lines": s.get("lines", []), "start": t["start"], "end": t["end"], "frames": frames})

    # Voice samples.
    voice_dir = plan / "voice"
    shutil.rmtree(voice_dir, ignore_errors=True)
    voice = []
    for lid in [x.strip() for x in a.voice.split(",") if x.strip()]:
        src = next((proj / "audio/lines" / f"{lid}{e}" for e in AUDIO_EXT if (proj / "audio/lines" / f"{lid}{e}").exists()), None)
        if src:
            voice_dir.mkdir(exist_ok=True)
            shutil.copyfile(src, voice_dir / src.name)
            voice.append({"id": lid, "src": f"voice/{src.name}"})
        else:
            print(f"no audio for {lid} in audio/lines/", file=sys.stderr)

    # Master models are not counted: the style frames already needed them.
    lo, hi = minutes * 0.7, minutes * 1.5
    estimate = f"{lo:.0f}–{hi:.0f} 分钟" if hi < 90 else f"{lo / 60:.1f}–{hi / 60:.1f} 小时"

    lint = subprocess.run([sys.executable, str(HERE / "lint_project.py"), str(proj), "--storyboard", a.storyboard,
                           "--script", a.script], capture_output=True, text=True).stdout
    lint_lines = [l for l in lint.splitlines() if l.startswith(("FAIL", "WARN"))]

    brief = proj / "brief.md"
    request = ""
    if brief.exists():
        m = re.search(r"用户原话\*{0,2}[：:]\s*(.+)", brief.read_text(encoding="utf-8"))
        request = m.group(1).strip() if m else ""
    data = {
        "title": board["meta"].get("title", proj.name),
        "generated": datetime.date.today().isoformat(),
        "request": request,
        "meta": {k: board["meta"].get(k, "") for k in ("question", "throughline", "answer")},
        "brief": md(brief.read_text(encoding="utf-8")) if brief.exists() else "",
        "choices": md((proj / "choices.md").read_text(encoding="utf-8")) if (proj / "choices.md").exists() else "",
        "assets": md((proj / "research/assets.md").read_text(encoding="utf-8")) if (proj / "research/assets.md").exists() else "",
        "decisions": read_decisions(plan / "decisions.md"),
        "duration": max((s["end"] for s in shots), default=0),
        "timing_measured": measured,
        "lines": len(all_lines),
        "chars": sum(len(re.sub(r"[，。？！：、；,.?!:;\s“”\"]", "", l["text"])) for l in all_lines),
        "estimate": estimate,
        "shots": shots,
        "script": script,
        "facts": list(facts.values()),
        "voice": voice,
        "model": model_report(proj),
        "lint": lint_lines,
    }
    page = (HERE.parent / "templates/plan.html").read_text(encoding="utf-8")
    page = page.replace("<title>方案页</title>", f"<title>{html.escape(data['title'])} · 方案</title>", 1)
    page = page.replace("/*__PLAN__*/null", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"), 1)
    if not a.bare:
        page = '<!doctype html>\n<html lang="zh">\n' + page + "\n</html>\n"
    (plan / "index.html").write_text(page, encoding="utf-8")
    fails = sum(1 for l in lint_lines if l.startswith("FAIL"))
    print(f"wrote {plan / 'index.html'}  ({len(shots)} shots, {data['duration']:.1f} s "
          f"{'measured' if measured else 'estimated'}, {sum(len(s['frames']) for s in shots)} frames, "
          f"{len(voice)} voice lines, lint {fails} FAIL / {len(lint_lines) - fails} WARN)")


if __name__ == "__main__":
    main()
