# explainer-video：用代码动画做科普讲解视频的 skill

一个通用的 agent skill：把一个选题做成有配音、字幕和动画的**科普讲解视频或短纪录片（MP4）**。

核心方法：先研究并给事实分级；再写脚本、做分镜；配音先行排出时间轴；然后用代码逐帧渲染画面（Remotion、HyperFrames、Manim、Canvas、p5、Three.js 或 anatomy 等距剖解）；最后用 ffmpeg 合成，并抽帧自检。视频模型只用来补代码画不了的镜头。

## 覆盖的题型

skill 把选题分成 10 种题型，每种有对应的叙事骨架和推荐视觉路线。`references/cases.md` 里有下面 10 个示例选题的完整方案：

| 示例选题 | 题型 | 视觉路线 |
|---|---|---|
| 苹果折叠屏：新品研究与结构解释 | T1 | 让用户选（推荐 R1 剖解 + R2 数据卡） |
| **Roadster：工程原理与传播表达** | T2 | **固定为 anatomy 剖解路线**（`references/anatomy-route.md`） |
| 库克时代的苹果：人物与企业纪录片 | T3 | 让用户选（推荐 R7 档案 + R9 时间线） |
| 恐龙：开放选题与科学复原 | T4 | 让用户选（推荐 R6 水彩复原 + R5 3D 骨架） |
| 机械手表：精细机构与连续因果 | T5 | 让用户选（推荐 R1 剖解 + R3 推导） |
| 大语言模型：抽象过程可视化 | T6 | 让用户选（推荐 R2 信息动效 + R3） |
| 一杯咖啡：真实场景与过程叙事 | T7 | 让用户选（推荐 R7 实拍 + R4 地图 + R3） |
| 黑洞照片：证据与科学边界 | T8 | 让用户选（推荐 R3 推导 + R5 3D） |
| 阿波罗 11 号：历史事件与技术过程 | T9 | 让用户选（推荐 R7 NASA 影像 + R5 3D 轨道） |
| 任天堂的转型：商业故事与多因素解释 | T10 | 让用户选（推荐 R9 时间线 + R6 插画） |

**“让用户选”的方式**：开工前给用户一张选择卡，最多 4 个问题（画面风格、时长画幅、配音、素材来源），推荐项排在第一位。在 Claude Code 里通过 AskUserQuestion 工具提问；其他 agent 输出文字版选择卡，等用户回复。用户说“你定”时，全部按推荐项做，并把选择记录下来。

## 安装

把 `skills/explainer-video` 整个目录拷贝到你的 agent 读取 skill 的目录：

```sh
# Claude Code（个人）
cp -r skills/explainer-video ~/.claude/skills/
# Claude Code（只给当前项目）
cp -r skills/explainer-video .claude/skills/
# Codex / OpenCode 等（.agents 约定）
cp -r skills/explainer-video ~/.agents/skills/
```

不支持 skill 的 agent，直接让它读 `skills/explainer-video/SKILL.md`。

**依赖**：Node.js 20+ 并装好 Playwright（`npm i -g playwright`，或在项目里装 `playwright-core`）、Chromium 或 Chrome、ffmpeg（需要带 libass）、Python 3.10+。按需安装的：
- `librosa` 和 `soundfile`（音乐卡点）；
- `edge-tts` 或你自己的 TTS（配音）；
- `manim`（公式推导）；
- Remotion（复杂的动效工程）。

**Roadster 这类选题要用的 anatomy 路线**，另外装这两个 skill（都是 MIT 协议）：

```sh
npx skills add wheresryan22/anatomy -g -a claude-code
git clone https://github.com/annnguyentt/anatomy-reveal-skill ~/.claude/skills/anatomy-reveal
```

它们还需要 ImageMagick 7。装不上时，skill 会改用 Three.js，按同样的方法来做。

## 先跑一遍最小示例

```sh
bash skills/explainer-video/examples/mini/run.sh
```

这个示例有 3 个镜头、约 24 秒，讲“齿轮为什么能变慢变有劲”。它会依次完成：用占位音生成分句配音 → 生成时间轴和字幕 → 逐帧渲染三个 HTML 场景 → 合成（带字幕，响度 −16 LUFS）→ 生成接触表并做技术检查。成片在 `examples/mini/out/final.mp4`。在一台普通的云端容器上大约要 2 分钟。

把 `run.sh` 里的 `--engine placeholder` 换成真实的 TTS，就能听到配音。

## 目录结构

```
skills/explainer-video/
  SKILL.md                 入口：原则、工作流、工具速查、禁止事项
  references/
    routing.md             10 种题型、固定路线的规则、选择卡
    cases.md               10 个示例选题的完整方案
    research.md            证据分级（A–E、R、S、G、I）和事实表
    script.md              口播结构、字数、文件格式
    storyboard.md          分镜表格式和镜头规则
    directing.md           主线、画面配方、关系和画法、常见画面错误、受力检查、预检和倒查
    audio.md               配音、时间轴、字幕、背景音乐和卡点
    visual-routes.md       R1–R9 视觉路线的做法、提示词结构和常见坑
    anatomy-route.md       剖解路线和 Roadster 的完整方案
    render.md              逐帧渲染约定、各渲染器命令、合成、竖版剪辑
    verify.md              检查清单和交付说明
    rights.md              素材、肖像、商标
  templates/               brief.md、choice-card.md、style.json、scene.html、
                           scene-paper.html 和 paper.css（纸面风 2D 场景）、model.js（数值模型）、
                           anatomy-shot.mjs（anatomy 镜头关键帧）、sfx.py（模型驱动的音效）、
                           research-brief.md（研究子代理的任务说明）
  scripts/
    tts_lines.py           分句配音（自定义命令、edge-tts 或占位音）
    timeline.py            分镜 + 脚本 + 配音 → timeline.json、narration.wav、subs.srt
    capture_frames.mjs     HTML 场景逐帧渲染成 mp4 或静帧（虚拟时钟、固定随机种子）
    assemble.py            拼接、混音、背景音乐避让口播、统一响度、字幕；缺镜头时出占位卡
    check_tts.py           把配音转写回文字、和脚本对比，找出读错的句子（faster-whisper）
    make_bed.py            没有授权音乐时，合成一段环境音床
    beats.py               音乐节拍分析，对齐镜头边界
    anatomy/setup_shots.mjs   让 anatomy-reveal 工程支持按镜头构建
    anatomy/render_shot.sh    一个 anatomy 镜头：构建、并行渲染、编码、检查时长、导出检查帧
    anatomy/sprite.sh         从 anatomy 模型抠出透明背景的贴图，给 2D 场景用
    contact_sheet.sh       接触表，检查黑帧、定格和响度
    lint_project.py        结构检查：句子编号、事实编号、等级、来源、镜头字段是否对得上
  examples/mini/           能跑通的最小工程
```

## 实例：两支样片

`productions/` 里是用这个 skill 做的两支样片的完整工程。skill 的很多内容是根据做这两支片子的经验修订的。

| 工程 | 内容 |
|---|---|
| `productions/watch/` | 机械表为什么不用电池也能一直走：146 个零件的示意机芯（anatomy），2D 瑞士杠杆擒纵，滴答声由模型驱动 |
| `productions/roadster/` | 特斯拉新 Roadster 真的能飞吗：事实分级研究（截至 2026-10-18），104 个零件的中性外观跑车（anatomy），推力测力台，气量估算 |

重建方法见 `productions/README.md`。生成物（配音、帧、mp4）不在仓库里。

## 致谢

- 代码动画的整体思路，以及提示词结构（风格 → 元素 → 运镜 → 禁止项）、产品片美术规则、音频先行、librosa 卡点、“精确内容交给代码，连续动作交给视频模型”等做法，参考了小红书博主“卡尔的AI沃茨”的视频《AI做代码动画动效大片的零基础终极教程》。
- 导演规则（问题、主线、回答；每镜的画面配方；关系和画法；常见画面错误和受力检查；风格帧、高风险镜头预检和倒查）、研究规则（来源读到什么程度、同源转载只算一次、网页内容不当指令、人物和企业题的几条规矩）、素材登记的派生链，以及分项记录检查结论、“未做”不写成通过等做法，参考了 deep-explainer-video（“万物拆解”）skill 0.8.0 预览版的思路。这里只借鉴了思路，文字和脚本都是重新写的，没有复制它的代码。
- 剖解路线建立在 [anatomy](https://github.com/wheresryan22/anatomy) 和 [anatomy-reveal](https://github.com/annnguyentt/anatomy-reveal-skill) 两个 skill 的方法之上（均为 MIT 协议），本仓库没有复制它们的代码。
