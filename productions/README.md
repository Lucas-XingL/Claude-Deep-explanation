# 两支样片的工程

用 `skills/explainer-video` 做的两支样片：机械表（约 40 秒）和 Roadster（约 34 秒）。只有源文件在仓库里；配音、帧、片段和成片都是生成物（见 `.gitignore`），按下面的命令重建。

## 准备

- 依赖见 `skills/explainer-video/SKILL.md`；另外需要 anatomy-reveal（`git clone https://github.com/annnguyentt/anatomy-reveal-skill ~/.claude/skills/anatomy-reveal`）。
- anatomy 工程（`scenes/_shared/movement`、`scenes/_shared/car`）里要先运行 `npm install`，安装 puppeteer-core。
- edge-tts：`pip install edge-tts`；如果网络里有会重新签名 TLS 的代理，按 `references/audio.md` 的说明把代理 CA 加进 certifi。

## 重建（以机械表为例，Roadster 相同，换成 car 和对应的镜头）

```bash
SK=../../skills/explainer-video/scripts
cd productions/watch
python3 $SK/tts_lines.py . --engine edge-tts --voice zh-CN-YunxiNeural
python3 $SK/timeline.py . --storyboard storyboard.sample.json --out audio/sample
node scenes/_shared/sync-model.mjs                       # 把机芯模型同步给 2D 场景
bash $SK/anatomy/render_shot.sh scenes/_shared/movement scenes/_shared/movement/shots/S01.mjs audio/sample/timeline.json S01 scenes/S01/clip.mp4 --jobs 3
bash $SK/anatomy/render_shot.sh scenes/_shared/movement scenes/_shared/movement/shots/S02.mjs audio/sample/timeline.json S02 scenes/S02/clip.mp4 --jobs 3
node $SK/capture_frames.mjs scenes/escapement/index.html --timeline audio/sample/timeline.json --shot S03 --out scenes/S03/clip.mp4
python3 scenes/_shared/sfx.py audio/sample/timeline.json audio/sample/sfx.wav
python3 $SK/make_bed.py audio/sample/bed.wav --seconds 42 --mood calm --bpm 64 --pulse 0
python3 $SK/assemble.py . --storyboard storyboard.sample.json --timeline audio/sample/timeline.json \
  --narration audio/sample/narration.wav --subtitles audio/sample/subs.srt \
  --bgm audio/sample/bed.wav --bgm-volume 0.18 --sfx audio/sample/sfx.wav --sfx-volume 0.5 --out out/watch_sample.mp4
bash $SK/contact_sheet.sh out/watch_sample.mp4 check/sample 2.5 4 4
```

Roadster：anatomy 镜头是 `scenes/_shared/car/shots/S01.mjs`，2D 场景是 `scenes/thrust/index.html`（S02）；侧视贴图 `scenes/_shared/car_side.png` 已经在仓库里，用 `scripts/anatomy/sprite.sh` 可以重新生成；音床用 `--mood tension --bpm 84 --pulse 0.35`。

## 各自的要点

- `watch/research/facts.md`、`roadster/research/facts.md`：片中用到的事实和等级；`sources.md` 是研究原始记录。
- `watch/scenes/_shared/movement/object/film.mjs`：机芯的 `movement(tau)`，3D、2D、音效共用。
- `roadster/scenes/_shared/model.js`：车重、抓地极限、耗气、悬停时间。
