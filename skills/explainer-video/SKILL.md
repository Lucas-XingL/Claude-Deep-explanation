---
name: explainer-video
description: 把一个选题做成有配音、字幕和动画的科普讲解视频或短纪录片，输出 MP4。选题可以是新品、工程原理、人物与企业、科学概念、历史事件、生产过程或商业故事。流程是：先研究并给事实分级，让用户选视觉路线，再写脚本、做分镜，然后配音先行排出时间轴，用代码逐帧渲染画面（Remotion、HyperFrames、Manim、Canvas、p5、Three.js 或 anatomy 等距剖解），最后用 ffmpeg 合成并抽帧自检。用户说“做一个 X 分钟的科普视频 / 讲解视频 / 短纪录片”“用动画讲清楚……”，或者想把一个原理、事件、人物、产品讲给普通人听并输出视频时使用，即使他们没提“动画”或“代码”。工程或机械类对象（比如特斯拉 Roadster 的设计原理）走 anatomy 剖解路线。
compatibility: 任何能执行 shell、读写文件、能看图片的 agent（Claude Code、Codex、OpenCode 等）。需要 Node.js 20+、Chromium 或 Chrome、ffmpeg、Python 3.10+。anatomy 路线还需要 ImageMagick 7。
---

# 科普讲解视频

一句话概括这套方法：**先定事实和讲法，再让代码一帧一帧把画面画出来。** 视频模型只用来补代码画不了的镜头。

## 七条原则

1. **全片围绕一个问题。** 开头抛出一个观众真想知道答案的问题，比如“连光都逃不出来，为什么还能拍到它？”，结尾要回答它。每个镜头都要服务于这个问题。
2. **讲因果和选择，不罗列。**
   - 机制类讲连续因果：A 推动 B，B 又受 C 限制。
   - 人物和企业讲当时有哪些选项、为什么选了这个、付出了什么代价。
   - 历史事件讲某一步为什么必须这样做。
3. **画面本身就是解释**（这条借自 anatomy）。能用一个真实的物体、机构、地图或实验装置讲清楚的，就不要画方框和箭头。屏幕上出现的每个数字，都来自同一份事实表或计算模型。
4. **事实要分级，边界要说清。** 在事实表里给每条信息标等级：官方或实测、可靠报道、当事人宣称、传闻、我们的估算。画面上用不同的角标区分。科学复原和想象画面要标“复原想象”，AI 生成的镜头要标“AI 生成画面”。
5. **音频先行。** 先写口播、生成配音、量出每句话的时长，再按这个时间轴做画面。画面跟着口播走，不要让口播去凑画面。
6. **逐帧渲染，不录屏。** 每个镜头都写成从时间 t 到画面的纯函数，渲染出来才不掉帧，也才能和配音严格对齐。
7. **每一步都要看结果。** 渲染出的帧拼成接触表看一遍；成片做完后，再从 MP4 文件本身抽帧检查。

## 工程目录

每一步都会在工程目录里留下一个文件，下一步从这个文件接着做：

```
<project>/
  brief.md              0 需求简报
  research/facts.md     1 事实表（带来源和证据等级）
  choices.md            2 用户选择记录
  style.json            2 全片统一的视觉规范（从 templates/style.json 复制后修改）
  script.md             3 口播脚本，每句一个编号
  storyboard.json       4 分镜表
  audio/                5 分句配音、narration.wav、timeline.json、subs.srt、背景音乐
  scenes/<镜头id>/      6 每个镜头的源文件和 clip.mp4
  out/                  7 成片、竖版剪辑、封面
  check/                8 接触表和检查记录
```

`examples/mini/` 是一个能完整跑通的最小工程，包含三个镜头、占位配音、合成和检查。第一次用这个 skill 时，先把它跑一遍，确认这台机器的工具链能用。

## 工作流

按顺序做，每一步做完再进入下一步。

### 0. 写需求简报
写 `brief.md`（模板见 `templates/brief.md`），内容包括：
- 受众、时长、画幅；
- 全片围绕的那个问题；
- 必须讲清的 3–5 件事；
- 观众看完应该能说出的一句话；
- 题型（见 `references/routing.md`）；
- 风险：时效性、争议、真人肖像、商标。

### 1. 研究
按 `references/research.md` 做研究，产出 `research/facts.md`，每条事实都带编号、来源和证据等级。

新品、人事变动、刚宣布的产品这类有时效性的选题，必须联网核实。不能联网时，要明确告诉用户哪些内容来自旧知识、可能已经过期。

### 2. 让用户选择
按 `references/routing.md` 处理，选择结果写进 `choices.md`，并定好 `style.json`。
- **固定路线的选题**：用户指定了路线，或者是工程、机械类对象且用户要求用 anatomy（比如 Roadster），视觉路线直接用 anatomy 路线（`references/anatomy-route.md`），不再询问。只问用户还没说的画幅、时长和配音。
- **其他选题**：给用户一张选择卡，最多 4 个问题，每个问题 2–4 个选项。推荐的选项放第一个，并标“（推荐）”。在 Claude Code 里用 AskUserQuestion 工具提问；在其他环境里，把选择卡按 `templates/choice-card.md` 的格式输出，然后等用户回复。
- **用户说“你定”“直接做”，或者无法交互**（比如批处理、定时任务）：全部用推荐选项，并在 `choices.md` 和最后的交付说明里写明。

### 3. 写脚本
按 `references/script.md` 写 `script.md`。每句一行，编号写成 `[L001]`。涉及事实的句子在句末标上事实编号，比如 `{F03}`。

### 4. 做分镜
按 `references/storyboard.md` 写 `storyboard.json`。

先定 4–8 个**母版资产**（一个主体模型、一张地图、一条时间线、一套图解系统等），大部分镜头都从母版派生，只改机位或状态。这是 5 分钟片子能做完的关键。

### 5. 配音和时间轴
按 `references/audio.md` 处理：
1. 用 `scripts/tts_lines.py` 生成分句配音（也可以用用户自己的录音）。
2. 用 `scripts/check_tts.py` 把配音转写回文字，和脚本对比，找出读错的句子。
3. 用 `scripts/timeline.py` 生成 `audio/timeline.json`，里面有每个镜头和每句话的起止时间，同时生成 `narration.wav` 和 `subs.srt`。
4. 没有可用的授权音乐时，用 `scripts/make_bed.py` 合成一段音床。音效的时间点从画面用的同一个模型算出来。

### 6. 先做 30 秒样片
用开头的钩子加一个核心镜头，做一段 30 秒左右的样片，交给用户确认风格。用户确认后再做全片。

如果用户说过“不用确认”，就跳过这一步，但仍然要自己按 `references/verify.md` 检查样片。

### 7. 逐个镜头制作
按 `references/visual-routes.md` 制作，anatomy 路线另见 `references/anatomy-route.md`。
- HTML 类的镜头从 `templates/scene.html` 开始改，用 `scripts/capture_frames.mjs` 按时间轴逐帧渲染成 `scenes/<id>/clip.mp4`。
- Remotion、HyperFrames、Manim、anatomy-reveal、Blender 用各自的渲染命令，输出同样放到 `scenes/<id>/clip.mp4`。
- 每做完一个镜头，立刻渲染开头、中间、结尾三帧，看过没问题再做下一个。

### 8. 合成
按 `references/render.md` 用 `scripts/assemble.py` 合成：拼接镜头，混入配音，背景音乐自动压低，统一响度，加上字幕，输出 `out/final.mp4`。

如果需要竖版传播剪辑，按 `references/render.md` 的“竖版剪辑”一节另做一版。

### 9. 终检与交付
按 `references/verify.md` 检查：
- 用 `scripts/contact_sheet.sh` 抽帧做接触表，逐张看；
- 核对事实；
- 检查音画同步、字幕、响度和素材版权。

交付内容：成片、字幕文件、分镜表、来源清单、工程目录。还要说明**哪些地方没有核实**。

## 规模和时间

| 片长 | 镜头数 | 口播字数（中文） | 母版资产 | 先告诉用户的大致耗时 |
|---|---|---|---|---|
| 60–90 秒竖版 | 10–18 | 250–380 | 2–3 | 1–3 小时 |
| 3 分钟 | 20–35 | 650–750 | 3–5 | 3–6 小时 |
| 5 分钟 | 30–50 | 1100–1250 | 4–8 | 5–10 小时 |

用了 anatomy 路线的话，每个主体模型另加 2–4 小时（`references/anatomy-route.md`）。开工时用 `date` 记下时间。任何一步用时超过预估的两倍，就告诉用户进度和还剩哪些工作。

## 工具速查

| 想要的画面 | 工具 | 路线 |
|---|---|---|
| 物体或机构拆开讲，爆炸图、剖面、零件联动 | anatomy / anatomy-reveal，或 Three.js 按同样的方法做 | R1 |
| 数据卡、对比、文字动效、产品界面 | Remotion，或 HyperFrames（从网页做视频），或 `templates/scene.html` | R2 |
| 公式、几何、物理量推导、概率分布 | Manim | R3 |
| 地理、产地、航线、轨道 | Canvas 2D 或 SVG 地图，D3 投影 | R4 |
| 空间感、尺度、运镜、环境 | Three.js（加 Blender 建模） | R5 |
| 手绘、水彩、插画式叙事、复原图 | Rough.js、p5.js 加 p5.brush | R6 |
| 历史照片、档案、真实人物 | 公共领域或授权素材，Ken Burns 推拉，再叠加代码图层 | R7 |
| 连续的真实动作、生物和场景 | 视频模型补镜头，必须标“AI 生成画面” | R8 |
| 企业史、决策树、多因素关系 | SVG 时间线或图谱，可配合 Remotion | R9 |

不确定某个题目该用哪条路线时，查 `references/routing.md` 和 `references/cases.md`，里面有 10 个示例题目的完整方案。

## 能力较弱的模型和长任务

不管用哪个模型，这几条都适用：
- 一次只做一个镜头。单个场景文件不超过 300 行，超过就拆成模块。
- 从 `templates/` 和 `examples/mini/` 改起，不要从零写渲染循环和合成命令。
- 写完一个镜头立刻渲染三帧并看图，确认没问题再往下做。
- 同一个错误连续两次没修好，就换一种更简单的画法，不要死磕。
- 所有数字从 `research/facts.md` 或场景里的计算模型读取，不要在画面代码里手写。

## 不要做的事

- 不要用视频模型或 AI 生成真实人物（比如库克、宇航员）的逼真形象，也不要克隆他们的声音。引用的话必须有出处，不能编造。
- 不要把传闻和宣称当成事实来讲，也不要把复原想象和 AI 生成的画面当成真实影像。
- 不要用受版权保护的角色、影视片段或商标做主画面，详见 `references/rights.md`。
- 不要录屏，也不要导出实时播放的动画。
- 没看过渲染出来的帧，不要交付。

## 参考文件

| 文件 | 什么时候读 |
|---|---|
| `references/routing.md` | 第 0、2 步：判断题型、出选择卡 |
| `references/cases.md` | 第 0–4 步：10 个示例题目的方案 |
| `references/research.md` | 第 1 步：研究方法、证据分级、时效性 |
| `references/script.md` | 第 3 步：口播结构、句子规则、字数 |
| `references/storyboard.md` | 第 4 步：分镜表格式、镜头规则 |
| `references/audio.md` | 第 5 步：配音、时间轴、字幕、音乐卡点 |
| `references/visual-routes.md` | 第 7 步：每条视觉路线的做法、提示词和常见坑 |
| `references/anatomy-route.md` | 用 R1 剖解路线时（Roadster 必读） |
| `references/render.md` | 第 7–8 步：逐帧渲染约定、各渲染器命令、合成、竖版剪辑 |
| `references/verify.md` | 第 6、9 步：检查清单 |
| `references/rights.md` | 用真实素材、真人、商标之前 |
