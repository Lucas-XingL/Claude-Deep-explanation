# 事实表：机械表（研究日期 2026-10-18）

片中的机芯是**示意机芯**：频率、宝石数、动力储备和擒纵角度参照 ETA 2824-2 的官方数据。轮系齿数用一组典型的 4 Hz 齿数（G1，不对应具体型号）。布局为小秒针，方便讲“四轮带秒针”；真实的 2824-2 是中心秒针。完整的研究记录见 `sources.md`。

| 编号 | 事实 | 等级 | 来源 | 备注 |
|---|---|---|---|---|
| F01 | 自动上链：摆陀（带滚珠轴承）的转动经换向轮、减速轮传到发条；两个方向转动都能上弦 | A | ETA CT 2824-2 技术文件（2022）零件清单；sources.md M7 | |
| F02 | 发条是卷在发条盒里的钢带，长约 20–30 cm，厚约 0.05–0.2 mm | B | Wikipedia, *Mainspring* | sources.md G5 |
| F03 | ETA 2824-2 的动力储备最少 38 小时，典型 42 小时；片中说“大约四十个小时” | A | ETA CT 2824-2 技术文件 | sources.md M1 |
| F04 | 轮系逐级增速：示意齿数 发条盒 80 → 中心轮 75/14 → 三轮 72/10 → 四轮 96/9 → 擒纵轮 20/8；各级增速 5.7×、7.5×、8×、12× | B | D. Boettcher, vintagewatchstraps.com（典型 28,800 次轮系） | 不对应具体型号，片中标“示意” |
| F05 | 中心轮每小时一圈（带分针）；四轮每分钟一圈（带秒针）；中心轮到四轮的传动比是 60 | B | Boettcher（轮系公式）；sources.md G2 | 真实 2824-2 为中心秒针布局 |
| F06 | 游丝厚度一般只有 0.02–0.05 mm，常常比头发还细 | B | Monochrome Watches, hairspring 制造工艺；A. Lange & Söhne, *The Lange balance spring* | |
| F07 | 摆轮周期 T = 2π√(I/κ)，由惯量和游丝刚度决定，与摆幅基本无关（等时性） | B | Wikipedia, *Balance wheel* / *Balance spring* | sources.md B1 |
| F08 | ETA 2824-2：28,800 次/小时 = 每秒 8 次摆动（4 Hz） | A | ETA CT 2824-2 技术文件 | |
| F09 | 瑞士杠杆擒纵：擒纵叉在两个限位之间摆动，平时由擒纵叉锁住擒纵轮 | B | Wikipedia, *Lever escapement*；Horopedia | sources.md X1、X2 |
| F10 | 摆轮每完整往返一次，擒纵轮走一个齿；每摆动一次（一个节拍），走半个齿 | B | WatchesbySJX, *Geometric efficiency of escapements* | sources.md X8 |
| F11 | 冲击：擒纵轮推擒纵叉，擒纵叉推摆轮补充能量；每声“滴答”其实包含 5 次撞击 | B | Horopedia, *Distribution mechanism (Swiss lever escapement)* | sources.md X2 |
| F12 | ETA 2824-2 摆轮升角 50° | A | ETA CT 2824-2 技术文件 | 用于模型的 lift 参数 |

## 尚未查清
- ETA 2824-2 的实际齿数没有公开，片中用典型齿数（F04），并标“示意”。
- 摆陀转多少圈能上满发条：没有可靠数据，片中不提。

## 不讲的内容
- 发条储能的具体焦耳数：两个来源相差约一倍（0.3 J 实测、0.56 J 计算）。
