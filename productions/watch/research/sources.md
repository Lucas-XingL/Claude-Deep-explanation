# Research notes: 不用电池的机械手表，为什么能一直走，还能知道一秒有多长？

Compiled 2026-10-18 from web sources. Every number below has a source and a confidence grade:

- **A** = official manufacturer document, standards body, or textbook-grade reference
- **B** = reliable secondary source (watchmaker archive, horology encyclopedia, peer-reviewed or academic work, Wikipedia with citations)
- **E** = our own calculation from A/B numbers (the inputs are named)
- "(uncertain)" after a grade means a single source, an unclear source, or a stated caveat. Read the note before you use it.

---

## 0. Bottom line for the animation model

1. **ETA 2824-2 (automatic).** ETA's official sheets cover frequency, power reserve, jewels, diameter and lift angle, along with the parts list and the reversing-wheel winding system. **ETA does not publish its going-train tooth counts, and I found no reliable public source for them.** Only the escape wheel count was found: 20 teeth, from one source (17jewels.info). The 2824 also uses an *indirect* layout. The central wheel is the seconds wheel, and the minute hand is driven on the dial side. So the textbook picture of a centre wheel at the centre turning once an hour does not match the 2824's real layout.
2. **ETA/Unitas 6498-1 (hand-wound, 18,000 vph).** This is the **only movement found with a complete, measured, published tooth-count set**: barrel, centre, third, fourth (seconds), escape wheel and pinion, plus the motion work. The counts close exactly: 1 rev/h, 1 rev/min, 18,000 vph and 12:1 for the hour hand. The official ETA sheet gives the rest (Ø 36.60 mm, 46 h, 17 jewels, lift angle 44°).
3. **Recommendation.** Build the gear-accurate numeric model on the **6498-1** (see section 2.1). If the story has to be about an automatic, use the **2824-2's official specs** together with the generic 4 Hz train from section 2.3, labelled 示意 (illustrative). Don't present those counts as the real 2824 numbers.
4. **Seiko NH35A** has an official TMI spec sheet (21,600 vph, >41 h, 24 jewels, −20/+40 s/day) but no published tooth counts. It's useful as a third data point only.

---

## 1. Fact table

| id | fact | source (title, site, URL) | conf. |
|---|---|---|---|
| **M1** | ETA 2824-2: size 11½‴, diameter **25.60 mm**, movement height **4.60 mm** | ETA SA, *Technical Communication CT 2824-2 FDE 481688 25* (06.10.2022), portal.eta.ch, https://portal.eta.ch/fr/technicaldocuments/index/pdf/id/1883 | A |
| **M2** | ETA 2824-2 power reserve: **minimum 38 h, typical 42 h** (the 2011 edition of the same sheet gives "running time 38 h") | same CT (2022); older CT 2824-2 FDE 481688 12 (07.02.2011) via watch-spare.com, https://www.watch-spare.com/amfile/file/download/file/2/product/10107/ | A |
| **M3** | ETA 2824-2: **25 jewels**; frequency **28,800 alt/h** (= vph = beats per hour) | ETA CT 2824-2 (2022), as M1 | A |
| **M4** | ETA 2824-2 **typical lift angle of balance 50°** | ETA CT 2824-2 (2022), as M1; also 17jewels.info and ranfft.org | A |
| **M5** | ETA 2824-2 product page: "28'800 vibrations per hour; 4 Hz", typical power reserve 42 h, ETACHRON regulator, **bidirectional self-winding**, stop-seconds (hacking), date with quick correction | ETA SA, *2824-2* product page, portal.eta.ch, https://portal.eta.ch/en/2824-2-2824-2-5.html | A |
| **M6** | 28,800 vph = **8 beats (ticks) per second**; balance frequency **4 Hz**; period **T = 0.25 s**; one beat = 0.125 s | arithmetic from M3; the table of 18,000/21,600/28,800 → 5/6/8 ticks/s matches Boettcher (G1) | E |
| **M7** | ETA 2824-2 spare-parts list names the train: barrel complete (14), **intermediate wheel** (10), **third wheel** (11), **second wheel** (12, the central seconds wheel), **escape wheel** (9), pallet fork (21), balance with stud (23). Auto parts: **oscillating weight with ball bearing** (31), **reversing wheel** (28), **auxiliary reversing wheel** (27), **reduction wheel** (29), **ratchet-wheel driving wheel** (26). Motion work: cannon pinion with driving wheel (33), minute wheel (34) | ETA CT 2824-2 (2022) parts list, as M1 | A |
| **M8** | ETA 2824-2 **escape wheel: steel, 20 teeth** ("since this movement is a fast beating one with 28800 A/h") | C. Lorenz, *ETA 2824-2*, 17jewels.info – The Movement Archive, https://17jewels.info/movements/e/eta/eta-2824-2/ | B (uncertain: one source only; Horology-student's comparison, https://horology-student.org/themes/comparison-eta-2824-vs-2892/, says the 2824 and 2892 escape wheels are the same size, but gives no count) |
| **M9** | ETA 2824-2 layout: **direct centre seconds** (the seconds wheel is at the centre); the "second wheel" (the first wheel after the barrel) sits off-centre at about 5 o'clock and meshes with the barrel; **hour and minute hands are driven indirectly on the dial side** through a minute wheel with a **slip clutch to the cannon pinion**. Shock protection is Incabloc; base versions have a nickel annular balance and better versions a Glucydur balance | 17jewels.info, as M8; Horology-student, *ETA 2824*, https://horology-student.org/movements/modern-eta-and-clones/eta-2824/ (photo captions: "friction wheel driving the cannon pinion", fourth wheel "in central position") | B |
| **M10** | ETA 2824-2 history: 2824 introduced in **1971**; 2824-2 made in large quantities **since 1982** | Monochrome Watches, *The history of the ETA 2824*, https://monochrome-watches.com/the-history-of-the-eta-2824-the-mundane-calibre-that-shaped-the-industry/ ; Ranfft DB 2824-2, https://ranfft.org/caliber/4187-ETA-2824-2 | B |
| **M11** | ETA 2824-2 grades. **Standard:** adjusted in 2 positions, ±12 s/day (up to ±30), Nivarox hairspring, nickel-plated balance. **Elaboré:** 3 positions, ±7 (±20). **Top:** 5 positions, ±4 (±15), Glucydur balance, Anachron hairspring. **Chronometer:** COSC, −4/+6 s/day | Monochrome Watches, as M10 (other guides agree) | B (not from an ETA document) |
| **M12** | ETA/Unitas **6498-1** (Savonette, small seconds at 6): Ø **36.60 mm** (16½‴), height **4.50 mm**, running time **46 h**, **17 jewels**, lift angle **44°**, **18,000 A/h** | ETA SA, *Technical Communication CT 6498-1 FDE 482382 09* (05.12.2016), hosted by patrimoine.bourgognefranchecomte.fr, https://patrimoine.bourgognefranchecomte.fr/documents/ETA_6498-1.pdf | A |
| **M13** | ETA **6497-1** (Lépine, small seconds at 9) has the same figures: 36.60 mm, 4.50 mm, 46 h, 17 jewels, 44°, 18,000 A/h | ETA SA, *CT 6497-1 FDE 482160 11* (28.11.2016), https://patrimoine.bourgognefranchecomte.fr/documents/ETA_6497-1.pdf | A |
| **M14** | ETA **6498-2**: **53 h**, **21,600 A/h**, 17 jewels, 44°, 36.60 mm | ETA SA, *CT 6498-2* (07.02.2018), https://patrimoine.bourgognefranchecomte.fr/documents/ETA_6498-2.pdf | A |
| **M15** | ETA 6498-1 parts list names the classic train: **centre wheel**, **third wheel**, **second wheel** (the small-seconds wheel, i.e. the 4th wheel), **escape wheel** | ETA CT 6498-1, as M12 | A |
| **M16** | Seiko/TMI **NH35A**: 12‴, Ø **27.40 mm** (29.36 mm with spacer), height **5.32 mm**, **24 jewels**, accuracy **−20 to +40 s/day** (at 23±2 °C), **21,600 vph**, duration **more than 41 h**, antimagnetic ≥4,800 A/m, manual winding, "automatic winding with ball bearing", "**both winding with one way clutch**", second-hand stop | Time Module Inc. (Seiko Instruments), *NH35A Watch Movement Specification and Drawing* (rev. 16.11.2022), timemodule.com, https://www.timemodule.com/upload/category/24/spec_sheet/NH35_SS.pdf | A |
| **M17** | NH35A lift angle **53°**; winding system is Seiko's "Magic Lever" | Caliber Corner, *Seiko SII Caliber NH35*, https://calibercorner.com/seiko-caliber-nh35a | B |
| **G1** | Typical going trains (wheel teeth / pinion leaves). **28,800 vph:** great (barrel) wheel 80; centre 75/14; third 72/10; fourth 96/9; **escape 20/8**. **18,000 vph:** great 75; centre 80/10; third 60/10; fourth 70/8; escape 15/7. **14,400 vph:** centre 64; third 60/8; fourth 56/8; escape 15/7. Labelled "examples … although other counts are often used"; **not tied to a named calibre** | D. Boettcher, *About watch movements: technical details*, vintagewatchstraps.com, https://www.vintagewatchstraps.com/watchmovement2.php | B |
| **G2** | Train formula: vibrations per second = (cw·tw·fw·ew·2)/(tp·fp·ep·3600), where w = wheel teeth, p = pinion leaves. The 2 is there because each escape tooth escapes twice per revolution; the 3600 because the centre wheel turns once an hour. Shortcut: vps = fw·ew·2/(ep·60). The centre-to-fourth ratio must be 60 | Boettcher, as G1 | B |
| **G3** | **ETA/Unitas 6498-1 measured counts** (microscope; cross-checked by micrometer and centre distances, agreement within 0.07 mm): **barrel 88**; **centre wheel 80 / centre pinion 12**; **third wheel 60 / pinion 10**; **second (4th, seconds) wheel 70 / pinion 8**; **escape wheel 15 / pinion 7**; balance wheel Ø **14.05 mm**. Motion work: cannon (driver) pinion 12, minute wheel 36 / minute pinion 10, hour wheel 40. Keyless: ratchet wheel 56, crown wheel 35, setting wheel 16, intermediate setting wheel 16 | *#2 Taking Measurements (6498 Calibre Movement)*, Watchmaking.io (Feb 2022), https://www.watchmaking.io/2022/02/2-taking-measurements-6498-calibre.html | B (one careful measurer; matches the G1 18,000 example exactly) |
| **G4** | Unitas/ETA **6497 at 21,600 vph** (a -2 version): escape wheel 15 teeth / pinion 10; fourth wheel (small seconds) 120 / pinion 8; third 60 / pinion 10; centre 80. The page works through the turn times itself (escape 1 rev per 5 s; third 1 rev per 7.5 min; centre 1 rev/h) | Horology-student, *Unitas/ETA 6497*, https://horology-student.org/movements/modern-eta-and-clones/unitas-eta-6497-6498/ | B |
| **G5** | Generic: the barrel "usually rotates once every 8 hours, so the common 40-hour spring requires 5 turns"; a modern watch mainspring is "20–30 cm long and 0.05–0.2 mm thick"; one-day movements are designed for 36–40 h | Wikipedia, *Mainspring*, https://en.wikipedia.org/wiki/Mainspring | B |
| **X1** | Swiss lever: the escape wheel "except in unusual cases, has 15 teeth and is made of steel"; the lever turns between **two banking pins**; **draw angle typically about 11–15° to the radial**; the escapement is detached (the balance swings free except during impulse) and self-starting | Wikipedia, *Lever escapement*, https://en.wikipedia.org/wiki/Lever_escapement | B |
| **X2** | Lever escapement **phases per vibration (beat)**: rest (supplementary arc) → unlocking → impulse → safety (drop + run to banking). During unlocking the escape wheel **recoils**: geometric recoil about 0.15–0.25°, dynamic recoil about 0.04°. Impulse to the balance **starts before the dead point and ends after it**. Each tick is really **five impacts**: unlocking; start of escape-wheel impulse; start of balance impulse; end of drop; end of run to banking. Overbanking is prevented by the dart (guard pin) with the safety roller, and by the horns with the impulse pin | Horopedia, *Distribution mechanism (Swiss lever escapement)*, horopedia.org, https://horopedia.org/distribution-mechanism-swiss-lever-escapement/ | B (English is machine-translated from French; content is consistent with X1 and X5) |
| **X3** | **Total lift of the lever** (its swing between the banking pins) = unlocking + impulse + run to banking; **"generally between 12° and 20°"**. This is the lever's angle. It is different from the **balance lift angle** (M4, M12) | Horopedia, as X2 | B |
| **X4** | "The Swiss lever escapement alone absorbs about 30% of the nominal energy of the barrel" | Horopedia, as X2 | B (uncertain: machine-translated; basis not given) |
| **X5** | Balance **lift angle** = the part of the swing where unlocking and impulse act (the escapement causes a losing rate over it). It is a constant number of degrees for a given escapement design. **Amplitude dial up is usually 270° or more; crown down it can fall to about 220°.** At lower amplitude the fixed lift zone is a larger share of the swing, and the point-of-attachment effect is used to compensate | Boettcher, as G1 | B |
| **X6** | Balance wheels swing "about 1½ turns with each swing, that is, about **270° to each side** of their center equilibrium position" | Wikipedia, *Balance wheel*, https://en.wikipedia.org/wiki/Balance_wheel | B |
| **X7** | Reference for a 2824-2: healthy amplitude **≈270–315° fully wound (>200° at 24 h)**; beat error ideally <0.5 ms | Ranfft DB, *ETA 2824-2*, https://ranfft.org/caliber/4187-ETA-2824-2 | B (uncertain: generic guidance on a database page, not an ETA figure) |
| **X8** | One full oscillation (2 beats) moves the escape wheel one tooth: **24° for a 15-tooth wheel**. Geometric efficiency of the 15-tooth Swiss lever is about **91%** (geometry only, not overall efficiency) | D. Ichim, *Insight: The Geometric Efficiency of Escapements*, WatchesbySJX (05.08.2024), https://watchesbysjx.com/2024/08/geometric-efficiency-escapements.html | B |
| **B1** | Balance period **T = 2π√(I/κ)**: I is the balance moment of inertia (kg·m²), κ the balance-spring stiffness (N·m/rad). One period is two beats | Wikipedia, *Balance wheel* (as X6) and *Balance spring*, https://en.wikipedia.org/wiki/Balance_spring | B (textbook formula) |
| **B2** | Elastic couple of a hairspring **M = E·h·e³ / (12·L)** (E Young's modulus, h height, e thickness, L active length), used with T = 2π√(I/M). Rate is adjusted by changing the active length (regulator) or the inertia (weights or screws) | ei8htohms, *A Day in Watch School Part Six – Hairsprings*, WatchProSite, https://www.watchprozine.com/watchtech/a-day-in-watch-school-part-six-hairsprings-/6112423/1223/ ; Horopedia *Moment of inertia*, https://horopedia.org/moment-of-inertia/ | B |
| **B3** | **Isochronism:** an isochronous spring has a period "independent of the amplitude of oscillation". That matters because drive force changes as the mainspring runs down and the oil ages. Breguet overcoils are the usual practical way to get it | Wikipedia, *Balance spring*, as B1 | B |
| **B4** | **Temperature:** Berthoud (1773) found that a brass balance with a steel hairspring **lost 393 s/day for a 33 °C (60 °F) rise**, 312 s of it from the spring getting weaker | Wikipedia, *Balance wheel* (cites Britten 1898, p. 37), as X6 | B |
| **B5** | Modern balances are usually **Glucydur** (a low-expansion beryllium-copper-iron alloy) with **Nivarox** hairsprings (a low thermal coefficient of elasticity). **Elinvar** (Guillaume, about 1900) is a nickel-steel whose elastic modulus is "essentially unaffected by temperature". Silicon hairsprings are not magnetisable | Wikipedia, *Balance wheel* and *Balance spring*, as above | B |
| **B6** | **COSC:** mechanical chronometer average daily rate **−4 to +6 s/day**; ISO 3159; tested **15 days, 5 positions, 3 temperatures (8, 23, 38 °C)** | COSC, *FAQ*, cosc.swiss, https://www.cosc.swiss/cosc-faq | A |
| **B7** | Other COSC mechanical criteria: mean variation 2 s/d; greatest variation 5; horizontal-vertical difference −6/+8; largest variation 10; **thermal variation ±0.60 s/d per °C**; rate resumption ±5 | Wikipedia, *COSC*, https://en.wikipedia.org/wiki/COSC | B |
| **W1** | Automatic winding: rotor → **reverser** and **reduction gears** → mainspring. Advanced designs "have two ratchets and wind the mainspring during both clockwise and anti-clockwise weight motions". Eterna introduced the **ball-bearing rotor in 1948** | Wikipedia, *Automatic watch*, https://en.wikipedia.org/wiki/Automatic_watch | B |
| **W2** | ETA 2824 reverser: the ball-bearing oscillating weight drives **two exchange (reversing) wheels**. Depending on rotor direction, one spins free and the other drives the winding, "always in the same direction". Pawls in the exchange wheels decouple the rotor during hand winding | 17jewels.info, as M8; ETA parts list M7; Monochrome ("two reversing wheels"), as M10 | B (A for the parts' existence) |
| **W3** | **Slipping bridle:** the outer end of the mainspring is attached to an expansion spring (the bridle) that grips notches or serrations in the barrel wall. At full wind the spring's pull beats the bridle's grip, so it slides and further winding does nothing. Patented by Adrien Philippe, 16 June 1863. Too loose a grip gives "mainspring creep" (short reserve). Without it, overwinding causes excessive amplitude and "knocking" (the impulse pin hits the back of the fork horns) | Wikipedia, *Automatic watch* (as W1) and *Mainspring* (cites De Carle 1969) | B |
| **W4** | Rotor-to-barrel reduction ratio "lies between **1:110 and 1:180**", varying by brand | E. C. Buiter, *The Design of a 2-DOF Inertial Motion Harvester for a Mechanical Watch*, MSc thesis, TU Delft (2014), https://repository.tudelft.nl/file/File_6898f632-bed3-4e2c-8844-737faf513802 (citing Yun et al., UbiComp 2008) | B (uncertain: second-hand citation) |
| **W5** | Kinematic model and experiment: the automatic winding device's **efficiency is about 46.3%** | L. Xie, C. G. Menet, H. Ching, R. Du, "The Automatic Winding Device of a Mechanical Watch Movement and Its Application in Energy Harvesting", *J. Mech. Des.* 131 (2009), doi:10.1115/1.3151803 (abstract via Crossref, https://api.crossref.org/works?query.bibliographic=The+Automatic+Winding+Device+of+a+Mechanical+Watch+Movement) | B (peer-reviewed; only the abstract was read) |
| **W6** | Wrist motion over a day (from time-use data): about **50% of the day has no wrist motion**; low 14%, medium 37%, **high motion about 9 min/day**. Most wrist-motion power is at **0–2 Hz** (92.4%) | Buiter thesis, as W4 | B |
| **W7** | Watch-winder rule of thumb: **about 650 turns per day**, bidirectional, as a baseline for most automatics | Barrington Watch Winders blog, https://barringtonwatchwinders.com/blogs/blog/demystifying-tpd-why-650-turns-per-day-is-the-automatic-watchs-magic-number | B (weak: a vendor's rule of thumb; no ETA figure found) |
| **E1** | **ETA 2824-2 barrel torque curve measured**: maximum torque at **7.2 barrel turns** (full wind); the 2824-2 mainspring is a **1300 g·mm** spring (≈12.7 N·mm, our conversion); energy stored **≈0.3 J** (≈1530 J/L of barrel volume); the watch runs **≈40 h** on it; as an automatic spring it has a **bridle that slips** at full wind | DonCorson (watchmaker), *WatchTech 101.1 – Motive Power*, WatchProSite (20.09.2012), https://www.watchprosite.com/watchtech/watchtech-101-1--motive-power/1223.815518.5498083/ | B (measured by a practitioner; not peer-reviewed) |
| **E2** | "A standard ETA2824 mainspring has been calculated to store **557.2 mJ**" | Buiter thesis (as W4), citing Xie et al. 2009 (W5) and eta.ch | B (uncertain: calculated, about 1.9× E1's measured value; the thesis also gives spring "E=2.3×10⁵ MPa, 400 mm length, 1.23 mm thickness", where 1.23 mm is evidently the height) |
| **E3** | 2824-2 mainspring dimensions listed as "**1.20 x 11.0 x 0.125 mm**", read as height 1.20 mm, barrel Ø 11.0 mm, thickness 0.125 mm; power reserve 40 h | Ranfft DB, as X7 | B (the field order is our reading) |
| **E4** | Energy stored is proportional to spring **volume** (e·h·L) and to the **square of the elastic limit**. Some energy is lost to friction between coils inside the barrel | DonCorson, as E1 | B |
| **E5** | Reference powers: a **quartz watch ≈5 µW**, a pacemaker ≈50 µW, a hearing aid ≈1 mW | Buiter thesis (as W4), citing Vullers et al., "Micropower energy harvesting", *Solid-State Electronics* 53 (2009) | B (uncertain: second-hand citation; 5 µW for a quartz watch looks high, and many simple quartz watches use about 1 µW, which is unsourced here) |

---

## 2. Gear-train arithmetic (worked checks)

Conventions: wheel teeth drive pinion leaves. Speed ratio = driver teeth ÷ driven leaves. A Swiss lever gives **2 beats per escape-wheel tooth**: one on the entry pallet, one on the exit pallet.

### 2.1 ETA/Unitas 6498-1: full, closes exactly (recommended model)

Inputs: G3 (counts) and M12 (18,000 A/h, 46 h).

| stage | ratio | resulting speed | target |
|---|---|---|---|
| barrel 88 → centre pinion 12 | 88/12 = **7.333** | barrel turns **once per 7 h 20 min** (440 min) | n/a (reserve only) |
| centre wheel 80 → third pinion 10 | 80/10 = **8** | centre 1 rev/h → third **8 rev/h** (1 rev per 7.5 min) | |
| third wheel 60 → fourth (seconds) pinion 8 | 60/8 = **7.5** | fourth = 8 × 7.5 = **60 rev/h = 1 rev/min** | small seconds hand, matches |
| fourth wheel 70 → escape pinion 7 | 70/7 = **10** | escape wheel **10 rev/min** | |
| escape wheel 15 teeth × 2 beats | 30 beats/rev | 10 × 30 = **300 beats/min = 5 beats/s = 18,000 vph** (2.5 Hz, T = 0.4 s) | matches M12 |

- Centre to fourth: 8 × 7.5 = **60**, which is the required ratio (G2). **E**
- Barrel to escape: 7.333 × 8 × 7.5 × 10 = **4,400** escape-wheel turns per barrel turn → 132,000 beats per barrel turn. **E**
- Barrel turns used over the 46 h reserve: 46 × 18,000 / 132,000 = **6.27 turns**. Wikipedia's generic figure is about 5 turns for 40 h at about 8 h/turn (G5). **E**
- Formula check (G2): vps = 80·60·70·15·2 / (10·8·7·3600) = 10,080,000 / 2,016,000 = **5.0**. **E**
- Motion work (hour hand): cannon pinion 12 → minute wheel 36 (÷3); minute pinion 10 → hour wheel 40 (÷4); 3 × 4 = **12**, so the hour hand turns once per 12 h. **E**
- Per beat: the escape wheel turns 360°/30 = **12°**; the small-seconds hand moves 360°/300 = **1.2°** (5 steps per second). **E**

### 2.2 Unitas/ETA 6497 at 21,600 vph: cross-check

Inputs: G4. Centre 80/10 = 8; third 60/8 = 7.5 → 60 ✓. Fourth 120/10 = **12 rev/min** for the escape wheel; 12 × 15 × 2 = 360 beats/min = **6 beats/s = 21,600 vph** ✓. (G4 states these turn times itself.) Compared with the 18,000 vph 6498-1, the centre-to-fourth part (80/10, 60/8) is identical. Only the last stage changes: fourth 70 / escape pinion 7 (×10) becomes 120 / 10 (×12). That is how the same layout is made to beat faster. Whether the 6498-2 (M14) uses exactly these counts is not verified. **E**

### 2.3 ETA 2824-2 (28,800 vph): what can and cannot be shown

- Known: 8 beats/s (M3, M6) and a 20-tooth escape wheel (M8, single source).
- So the escape wheel must turn 480 beats/min ÷ (20 × 2) = **12 rev/min** (1 rev per 5 s), and the **seconds wheel : escape pinion ratio must be 12**. Per beat the escape wheel turns 360°/40 = **9°**; the central seconds hand moves 360°/480 = **0.75°** per step (8 steps/s). **E**
- **Not found:** tooth counts for the 2824's intermediate wheel, third wheel, seconds wheel and pinions. ETA's technical communications list parts but no counts.
- **Layout caveat (M9):** in the 2824 the wheel at the centre is the **seconds wheel** (1 rev/min). The minute hand comes from the cannon pinion, which is driven on the dial side through a friction (slip) wheel. So "a train wheel at the centre turning 1 rev/h" is not literally true for the 2824; only the cannon pinion turns once an hour.
- **Illustrative 4 Hz train (G1, not 2824-specific):** barrel 80 → centre pinion 14 (5.714 centre turns per barrel turn); centre 75 → third pinion 10 (7.5); third 72 → fourth pinion 9 (8) → 7.5 × 8 = **60** ✓; fourth 96 → escape pinion 8 = **12 rev/min** ✓; escape 20 teeth → 12 × 40 = **480 beats/min = 28,800 vph** ✓. **E**
  - It also happens to fit the reserve: at 5.714 h per barrel turn, the 2824's 38/40/42 h need **6.65/7.0/7.35** barrel turns. DonCorson measured full wind at **7.2 turns** (E1). This is a consistency check only, not proof the 2824 uses these counts. **E**

### 2.4 Energy and power checks (all E)

- Average power drawn from the spring, using E1: 0.3 J ÷ (40 h × 3600 s) = **≈2.1 µW**. Using E2: 0.557 J ÷ 42 h = **≈3.7 µW**. So a mechanical watch draws a **few microwatts** from its spring. The balance itself receives less, after train and escapement losses (X4, W5).
- Energy per beat at 28,800 vph: 0.3 J ÷ (40 × 28,800) = **≈0.26 µJ per tick** (≈0.5 µJ with E2).
- Size comparison: 2 µW is 1/500,000 of 1 W. (Pure arithmetic; for a device comparison use E5 with its caveat.)
- DonCorson's own comparison (E1): 0.3 J would move his car (6.3 L/100 km) **0.14 mm**.

### 2.5 Balance timing numbers (all E)

- κ/I = (2π/T)²: **631.7 s⁻²** at 4 Hz (2824); **246.7 s⁻²** at 2.5 Hz (6498-1).
- Sensitivity: T ∝ √(I/κ), so a fractional change of κ produces half that change in T. **1 s/day = 1/86,400 = 11.6 ppm**, which means a **23 ppm** change in spring stiffness (or the opposite change in I) shifts the rate by 1 s/day. COSC's −4/+6 s/day is −46 to +69 ppm.
- Temperature: Berthoud's 393 s/day over 33 °C (B4) is about **12 s/day per °C** for an uncompensated brass/steel balance. The COSC limit is ±0.6 s/day per °C (B7), about 20× tighter. That gap is why Glucydur, Nivarox and Elinvar exist (B5).
- Share of each beat spent in contact with the escapement. **Assumptions:** simple-harmonic swing, the lift zone centred on the dead point, amplitude 280°. At 4 Hz with a 50° lift that is ≈**7 ms of each 125 ms beat (≈6%)**; at 2.5 Hz with 44° it is ≈10 ms of 200 ms (≈5%). The other ~95% is free swing, which is the "detached" escapement idea behind X1.
- Peak balance speed at the dead point (amplitude 280°): ≈123 rad/s ≈ **19.5 rev/s** at 4 Hz; ≈77 rad/s ≈ 12 rev/s at 2.5 Hz.

---

## 3. Swiss lever escapement: event sequence for one beat

Synthesised from X1 (Wikipedia), X2/X3 (Horopedia) and X5 (Boettcher). Start state: the balance is swinging freely (supplementary arc); the lever rests against one banking pin, held there by **draw**; an escape-wheel tooth rests on the **locking face** of the entry pallet stone; the whole train is stopped.

1. **Free return.** The hairspring pulls the balance back toward its equilibrium (dead) point. Only the balance is moving; the train is locked.
2. **Unlocking begins: impact 1.** The impulse (roller) jewel enters the fork slot and strikes the inside of the fork horn. Lift angle measurement starts here.
3. **Unlocking.** The jewel pushes the lever. The pallet stone slides out along the tooth's locking face, which is angled for draw (about 11–15°), so the escape wheel and the whole train **recoil slightly backwards** (≈0.15–0.25° geometric plus ≈0.04° dynamic). This costs the balance a little energy.
4. **Start of escape-wheel impulse: impact 2.** The tooth tip leaves the locking face and falls onto the pallet stone's **impulse face**.
5. **Impulse: impact 3 when the fork catches the jewel.** The mainspring-driven tooth slides across the sloping impulse face (in the club-tooth Swiss lever, the pallet edge also slides across the tooth's own impulse face). This turns the lever, and the fork pushes the impulse jewel, giving the balance its push. The impulse **starts before the dead point and ends after it**.
6. **Drop: impact 4.** The tooth leaves the entry pallet. The escape wheel turns freely through a small "drop" angle until a different tooth lands on the **locking face of the exit pallet**. The escape wheel has now advanced **half a tooth** (12° for 15 teeth, 9° for 20 teeth).
7. **Lock and run to banking: impact 5.** Draw on the exit pallet's locking face pulls the lever the last bit, deeper into lock, until it hits the other banking pin. The train is locked again. The lever has swung its total lift of about 12–20° (X3).
8. **Supplementary arc (free swing).** The impulse jewel leaves the fork. The balance swings on, completely detached, to its amplitude (≈270–300° when fully wound and dial up; down toward ≈220° crown down; X5, X6, X7), stops, and the hairspring brings it back. During this time the **dart (guard pin) and safety roller** keep the lever on its banking pin if the watch is jolted.
9. **Next beat** (the "tock"). Steps 2–8 repeat mirrored on the **exit pallet**. Two beats make one full oscillation (one period T), which advances the escape wheel exactly **one tooth**.

The impacts in steps 2, 4, 5, 6 and 7 come so close together that the ear hears them as one tick (X2). A timegrapher uses the time between them, together with the **balance lift angle** (2824-2: 50°; 6498-1: 44°; NH35A: 53°), to compute amplitude.

**Two different "lift" numbers.** Don't mix them up in the animation:
- **Balance lift angle** (ETA "angle lift of balance", e.g. 50°) is how far the *balance* turns while the jewel is in contact with the fork.
- **Lever total lift** (12–20°) is how far the *lever* swings between its banking pins.

---

## 4. Automatic winding chain (for the 自动上链 segment)

1. **Rotor** (oscillating weight, ball-bearing on the 2824; M7, W1). Gravity and inertia make the off-centre weight swing whenever the wrist moves or turns.
2. **Reverser.** The 2824 has a **reversing wheel plus an auxiliary reversing wheel** with internal pawls (M7, W2). Whichever way the rotor turns, one wheel drives and the other freewheels, so the output always turns the same way (bidirectional winding, M5). The NH35A uses a one-way clutch with bidirectional winding (M16), Seiko's Magic Lever (M17).
3. **Reduction gearing** (the 2824 reduction wheel → ratchet-wheel driving wheel → ratchet wheel on the barrel arbour; M7). Typical overall reduction is about 1:110–1:180 (W4), which trades many fast rotor turns for a few strong arbour turns.
4. **Click** (pawl) on the ratchet stops the spring unwinding back through the winding train (M7 lists the click and click spring; G5).
5. **Mainspring in the barrel** (E1, E3). Full wind on the 2824 is about 7.2 barrel turns (E1).
6. **Slipping bridle** (W3, E1). At full wind the bridle slips round the barrel wall, so extra wrist motion is simply wasted and the spring is never overwound.

How much motion it takes: no ETA figure was found. Supporting facts: the device converts about 46% of rotor energy into spring winding (W5); wrists are still about half the day (W6); winder makers use about 650 turns/day as a baseline (W7, weak). A crown-turn count for a full 2824 wind was not found.

---

## 5. EN–ZH term list (for the script)

mainspring 发条 · barrel 发条盒 · going train 走时轮系 · centre wheel 中心轮 (二轮) · third wheel 三轮 · fourth/seconds wheel 四轮 (秒轮) · escape wheel 擒纵轮 · pallet fork / lever 擒纵叉 · pallet stones 叉瓦 · impulse (roller) jewel 圆盘钉 · banking pins 限位钉 · draw 牵引 (锁接牵引角) · balance wheel 摆轮 · hairspring / balance spring 游丝 · lift angle 升角 · amplitude 振幅 · beat / vibration 振次 · rotor / oscillating weight 自动陀 (摆陀) · reversing wheel 换向轮 · slipping bridle 发条打滑片 · cannon pinion 分轮 (中心管) · minute wheel 跨轮 · hour wheel 时轮 · motion work 时分轮系. (The Chinese terms are common usage; check them against your preferred glossary.)

---

## 6. Uncertain or not found (please don't present these as fact)

- **ETA 2824-2 going-train tooth counts:** not published, not found. The 20-tooth escape wheel comes from one source (M8). The G1 4 Hz train is a generic example.
- **Mainspring energy:** two values for the same 2824 spring, 0.3 J measured (E1) and 0.557 J calculated (E2). Use "about 0.3–0.6 J" or "a few tenths of a joule".
- **Escapement energy share (X4)** and the **quartz 5 µW figure (E5)** are second-hand and unclear.
- **Grade accuracies (M11)** come from secondary articles, not an ETA document.
- **Amplitude:** no official ETA amplitude spec. 270–315° (X7) and ≥270° dial up / ~220° crown down (X5) are watchmaker guidance.
- **Not found:** NH35 tooth counts, the 2824's crown turns to full wind, rotor turns to full wind, and the 2824's balance inertia and hairspring dimensions.
