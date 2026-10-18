# Roadster 发布会：增量复核与补缺（截至 2026-10-18）

本文件只补 `../sources.md` 里没有的内容，或对其中条目做复核、更正。sources.md 里已有的编号（T、F、S、E、M 开头）照原样引用，不重复展开。

**阅读程度标记**（每条来源后面都注了）
- 【全文·原文】：用 curl 抓下网页，抽出正文后读了全文或相关段落，引文是原句。
- 【全文·摘要】：用 WebFetch 读的整页，返回的是工具的摘要和摘录，引文由工具给出，没有逐字核对。
- 【片段】：只看到搜索结果的标题或摘要。按要求，这类来源最高只定 C。
- 【打不开】：403、402、429 或机器人验证。

**访问限制**：YouTube 对 yt-dlp 和网页都触发了机器人验证（429，"Sign in to confirm you're not a bot"）。只有 "The Ramp | Roadster"（7p5LxFdc-Qg）和 "The Kickflip | Roadster"（r5vsHHPVhJg）两条的元数据拿到了，同时拿到了 YouTube 的 storyboard 缩略图（160×90 像素，约每 0.98 秒一帧）。完整直播 "Roadster Event"（qt5p-_tE8d0）的元数据和画面**拿不到**。下文"本人读图"的结论都来自这些低分辨率缩略图，精度约 ±1 秒，而且只适用于官方剪辑过的短片。

---

## 1. 截至 2026-10-18 的新进展

**总体判断：2026-10-16 以后没有出现会推翻 sources.md 主要说法的新信息。** 10 月 17–18 日没检索到特斯拉或马斯克新的技术澄清、新的工程师采访，也没有新的监管动作。补充和更正有下面这些：

1. **特斯拉和马斯克**：发布会之后，马斯克能查到的帖子仍然只有 10-16 那条 "Turns out the future does have flying cars"（已收在 F11）。10-17、10-18 没查到新的澄清或数字更正。
2. **"我们说的不是持续飞行，就是在跳"这句不是马斯克说的。** 原话 "We're not talking about sustained flight… We are literally talking about hopping" 出自史密森尼航空航天博物馆垂直飞行馆长 Roger Connor 接受 CNN 采访（U26）。有些检索摘要把它算到了马斯克头上，视频里不要这样引用。
3. **工程细节补充**：Hagerty、Top Gear、MotorTrend 三个采访在 sources.md 里已经收了。这次补的是它们文字版里的新细节：
   - 风扇可以上下伸缩；
   - 四段裙边由橡胶加尼龙刷毛做成，是可更换的磨损件；
   - 风扇电机转速"超过 15,000 rpm"；
   - Top Gear 给出了喷口的具体布局。

   这些说法都来自同一批视频采访，算同源（U10–U12、U9）。
4. **专利更正**：sources.md 的 F14 备注里提到 evo 说"专利设计没有裙边"。原因是**有两件专利**：
   - US 12,746,987 B1 写的是风扇"可以不用裙边"；
   - **另一件 US 12,377,920 B1**（2025-08-05 授权）专门写了可收放的裙边：裙边全部放下时形成一个完全密封的车底区域。

   两件专利我都直接读了 USPTO 的 PDF（U11）。
5. **监管**：联邦层面仍只有 FAA 和 NHTSA 的表态（E1、E3），没查到新的联邦动作。新增一条州层面的**政治表态**：佛罗里达州州长 DeSantis 10-16 在 X 上回复网友说 "We will make sure that it's legal"（U25）。这不是法规，也没有任何程序跟进。
6. **真伪质疑与核实**：
   - Snopes（10-16）评定"影像为真"：不是 AI 生成，也没有数字剪辑，有现场观众自拍的视频佐证（U24）。
   - 质疑方：Autonocion 的作者认为"不是现场实时演示，是预录的"；CarScoops 提到"有人说看到钢丝"；Motor1 的导语写了 "tethered flip"（系绳翻转）。这三条都**没有给出任何证据**（U24）。
   - Motor1 那篇还把日期写成了"Wednesday night"，实际是周四，可信度要打折扣。
   - Electrek 的分析文章在 10-17 17:10 UTC 又更新过一次，"演示车可能没装电池"的推测还在（已有 E6）。
7. **数字的冲突和小更正**：
   - 推进器满罐能用多久：Top Gear 文字版说 Thrust 版"六秒用完"，InsideEVs 写"五到六秒"，和 F8 的"约 5 秒"基本一致。
   - 能不能预订 Thrust 版：CBS（10-16 更新）说 Thrust "网上有承诺但不能预订"；InsideEVs、Engadget 和 sources.md 的 T30 都写 Thrust 预订金 $250,000。两种说法冲突（U29）。
8. **接下来可能有新信息的场合**：Tesla 2026 年第三季度财报会，时间是 **10 月 21 日**（据 CBS 引用分析师 Dan Ives 的研报）。

---

## 2. 事实表

| 编号 | 事实 | 等级 | 口径 | 来源（标题、媒体、日期、链接） | 备注 |
|---|---|---|---|---|---|
| U1 | **坡道的形状**：一面很高的弯墙，从地面往上弯，越过竖直以后继续往回卷，到顶部车已接近或完全倒扣。媒体的说法有："C 形坡道"、"侧放的半管"、"倒置的半个环"、"向上卷过头、让车倒过来的坡道"、"多层楼高"、"Hot Wheels 式轨道，先竖直，再倒过来"。 | B | 只有形状描述，**没有任何尺寸**。 | Engadget（Mariella Moon），"Relive Tesla's ridiculous(ly fun) Roadster stunt show"，2026-10-15 22:24 EST，https://www.engadget.com/2288448/relive-tesla-ridiculously-fun-roadster-stunt-show/ 【全文·摘要】; InsideEVs（Rob Stumpf），"Here Are All Of The Crazy Tricks The Tesla Roadster Just Did"，2026-10-16 02:00Z，https://insideevs.com/news/812152/tesla-roadster-backflip-suction-2g/ 【全文·原文】; Not a Tesla App（Nehal Malik），2026-10-16，https://notateslaapp.com/news/4837/tesla-roadster-event-recap-it-flies-flips-and-hits-0-60-in-081s 【全文·摘要】; CBS News，"With Tesla Roadster debut, Elon Musk shows 'flying cars are real'"，2026-10-16（20:07 EDT 更新），https://www.cbsnews.com/news/tesla-roadster-debut-elon-musk-flying-cars-are-real/ 【全文·原文】; The Verge（Andrew J. Hawkins），2026-10-16 01:28Z，https://www.theverge.com/transportation/1012552/tesla-roadster-next-gen-reveal-elon-musk 【全文·原文】; Electrek（Jameson Dow），2026-10-16 03:36Z（10-17 17:10Z 更新），https://electrek.co/2026/10/15/an-updated-technical-look-at-teslas-kick-flipping-0-60-in-1s-next-gen-roadster/ 【全文·原文】 | 本人读官方短片的 storyboard：从侧面航拍看，坡道的侧面轮廓是"C"形，也就是半个环；从正前方看，是一条向上、顶端往一侧弯过去的弯墙。分辨率只有 160×90，只能定性。CBS 一稿里有 AFP 的稿件成分。 |
| U2 | **坡道高度"65 英尺（约 19.8 米）"**："hung almost upside down 65 feet off the ground, let go, and caught itself"，"Without the thrusters, that's a bad two seconds"。 | D | 坡道顶部离地高度。来源是个人社交帖，测量方法不明。 | Aakash Gupta 在 X 上的帖子，约 2026-10-16，https://x.com/aakashgupta/status/2110938030479638892 【片段】（页面返回 402） | 没有官方数字，也没有第二个独立来源。The Verge 只说"very tall, multi-story"。按自由落体算，19.8 m 落地约 2.0 s，和"两秒"自洽，但这只说明帖子内部算得通，不能证明高度对。 |
| U3 | **坡道一共开上去两次**。第一次开上去，停在坡顶，倒挂着，用来证明能"倒着开"。然后倒车退下来，第二次加速冲上去，从顶端离开，在空中翻身落地。 | B | 两家互相独立的现场或直播报道说法一致。 | Engadget（同 U1）："It drove up — twice — and stopped at the top of the ramp perpendicular to the ground, hanging upside-down… After the second time, the car jumped off the ramp, rolled over, and safely hovered to the ground"; InsideEVs（同 U1）："Tesla immediately drove the car onto a sideways half-pipe to show that it has enough suction to, literally, drive upside down… After backing the roadster down the ramp, it sprinted back up and then performed an aerial maneuver"; Electrek 分析（同 U1）："The first demo showed the Roadster driving up a hot wheels-like track, going fully vertical, and then upside down… The next trick involved driving up the ramp, jumping off the end and then landing." | Engadget 那句话可以理解成两次都停在坡顶。停住时车的姿态有不同说法："perpendicular to the ground"（与地面垂直，Engadget）和 "almost upside down"（几乎倒过来，U2）。所以第一次停住的位置**可能是越过竖直、接近倒扣，不一定是完全 180°**。Motor1 另有一种说法："Tesla rolled out the next-generation Roadster already hanging upside down"，意思是车一亮相就已经挂在坡上，和上面两家不一致，见 U24 备注。 |
| U4 | **倒挂停了几秒：没查到。** 没有任何媒体或个人给出静止倒挂的时长。 | — | — | 检索了 Engadget、InsideEVs、Electrek、The Verge、CBS、CNN、Snopes、Motor1、Not a Tesla App、tech-insider 等 | 只能看完整直播 qt5p-_tE8d0 的 6:03–10:55 段落来确定，我这边 YouTube 被拦了，见第 3 节。 |
| U5 | **特斯拉官方的能力表述**："This provides enough suction to hold the vehicle upside down, even when stationary… achieving massive downforce at zero speed." | A（官方宣称） | 官方说的是"静止时也能吸住倒挂"这一能力，不等于演示当晚静止倒挂了多少秒。 | Tesla Roadster 官网文案，由 The Autopian（Thomas Hundal）转引，2026-10-16 01:37Z（13:56Z 更新），https://www.theautopian.com/the-tesla-roadster-is-more-insane-than-you-could-possibly-have-imagined/ 【全文·原文】; 和 sources.md F1（YouTube 视频说明）的措辞同源 | tesla.com 本人抓不到（sources.md 里已说明）。 |
| U6 | **马斯克在倒挂段的现场原话**："This car could suck the chrome off a trailer hitch… And it can stick upside down." | C | 现场口头说法。 | InsideEVs 812152（同 U1）【全文·原文】 | 只有一家媒体引用。 |
| U7 | **官方短片 "The Ramp \| Roadster"（7p5LxFdc-Qg）的基本信息**：时长 46 s，上传日期 2026-10-16，说明文字是 "The first live demo during the Roadster event. Real life, baby"，截至 10-18 播放量约 601 万。 | A | yt-dlp 读到的元数据 | YouTube 7p5LxFdc-Qg 【元数据读到；视频本体下载被 403 拦下】 | 同名的第二条上传 -yRQsurykGw 没能读取（429）。 |
| U8 | **"The Ramp" 短片里各段大概在什么时间（本人读 storyboard，±1 s）**： ① 0:00–0:03 车停在坡脚，近景； ② 约 0:03–0:05 远景，坡道全貌； ③ **约 0:05–0:09 车沿弯墙一路往上开，每一帧位置都在变，看不到停顿**； ④ 约 0:09 到坡顶； ⑤ **约 0:10 离开坡顶**； ⑥ 约 0:11 车在半空，已大致翻正，车底有 3–4 股朝下的白色气流； ⑦ 约 0:12 接近地面，被白烟包住，随后落地； ⑧ 约 0:18–0:23 换另一机位重放：坡顶，然后空中翻正，朝下喷气，落地； ⑨ 约 0:27–0:30 俯拍机位，能看到车在空中转体，周围有喷气； ⑩ 约 0:30–0:45 高空航拍全景（C 形坡道）。 | 本人观察（非来源事实，不定等级） | 时间是短片里的时间，不是直播里的时间。storyboard 约每 0.98 s 一帧，判断 ±1 s。 | 来源：YouTube storyboard 缩略图（由 7p5LxFdc-Qg 元数据给出的 i.ytimg.com/sb/ 地址） | 这条短片里**只看到一次连续爬坡加起跳**，没看到长时间停住。它看起来是第二次（起跳那次）的剪辑，第一次倒挂停住的那段不在短片里，或者被剪掉了。从离开坡顶（约 0:10）到接近地面（约 0:12）大约 2 s。 |
| U9 | **完整直播里倒挂段的时间码**：章节 "Ramp demo" 是 6:03–10:55（sources.md T22）。Snopes 引用直播时把链接定在 **t=390s（6:30）**。倒挂具体在第几分第几秒：**查不到**。 | A（章节）；时间点查不到 | 指 qt5p-_tE8d0 这条录像 | Snopes 引文 "Tesla. 'Roadster Event'. YouTube, 15 Oct. 2026, https://www.youtube.com/live/qt5p-_tE8d0?t=390s"（Snopes，2026-10-16，见 U24）【全文·原文】 | 6:30 只是 Snopes 选的起点，不一定是倒挂的那一刻。 |
| U10 | **翻身用的是哪些喷口：没有官方说法。** 媒体的说法如下。 InsideEVs："At least four are mounted under the car (which helped it leap over the lineup), and an additional two are on the front, which helped to turn the car right side up"（车底至少四个帮它跳过车阵，前面两个帮它翻正）。 Top Gear 现场稿给出的布局："10 compressed gas thrusters - four at the rear and two at the front all facing outward, plus one on each corner facing downward… The other six allow the Roadster… to launch itself off the ground and control its descent, but also manipulate itself in mid-air"。 Top Gear 规格稿写的是 "six more thrusters on the front and sides"。 Electrek 写的是 "one downward-pointing thruster at each corner, and two thrusters at the front for yaw"（前两个管偏航）。 特斯拉官网说 Rocket 版的推进器 "support forward and upward acceleration as well as lateral rotational movement"。 | 布局 C（工程师口述，经媒体转述）；"前两个负责翻正"是 D（单一媒体的解读） | 喷口数量和朝向；谁负责滚转。 | InsideEVs 812152（同 U1）【全文·原文】; Top Gear，"Wow: the new Tesla Roadster can actually fly"，2026-10-16 09:55 BST，https://www.topgear.com/car-news/first-look/wow-new-tesla-roadster-can-actually-fly 【全文·原文】; Top Gear，"The Tesla Roadster has finally landed…"，2026-10-16 12:00 BST，https://www.topgear.com/car-news/electric/tesla-roadster-has-finally-landed-thrusters-0-60mph-059s-and-flight 【全文·原文】; Electrek 分析（同 U1）; Snopes 引 Tesla 官网（U24） | **冲突**：前方两个喷口，Top Gear 说"朝外"，Electrek 说"管偏航"，InsideEVs 说"帮翻正"。车底朝下的是"四角各一个"（Top Gear、Electrek）还是"车底至少四个"（InsideEVs），说法也不同。本人读 storyboard：下落时车底有 3–4 股朝下的气流，说明下降过程用了朝下的角部喷口；滚转本身用了哪几个，看不出来。 |
| U11 | **两件专利**（本人直接读了 USPTO 的 PDF）。 ① **US 12,746,987 B1 "Electric Fan Car"**：2026-09-29 授权，申请日 2024-01-17，临时申请日 2023-01-17。插图是 4 个电动涵道风扇（EDF）并排装在后扩散器里。正文写 "In some embodiments, four electric ducted fans may be used"，还写了 "the EDFs may operate without use of additional elements below the vehicle (e.g., a skirt…)"，即可以不用裙边。 ② **US 12,377,920 B1 "Adaptive Vehicle Aerodynamics for Downforce"**：2025-08-05 授权，申请日 2025-04-29，申请人 Tesla。摘要原文："In a first mode, a complete set of skirts creates a fully sealed bounded region under the vehicle with central fans generating maximum downforce at low speeds on smooth surfaces. In a second mode, a subset of skirts (primarily side skirts)… while all fans operate"。实施例里有侧裙、前裙、后裙，可以部分放下，并根据 GPS、车速、车身俯仰和侧倾、离地距离来调整。 | A（一手专利文件） | 专利只描述结构，**没有给出风扇功率、负压、密封面积这类数字**（在我读过的页面里）。 | USPTO PDF：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12746987 【读了首页和第 1–4 栏，9 页里读了 3 页，权利要求页没读】; https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12377920 【读了首页和第 13–14 栏，16 页里读了 2 页】 | 专利本身都没有写明是给 Roadster 用的。把它们和 Roadster 联系起来，是媒体的推断（Electrek、InsideEVs）。sources.md F14 里"evo 说专利没有裙边"，指的应该是 ①。 |
| U12 | **风扇和裙边的新细节**（都出自发布前录好的工程师视频采访）： 风扇转速 "past 15,000 rpm"（MotorTrend）； 四段独立裙边 "drop down to seal the underbody"，材料是橡胶加尼龙刷毛，可更换的磨损件（Hagerty）； "Dual-mode active fans in the back… can also create a venturi effect… The fans themselves are deployable and can move up and down to get out of the way of road debris"（Top Gear 视频，经 InsideEVs 转述）； Top Gear 文字稿："deployable underskirts and rear-bumper extraction fans"。 | C | 工程师口述，经媒体转述。 | Electron Motion，"Tesla Roadster Thrusters and Suction Fans: How They Work"，2026-10-17，https://electronmotion.com/2026/10/17/tesla-roadster-thrusters/ 【全文·摘要】; InsideEVs（Iulian Dnistran），"The Tesla Roadster Has 1,341 HP…"，2026-10-16 12:46Z，https://insideevs.com/news/812242/tesla-roadster-2026-specs/ 【全文·原文】; Top Gear 规格稿（同 U10） | **同源**：这几篇都在转述 Hagerty、Top Gear、MotorTrend 三条视频，只能算三个来源，不是五个。"4 个风扇 × 约 20 kW" 已经在 F14。Sawyer Merritt 在 X 上的帖子（"side skirts and front and rear skirts deploy under the battery pack, sucking the car down at ~2G"，https://x.com/SawyerMerritt/status/2111542537202651638 【片段】）是在讲专利 ②，不是独立信源。 |
| U13 | **下压力数字（复核 F14，没有新的更正）**： "up to 2 G of suction"：Moravy 在台上说，多家报道一致； "like 2,500 kilos or something"：Moravy 接受 MotorTrend 采访时说； 约 4,700 kg：Electrek 读的是特斯拉现场屏幕上显示的数字，cellcog 博客说这个数字是车倒挂在坡顶时显示的。 | 2 G：B（作为引语）/ C（作为事实）；2,500 kg：C；4,700 kg：B（作为"屏幕上显示过"）/ D（"显示于倒挂时"） | 2 G 指吸力约等于车重的 2 倍，没说是在什么车速和条件下。2,500 kg 和 4,700 kg 都指下压力，以质量单位表示，测量条件不明。 | InsideEVs 812151（Mack Hogan），2026-10-16 01:17Z（14:53Z 更新），https://insideevs.com/news/812151/2027-tesla-roadster-price-specs-release-date/ 【全文·原文】; Electron Motion（同 U12）; Electrek 分析（同 U1）："There's no need for 4,700kg of downforce on what is apparently a sub-1,700kg car"; cellcog 博客，https://cellcog.ai/blog/tesla-roadster-physics/ 【片段】 | 有一条检索摘要把"2,500 kilos"算到了马斯克头上，但 Electron Motion 原文写的是 Moravy，以 Moravy 为准。The Verge 写风扇系统"由 SpaceX 提供"，和工程师说的"基于热泵压缩机电机"（F14）不一致。我判断是 The Verge 写错了，但这一点没有核实。 |
| U14 | **车底负压和密封面积：没查到任何数字。** 官方、专利和工程师采访里都没有车底压差（kPa）、密封面积（m²）、裙边离地间隙。 | — | — | 同 U11、U12、U13 | 本人的推算见第 5 节，只是推算，不能当来源用。 |
| U15 | **McMurtry Spéirling（先例 1）**：官方说法是 "2000kg of downforce" 由风扇系统产生，0 mph 时就有。2025-04-11 在公司总部完成倒挂行驶：车开上坡道，停到一个专门搭的平台上，**平台翻转，把车整个倒过来**，然后车 "drove forward, entirely unsupported"，现场有独立裁判。官方说这是 "proof of concept using a small purpose-built rig"。同一稿还宣称 0-60 mph 用时 1.5 s，过弯超过 3 g。 | A（厂方新闻稿，属于厂方宣称）；B（Top Gear 同日报道） | 2,000 kg 是厂方说的风扇下压力，静止时就能达到。注意：它是**先在平台上被翻过来**，不是像特斯拉那样自己开上弯墙。 | McMurtry Automotive 新闻稿，"WORLD FIRST: McMurtry Spéirling drives upside down from stationary"，2025-04-11，https://mcmurtry.com/upside-down-driving/ 【全文·原文】; Top Gear，"The McMurtry Spéirling is the first car in the world to DRIVE UPSIDE DOWN"，2025-04-11，https://www.topgear.com/car-news/electric/mcmurtry-speirling-first-car-world-drive-upside-down 【全文·原文】 | 车重：Wikipedia 写 "Under 1,000 kg"（没有引注）和 900 kg（引 fastestlaps），【全文·摘要】，只能定 C/D。Electrek 写约 1,000 kg。风扇转速 23,000 rpm 只在检索摘要里出现过（D）。倒挂持续多久有冲突：Wikipedia 写"upside down for five seconds"，TheNextWeb 的检索摘要写"over a minute while stationary"【片段】。 |
| U16 | **Brabham BT46B（先例 2）**：车尾一个由发动机经离合器驱动的大风扇，配合滑动裙边密封车底。它只参加了 1978 年瑞典大奖赛，劳达赢了，领先第二名半分钟以上。之后车队在压力下撤下这台车，国际汽联随后禁止风扇车。 | B | 历史事实。风扇直径、转速、下压力都**没有可靠数字**。 | Wikipedia "Brabham BT46"（引 Alan Henry 1985 年的《Brabham: The Grand Prix Cars》，第 181–187 页），https://en.wikipedia.org/wiki/Brabham_BT46 【全文·摘要】 | 只有二手百科转述，书本身没有核对。 |
| U17 | **Chaparral 2J（先例 3）**：车尾两个风扇，由一台单独的二冲程双缸小发动机驱动，Lexan 塑料裙边贴着地面密封。只在 1970 赛季比赛过，之后被 SCCA 以"可动空气动力装置"为由禁用。条目给出的下压力约为 1.25–1.5 g。 | B（历史）/ C（g 值） | g 值的测量条件不明。 | Wikipedia "Chaparral 2J"（引 Road & Track 2017、Motor Sport 2020 等），https://en.wikipedia.org/wiki/Chaparral_2J 【全文·摘要】 | 如果要用 g 值，建议回原始文献核对。 |
| U18 | **飞越车阵（Kickflip）没有借助坡道**：车在平地上开向一排车，在接近时用推进器竖直起跳。原话有："No ramp, just vertical takeoff"（The Autopian）；"it appeared to lift vertically as it neared the first one rather than launching well before"（The National）；"rolled toward a line of other Teslas, fired its cold-gas thrusters, shot into the air"（AGTP 的 X 帖子）。 | B | — | The Autopian（同 U5）【全文·原文】; The National（Alvin R Cabral），"Up in the air: Tesla's 'flying' Roadster raises more questions than answers"，2026-10-17，https://www.thenationalnews.com/future/technology/2026/10/17/up-in-the-air-teslas-flying-roadster-raises-more-questions-than-answers/ 【全文·摘要】; AGTP 的 X 帖子，https://x.com/AGTPinsights/status/2111013714103304450 【片段】 | 本人读 "The Kickflip" 短片（r5vsHHPVhJg，44 s）的 storyboard：车沿平直路面驶近，画面里没有坡道。 |
| U19 | **飞越的高度**：InsideEVs 写 "the 13.5-foot-tall Tesla Semi—which it cleared by nearly double its height"。 | D（单一媒体的目测） | Semi 高 13.5 ft，约 4.1 m。"cleared by nearly double its height" 有两种读法：一是最高点离地约为 Semi 的两倍，约 8 m；二是比 Semi 车顶再高出约两倍车高。原文没说清。 | InsideEVs 812152（同 U1）【全文·原文】 | 本人读 storyboard：短片约 0:13.7 处，远景里车身下沿离地大约是 Semi 高度的 1.5–2 倍，但透视下前后距离不明，只能作为数量级参考。**没有找到任何人从视频里实测过高度。** |
| U20 | **飞越的距离和滞空时间：没查到任何来源。** 被飞越的是 5 台车并排停放（Model 3、Model Y、Cybercab、Cybertruck、Semi），车之间的间距没有公开。 | — | — | 车型名单见 sources.md T24，以及 tech-insider "All 4 Stunts" 等 | 本人粗读 storyboard（短片时间）：远景里约 0:12.7 车还在地面驶近，约 0:13.7 已经升到 Semi 上方，约 0:14.7 在车阵另一侧倒转着向下喷气，约 0:15.6–0:16.6 落地起烟。**滞空大约 2–4 s**，±1 s。这是剪辑过的片子、1 fps 的缩略图，**不能当测量结果**。 |
| U21 | **还有没有"第四个特技"**：Engadget 写 "the Roadster did one last flip, jumping from stationary position, turning over in the air"，意思是最后还从静止状态起跳翻了一次。tech-insider 的标题是"All 4 Stunts"。其他媒体都只写了三个演示：坡道、Kickflip、0-60。 | C（Engadget 是单一来源）/ D（tech-insider） | 起跳时车是静止还是在行驶。 | Engadget（同 U1）【全文·摘要】; tech-insider（Elias Virtanen），2026-10-17，https://tech-insider.org/tesla-roadster-tricks-stunts-explained-2026/ 【全文·摘要】 | **冲突**：Kickflip 的起跳，AGTP 和 The National 描述为行驶中起跳，Engadget 那段说的是"从静止起跳"。可能是另一次特技，也可能是描述不同，查不清。 |
| U22 | **外形尺寸**：车宽约 2,000 mm（约 79 in），轴距 2,825 mm（111.2 in），两者都来自 Top Gear 的视频。**车长和车高查不到可靠来源。** | C | 工程师或主持人在视频里的口述，未见官方规格表。 | Wikipedia "Tesla Roadster (second generation)" 信息框，引注为 Top Gear 2026-10-16，2026-10-18 访问，https://en.wikipedia.org/wiki/Tesla_Roadster_(second_generation) 【全文·摘要】; EVwire 2026-10-16（车宽约 2 m，已在 S10） | **同源**：Wikipedia 和 EVwire 都转述 Top Gear 的视频，只算一个来源。另有 greencarscompare 给出 4,201 × 1,999 × 1,199 mm、轴距 2,799 mm，但那一页标注 2026-07-05 更新，早于发布会，应该是占位或预估数据（D，【片段】）。arabwheels 的 3,947 × 1,852 × 1,128 mm、轴距 2,352 mm 与第一代 Roadster 几乎一样，是错的（D，【片段】）。都不要用。 |
| U23 | **车重**：最轻的版本 "roughly 3,700 pounds (1,700 kilograms)"；Top Gear 文字稿写 "likely be under 1,700kg"。 | C | 目标值，指最轻的版本，不清楚是否包含储气罐和气体。 | InsideEVs 812242（同 U12）【全文·原文】; Top Gear 规格稿（同 U10） | 与 S6 一致，没有更正。 |
| U24 | **真伪核查**：Snopes 评定 "True"，原文是 "there is nothing to suggest the video is fake… not created using artificial intelligence tools or the product of digital editing"，依据是直播加上现场观众自己拍的片段。同时注明 "Whether the vehicle actually 'flew'… is up to individual interpretation"。**质疑一方都没有给证据**： Autonocion（Olivia Richman，10-16）认为 "This was a video. This was not a real-time demonstration"，看到的是"后台预录画面"； CarScoops（Stephen Rivers，10-16）写 "Some have claimed that they saw wires helping to hold the car up"，并说这一点无法核实； Motor1（Brian Potter，10-16）只在导语里写了 "tethered flip"，正文没有展开； Policy Wire（无署名，10-16）的结论和 Snopes 一样。 | Snopes：B；其余：D | Snopes 核查的是"影像真不真"，不是"性能数字准不准"。 | Snopes（Laerke Christensen），"Are videos of Tesla's new 'flying' car performing mid-air stunts real?"，2026-10-16，https://www.snopes.com/fact-check/tesla-flying-roadster-car-real/ 【全文·原文】; Autonocion，https://www.autonocion.com/us/tesla-roadster-live-demo-recap/ 【全文·摘要】; CarScoops，https://www.carscoops.com/2289194/tesla-claims-roadster-questions/ 【全文·摘要】; Motor1，https://www.motor1.com/news/812195/tesla-roadster-stunt-2028-production/ 【全文·原文】; Policy Wire，https://policywire.substack.com/p/policy-wire-fact-check-are-videos 【全文·摘要】 | Motor1 那篇把发布会写成 "Wednesday night"（实际是周四），还写车 "rolled out… already hanging upside down"，和 Engadget、InsideEVs 都不一致，整篇可信度低。Top Gear 自述 "we did. In person. With our eyes"，也就是在现场看到了（见 U10 的 Top Gear 现场稿）。 |
| U25 | **佛罗里达州长 DeSantis 10-16 在 X 上的回应**：先发 "Tesla Roadster = Wow!"；有人问能不能在佛州合法上路，他回复 "We will make sure that it's legal — at a minimum could be used to leapfrog golf carts in the Villages"。 | B（发帖这件事）；作为监管结论：不成立 | 这是政治表态，不是法规，也没有州机构跟进。 | RedState（Kyle Becker），2026-10-16 11:52，https://redstate.com/kyle-becker/2026/10/16/ron-desantis-drops-a-savage-joke-about-elon-musks-new-roadster-n2208213 【全文·摘要】; WFLA，https://www.wfla.com/news/florida/desantis-speaks-out-on-revamped-tesla-roadster/ 【打不开】; BroBible、thenews.com.pk、cubanoticias360 【片段】 | **同源**：这些报道都在转述同一条 X 帖子，只算一个来源。Aakash Gupta 另发帖评论说，一旦离地就归联邦空域管（D，个人观点）。 |
| U26 | **CNN 报道中的史密森尼航空航天博物馆馆长 Roger Connor**："We're not talking about sustained flight… We are literally talking about hopping."（发布会之前接受的采访）。CNN 正文还写："whether the car is able to truly fly is very difficult to say… It certainly didn't have any demonstration of long-range flight." | B | 专家的评论，不是特斯拉的说法。 | CNN（Chris Isidore），"Tesla unveils what it says is a flying car, called the Roadster"，2026-10-16 02:34Z（18:14Z 更新），https://www.cnn.com/2026/10/15/business/tesla-unveils-what-it-says-is-a-flying-car 【全文·原文】; 同一篇稿件经 CNN Newsource 转发到 WKRC Local12，https://local12.com/news/nation-world/tesla-roadster-unveiled-by-elon-musk-as-driverless-demonstration-shows-car-climbing-ramp-hanging-upside-down-spinning-off-cincinnati-consumer-alerts-future-society-tech-landing-with-jets-musk-says-sports-car-reaches-60-mph-under-one-second 【全文·摘要】，与 CNN 同源 | **不要算到马斯克头上**（有检索摘要就是这么错的）。适合用来回答"它真的会飞吗"。 |
| U27 | **The Verge 对坡道段的描述**："the Roadster drove up a very tall, multi-story ramp, using its incredible downforce to cling to the vertical roadway. When it reached the top of the ramp, it flipped around using its cold-gas thrusters to bring it gently back down to earth." 后续评论稿称全场 "a 30-minute flex"。 | B | 定性描述。 | The Verge（同 U1）; The Verge，"The incredible flying Tesla Roadster is just for show"，2026-10-16 14:15Z，https://www.theverge.com/transportation/1012783/tesla-roadster-flying-stunt-production-reality-musk 【全文·原文】 | 同一篇里说风扇"supplied by SpaceX"，见 U13 备注。 |
| U28 | **推进器满罐的持续时间（复核 F8）**：Top Gear 文字稿写 Thrust 版的 200 L 罐 "emptied in just six seconds and needs refilling a station, so it's a one-shot deal"；InsideEVs 写 "One charge lasts roughly five to six seconds"。 | C | Thrust 版，200 L 罐，用于加速。 | Top Gear 规格稿（同 U10）; InsideEVs 812242（同 U12） | 和 F8 的"约 5 s"一致，只是区间稍宽。 |
| U29 | **Thrust 版能不能预订：冲突。** CBS："A limited-edition Thrust model is also promised online but cannot be reserved"。InsideEVs 的预订条款稿写 "you'll need to front as much as $250,000"，Engadget 和 Motor1 也写 $250,000。 | B，两边冲突 | 指 10-16 前后的官网状态，可能后来改过。 | CBS（同 U1）【全文·原文】; InsideEVs（Rob Stumpf），"Tesla 'Cannot Guarantee' Your Roadster Pre-Order Will Ever Be Delivered"，2026-10-16 15:29Z，https://insideevs.com/news/812247/tesla-roadster-preorder-delivery-guarantee/ 【全文·原文】 | 和本片的主问题关系不大，仅供参考。InsideEVs 同一篇引了预订协议原文："we cannot guarantee when your vehicle will actually be delivered or if it will be delivered"。 |

---

## 3. 第 2 题结论：坡道倒挂时车是停住了，还是一直在开？

**结论：停住了。** 第一次上坡时车停在坡顶倒挂，但**停了几秒查不清**。起跳那一次（官方短片 "The Ramp" 里能看到的那一次）是**一直开上去**的，到顶后约 1 秒内就离开坡道。

依据：
1. **两家互相独立的媒体**（Engadget，InsideEVs）都写了坡道段有两次上坡。第一次开上去停在坡顶倒挂（Engadget："stopped at the top of the ramp… hanging upside-down"），然后倒车退下来（InsideEVs："After backing the roadster down the ramp"）。第二次冲上去以后起跳。Electrek 也把坡道段分成"先开上去、竖直、再倒过来"和"再开上去、从顶端跳出"两个环节（U3）。
2. 特斯拉官方宣称系统能"静止时吸住车身倒挂"（U5）。马斯克当场说 "it can stick upside down"（U6）。
3. 我读了官方短片 "The Ramp" 的 storyboard：爬坡那段（约 0:05–0:09）每一帧车的位置都在变，到顶以后约 1 秒就离开坡道（约 0:10），没有长时间静止（U8）。这只说明**这条剪辑过的短片**里看不到停顿，不能否定第一次上坡时停过。
4. **停住的姿态也不确定**：Engadget 写 "perpendicular to the ground, hanging upside-down"，Aakash Gupta 写 "almost upside down"。停住时车可能是越过竖直、接近倒扣，**不一定是完全 180° 倒扣**（U3）。
5. **停了几秒、在直播第几秒**：都没查到（U4、U9）。要回答，需要人工看完整直播 qt5p-_tE8d0 的 6:03–10:55，Snopes 把链接定在 6:30。

**坡道形状和高度**：
- 形状：一面很高的弯墙，从地面向上弯，越过竖直以后继续往回卷，相当于半个环，侧面看是 C 形（U1，B）。
- 高度：没有官方数字。只有一条 X 帖子说"65 英尺（约 20 米）"（D，U2）；The Verge 写"多层楼高"。

**时间码**：
- 完整直播的章节 "Ramp demo" 在 6:03–10:55（T22）；
- 短片 "The Ramp"（46 s）里各段的时间见 U8：约 0:05–0:09 爬坡，约 0:10 离开坡顶，约 0:11 朝下喷气，约 0:12 落地，0:18 以后是换机位的重放。

**翻身用了哪些喷口**：
- 没有官方说法。
- 媒体说法彼此冲突（U10）：InsideEVs 认为是"车头两个"把车翻正；Top Gear 和 Electrek 给出的布局是"后 4 个、四角朝下各 1 个、车头 2 个"。
- 下降时能看到车底朝下的喷气，说明用了角部朝下的喷口。滚转靠的是哪几个，从画面上判断不了。

---

## 4. 未公开或查不到的

- 第一次上坡停住倒挂的**时长**，以及在完整直播里的**精确时间码**（U4、U9）。
- 坡道的**官方高度、半径和角度**。唯一的数字"65 ft"来自个人帖子（U2）。
- 坡顶停住时车身的**准确姿态**：是完全倒扣，还是越过竖直的某个角度（U3）。
- 翻身时**哪几个喷口点火**、点了多久、推力多大（U10）。
- **车底负压（kPa）、密封面积（m²）、裙边离地间隙**：官方、专利和采访里都没有（U14）。
- 风扇的**单个推力、风量**；"2 G"在什么车速和条件下成立；2,500 kg 和约 4,700 kg 到底谁对（U13）。
- 飞越车阵的**高度、水平距离、滞空时间**：没有任何人实测（U19、U20）。5 台车之间的间距没有公开。
- **车长、车高**：没有可靠来源。车宽和轴距只有 Top Gear 视频的口述（U22）。
- 演示时用了几台车、各自什么配置（已在 sources.md E6 和第 3 节列出），本次没有新信息。
- Engadget 说的"最后一次原地起跳翻转"是不是第四个特技（U21）。
- 以下来源打不开：Inc.com（403）；WFLA（403）；X 帖子（402，只看到片段）；完整直播 qt5p-_tE8d0 和两条同名的二次上传（-yRQsurykGw、Uq_0kEthH3U），都被 YouTube 机器人验证拦下；Google Patents 和 Justia（拦截，已改用 USPTO 的 PDF）。

---

## 5. 推算（**不是来源，只给主代理做量级参考**）

**车底需要多大负压。**

- 公式：吸力 F = ΔP × A，其中 ΔP 是车底和大气的压差，A 是裙边围出的密封面积。
- 车重：目标值 1,700 kg（U23），重力约 16.7 kN。

A 没有任何来源。我**假设 A 取 3–5 m²**（车宽约 2.0 m、轴距约 2.8 m，见 U22，裙边围出的面积应该比车身投影小）。在这个假设下：

| 要产生的吸力 | 对应的力 | 需要的压差 ΔP | 约等于海平面大气压（101.3 kPa）的 |
|---|---|---|---|
| 1 倍车重（刚好够倒挂不掉） | 16.7 kN | 3.3–5.6 kPa | 3–6% |
| "2 G"（2 倍车重） | 33.4 kN | 6.7–11 kPa | 7–11% |
| 4,700 kg（屏幕上的数字） | 46 kN | 9.2–15 kPa | 9–15% |

**可以在视频里讲的意思**：车底只要比外面"少"几个到十几个百分点的气压，就够把车吸住。前提是密封得好，否则漏进来的气流会吃掉风扇的功率。

**对比 McMurtry**：官方 2,000 kg 下压力，车重不到 1,000 kg，下压力和车重之比大于 2，和特斯拉说的"2 G"是同一个量级。

---

## 6. 待主代理决定

1. **第 2 题是写"停住了"，还是写"停住了（时长不明）"**。我倾向后者。最好让找视频的子代理或人工看一遍完整直播 6:03–10:55，补上停顿时长、准确时间码，以及停住时车是不是完全倒扣。
2. **坡道高度**："65 英尺"只有一条个人 X 帖子（D）。建议画面和旁白只说"几层楼高"，或者干脆不说。
3. **喷口布局用哪一版来做动画**：建议用"后 4 个、四角朝下各 1 个、车头 2 个"，Top Gear 和 Electrek 两家一致。翻身由谁完成要写"未公开"，不要采用 InsideEVs"车头两个负责翻正"的说法，它只是单一媒体的解读。
4. **Kickflip 的高度和滞空时间**：只有 InsideEVs 一句话加我从缩略图里的粗读。是否在片中给"约两倍 Semi 高度""两三秒"这类说法，需要你定。如果要给，建议明确标注是"目测"。
5. **本人读 storyboard 的结论**（U8、U19、U20）能不能写进脚本：它的精度只有 ±1 s，而且来自 160×90 的剪辑短片缩略图。建议只作为找素材和对时间点的线索，不要当事实引用。
6. **外形尺寸**：只有车宽约 2.0 m、轴距约 2.8 m（C）。做示意图时建议用"约 4.x 米长"这类模糊表述，或者干脆不标注车长。
7. **先例对比选哪个**：McMurtry 的数据最好用（2,000 kg、厂方新闻稿 A）。但要说明它是**先上了一个翻转平台、被翻过来**，然后才自己往前开，和特斯拉"自己开上弯墙"不一样。Brabham BT46B 和 Chaparral 2J 适合讲"风扇车早就有，也早就被禁过"，但数字不全。
8. "We're not talking about sustained flight… hopping" 适合用来回答"它真的会飞吗"，但必须注明是**史密森尼的馆长**说的，不是马斯克（U26）。
9. Thrust 版能不能预订，CBS 和 InsideEVs 等的说法冲突（U29）。如果片中提到 Thrust 的价格或预订，需要再核实一次。
