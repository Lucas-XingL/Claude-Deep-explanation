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
    (meta question/throughline/answer; per shot new_info/subject/relation/change/result);
    every shot's asset is one of the storyboard's master assets; the film opens on a real picture
    (R7) or a labelled AI recreation (R8), and those shots carry a credit;
  - a line citing a C or D fact says who claims it (说、称、据……); a line citing an E fact
    sounds like an estimate (算、约、如果……); numeric facts say what the number covers (口径).

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
# Words that attribute a claim, and words that mark an estimate (checked on lines citing C/D or E facts).
ATTRIB_RE = re.compile(r"说|称|据|表示|透露|介绍|计时|公布|声明|宣布|传闻|消息|爆料|号称|官方|工程师|报道|显示")
ESTIMATE_RE = re.compile(r"算|估|如果|假设|按|大约|约|左右|大概|差不多|理想|示意|至少|最多|上下|几乎|比如|例如|假如|设")

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
    """Return {fact_id: level_cell} from the markdown table; columns are found by their headers."""
    out, col = {}, {"事实": 1, "等级": 2, "来源": 3}
    numeric_without_scope = []
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        cells = [c.strip() for c in raw.strip().strip("|").split("|")]
        if cells and cells[0] == "编号":
            col = {name: i for i, name in enumerate(cells)}
            continue
        if not cells or not re.fullmatch(r"F\d+", cells[0]):
            continue
        get = lambda name: cells[col[name]] if name in col and col[name] < len(cells) else ""
        fid = cells[0]
        if fid in out:
            report("FAIL", f"facts.md:{n}", f"{fid} 重复")
        level, source = get("等级"), get("来源")
        if not LEVEL_RE.search(level):
            report("FAIL", f"facts.md:{n}", f"{fid} 没有证据等级（A–E、R、S、G、I）")
        if not source or source in {"—", "-", "…"}:
            report("FAIL", f"facts.md:{n}", f"{fid} 没有来源")
        letters = sorted(set(LEVEL_RE.findall(level)))
        if len(letters) > 1:
            report("WARN", f"facts.md:{n}", f"{fid} 混合了 {'、'.join(letters)} 几个等级，建议拆成几条，每条一个等级")
        if re.search(r"\d", get("事实")) and not get("口径"):
            numeric_without_scope.append(fid)
        out[fid] = level
    if numeric_without_scope:
        where = "缺“口径”列" if "口径" not in col else "“口径”为空"
        report("WARN", "facts.md", f"{len(numeric_without_scope)} 条带数字的事实{where}，写清这个数指的是什么"
               f"（哪个量、方向、条件、谁测的）：{', '.join(numeric_without_scope)}（见 research.md 第 2 节）")
    return out


def level_of(level):
    """The fact's single level letter, or "" when the cell mixes several (those are skipped)."""
    letters = set(LEVEL_RE.findall(level))
    return letters.pop() if len(letters) == 1 else ""


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

    masters = set(board.get("assets", {}))
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
        asset = shot.get("asset")
        if asset and asset not in masters:
            report("WARN", where, f"asset {asset!r} 不在 assets 里；同一个主体要来自同一个母版资产（见 directing.md 第 5 节）")
        if route == "R1" and not asset:
            report("WARN", where, "R1 镜头没有写 asset（用哪个剖解模型）")
        if "hold" in shot and not str(shot["hold"]).strip():
            report("WARN", where, "hold 要写原因，比如“让观众读完这张图”")
        if route in ("R7", "R8") and not shot.get("credit"):
            report("WARN", where, "真实画面或 AI 还原的镜头要写 credit（屏幕上的来源署名，见 footage.md）")
        if route == "R8" and not any("AI" in str(x) for x in shot.get("onscreen", [])):
            report("WARN", where, "R8 镜头的 onscreen 里要有“AI 还原画面”或“AI 生成画面”角标")
        for fr in shot.get("frames", []):
            if fr.get("image") and not (proj / fr["image"]).exists():
                report("WARN", where, f"方案页的画面还不存在：{fr['image']}")
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
    shots = board.get("shots", [])
    if shots and "sample" not in name and shots[0].get("route") not in ("R7", "R8") and not meta.get("no_real_opening"):
        report("WARN", name, "第一个镜头不是真实画面（R7）或 AI 还原（R8）。开场先给真实画面，见 footage.md；"
               "有意不用，就在 meta 里写 no_real_opening 和理由")
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
        levels = {level_of(facts.get(fid, "")) for fid in script_facts[lid]}
        if levels & {"C", "D"} and not ATTRIB_RE.search(text):
            report("WARN", f"{a.script} {lid}", "引用了 C/D 级事实，但句子里没有“说、称、据”之类的归属词，听起来像已证实的事实")
        if "E" in levels and not ATTRIB_RE.search(text) and not ESTIMATE_RE.search(text):
            report("WARN", f"{a.script} {lid}", "引用了 E 级估算，但句子听起来像事实；用“算下来、大约、如果按……”")
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
