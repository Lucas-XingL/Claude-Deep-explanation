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

**逐词时间**：用 edge-tts 时，`tts_lines.py` 会在每句配音旁边存一个 `L007.words.json`，记下每个词从第几秒开始。`timeline.py` 把它带进时间轴（`lines[].words`），字幕也按词来切时间。场景里用 `atWord(t, "L007", "大气")` 让画面卡在说出“大气”的那一刻（anatomy 镜头用 `W("L007", "大气")`）。其他 TTS 没有逐词时间时，运行 `check_tts.py --save-words`，用语音识别补上。要注意，edge-tts 的分词有时很怪（比如切出“底气”“压变”），所以 `atWord` 按字符匹配，不按词匹配；同一句里出现两次的词，取第一次。

**生成后先“听”一遍**：运行 `python3 scripts/check_tts.py <proj>`（需要 faster-whisper）。它会把每句配音转写回文字，和脚本对比，相似度低于 0.85 的句子会列出来。被标出的句子大多是同音字（比如擒纵→秦宗、机芯→鸡心），不一定是读错。逐句看一下，真正读错的才需要加 `<读作：…>` 重新生成。

转写核对只能发现念错的字，听不出语气、停顿和重音是否自然，也听不出音乐是不是盖过了人声。agent 自己没法真正“听”，所以交付说明里要写明“没有人工试听”，请用户听一遍（见 `verify.md` 第 5、6 节）。

**方案页的试听**（SKILL.md 第 6 步）：只生成 2–3 句，挑有数字、英文名或专有名词的句子，比如 `--only L001,L004,L009`，再用 `make_plan.py --voice L001,L004,L009` 放进方案页。用户确认音色后，再生成全部句子。

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
- 改了配音或分镜之后，**必须重新运行 timeline.py，再重新渲染受影响的镜头**。只改了一句，就只重新生成那一句、重排时间轴、重渲包含那一句的镜头，其他镜头不动。
- **时间轴只能由配音决定，不能反过来。** 画面不够长时改画面，不要拉伸或加速配音去凑；画面比时间轴短时也不要用最后一帧定格补齐。

## 3. 字幕

- 默认把字幕烧进画面（`assemble.py --subs burn`），样式是白字加半透明深色底，浅色和深色背景都能看清。
- 也可以用 `--subs soft` 把字幕作为可开关的轨道封装，或者用 `--subs none` 不加字幕，单独交付 `subs.srt`。
- 场景里的文字不能放进底部的字幕区，安全边距见 `style.json` 的 `safe` 字段。
- 字幕显示原文，读音修正只影响配音。
- 每段字幕去掉句尾的逗号和句号（`timeline.py` 自动处理），问号、数字、单位和否定词都保留。

## 4. 背景音乐和卡点

- **音乐要有授权**：无版权音乐库、用户提供的音乐，或者自己生成的音乐。在 `research/assets.md` 里登记来源（见 `rights.md`）。
- **没有现成音乐时，按片子的结构合成配乐**：
  ```
  python3 scripts/make_bed.py audio/bed.wav --timeline audio/timeline.json --storyboard storyboard.json --mood calm
  ```
  它不是一段循环，而是跟着片子走：开头一个短动机，结尾再出现一次，首尾呼应；每进入分镜里的一个新段落（`section`）换一个和弦，并有一声轻的气流声；层次随片子加厚（铺底 → 低音 → 节拍 → 琶音），结尾收回来；最后落在主和弦上淡出。在分镜镜头里写 `"accents": ["L010", "L007:大气"]`，会在那句话开头或那个词上加一个重音（上扬的气流声加一声低沉的“咚”），用在揭示答案、数字出现、机构动作的那一刻。长度正好等于片长，不循环、不补静音。从零合成，不涉及授权。只给 `--seconds` 时，仍然输出一段平稳的音床。
- 重音不要多：一分钟两三个就够，放在真正的揭示处。配乐不能盖过口播，交付前要有人实际听一遍（agent 只能看波形，听不出好坏，在 `review.md` 里记“未做”）。
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
