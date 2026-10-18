# 制作简报模板（交给制作子代理）

能开子代理时，第 6 步的母版资产和风格帧、第 8 步的镜头制作必须并行：按母版资产分组，每组填一份，在同一条消息里一起开出去、放在后台。主代理同时做配乐、音效，并逐个审看交回的帧。子代理看不到你和用户的对话，所以下面每一项都要写全。

---

制作任务。你是几个同时工作的制作子代理之一，只负责下面这一组镜头。

**工程**：`<工程绝对路径>`；skill：`<skill 绝对路径>`。今天是 <日期>。

**片子在讲什么**（从 `storyboard.json` 的 `meta` 抄）：问题 <…>；主线 <…>；回答 <…>。

**你负责**：母版资产 `<资产键>`（<一句话：它是什么>），镜头 <S03、S07>。
每个镜头抄下分镜里的：`lines`、`new_info`、`subject`、`relation`、`change`、`result`、`risks`、`accents`、`visual`。

**这次要做的**（二选一，删掉另一个）：
- 第 6 步：建好母版资产，按估算时间轴 `plan/est/timeline.json` 给每个镜头出 2 张风格帧，放进 `plan/stills/<镜头>/`；
- 第 8 步：按正式时间轴 `audio/timeline.json` 渲染出 `scenes/<镜头>/clip.mp4`。

**先读**：`<skill>/SKILL.md` 的原则一节；`<skill>/references/directing.md`；路线对应的文档（`anatomy-route.md` / `hyperframes-route.md` / `visual-routes.md` 里的那一节）；`<工程>/style.json`；`<工程>/scenes/_shared/model.js`；`<工程>/research/facts.md`。

**只许写**：`<工程>/scenes/<你的场景目录>/`、`<工程>/scenes/_shared/<你的物体目录>/`、`<工程>/plan/stills/<你的镜头>/`、`<工程>/check/<你的镜头>/`。
**只读**：其他所有文件，尤其是 `model.js`、`style.json`、`facts.md`、`script.md`、`storyboard.json`。觉得它们要改，写进交付报告，不要自己改。

**渲染份额**：同时最多 <N> 个渲染进程（anatomy `--jobs <N>`，HyperFrames `--workers <N>`）。别的子代理也在渲染，不要多占。

**做法要求**：
- 画面里的数字全部从 `model.js` 读，不要手写；宣称、估算的数字挂 `style.json` 里的角标；
- 说到某个东西时它才出现或亮起（`atWord` / `wordAt`），时间来自时间轴，不要手写秒数；
- 底部字幕区不放东西；
- 渲染命令和检查按路线文档来，脚本报 FAIL 就修到通过，不改阈值、不加跳过检查的参数。

**交付前必须做**：
1. 跑完路线对应的检查（`capture_frames.mjs` 的乱序复查 / anatomy `render_shot.sh` 的零件数和时长 / HyperFrames `render_shot.sh` 的 check），记下结果；
2. 亲自看每个镜头的静帧或 `clip.mp4.check.png`，对照分镜的 `change` 和 `result` 写一句“看到了什么”；
3. 标了 `risks` 的镜头，按 `directing.md` 第 8 节在指定时刻出帧看过。

**交回一份报告**（10–20 行）：
- 写了哪些文件；
- 跑了哪些命令，结果（通过 / 失败及原因）；
- 每个镜头的静帧或检查帧路径，和一句“看到了什么”；
- 没做完或没做到的，原因；
- 需要主代理决定或修改共享文件的地方（你不能问用户，有疑问都写在这里）。

不要编造检查结果。没跑的检查写“没跑”。

---

报告回来后，主代理自己打开报告里列出的帧看一遍，再决定通过还是退回修改（原则 8：看产物，不看汇报）。
