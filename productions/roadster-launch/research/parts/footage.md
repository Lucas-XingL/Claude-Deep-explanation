# 开场素材报告（2026-10-18）

## 试过的办法和结果
1. **YouTube 官方视频，用 yt-dlp 2026.08.19 下载**：《The Ramp》7p5LxFdc-Qg 一共试了大约 15 次，用过的 player client 有 default、android、android_vr、ios、tv、tv_simply、web_safari、web_embedded、mweb。几乎每次都报 “Sign in to confirm you're not a bot”。default 有一次列出了格式，但接着下载又被拦；android 有一次报 403。结论：拿不到视频，-yRQsurykGw 和 qt5p-_tE8d0 就没再试下载。不过 web_safari 能拿到公开的 storyboard 缩略图，《The Ramp》和《Roadster Event》的都拿到了，只用来核对画面来源。
2. **B 站**：搜索接口用关键词“Roadster倒挂”成功一次，之后都返回 412 限流。用 yt-dlp 未登录、不带 cookie 下载了两个结果：
   - BV159JB6JEpX，看看新闻Knews，“特斯拉飞行汽车发布会纯享版”，84 秒，1080p：是特斯拉官方直播的画面，带遥测 HUD 和 “TESLA LIVE” 角标，左上角有“看看新闻”台标。**采用。**
   - BV1stJi6bEDU，“曼哈顿的夏天”，15 秒：白天高速上一辆红车喷气飞过货车，判断是 AI 生成视频，不是发布会现场。已删除。
3. 小红书、X/fxtwitter、Reddit、微博、新闻网站、特斯拉官网：**没做**，B 站已经拿到能用的素材。

## 核对来源
《Roadster Event》的 storyboard 里，约 6:05–7:05 有带同样 HUD 的坡道大远景，所以这段画面应该是官方直播的转载。《The Ramp》（46 秒剪辑版）的 storyboard 没有 HUD，按每秒一帧的缩略图看，里面也没有倒挂仰拍特写。所以署名写“特斯拉官方直播”，没有照模板写《The Ramp》。

## 最终素材和时间码
- 来源：A01（Knews 文件）15.2–21.2 秒，经 `footage.sh --from 15.2 --duration 6 --crop 1280:720:250:175` 处理。这个裁切同时去掉了左上角的台标和底部的 HUD 仪表。
- clip.mp4 内容：0–3.7 秒是大远景，车开到弯曲坡道的悬挑段，俯仰角到 170°；3.7–6.0 秒是仰拍特写，车倒挂在坡道顶下方。下一个切点在 21.333 秒，没有截进来。
- 署名（已烧录）：“画面：特斯拉官方直播，2026-10-15，经看看新闻转载”。
- 输出在 `scenes/_shared/opening/`：clip.mp4（6.0 秒，1920×1080，30 fps，无音轨）、clean.mp4（不带署名）、last.png（倒挂特写）、edges.png（线稿干净）、credit.txt。
- 备用镜头：A01 的 77.9–82.7 秒，车被喷气托起、翻成倒置再落地。已处理到 `raw/opening/flyover_backup/`，用 delogo 盖掉了台标和角标。
- 全部登记在 `research/assets.md`（A01–A05，含 sha256）。

## 自己看过的 3 帧
`/tmp/claude-0/-home-user-Claude-Deep-explanation/0eb44ce9-0266-57bc-89f2-54801865549f/scratchpad/check/` 下的 clip_start_0.0s.png、clip_mid_3.0s.png、clip_end_5.97s.png，四宫格是 check_sheet.png。
- 开头和中间两帧：夜里一条弧形混凝土坡道，车在顶端悬挑段，车底朝外。
- 结尾一帧：白色 Roadster 车轮朝上，贴在红白两色坡道的底面。
- 三帧都没有台标、HUD 或平台水印，左上角署名清楚，不压到坡道。

## 还缺 / 要注意
- 画质：源文件码率约 590 kbps，裁切后又放大 1.5 倍，特写偏软，但能用。想要更清楚的版本，可以在用户自己的电脑上下载 YouTube 原片（《Roadster Event》约 6:05–7:05）。
- `brief.md` 的风险栏写着“不用官方视频画面”，和这次的开场策略冲突，需要主代理或用户确认用哪条。
- 顺带看到的事实：倒挂特写时直播 HUD 显示 DOWNFORCE 4697 KG、PITCH 170°、ALTITUDE 67.8 FT（A01 第 20 秒）。这和 brief 里说的“约 4,700 kg”一致，可以交给文字研究核对。
