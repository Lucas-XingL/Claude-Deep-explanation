# HyperFrames 路线

[HyperFrames](https://github.com/heygen-com/hyperframes)（HeyGen 开源，Apache-2.0）把一个 HTML 页面加一条 GSAP 时间线逐帧渲染成视频，和 `capture_frames.mjs` 是同一类做法。它多出来的是：

- **组件库**：约 210 个模块（数据图表、条形图赛跑、世界地图、航线、流程图、各种转场、光效）和约 240 个组件（数字滚动、逐词上浮、手写圈注、下划线、卡拉 OK 字幕……），装进来改一改就能用；
- **检查**：渲染前查一遍运行错误、元素越界、动作、文字对比度（WCAG AA），还能把底部字幕区设成禁区；
- **并行渲染**：多个 Chrome 进程同时出帧；可以输出带透明通道的 mov / webm。

这个 skill 用它做精致的信息动效镜头：玻璃卡片、逐字上浮的标题、随口播滚动的数字、光扫、图表、地图。

## 1. 什么时候用

| 镜头 | 用什么 |
|---|---|
| R2 信息动效：数据卡、宣称与证实对照、要点列表、标题、章节卡 | **HyperFrames**（`templates/hyperframes/`），简单的也可以用 `capture_frames.mjs` |
| 数据图表、条形图赛跑、热力图、流程图 | HyperFrames 组件库（`data-chart`、`bar-chart-race`、`heatmap`、`flowchart`），数据换成事实表里的 |
| R4 地图与路线 | HyperFrames 组件库（`world-map`、`us-map-flow`、`nyc-paris-flight`）可以做底子；需要 d3 投影、精确路线时仍用 Canvas/SVG 场景 |
| 纸面风的原理图、受力、推导，读 `model.js`、用机器时间 `tauAt` 的场景 | `templates/scene-paper.html` + `capture_frames.mjs`（逐帧画 Canvas，乱序复查） |
| R1 anatomy 物体 | `scripts/anatomy/render_shot.sh` |
| 真实画面开场 | `scripts/footage.sh` + `templates/scene-reveal.html` |

同一部片子里可以混用：每个镜头最后都是 `scenes/<id>/clip.mp4`，`assemble.py` 不关心它是怎么渲染的。混用时颜色、字体、角标都从 `style.json` 取（模板已经照抄了 paper 和 dark 两套），看起来才像同一部片子。

## 2. 安装（每个工程跑一次）

```sh
bash scripts/hyperframes/setup.sh <proj>
```

- 把 hyperframes（固定版本 `HF_VERSION`，默认 0.8.172）、GSAP 和字体装到 `~/.cache/explainer-video/hyperframes`（所有工程共用），下载它渲染用的 Chrome Headless Shell，跑一遍 `doctor`。
- 往工程里放两样东西：`scenes/_shared/fonts/`（思源黑体、思源宋体的可变字体，按字符集分片；IBM Plex Mono），`scenes/_shared/vendor/gsap.min.js`。渲染时不依赖字体 CDN、系统字体和 GSAP 的 CDN。
- 占用：工具约 160 MB，Chrome 约 260 MB，每个工程的字体约 11 MB（`.gitignore` 里排除，换机器重跑 `setup.sh`）。
- 需要的网络：npm 源、Chrome 下载；用组件库时还要能访问 `raw.githubusercontent.com`。
- 遥测：脚本对每个 hyperframes 命令都设了 `HYPERFRAMES_NO_TELEMETRY=1`、`DO_NOT_TRACK=1`。自己手动跑命令时也设上。
- **不要把画面发出去**：`hyperframes snapshot` 在设置了 `GEMINI_API_KEY` 时会默认把截图发给 Gemini 做描述。`render_shot.sh` 传了 `--describe false`；手动跑 `snapshot` 也要加上。
- HyperFrames 自己的 agent skill（`npx skills add heygen-com/hyperframes`）讲 GSAP 和它的写法，可以装来参考；和这里的约定冲突时，以这里为准（时间来自口播、字幕区留空、证据角标）。

## 3. 工程里的样子

```
scenes/
  _shared/
    fonts/fonts.css        setup.sh 写的；字体族名 "Noto Sans SC Variable"、"Noto Serif SC Variable"、"Plex Mono"
    vendor/gsap.min.js
    model.js               数值模型（可选，和 2D 场景共用）
  S03/
    index.html             从 templates/hyperframes/index.html 复制来改
    hyperframes.json       同一个模板目录里的，hyperframes add 靠它知道往哪装
    compositions/          组件库装进来的模块和组件（hyperframes add）
    shot.js                render_shot.sh 按时间轴写的，不要手改
    clip.mp4               成品
```

一个合成可以给几个镜头用（比如 `scenes/cards/` 给 S03、S07），渲染时用镜头 id 区分，`SHOT.id` 可以在页面里分支。

## 4. 合成的约定

模板已经按这些写好了，改的时候保持住：

- **根元素**：`<div id="root" data-composition-id="main" data-start="0" …>`。`data-duration`、`data-width`、`data-height` 由构建脚本按时间轴改写，源文件里写什么都行。
- **一条时间线**：`const tl = gsap.timeline({ paused: true })`，最后 `tl.set({}, {}, D)` 撑满整个镜头，注册成 `window.__timelines["main"]`。
- **时间都来自口播**：`window.SHOT`（`shot.js`）和 `capture_frames.mjs` 给 HTML 场景的完全一样。`wordAt("L004", "零点八")` 是说出这个词的那一刻（有逐词时间时按词，没有时按字在句中的位置估）。不要手写秒数，换了配音就全错了。
- **模块和视频也能卡在词上**：给子合成、组件库模块、视频元素写 `data-start="@L004:零点八-0.3"`（这个词前 0.3 秒）、`data-start="@L004"`（这句开头）、`data-duration="@rest"`（到镜头结束）或 `data-duration="@L006"`（到 L006 开头）。构建时换算成秒。
- **动作写法**：
  - GSAP 移动的元素不要再写 CSS `transform`（lint 会拦），初始状态用 `fromTo` 或 `set` 给；
  - 计数器从补间的值算（`n.v.toFixed(2)`），不要在 `onUpdate` 里累加；渲染时会跳着取帧，状态必须只由时间决定；
  - 整个镜头要一直有一点动：缓慢推近、网格漂移、光斑移动（模板最上面三行）。
- **版面**：
  - 底部字幕区（`style.json` 的 `safe.bottomForSubs`：横版 16%，竖版 22%）不放任何东西，检查会拦；角落小字放在顶部；
  - 有意超出容器的元素（光扫）加 `data-layout-allow-overflow`；
  - 字号用 `style.json` 的 `type`，一屏不超过 `maxCharsOnScreen` 个字的正文；
  - 模板是 16:9 的版面，竖版要另写一套布局。
- **字体**：只写 `fonts.css` 里的三个字体族，不写系统字体名（不同机器渲染出来不一样，编译器也会报 “No deterministic font mapping”）。
- **证据角标**：宣称、估算、复原的数字旁边挂 `style.json` 的角标（模板里的“宣称”“特斯拉自己计时”）。纸面主题里 accent 色做小字时对比度不够，模板把它压深了（`--claim`、`--fact`），不要改回去。

## 5. 渲染

```sh
SK=<本 skill>/scripts
# 方案页的风格帧（第 6 步）：按估算时间轴出指定时刻的静帧
bash $SK/hyperframes/render_shot.sh scenes/S03 plan/est/timeline.json S03 scenes/S03/clip.mp4 \
     --stills-only --stills-at 2,9 --stills-out plan/stills/S03

# 正式渲染（第 8 步）
bash $SK/hyperframes/render_shot.sh scenes/S03 audio/timeline.json S03 scenes/S03/clip.mp4

# 边改边看：打开 HyperFrames 的预览界面（用上次写的 shot.js 里的真实时间）
HYPERFRAMES_NO_TELEMETRY=1 ~/.cache/explainer-video/hyperframes/node_modules/.bin/hyperframes preview scenes/S03
```

`render_shot.sh` 依次做这些事：

1. **缓存**：合成目录里的文件、`_shared/`、这个镜头的时间、选项都没变时直接跳过（`clip.mp4.inputs.sha256`）；`--force` 强制重渲。
2. **构建**：复制一份到临时目录，写 `shot.js`，改写根元素的时长和尺寸，换算 `@L004:…` 时间，把 `../_shared/` 的文件带进来（HyperFrames 只能读到工程目录里的文件）。
3. **检查**：`hyperframes check`，字幕区设成错误区。有错误就停下，按提示改（提示里有选择器和建议的颜色值）。`--no-check` 只跑 lint；`--check-args "--no-contrast"` 可以临时跳过对比度检查，交付前不能跳。
4. **渲染**：`--quality looks`（默认，CRF 16）/ `draft` / `delivery`，`--workers auto` 或数字，`--format mp4`（默认）/ `mov` / `webm`（后两种带透明通道）。
5. **核对**：片段时长和镜头时长差超过 0.1 秒就报错；导出中间一帧 `clip.mp4.check.png`。

## 6. 组件库

```sh
cd scenes/S04
HYPERFRAMES_NO_TELEMETRY=1 <hyperframes> catalog --type block --query 地图   # 或 --tag transition
HYPERFRAMES_NO_TELEMETRY=1 <hyperframes> add data-chart                       # 装到 compositions/
```

- **模块（block）**是一个子合成（`compositions/<name>.html`），在 `index.html` 里用 `<div data-composition-id="…" data-composition-src="compositions/<name>.html" data-start="@L004:…" data-duration="@rest" …>` 引用，写法 `add` 会打印出来。
- **组件（component）**是一段代码，复制进自己的合成里用。
- **装进来的只是起点，必须改完才能用**：
  - **数据全部换掉**。组件库里的数字、标签、标题都是演示用的假数据（例如 “Monthly Revenue vs. Conversion Rate”），一个都不能留；换成事实表里的数，带上口径和角标；
  - 字体换成我们的三种（它们大多从 Google Fonts 加载英文字体，渲染时要联网，也没有中文字形）；
  - 颜色换成 `style.json`，字号放大到我们的标准（组件库的小字在 1080p 下常常只有 13–16px）；
  - 来源行、角落小字常常放在底部字幕区，检查会拦，挪到顶部；
  - 实测：原样装进来的 `data-chart` 没通过检查（两处对比度、一处字幕区）。

## 7. 和其他检查的关系

- `render_shot.sh` 只检查这个镜头本身。合成以后照常跑 `contact_sheet.sh` 和 `check_sync.py`（实测：HyperFrames 镜头的逐句变化率 11–19%，全部通过）。
- 渲染前看静帧，渲染后看 `clip.mp4.check.png`，交付前看成片抽帧（`verify.md`）。
- HyperFrames 的渲染是按时间跳帧取的，状态依赖上一帧的写法会在成片里出错，`capture_frames.mjs` 的乱序复查在这里没有。所以第 4 节的“状态只由时间决定”要自己守住，看静帧时专门看一眼跳到中间的那几帧。

## 8. 实测（4 核云容器，软件渲染，无 GPU）

| 环节 | 用时 |
|---|---|
| `setup.sh` | 首次要下载约 160 MB 的包和约 260 MB 的 Chrome，用时看网络；npm 和 Chrome 都有缓存时 7 秒 |
| 检查（10 个采样点，含对比度） | 约 25 秒 |
| 5 张静帧（含检查） | 约 40 秒 |
| 21.9 秒、1080p、30fps 的镜头 | 1 个 worker 约 85 秒；4 个 worker 约 55 秒，加检查共约 80 秒 |
| 没变的镜头再跑一次 | 0.1 秒（缓存） |

## 9. 踩过的坑

- 给包住全部内容的外层 `div` 写了 `data-start`、`data-duration`，lint 报 `nested_structure_needs_subcomposition`：外层就用普通 `div`，只有根元素和真正的子合成写这些属性。
- 角落小字（“FIG 2 · …”）放在右下角，压进字幕区：挪到右上角。
- 光扫元素被报越界：加 `data-layout-allow-overflow`。
- 字体栈里写了系统字体作后备，编译器报字体映射不确定：只写本地字体加通用族名。
- 纸面主题直接用 `style.json` 的 accent（#E4572E）做小字，对比度 2.9:1 不够：压深到 #B53F28。
- 第一版版面太小、内容都挤在上半屏：标题 92px、卡片标题 50px、数字 176px，内容从安全区顶部排到字幕区上沿。
