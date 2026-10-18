# 渲染与合成

## 1. 为什么逐帧渲染

录屏会受机器性能影响，容易掉帧、卡顿，也没法和配音严格对齐。正确的做法是：每个镜头写成从时间 t 到画面的纯函数，一帧一帧算出来，再编码成视频。Remotion、HyperFrames、Manim、anatomy-reveal 内部都是这样做的。自己写的 HTML 场景用 `scripts/capture_frames.mjs` 来渲染。

## 2. HTML 场景的约定

`capture_frames.mjs` 会在页面里注入下面这些对象。场景要遵守约定，`templates/scene.html` 已经写好了：

| 对象 | 谁提供 | 内容 |
|---|---|---|
| `window.SCENE` | 渲染脚本 | `{width, height, fps, duration}`。场景按它排版，同一个文件能出 16:9 和 9:16 两种版本 |
| `window.SHOT` | 渲染脚本（传了 `--timeline` 和 `--shot` 时） | `{id, duration, lines:[{id,start,end,text}]}`，句子时间是相对这个镜头开头的。用它让画面跟着口播走 |
| `window.renderFrame(t)` | 场景 | 画出时间 t（秒）的画面，可以是 async 函数 |
| `window.sceneReady` | 场景（可选） | Promise，字体、图片、模型都加载完再 resolve |

另外，渲染脚本在每一帧都会做这些事：
- 把 CSS 动画和 Web Animations 定位到 t（`document.getAnimations()`）；
- 把 GSAP 的全局时间线定位到 t；
- 把 `requestAnimationFrame`、`performance.now`、`Date.now` 换成虚拟时钟；
- 把 `Math.random` 换成固定种子。

所以用 CSS 动画、GSAP，或者按真实时间写的库，大多数也能逐帧渲染出来。但最稳妥的写法仍然是所有运动都直接由 `renderFrame(t)` 里的 t 计算。

场景里不要做的事：
- 读真实时间；
- 运动依赖上一帧的状态。比如物理模拟必须写成从 0 积分到 t，或者按固定步长、可重放的方式推进；
- 用 fetch 读取 `file://` 下的文件。数据要内联，或者放在旁边的 `.js` 文件里，以 `window.DATA = …` 的形式加载；
- 视频元素自动播放。真实视频素材请用 ffmpeg 处理（见 R7）。

## 3. 渲染命令

```sh
# 按时间轴渲染一个镜头（时长、尺寸、帧率和句子时间都从 timeline.json 读取）
node scripts/capture_frames.mjs scenes/S05/index.html --timeline audio/timeline.json --shot S05 --out scenes/S05/clip.mp4

# 只出三张静帧来检查（第 7 步每个镜头做完都要做）
node scripts/capture_frames.mjs scenes/S05/index.html --timeline audio/timeline.json --shot S05 --stills 0,3.2,6.4 --out check/S05

# 竖版
node scripts/capture_frames.mjs scenes/S05/index.html --timeline audio/vertical/timeline.json --shot V03 --out scenes/V03/clip.mp4
```

- **速度**：1080p 的 Canvas 场景大约每秒渲染 5–10 帧，所以 1 秒成片大约要 3–6 秒。4 核机器上和其他渲染同时跑时，1 秒成片要 10–20 秒。5 分钟的片子可以同时开 3–4 个进程，按镜头并行渲染。
- **WebGL**：无头 Chromium 用软件渲染（SwiftShader），所以比较慢。先用 `--width 960 --height 540` 预览，确认后再出全尺寸。
- **其他渲染器**输出的视频统一放到 `scenes/<id>/clip.mp4`：

| 工具 | 命令 |
|---|---|
| Remotion | `npx remotion render <CompositionId> scenes/S05/clip.mp4 --props='{"timeline":…}'` |
| HyperFrames | 用它自己的渲染命令（以它的文档为准），输出 mp4 |
| Manim | `manim -qh --fps 30 -r 1920,1080 scene.py S05`，再把 `media/videos/...` 拷贝过来 |
| anatomy-reveal | `bash scripts/anatomy/render_shot.sh <工程> <工程>/shots/S05.mjs audio/timeline.json S05 scenes/S05/clip.mp4 --jobs 3`（见 `anatomy-route.md`） |
| Blender | `blender -b scene.blend -o //frames/f_#### -a`，然后 `ffmpeg -framerate 30 -i frames/f_%04d.png -c:v libx264 -pix_fmt yuv420p clip.mp4` |
| 视频模型 | 下载后用 `ffmpeg -ss … -t …` 裁剪，统一帧率 |

时长不需要完全一致。`assemble.py` 会把每段片段裁剪到时间轴给的长度，不够的话定格最后一帧补齐。不过片段最好比时间轴稍长一点，免得定格太久。

## 4. 后台流水线（长渲染）

anatomy 镜头一段要渲染几十分钟。把渲染放到后台，再写一个收尾脚本：等渲染全部结束后编码、合成、做接触表，然后用 agent 的后台任务机制（在 Claude Code 里是 `run_in_background`）运行它，完成时会有通知。示意：

```bash
#!/usr/bin/env bash
set -u
SK=<skill>/scripts
# 1. 并行渲染（每个都在后台）
bash $SK/anatomy/render_shot.sh obj obj/shots/S01.mjs audio/sample/timeline.json S01 scenes/S01/clip.mp4 --jobs 2 > log/S01.log 2>&1 &
P1=$!
node $SK/capture_frames.mjs scenes/diagram/index.html --timeline audio/sample/timeline.json --shot S02 --out scenes/S02/clip.mp4 > log/S02.log 2>&1 &
P2=$!
wait $P1 $P2
# 2. 合成和检查
python3 $SK/assemble.py . --storyboard storyboard.sample.json --timeline audio/sample/timeline.json \
  --narration audio/sample/narration.wav --subtitles audio/sample/subs.srt \
  --bgm audio/sample/bed.wav --sfx audio/sample/sfx.wav --out out/sample.mp4
bash $SK/contact_sheet.sh out/sample.mp4 check/sample 2.5 4 4
```

- 停止进程时按 PID 停，不要用 `pkill -f "<关键词>"`：执行这条命令的 shell 自己的命令行里也含有这个关键词，会把自己也杀掉。
- 流水线跑完后，先看接触表和检查帧，确认没问题再交付。日志里写着 “wrote …” 不代表画面就是对的。

## 5. 合成（scripts/assemble.py）

```sh
python3 scripts/assemble.py <proj> --bgm audio/bgm.mp3            # 默认：烧录字幕、背景音乐自动避让口播、响度 −16 LUFS
python3 scripts/assemble.py <proj> --bgm audio/bed.wav --bgm-volume 0.18 --sfx audio/sfx.wav --sfx-volume 0.5   # 加音效轨
python3 scripts/assemble.py <proj> --subs soft --out out/final_softsubs.mp4
python3 scripts/assemble.py <proj> --storyboard storyboard.vertical.json --timeline audio/vertical/timeline.json \
        --narration audio/vertical/narration.wav --subtitles audio/vertical/subs.srt --out out/vertical.mp4
```

它会做这些事：
1. 按 `timeline.json` 把每个镜头缩放、补边到画幅大小，统一帧率，裁剪或补齐到给定时长。
2. 按顺序硬切拼接，转场要在场景内部做（见 `visual-routes.md` 末尾）。
3. 混合配音和背景音乐，有口播时自动压低背景音乐，再统一响度。
4. 加字幕，输出 H.264 和 AAC 编码的 MP4（带 faststart，适合网络播放）。

**还没做好的镜头会自动生成一张占位卡**，显示镜头编号和 `visual` 描述。所以第 5 步做完就可以先剪一版“动态分镜”：有完整配音和占位卡的样片，先检查节奏和时长，再逐个替换成真正的镜头。

## 6. 竖版剪辑

1. 写 `script.vertical.md`，内容 60–90 秒；再写 `storyboard.vertical.json`，`meta` 设为 1080×1920，镜头编号用 `V01`…。
2. 配音和时间轴，全部放进 `audio/vertical/`，这样和横版的句子编号重复也不会冲突：
   ```sh
   python3 scripts/tts_lines.py <proj> --script script.vertical.md --out audio/vertical/lines …
   python3 scripts/timeline.py <proj> --storyboard storyboard.vertical.json --script script.vertical.md \
           --lines audio/vertical/lines --out audio/vertical --max-chars 12
   ```
3. 镜头尽量复用横版的场景文件，用 `--width 1080 --height 1920` 重新渲染，因为场景是按 `SCENE.width` 和 `SCENE.height` 自适应排版的。anatomy-reveal 的镜头用 `--ratio 9:16` 重新渲染。
4. 合成时把 `--storyboard`、`--timeline`、`--narration` 和 `--subtitles` 都指向竖版的文件。
5. 封面：挑一帧最强的画面，加上一行问题（不超过 12 个字），可以用 `capture_frames.mjs --stills` 从封面场景出图。

## 7. 导出规格

| 用途 | 规格 |
|---|---|
| 横版主片 | 1920×1080，30 fps，H.264，CRF 18，AAC 192 kbps，−16 LUFS |
| 竖版传播 | 1080×1920，30 fps，其余相同 |
| 高质量存档（可选） | 再出一份 CRF 14 的版本，或者 ProRes 格式（`-c:v prores_ks -profile:v 3`） |
