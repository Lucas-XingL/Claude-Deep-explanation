# 素材登记

核实日期均为 2026-10-18。`raw/` 和 `scenes/_shared/opening/` 不提交到仓库；下面写着怎么重新拿到每个文件。

| 编号 | 类型 | 素材 | 时间码 | 用在哪些镜头 | 来源链接 / 作者 | 授权依据 | 署名 / 画面角标 | 派生自 | sha256 前 12 位 | 核实日期 |
|---|---|---|---|---|---|---|---|---|---|---|
| A01 | 视频 | 第二代 Roadster 发布会 “The Ramp” 演示，特斯拉官方直播画面（带直播遥测 HUD：DOWNFORCE / PITCH / ALTITUDE，偶见 “TESLA LIVE” 角标），由看看新闻剪成 84 秒“纯享版”，左上角有“看看新闻”台标。文件 `raw/opening/knews_BV159JB6JEpX.mp4`，1920×1080，30 fps，只有视频轨 | 整段 0:00–1:24；坡道段 0:00–0:48 | 原件，不直接上屏 | 画面原作者：Tesla（YouTube《Roadster Event》https://www.youtube.com/watch?v=qt5p-_tE8d0 ，坡道段约 6:05–7:05，由公开 storyboard 推算，未逐帧对齐）；经由：看看新闻Knews，B 站 https://www.bilibili.com/video/BV159JB6JEpX（2026-10-17 上传），`yt-dlp -f 30080` 未登录下载 | 引用（《著作权法》适当引用，见 rights.md 2.5） | 见 A02 | — | 484fb7e85294 | 2026-10-18 |
| A02 | 派生 | 开场镜头：车开到弯曲坡道的悬挑段（HUD 俯仰角 156°→170°，大远景），切到车倒挂在坡道顶下方的仰拍特写。裁掉台标和 HUD，放大到 1920×1080，30 fps，6.0 秒，烧录署名。`scenes/_shared/opening/clip.mp4`（`clean.mp4` 是不带署名的同一段） | A01 的 15.200–21.200 秒（15.2–18.9 大远景，18.9–21.2 倒挂特写，21.333 处是下一个切点，没有截进来）；clip 内 0–3.7 秒大远景，3.7–6.0 秒特写 | 开场 R7 视频镜头 | 同 A01 | 同 A01 | “画面：特斯拉官方直播，2026-10-15，经看看新闻转载”（已烧录在左上角）；角标建议“官方画面” | A01：`footage.sh --from 15.2 --duration 6 --crop 1280:720:250:175` | clip 69cfa4de07fb；clean b602060a9224 | 2026-10-18 |
| A03 | 派生 | A02 的最后一帧（倒挂特写，无署名）`scenes/_shared/opening/last.png`，供 reveal 镜头用 | A01 的约 21.17 秒 | reveal 镜头 | 同 A01 | 同 A01 | 同 A02 | A02：末帧 | 703368f40bc2 | 2026-10-18 |
| A04 | 派生 | A03 的线稿 `scenes/_shared/opening/edges.png` | — | reveal 镜头 | 同 A01 | 同 A01 | 同 A02 | A03：edgedetect 线稿 | ecebd3480aa6 | 2026-10-18 |
| A05 | 派生（备用） | 备用镜头：冷气推进器把车从一排车旁托起，在 Semi 卡车上方翻成倒置再落回地面。`raw/opening/flyover_backup/clip.mp4`，4.8 秒（同目录有 `clean.mp4`、`last.png`、`edges.png`）。暗背景上用 delogo 盖掉“看看新闻”台标和“TESLA LIVE”角标（角标处留有很淡的痕迹） | A01 的 77.900–82.700 秒（79.07 处有一个切点，换机位） | 未用，备用 | 同 A01 | 同 A01 | 同 A02（已烧录） | A01：`footage.sh --from 77.9 --duration 4.8 --cover 100:45:365:130 --cover 1615:975:262:62` | clip b0e8c79265c9；clean d4d9e620084b；last 693a1c157cbd；edges 2680c71f1e13 | 2026-10-18 |

## 没用上的来源

- 特斯拉官方 YouTube《The Ramp | Roadster》https://www.youtube.com/watch?v=7p5LxFdc-Qg （46 秒，2026-10-16 上传）：容器里下载被人机验证拦下（试过 default、android、android_vr、ios、tv、tv_simply、web_safari、web_embedded、mweb 这些 player client）。公开 storyboard（每秒一张 320×180 缩略图）能拿到：这一版是剪辑过的回顾片，没有 HUD，机位和 A01 的大远景一致，但 1 秒一帧的缩略图里看不到 A01 那个倒挂仰拍特写。所以 A02 的署名写“官方直播”，没写《The Ramp》。
- B 站 BV1stJi6bEDU（“曼哈顿的夏天”，15 秒）：白天高速公路上红色跑车喷气飞越货车，看起来是 AI 生成视频，不是发布会现场。已下载、查看后删除（sha256 前 12 位 044cb1c12b3b），不用。
