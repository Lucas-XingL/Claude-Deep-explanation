#!/usr/bin/env python3
"""Check that a project's files fit together before rendering and before delivery.

Usage:
  python3 lint_project.py <project_dir> [--storyboard storyboard.json ...] [--script script.md]

Checks script.md, research/facts.md, every storyboard*.json (or the ones given),
research/assets.md and brief.md / choices.md:
  - line ids are unique, every {F..} exists in facts.md, facts have a level and a source;
  - storyboard shots have unique ids, their lines exist and are used once, evidence ids exist,
    shots without lines have a duration, routes and risks are known values;
  - the full storyboard uses every script line; the directing fields are filled in
    (meta question/throughline/answer; per shot new_info/subject/relation/change/result).

FAIL means the pipeline will break or a claim has no source; WARN means something to look at.
A clean run only says the files agree with each other. It does not say the content is right.
Exit code 1 when there is any FAIL.
"""
import argparse, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from timeline import LINE_RE, FACT_RE, SAY_RE  # same parsing as the timeline

FACT_ID_RE = re.compile(r"F\d+")
LEVEL_RE = re.compile(r"(?<![A-Za-z])[A-EGIRS](?![A-Za-z])")
ROUTES = {f"R{i}" for i in range(1, 10)}
RISKS = {"key_action", "continuity", "occlusion", "image_visibility"}
META_FIELDS = ("question", "throughline", "answer")
SHOT_FIELDS = ("new_info", "subject", "relation", "change", "result")
MAX_CLAUSE = 16   # timeline.py --max-chars for 16:9
MAX_ONSCREEN = 15

problems = []


def report(kind, where, msg):
    problems.append((kind, where, msg))


def read_script(path):
    """Return ({line_id: text_without_tags}, {line_id: [fact ids]}) and report duplicates."""
    texts, facts = {}, {}
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        m = LINE_RE.match(raw.strip())
        if not m:
            continue
        lid, body = m.groups()
        if lid in texts:
            report("FAIL", f"{path.name}:{n}", f"{lid} 重复出现，timeline.py 只会用最后一个")
        texts[lid] = SAY_RE.sub("", FACT_RE.sub("", body)).strip()
        facts[lid] = FACT_ID_RE.findall(" ".join(FACT_RE.findall(body)))
    return texts, facts


def read_facts(path):
    """Return {fact_id: (level_cell, source_cell)} from the markdown table."""
    out = {}
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        cells = [c.strip() for c in raw.strip().strip("|").split("|")]
        if not cells or not re.fullmatch(r"F\d+", cells[0]):
            continue
        fid = cells[0]
        if fid in out:
            report("FAIL", f"facts.md:{n}", f"{fid} 重复")
        level = cells[2] if len(cells) > 2 else ""
        source = cells[3] if len(cells) > 3 else ""
        if not LEVEL_RE.search(level):
            report("FAIL", f"facts.md:{n}", f"{fid} 没有证据等级（A–E、R、S、G、I）")
        if not source or source in {"—", "-", "…"}:
            report("FAIL", f"facts.md:{n}", f"{fid} 没有来源")
        out[fid] = (level, source)
    return out


def check_board(proj, path, script_texts, facts, full):
    name = path.name
    try:
        board = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        report("FAIL", name, f"JSON 格式错误：{e}")
        return
    meta = board.get("meta", {})
    for k in ("width", "height", "fps"):
        if k not in meta:
            report("WARN", name, f"meta 缺 {k}，会用默认值")
    missing_meta = [k for k in META_FIELDS if not meta.get(k)]
    if missing_meta:
        report("WARN", name, f"meta 缺主线字段 {', '.join(missing_meta)}（见 directing.md 第 1 节）")

    seen_ids, used = set(), {}
    lacking = {k: [] for k in SHOT_FIELDS}
    routes = set()
    for shot in board.get("shots", []):
        sid = shot.get("id", "?")
        where = f"{name} {sid}"
        if sid in seen_ids:
            report("FAIL", where, "镜头编号重复")
        seen_ids.add(sid)
        lines = shot.get("lines", [])
        if not lines and "duration" not in shot:
            report("FAIL", where, "没有口播，也没有 duration")
        for lid in lines:
            if lid not in script_texts:
                report("FAIL", where, f"{lid} 不在脚本里")
            elif lid in used:
                report("FAIL", where, f"{lid} 已经用在 {used[lid]}，同一句只能属于一个镜头")
            else:
                used[lid] = sid
        route = shot.get("route")
        routes.add(route)
        if route not in ROUTES:
            report("WARN", where, f"route 是 {route!r}，应为 R1–R9")
        src = shot.get("source")
        if not src:
            report("FAIL", where, "没有 source")
        elif not (proj / src).exists():
            report("WARN", where, f"source 还不存在：{src}（构建或渲染时生成的可以忽略）")
        for fid in shot.get("evidence", []):
            if fid not in facts:
                report("FAIL", where, f"evidence 里的 {fid} 不在 facts.md 里")
        for k in ("visual", "camera"):
            if not shot.get(k):
                report("WARN", where, f"缺 {k}")
        for k in SHOT_FIELDS:
            if not shot.get(k):
                lacking[k].append(sid)
        for r in shot.get("risks", []):
            if r not in RISKS:
                report("WARN", where, f"risks 里的 {r!r} 不认识，可用 {', '.join(sorted(RISKS))}")
        for text in shot.get("onscreen", []):
            if len(text) > MAX_ONSCREEN:
                report("WARN", where, f"屏幕文字超过 {MAX_ONSCREEN} 字：{text}")
    for k, sids in lacking.items():
        if sids:
            report("WARN", name, f"{len(sids)} 个镜头缺 {k}：{', '.join(sids)}（见 directing.md 第 1、2 节）")
    if full:
        unused = [lid for lid in script_texts if lid not in used]
        if unused:
            report("WARN", name, f"{len(unused)} 句口播没有放进任何镜头，不会出现在片中：{', '.join(unused)}")
    if routes & {"R7", "R8"} and not (proj / "research/assets.md").exists():
        report("FAIL", name, "用了 R7 或 R8 素材，但没有 research/assets.md（见 rights.md）")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--storyboard", action="append", help="default: every storyboard*.json in the project")
    ap.add_argument("--script", default="script.md")
    a = ap.parse_args()
    proj = Path(a.project)

    for f in ("brief.md", "choices.md"):
        if not (proj / f).exists():
            report("WARN", f, "不存在（第 0、2 步）")

    script_path = proj / a.script
    if not script_path.exists():
        report("FAIL", a.script, "不存在")
        script_texts, script_facts = {}, {}
    else:
        script_texts, script_facts = read_script(script_path)
    facts_path = proj / "research/facts.md"
    if not facts_path.exists():
        report("FAIL", "research/facts.md", "不存在")
        facts = {}
    else:
        facts = read_facts(facts_path)

    cited = set()
    for lid, text in script_texts.items():
        for fid in script_facts[lid]:
            cited.add(fid)
            if facts and fid not in facts:
                report("FAIL", f"{a.script} {lid}", f"{{{fid}}} 不在 facts.md 里")
        for clause in re.split(r"[，。！？；：、,.!?;:]", text):
            if len(clause.strip()) > MAX_CLAUSE:
                report("WARN", f"{a.script} {lid}", f"一个分句超过 {MAX_CLAUSE} 字，字幕会从中间断开：{clause.strip()}")
    uncited = [fid for fid in facts if fid not in cited]
    if uncited and script_texts:
        report("WARN", "facts.md", f"{len(uncited)} 条事实脚本里没有引用（可能只用在画面上）：{', '.join(uncited)}")

    boards = [proj / b for b in a.storyboard] if a.storyboard else sorted(proj.glob("storyboard*.json"))
    if not boards:
        report("WARN", "storyboard", "没有找到 storyboard*.json")
    for b in boards:
        if not b.exists():
            report("FAIL", b.name, "不存在")
            continue
        texts = script_texts
        if "vertical" in b.name and (proj / "script.vertical.md").exists():
            texts, _ = read_script(proj / "script.vertical.md")
        check_board(proj, b, texts, facts, full=not any(k in b.name for k in ("sample", "vertical")))

    for kind, where, msg in problems:
        print(f"{kind}  {where}: {msg}")
    fails = sum(1 for p in problems if p[0] == "FAIL")
    warns = len(problems) - fails
    print(f"\n结构检查：{fails} FAIL，{warns} WARN。只说明文件之间对得上，不说明内容正确。")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
