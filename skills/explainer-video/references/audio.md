# 配音、时间轴、字幕和音乐

## 1. 配音（scripts/tts_lines.py）

每句口播生成一个文件，放在 `audio/lines/L001.wav`（也可以是 mp3 或 m4a）。分句生成的好处：
- 能精确知道每句话的起止时间；
- 改一句只需要重做一句。

| 方式 | 命令 | 说明 |
|---|---|---|
| 用户已有的 TTS（推荐，比如火山/豆包、阿里、讯飞、ElevenLabs、OpenAI TTS 等） | `python3 scripts/tts_lines.py <proj> --cmd '你的命令 --text {text} --out {out}' --ext wav` | `{text}` 会自动加引号 |
| edge-tts | `pip install edge-tts`，然后 `python3 scripts/tts_lines.py <proj> --engine edge-tts --voice zh-CN-YunxiNeural` | 需要能访问微软的服务；常用音色：YunxiNeural（男）、XiaoxiaoNeural（女）、YunjianNeural（男，有力） |
| 占位音 | `--engine placeholder` | 按字数生成提示音，没有 TTS 时先把画面和时间轴做出来 |
| 用户自己录音 | 按 `L001.wav`… 的文件名放进 `audio/lines/` | 先把 `script.md` 发给用户照着念，每句之间停顿一秒，录完再切分 |

**在 TLS 被代理重新签名的环境里**（公司代理、云端沙箱），edge-tts 会报 `CERTIFICATE_VERIFY_FAILED`。原因是它只信任 certifi 自带的证书。解决办法是把代理的 CA 追加到 edge-tts 所在 Python 环境的 certifi 文件里：`cat <代理CA.crt> >> $(python -c "import certifi;print(certifi.where())")`。只改自己的虚拟环境，不要关闭证书校验。

**生成后先“听”一遍**：运行 `python3 scripts/check_tts.py <proj>`（需要 faster-whisper）。它会把每句配音转写回文字，和脚本对比，相似度低于 0.85 的句子会列出来。被标出的句子大多是同音字（比如擒纵→秦宗、机芯→鸡心），不一定是读错。逐句看一下，真正读错的才需要加 `<读作：…>` 重新生成。

几点要求：
- **全片只用一个音色**，语速保持一致。科普讲解用平静、清楚的讲述语气，不要用“营销腔”。
- **读音要核对**：数字、英文缩写、专有名词（比如 M87*、Roadster、Transformer）。读错的句子用 `<读作：……>` 修正后，加 `--only L010 --force` 单独重新生成。
- **不能克隆真实人物的声音**，比如库克、马斯克、宇航员。见 `rights.md`。
- 用户自己录的长音频需要切成分句：用 `ffmpeg -af silencedetect=noise=-35dB:d=0.5` 找出停顿位置，再按停顿切分，然后逐句核对是否和脚本对上。

## 2. 时间轴（scripts/timeline.py）

```
python3 scripts/timeline.py <proj>       # 读 storyboard.json 和 script.md，以及 audio/lines/
```

输出三个文件：
- `audio/timeline.json`：每个镜头的 start、end、duration，以及镜头内每句话的相对时间（`shots[].lines`）。渲染脚本会把这些信息作为 `window.SHOT` 传给场景。
- `audio/narration.wav`：所有句子按时间摆好的整条配音轨。
- `audio/subs.srt`：字幕。长句会在标点处切开，每段不超过 `--max-chars` 个字（横版 16，竖版 12）。

时长规则：
- 镜头时长 = `pre` + 句子时长 + 句间停顿 + `post`。没有口播的镜头用 `duration`。
- 某句还没有配音时，按字数估算时长，并在输出里列出来。这样可以先用估算的时间轴做画面，配音到了再重新运行，画面会自动对齐。
- 改了配音或分镜之后，**必须重新运行 timeline.py，再重新渲染受影响的镜头**。

## 3. 字幕

- 默认把字幕烧进画面（`assemble.py --subs burn`），样式是白字加半透明深色底，浅色和深色背景都能看清。
- 也可以用 `--subs soft` 把字幕作为可开关的轨道封装，或者用 `--subs none` 不加字幕，单独交付 `subs.srt`。
- 场景里的文字不能放进底部的字幕区，安全边距见 `style.json` 的 `safe` 字段。
- 字幕显示原文，读音修正只影响配音。

## 4. 背景音乐和卡点

- **音乐要有授权**：无版权音乐库、用户提供的音乐，或者自己生成的音乐。在 `research/assets.md` 里登记来源（见 `rights.md`）。
- **没有现成音乐时**，用 `python3 scripts/make_bed.py audio/bed.wav --seconds <总长> --mood calm|tension|bright` 合成一段简单的环境音床：慢速和弦铺底加低音，可以加轻微的节拍。它是从零合成的，不涉及授权问题，只适合垫在口播下面。
- 默认把音量压到 0.22，有口播时自动再压低（sidechain ducking），整片响度统一到 −16 LUFS，适合网络平台。
- **按节拍剪辑**（适合 MV 风格、开头和结尾、传播剪辑）：
  ```
  pip install librosa soundfile
  python3 scripts/beats.py audio/bgm.mp3 --snap audio/timeline.json
  ```
  输出 `bgm.beats.json`，里面有 beats、downbeats 和 strong 三组时间点。`--snap` 会列出每个镜头边界离最近节拍差多少。微调分镜里的 `pre` 和 `post`，让大的切换落在 strong 或 downbeat 上。场景内部的动作（文字出现、零件弹出）也可以读取这份时间表来对齐节拍。
- 讲解类的片子以口播为主，不需要每个镜头都卡节拍。只在钩子、段落转换和结尾处卡点。

## 5. 音效（可选）

有零件咬合、按钮按下、地图上路线到站这类明确的动作时，可以加很轻的音效：
- 音效来源要有授权，或者自己合成（numpy 生成短促的噪声或正弦，或用 Web Audio、ffmpeg）。
- **音效的时间点要从画面用的同一个模型算出来**。例如机械表的“滴答”就是 `movement(tau)` 里每次落齿的时刻，推进器的嘶声包络就是推力曲线。这样音画天然同步。从 `templates/sfx.py` 改起：短促的撞击用 `hits`，持续的嘶声、风声、嗡声用 `bed`。完整实例见仓库的 `productions/watch/scenes/_shared/sfx.py` 和 `productions/roadster/scenes/_shared/sfx.py`。
- 把音效做成一条和成片一样长的音轨，合成时加 `assemble.py --sfx audio/sfx.wav --sfx-volume 0.6`。
