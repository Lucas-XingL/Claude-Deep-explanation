# 分镜表

分镜表 `storyboard.json` 是时间轴、渲染和合成三步共用的数据源：`scripts/timeline.py`、`scripts/capture_frames.mjs` 和 `scripts/assemble.py` 都读它。

## 1. 格式

```json
{
  "meta": {
    "title": "黑洞照片",
    "width": 1920, "height": 1080, "fps": 30,
    "style": "style.json",
    "question": "连光都逃不出来，为什么还能给它拍照？",
    "throughline": "黑洞本身不发光 → 亮的是周围的热气体 → 光被弯折成一圈 → 地球大小的望远镜才分辨得出",
    "answer": "拍到的是黑洞的影子和周围的光环，不是黑洞本身"
  },
  "assets": {
    "disk3d": "3D 吸积盘场景，scenes/_shared/disk/，可以改机位和光线弯曲强度",
    "earthmap": "地球站点地图，scenes/_shared/earthmap/"
  },
  "shots": [
    {
      "id": "S01",
      "section": "钩子",
      "lines": ["L001", "L002"],
      "pre": 0.5,
      "post": 0.3,
      "route": "R5",
      "asset": "disk3d",
      "source": "scenes/S01/index.html",
      "visual": "从黑暗中推近，亮环慢慢出现，最后停在接近 EHT 图像的构图",
      "camera": "从远处出发 → 经过亮环上方 → 停在正面略俯视",
      "onscreen": ["模拟"],
      "evidence": ["F01"],
      "transition_in": "cut",
      "new_info": "提出问题：一个看不见的东西，照片里是什么",
      "subject": "亮环",
      "relation": "证据链",
      "change": "镜头从黑暗推近，亮环慢慢出现",
      "result": "构图停在和 EHT 图像一致的位置，下一镜直接换成真实图像",
      "risks": ["continuity"],
      "notes": "最后一帧的构图要和 S02 的第一帧一致（匹配剪辑）"
    },
    {
      "id": "S02",
      "section": "钩子",
      "lines": [],
      "duration": 2.0,
      "route": "R7",
      "source": "scenes/S02/clip.mp4",
      "visual": "EHT 发布的 M87* 真实图像，缓慢推近",
      "onscreen": ["EHT Collaboration 署名"],
      "evidence": ["F04"]
    }
  ]
}
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | `S01`、`S02`……，按播放顺序排列 |
| `lines` | 是 | 这个镜头期间播放的口播句子编号，可以为空 |
| `duration` | `lines` 为空时必填 | 纯画面镜头的秒数 |
| `pre` / `post` | 否 | 第一句口播之前、最后一句之后留出的纯画面时间（秒），默认 0.3 和 0.2 |
| `route` | 是 | R1–R9（见 `visual-routes.md`） |
| `source` | 是 | HTML 场景文件，或者已经渲染好的 `clip.mp4`，或者帧目录 |
| `visual` / `camera` | 是 | 用一两句话写清楚画面内容和镜头运动（“从哪出发、经过哪、停在哪”） |
| `onscreen` | 否 | 屏幕上的文字和角标，字幕不算在内 |
| `evidence` | 否 | 这个镜头展示的事实编号 |
| `transition_in` | 否 | `cut`（默认）或 `match`（匹配剪辑，前后帧在场景里对齐）。转场效果在场景内部做，合成时只做硬切 |
| `new_info` | 建议 | 这个镜头给观众带来的新东西。写不出来就删掉或合并这个镜头 |
| `subject` / `relation` / `change` / `result` | 建议 | 画面配方：看哪个东西、讲什么关系、什么在变、后果在哪里看得见（见 `directing.md` 第 2、3 节） |
| `risks` | 否 | `key_action`、`continuity`、`occlusion`、`image_visibility`，渲染前按 `directing.md` 第 8 节预检 |

`meta` 里的 `question`、`throughline`、`answer` 是全片的问题、主线和回答（见 `directing.md` 第 1 节）。脚本和分镜都写好后，运行 `python3 scripts/lint_project.py <proj>` 检查句子编号、事实编号、镜头字段是否对得上。

镜头时长由 `timeline.py` 根据配音自动算出，写进 `audio/timeline.json`。不要手动填每个镜头的时长，纯画面镜头除外。

## 2. 镜头规则

1. **一个镜头只讲一件事**，对应 1–3 句口播，长度一般 3–12 秒。超过 12 秒的话，在镜头内部加机位变化或状态变化。
2. **镜头要服从口播。** 口播说到哪，画面就指到哪：高亮、推近、零件动起来、路线延伸。场景可以从 `window.SHOT.lines` 读到每句话在镜头内的起止时间（见 `render.md`），用来精确对齐。
3. **每隔 20–40 秒换一次节奏**：换景别（全景、中景、特写），或者换路线（3D 切到图解），或者插一个纯画面镜头让观众喘口气。
4. **转场优先用“动作带过去”**：零件被推进下一个画面，人物走进一扇门，地图上的路线延伸成下一幕的线条。前一个镜头的最后一帧和后一个镜头的第一帧在构图上对齐，就是匹配剪辑。
5. **一屏的文字不超过 15 个字**，字幕不算。字号不小于画面高度的 1/24。角标和署名放在 `style.json` 规定的安全区里。
6. **母版资产要复用。** 同一个模型、同一张地图在全片里反复出现，只改机位、高亮和状态。观众会把它当成“地图”来记，也能省下大量制作时间。
7. **画面和口播说的是同一件事。** 口播讲 A 的时候，画面不要在演 B。
8. **一个场景可以跨好几句。** 不要每换一句就切一个新画面、把镜头拉回全景。更多镜头语法和常见画面错误见 `directing.md`。

## 3. 画面描述怎么写（visual 和 camera 字段）

按这个顺序写，和视频里给 AI 写提示词的结构一致：

1. **整体风格**：沿用 `style.json`，只写这个镜头和全片风格不同的地方。
2. **画面里必须有的东西**：主体、状态、标注。
3. **怎么动**：镜头从哪出发、经过哪、停在哪；哪个零件在什么时候动。
4. **不能出现的东西**：多余的文字、不属于这一步的零件、商标等。

例子：
`电影感的河谷，有水、树、桥和一条船；镜头从桥下出发，贴着水面经过船，停在桥上的全景；画面里不能出现任何文字。`

## 4. 竖版剪辑

另外写一份 `storyboard.vertical.json`，`meta` 改成 1080×1920。从主片里挑 8–15 个镜头，重新安排，不要直接把横版画面裁成竖版。场景要按 `window.SCENE.width` 和 `window.SCENE.height` 自适应排版（见 `render.md`）。口播重写成一份 60–90 秒的脚本，单独保存为 `script.vertical.md`。
