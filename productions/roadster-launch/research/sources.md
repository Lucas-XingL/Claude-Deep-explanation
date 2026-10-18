# Tesla Roadster (2nd generation): "flying" and thruster claims, research notes

Compiled 2026-10-18. Every item has a source URL and a publication date. All times are as given by the source.

**Evidence levels**
- **A**: an official Tesla spec, document or page, or something shown publicly on official video. An "A" for a performance number only means Tesla officially claims or showed it. Nobody has tested any of these numbers independently.
- **B**: reliable reporting, or several independent outlets that agree.
- **C**: a verbal claim by Musk or Tesla staff (including Lars Moravy and Franz von Holzhausen) that nobody has verified.
- **D**: a rumour, a single unverified source, or a low-reliability outlet.

**Access limits.** Some sources could not be read directly, so their content comes through other outlets:
- tesla.com returned 403 to automated fetches, and the Wayback Machine was blocked. Tesla's Roadster page and press-gallery wording are therefore quoted through media reports (TechCrunch, Teslarati, Reuters, Electrek, EVwire) and search snippets.
- CNBC (403), Wired (blocked) and YouTube transcripts (captcha) were unavailable.
- The official YouTube video titles, publish times and description text were read directly from YouTube's public RSS feeds for the Tesla, Top Gear and MotorTrend channels.
- WebFetch limited direct quotes to about 125 characters, so some long quotes appear in pieces.

---

## 1. Current status as of October 2026

Tesla held the unveiling of the second-generation Roadster on **Thursday 15 October 2026**, at the SpaceX rocket development and test site in **McGregor, Texas, near Waco**, and livestreamed it. The event had been set for 1 October and was postponed on 28 September because of the weather.

Three live demos were shown, and no human was in the car for any of them:
1. **"The Ramp"**: the car drove up a curved ramp until it was upside down, held on by a fan "multi-mode suction system". It launched off the ramp, used cold-gas thrusters to rotate about 180° in the air, and landed on its wheels.
2. **"The Kickflip"**: the car used its thrusters to jump over a line of Teslas (Cybercab, Cybertruck, Semi, Model Y, Model 3) and flip in mid-air before landing.
3. **"The 0-60"**: Tesla's on-screen timer showed **0.81 s** ("0.67 s w/ rollout subtracted", in the description of Tesla's official video).

The car **did leave the ground**, but only in brief jumps, flips and controlled landings. **Nothing showed sustained flight or a stationary hover.** Tesla has published no height, airtime or flight-duration figures. The cars were **prototypes**.

Tesla now lists three trims, and reservations reopened:
- **Performance**: 2 seats, fans and active aero, no thrusters. Reservation **$50,000** ($5,000 up front plus $45,000 within 10 days).
- **Thrust**: 2 seats, rear cold-gas thrusters, limited. Reservation **$250,000**.
- **Rocket**: 1 seat, perimeter thrusters for brief flight, invite only, "not approved for public road use".

In China, only the Performance trim can be reserved, with a deposit (意向金) of **RMB 332,000** (reported by Xinjingbao). **No final price has been announced.** Musk says **production starts in 2028**. **No cars have been delivered.**

On regulation, the **FAA said the car "does not meet the FAA definition of an aircraft."** NHTSA said the maker must still comply with the federal motor vehicle safety standards (FMVSS) and that it "will continue to monitor the situation."

Most technical numbers so far come from interviews with Tesla engineers, not from an official spec sheet:
- 4 rear thrusters, plus 6 more on the Rocket
- 200 L and 600 L composite tanks (COPVs) rated to 10,000 psi
- more than 80 kN of thrust
- about 5 s of thrust per fill
- just under 1,700 kg target mass
- more than 1 MW from two rear motors

These are claims (level C).

---

## 2. Fact table

### 2a. Timeline: 2017 promise through the October 2026 unveiling

| id | fact | level | source (title, outlet, date, URL) | notes |
|---|---|---|---|---|
| T1 | 16 Nov 2017: Tesla showed the Roadster 2 prototype as a surprise at the end of the Tesla Semi event. The claims were 0-60 mph in 1.9 s; 0-100 mph (0-160 km/h) in 4.2 s; top speed over 250 mph; 620 mi range; a 200 kWh pack; from $200,000 with a $50,000 deposit; on the road in 2020. | A that the prototype was shown; C for the specs | "Tesla Roadster: the world's quickest-accelerating road car", Autocar (Sam Sheehan), 17 Nov 2017, https://autocarpro.in/news-international/tesla-reveals-roadster-27123 ; "Tesla truck… $200,000 Roadster", Fortune, 17 Nov 2017, https://fortune.com/2017/11/17/tesla-truck-200000-roadster | **Conflict on the quarter-mile:** Musk said 8.9 s on stage (Autocar), while Tesla's figures as reported by TTAC give 8.8 s (T2). |
| T2 | 2017 prototype details: Founders Series at $250,000 with 1,000 units; 4 seats (2+2); a removable lightweight glass roof that stows in the trunk; quarter-mile 8.8 s. | C | "Tesla Roadster: Guess Who's Back, Back Again?", The Truth About Cars (Matthew Guy), 17 Nov 2017, https://www.thetruthaboutcars.com/2017/11/tesla-roadster-guess-whos-back-back/ | TTAC itself only guessed the motor layout. |
| T3 | 2017 prototype: three motors (one front, two rear), all-wheel drive, torque vectoring, and a claimed 10,000 Nm of *wheel* torque. | C/D | Esquire Middle East (2017), https://www.esquireme.com/gear/cars/24798-a-tesla-that-will-outpace-the-bugatti-veyron-to-be-released-in-2020 ; Petersen Museum vehicle page (seen as a search snippet only), https://petersen.org/pages/petersen-vehicle/2017-tesla-roadster-2 ; Driving.co.uk (2017), https://driving.co.uk/?p=64139 | The 10,000 Nm is torque measured at the wheels, after gearing. It is not motor torque. |
| T4 | 9 Jun 2018, Musk tweet: "SpaceX option package for new Tesla Roadster will include ~10 small rocket thrusters arranged seamlessly around car. These rocket engines dramatically improve acceleration, top speed, braking & cornering. Maybe they will even allow a Tesla to fly …" | C | Quoted in "Musk: Tesla Roadster SpaceX option adds 10 rocket thrusters", Driven/Daily Mail (Aaron Brown), 14 Jun 2018, https://www.drivencarguide.co.nz/news/musk-tesla-roadster-spacex-option-adds-10-rocket-thrusters/ ; Fortune (David Z. Morris), 10 Jun 2018, https://fortune.com/2018/06/10/musk-tesla-roadster-spacex-rocket-thrusters | This is the origin of "~10 thrusters". |
| T5 | 10 Jun 2018, Musk tweet: "Note, gas contained would be ultra high pressure air in a SpaceX rocket COPV bottle. The air exiting the thrusters would immediately be replenished whenever vehicle pack power draw allowed operation of the air pump, which is most of the time." In a separate reply he wrote of "an electric pump to replenish air in COPV… But we are going to go a lot further." | C | "Elon Musk is Serious About the Tesla Roadster Rocket Thrusters", AutoGuide (Sam McEachern), 11 Jun 2018, https://www.autoguide.com/auto-news/2018/06/elon-musk-serious-tesla-roadster-rocket-thrusters.html ; Driven (above) | The air-in-COPV, pump-refill concept dates from 2018. |
| T6 | May 2020, on *Jay Leno's Garage*: "We're gonna use ultra-high pressure compressed air. It's a cold gas thruster." "The main thruster will be behind the license plate… for acceleration, it drops the license plate." "It's like full-on James Bond." | C | "Tesla Roadster Will Really Use SpaceX Rocket Thrusters — Because Elon", CleanTechnica (Johnna Crider), 24 May 2020, https://cleantechnica.com/2020/05/24/tesla-roadster-will-really-use-spacex-thrusters-because-elon/ | The episode was due to air on 27 May 2020. |
| T7 | Feb 2021, on the Joe Rogan podcast: Musk wants the car to hover "without, you know, killing people", at about 1 m above the ground. "If you plummet, you blow out the suspension, but you're not gonna die." Even without hovering, the thrusters would make it "move like a bat out of hell." | C | "Elon Musk Wants to Make the Tesla Roadster Hover", Entrepreneur (Michelle Jones), 16 Feb 2021, https://www.entrepreneur.com/business-news/elon-musk-wants-to-make-the-tesla-roadster-hover/365517 | The episode came out around 11–12 Feb 2021 (a NY Post report is dated 12 Feb). The 1 m figure is paraphrased. |
| T8 | May 2021: a Petersen Museum plaque on the displayed prototype gave 0-60 in 1.1 s "with SpaceX package". On 20 May 2021 Musk tweeted "Production article will look different (better)". | D (plaque); C (tweet) | "Tesla is updating Roadster design, 0-60 mph in mind-boggling 1.1 sec with SpaceX package?", Electrek (Fred Lambert), 20 May 2021, https://electrek.co/2021/05/20/tesla-roadster-design-0-60-mph-1-sec-spacex-package/ | **Conflict:** some outlets (Motor1, HotHardware) say Musk "confirmed" 1.1 s, but Electrek attributes the figure to the plaque. |
| T9 | Production slips: Jul 2020 to 2021; Jan 2021 to 2022; Sep 2021 to 2023; May 2023 "hopefully" 2024 ("this is not a commitment"); Q3 2024 call to 2025–26. | B | "Elon Musk pushes Tesla Roadster unveil again — now 'maybe in a month or so'", Electrek (Fred Lambert), 22 Apr 2026, https://electrek.co/2026/04/22/tesla-roadster-unveil-delayed-again-earnings-call/ ; "Tesla sets Roadster event…", Electrek, 13 Oct 2026, https://electrek.co/2026/10/13/tesla-roadster-event-thursday-nine-years-delays/ | Electrek counts at least six production slips and seven unveil dates. |
| T10 | 28 Feb 2024 (late 27 Feb in US time), on X: "Tonight, we radically increased the design goals for the new Tesla Roadster. There will never be another car like this, if you could even call it a car." Replying about the 0-60 time: "0-60mph < 1 sec" and "And that is the least interesting part." Timing: "Unveil end of year, aiming to ship next year." | C | "Musk says the Tesla Roadster will do 0-60 in under a second…", The Drive (Nico DeMattia), 28 Feb 2024, https://www.thedrive.com/news/musk-says-the-tesla-roadster-will-do-0-60-in-under-a-second-sure-whatever ; Fortune (Christiaan Hetzner), 28 Feb 2024, https://fortune.com/2024/02/28/elon-musk-tesla-roadster-unveiling-acceleration-production-market-launch-release-date | The Drive quotes "if you can even call it a car"; Fortune quotes "could". The demo promised for the end of 2024 did not happen. |
| T11 | 31 Oct 2025, on the Joe Rogan podcast: "One thing I can guarantee is that this product demo will be unforgettable." He hoped for an unveil "before the end of the year." On Peter Thiel's remark that the future was supposed to have flying cars: "if Peter wants a flying car, we should be able to buy one." | C | "Elon Musk Tells Joe Rogan That He Will Demo a Flying Car by End of Year", Gizmodo (Matt Novak), 31 Oct 2025, https://gizmodo.com/elon-musk-tesla-flying-car-2000680264 | This did not happen in 2025. |
| T12 | 6 Nov 2025, Tesla shareholder meeting: the demo "will be April 1 of next year". "I have some deniability because I can say I was just kidding." He called it the "most exciting, whether it works or not, demo ever of any product." Production is "probably about 12-18 months after that." | C | "Tesla delays reveal of production Roadster 2 to April Fools' Day", TechCrunch (Sean O'Kane), 6 Nov 2025, https://techcrunch.com/?p=3065962 ; Electrek (Jameson Dow), 6 Nov 2025, https://electrek.co/?p=442595 | Electrek's later recap gives production as "2027 or 2028". |
| T13 | Jan 2026, *Moonshots* podcast: "safety is not the main goal… if safety is your number one goal, do not buy the Roadster"; "aspire not to kill anyone in this car." | C | "'Aspire Not To Kill Anyone' — Musk's Safety Rating For The Next-Gen Roadster", Dallas Express via Yahoo Autos (Joe Edwards), 18 Jan 2026, https://autos.yahoo.com/safety-and-recalls/articles/aspire-not-kill-anyone-musk-133056181.html | The episode's air date was not stated. |
| T14 | 6 Feb 2026: Tesla filed a new Roadster trademark with a new silhouette. | B | Electrek (Fred Lambert), 6 Feb 2026, https://electrek.co/2026/02/06/tesla-files-new-roadster-trademark-with-new-silhouette/ | Title only; seen in Electrek's RSS feed. |
| T15 | Mid-March 2026: Musk on X moved the date from an April 1 "demo" to an "unveil" "probably" in late April. He also called it "a banger next-level". | C | EVwire, 18 Mar 2026, https://evwire.com/p/elon-musk-tesla-next-gen-roadster-unveiling-late-april (links to x.com/elonmusk/status/2033819277917360579) ; Electrek, 5 Jun 2026 (below) | The "banger" wording comes only through secondary outlets. |
| T16 | 21 Apr 2026, Q1 earnings call: "We may be able to debut that in a month or so." "It requires a lot of testing and validation before we can actually have a demo." | B (quote reported) | Electrek, 22 Apr 2026, https://electrek.co/2026/04/22/tesla-roadster-unveil-delayed-again-earnings-call/ | |
| T17 | 5 Jun 2026: per *The Information* (four anonymous sources), the demo slipped to August or later. The cold-gas system is code-named **"A71"** and was shown to Musk in late April. The system is meant to boost acceleration and let the car "briefly lift off the ground". | D (one outlet, anonymous sources), relayed by B | "Tesla pushes Roadster demo to August as SpaceX thruster work continues", Electrek (Fred Lambert), 5 Jun 2026, https://electrek.co/2026/06/05/tesla-roadster-demo-delayed-august-spacex-thruster/ | The A71 code name was later repeated by Chinese media (S-CN1). |
| T18 | 14 Aug 2026: per *The Information*, a lift-off stunt at McGregor with the car operated remotely and nobody inside, and spectators kept several hundred yards back because of the noise. One source said: "We started off thinking we were almost making an aircraft and ended up with something closer to hovering." The earlier plan (ramp, upside-down driving, hover) had been "cut back". | D, later largely borne out | "Tesla plans flying Roadster demo this month with no driver", Electrek (Fred Lambert), 14 Aug 2026, https://electrek.co/2026/08/14/tesla-flying-roadster-demo-this-month-no-driver/ | |
| T19 | 11–12 Sep 2026: Tesla posted a teaser on X ("Go for launch", "10.01"), and Musk replied "New Tesla Roadster Unveil 10.01". | B | Electrek (Fred Lambert), 12 Sep 2026, https://electrek.co/2026/09/12/tesla-roadster-october-1-reveal-teaser/ ; Reuters via Khaleej Times, 13 Sep 2026, https://www.khaleejtimes.com/business/auto/tesla-to-unveil-long-delayed-roadster-on-october-1-musk-says | Electrek says Tesla posted on Friday; Reuters says Musk spoke on Saturday. |
| T20 | Around 15 Sep 2026, at the All-In Summit: "We actually need an audience there to vouch that this is not AI." | C | gagadget, 15 Sep 2026, https://gagadget.com/en/725987-tesla-roadster-gets-an-october-1-reveal-musk-wants-witnesses/ | The exact interview date was not given. |
| T21 | 28 Sep 2026: Tesla on X: "We've been tracking the weather closely with local meteorologists… given the severe conditions predicted & because this event can only be held outdoors… we've made the difficult decision to reschedule." The event moved from 1 Oct to 15 Oct. | B | "Tesla delays Roadster 2 event again due to bad weather", TechCrunch (Sean O'Kane), 28 Sep 2026, https://techcrunch.com/2026/09/28/tesla-delays-roadster-2-event-again-due-to-bad-weather/ | |
| T22 | **15 Oct 2026, the event itself:** livestreamed from SpaceX's McGregor, Texas test site; scheduled for 7:55 pm Central. Tesla's official "Roadster Event" video went up at 2026-10-16 01:34 UTC. Its chapters: Ramp demo 6:03–10:55; Kickflip 10:56–12:43; Design 12:47–14:38; Aero 14:38–15:57; 0-60 demo 15:58–19:26. | A | Tesla YouTube "Roadster Event", https://www.youtube.com/watch?v=qt5p-_tE8d0 (published 2026-10-16T01:34Z) ; Electrek, 13 Oct 2026 (above) ; Reuters via Star-Advertiser, 16 Oct 2026, https://www.staradvertiser.com/2026/10/16/breaking-news/tesla-unveils-roadster-with-thrusters-targets-2028-production/ | **Location wording differs:** most sources say McGregor; some say Waco. McGregor is near Waco. |
| T23 | Demo 1, "The Ramp": the car drove up a curved ramp until upside down, held by fan suction. It came off the ramp inverted, rolled about 180° using compressed-gas bursts, and landed on its wheels. | A (official video); B (descriptions) | Tesla YouTube "The Ramp \| Roadster", https://www.youtube.com/watch?v=7p5LxFdc-Qg (2026-10-16T02:23Z; description: "The first live demo during the Roadster event. Real life, baby") ; Fortune (Bilin Lin), 17 Oct 2026, https://fortune.com/2026/10/17/tesla-flying-roadster-spacex-thrusters-2028-production-price/ ; CBS (below) | TechCrunch says the car "spun, and eased down to the pavement". |
| T24 | Demo 2, "The Kickflip": the car used its thrusters to jump over a Cybercab, Cybertruck, Tesla Semi, Model Y and Model 3 while moving, flipping in mid-air before landing. | A (official video); B | Tesla YouTube "The Kickflip \| Roadster", https://www.youtube.com/watch?v=r5vsHHPVhJg (2026-10-16T02:52Z; "The 2nd live demo… Tony would be proud") ; "Tesla reveals SpaceX-powered Roadster that flies and falls with style", TechCrunch (Sean O'Kane), 15 Oct 2026, https://techcrunch.com/2026/10/15/tesla-reveals-spacex-powered-roadster-that-flies-and-falls-with-style/ | Sources do not say clearly whether a ramp helped this jump. Two uploads exist with each of these titles; IDs and times are listed in M1. |
| T25 | Demo 3, "The 0-60": "0-60 mph in 0.81 seconds. 0.67 seconds (w/ rollout subtracted)". | A (shown on official video with Tesla's own timer, not independently timed) | Tesla YouTube "The 0-60 \| Roadster", https://www.youtube.com/watch?v=Zg9Q56t7bdo (2026-10-16T05:51Z) | Electrek reports an earlier run that read 1.0 s, timer problems, and thrusters firing before the car moved (E6). |
| T26 | **No human was aboard during the demos.** Musk said the demo was "technically autonomous" "to make sure we don't kill anyone" (AP). Electrek: "nobody in the car". Fortune: a mannequin in a SpaceX spacesuit sat in the car. Xinjingbao: an Optimus robot was in the car and the stunts ran remotely on a preset program. | B (no human aboard); D (what dummy was in the seat) | AP via Boston Globe, 16 Oct 2026, https://www.bostonglobe.com/2026/10/16/business/tesla-roadster-car-thrust/ ; Electrek (Jameson Dow), 15/16 Oct 2026, https://electrek.co/2026/10/15/an-updated-technical-look-at-teslas-kick-flipping-0-60-in-1s-next-gen-roadster/ ; Fortune, 17 Oct 2026 (above) ; 新京报 (Xinjingbao) via 川观新闻, 16 Oct 2026, https://cbgc.scol.com.cn/news/8064130 | **Conflict:** mannequin or Optimus; remote-controlled or autonomous. |
| T27 | **No sustained flight or hover was demonstrated**, and no height or airtime was published. Fortune: "a prototype demonstration with brief maneuvers, not sustained flight… Tesla hasn't said how long or far it can stay airborne." | B | Fortune, 17 Oct 2026 (above) ; Electrek analysis, 15 Oct 2026 (above) | A pre-event summary attributed to CNBC mentions "hovering slowly before landing" (unverified; CNBC returned 403). |
| T28 | The demo vehicles were prototypes. 4–5 prototypes have reportedly been built, with a larger build "early next year". | B (prototype); C (count) | Fortune, 17 Oct 2026 (above) ; "VIDEO: Tesla Roadster deep dives…", EVwire (Simon Alvarez), 16 Oct 2026, https://evwire.com/p/tesla-roadster-deep-dive-videos-hagerty-top-gear-motortrend | Electrek suggests different cars may have been used for different demos. |
| T29 | Production in **2028**. Musk: "We enter production in 2028. Actually, for real" (evo) and "2028, actually" (Electrek). Built in Texas (Giga Texas, per Teslarati and EVwire). | C | evo (Sam Jenkins), 16 Oct 2026, https://www.evo.co.uk/tesla/roadster/209200/no-you-cant-drive-the-flying-tesla-roadster-on-the-road-or-buy-one ; "Tesla unveils Cyberfied new Roadster that can kickflip", Electrek (Fred Lambert), 15 Oct 2026, https://electrek.co/2026/10/15/tesla-unveils-cyberfied-new-roadster-kickflip/ ; Reuters, 16 Oct 2026 (above) | Teslarati also quotes Musk saying production would follow the demo by 12–18 months. |
| T30 | US reservations: Performance $50,000 ($5,000 due now and described as fully refundable, plus $45,000 within 10 days or the reservation is cancelled). Thrust $250,000. Rocket invite-only with no fee shown. **No prices were given.** AP says the fine print does not guarantee delivery timing, or delivery at all. | A (Tesla reservation page, via several outlets) | Electrek, 15 Oct 2026 (above) ; Reuters, 16 Oct 2026 (above) ; AP, 16 Oct 2026 (above) | CBS mentions only the $5,000 first payment. In the UK, evo reports £5,000 plus £45,000 or £245,000. |
| T31 | China: the Tesla China site opened reservations for **Performance only**, with a deposit (意向金) of **RMB 332,000**. Production in 2028. The thruster versions are for closed courses only and "尚未取得公共道路上路资质" ("not yet approved for public roads"). | B (one major Chinese outlet, matching a Sina headline) | 新京报贝壳财经 (Bai Haotian), 16 Oct 2026, via https://cbgc.scol.com.cn/news/8064130 ; Sina headline "中国官网开放Performance版本预订" ("China site opens Performance reservations"), https://cj.sina.com.cn/articles/view/5328858693/v13d9fee4502002kajc | Whether the deposit is refundable in China was not confirmed from a source I could read. |
| T32 | No deliveries. What happens to 2017 Founders Series ($250,000) deposits has not been stated. | B | Fortune, 17 Oct 2026 (above) | |

### 2b. What "flying" means: thrusters, propellant, tanks

| id | fact | level | source | notes |
|---|---|---|---|---|
| F1 | Tesla's official description: "Roadster is a true pilot's car: active aerodynamics, a multi-mode suction system & cold-gas thrusters." "Multi-mode fan & ground sealing system pulls air from beneath the vehicle, generating enough suction to hold it upside down while stationary." "Advanced cold-gas thrusters w/ all-electric actuators make micro adjustments within a fraction of a second to stabilize the vehicle in flight." | A | Tesla YouTube "Roadster \| The Last Best Driver's Car", https://www.youtube.com/watch?v=cvKIR-c1SsU (published 2026-10-16T01:34Z), description text | This is the most quotable official wording. |
| F2 | Trims on Tesla's page: **Performance** is "Road ready", 2 seats, active aero plus multi-mode suction, no thrusters. **Thrust** is "Race ready", 2 seats, "rear-mounted cold-gas thrusters" ("acceleration thrusters"), limited release. **Rocket** is "Air ready", 1 seat, thrusters around the perimeter, a "full flight system" for "forward and upward acceleration" and lateral rotation, invite only, "not approved for public road use", and not offered in all regions. | A (page, via several outlets) | TechCrunch, 15 Oct 2026 (above) ; "Tesla Roadster: Three configs, one can fly, 0-60 in 0.8 seconds", Teslarati, 15 Oct 2026, https://www.teslarati.com/tesla-roadster-specs-configurations/ ; Reuters, 16 Oct 2026 ; Yahoo Finance (Pras Subramanian), 16 Oct 2026, https://finance.yahoo.com/markets/stocks/article/tesla-unveils-roadster-featuring-compressed-air-thrusters-for-limited-flight-015532745.html | EVwire says Tesla's order page lists Thrust and Rocket as "Augments". Teslarati quotes Tesla's site: "So…yes, it can fly." |
| F3 | Thruster count: **Thrust has 4 rear nozzles. Rocket has 10:** the 4 rear plus 6 more (one pointing down at each corner and two at the front for yaw). | C (engineers in interviews) | Top Gear video chapter "Rocket = 1 Seat & 6 Extra Thrusters", https://www.youtube.com/watch?v=JdkIOhFmbKI (2026-10-16) ; MotorTrend short "four cold-gas thrusters", https://www.youtube.com/watch?v=iiNqEGivr0s ; Electrek analysis, 15 Oct 2026 ; Electron Motion, 17 Oct 2026, https://electronmotion.com/2026/10/17/tesla-roadster-thrusters/ | TechCrunch's phrase "10 thrusters connected to 600 liters" refers to the Rocket. The 2018 "~10 thrusters" (T4) happens to match. |
| F4 | Tanks: carbon-fibre-overwrapped pressure vessels (COPVs). **Thrust:** one 200 L tank behind the seats, in the trunk. **Rocket:** adds a 400 L tank in place of the passenger seat, for **600 L** in total. Rated to **10,000 psi** (about 690 bar). Tesla says "every usable void" is filled with COPVs. | C (specs); A/B ("every usable void" quoted from Tesla) | MotorTrend video chapters "Inside the 10,000 PSI Pressure Vessel" (https://www.youtube.com/watch?v=6D5MlPZQFOw) and "Inside the 10,000 PSI Carbon Fiber Tank" (https://www.youtube.com/watch?v=y7oKy09ALfM), both 2026-10-16 ; "Tesla's Engineering VP Explains…", TeslaNorth (Sarah Lee-Jones), 16 Oct 2026, https://teslanorth.com/2026/10/16/tesla-roadster-moravy-hagerty-engineering-interview/ ; TechCrunch, 15 Oct 2026 | "Rated up to" 10,000 psi does not necessarily mean it is operated at 10,000 psi. |
| F5 | **Propellant gas: conflict.** Moravy (Hagerty) says **nitrogen**: "nitrogen seemed like a good fuel." Musk, Tesla and most coverage say **compressed or high-pressure air**: CBS quotes Musk on "ultra high-pressure air tanks", and TechCrunch quotes Moravy on "600 liters of compressed air." Musk's 2018 and 2020 statements also say air. | C, conflicting | TeslaNorth, 16 Oct 2026 (nitrogen) ; CBS News (Kris Van Cleave), 16 Oct 2026, https://cbsnews.com/news/tesla-roadster-dot-flying-car (air) ; TechCrunch, 15 Oct 2026 (air) | For a physics estimate the two hardly differ (air is about 78% N₂; the Isp values are almost the same). |
| F6 | Propellant mass: "**about 250 kg** of air" in 600 L feeding 10 nozzles (attributed to Moravy); evo says "up to 250kg". | C | "Tesla Unveils Thruster-Equipped Roadster, Targets 2028 Production", Autocar Professional, 16 Oct 2026, https://www.autocarpro.in/news/tesla-unveils-thrusterequipped-roadster-135279 ; evo, 16 Oct 2026 (above) | Globe TV says "two 600-litre tanks", which conflicts with everyone else (level D). See section 4 for a consistency check. |
| F7 | Thrust: "**more than 80 kilonewtons**" (Moravy, and a Tesla presenter during the 0-60 run). Moravy compared it to one F-16 engine without afterburner (MotorTrend). Tesla on X: the thruster system "generates 4–5x the force the tires can". Tesla on X: "Every car on the road today is limited by one thing: tire grip". | C | Autocar Professional, 16 Oct 2026 ; evo, 16 Oct 2026 (evo says it "cannot verify" the figure) ; Fox Business (Landon Mion), 15 Oct 2026, https://www.foxbusiness.com/technology/teslas-new-roadster-makes-flying-debut-hitting-60-mph-under-second ; Electron Motion, 17 Oct 2026 | Sources do not say whether 80 kN is per trim, a peak or the total. Electrek treats it as the rear ports. |
| F8 | Duration: **about 5 s** of thrust per fill, used over the first part of a quarter-mile run. Thrust tapers as tank pressure falls (Moravy's "balloon" analogy). | C | Moravy to Top Gear (chapter "How Long Do The Thrusters Last?" at 22:18), https://www.youtube.com/watch?v=JdkIOhFmbKI ; EVwire, 16 Oct 2026 ; Electron Motion, 17 Oct 2026 | No hover duration has been given anywhere. |
| F9 | **Refill: conflict.** Moravy says 6–7 h today for 600 L, with a target of about 30 min (Hagerty, via TeslaNorth and Electrek). Electron Motion, citing Top Gear, says 2–6 h from an external high-pressure system. Musk at the reveal: the car refills its own high-pressure air tank (Autocar Pro; Electron Motion). Von Holzhausen: "We're working on the system that allows for filling it up." | C, conflicting | TeslaNorth, 16 Oct 2026 ; Electrek analysis, 15 Oct 2026 ; Autocar Professional, 16 Oct 2026 ; Electron Motion, 17 Oct 2026 | Whether the production car fills itself is not settled. |
| F10 | Musk on stage: "It literally is just going to puff itself up, and uh, and be able to do this, these maneuvers whenever you'd like." "This is the culmination of incredible work by Tesla and SpaceX Engineers working closely together…" | C | TechCrunch, 15 Oct 2026 ; Reuters, 16 Oct 2026 | |
| F11 | Musk on X after the demo: "Turns out the future does have flying cars". Also, after the run: "Flying cars are real." | B (quote reported) | AP, 16 Oct 2026 ; Fortune, 17 Oct 2026 ; Fox Business, 15 Oct 2026 | **Speaker conflict:** Fox attributes "Flying cars are real" to Lars Moravy; Autocar Pro and Teslarati attribute it to Musk. |
| F12 | Musk: "This is not necessarily a safety-optimized car… But it takes the fun meter to 11 out of 10." On legality: "not sure it's necessarily legal in all jurisdictions." Lars Moravy: "We borrowed some technology from SpaceX." | B (quotes reported) | AP, 16 Oct 2026 ; Flying Magazine (Jack Daleo), 16 Oct 2026, https://www.flyingmag.com/breaking-down-tesla-flying-roadster-debut/ ; Globe TV, 16 Oct 2026 (Moravy quote; D outlet) | |
| F13 | Exhaust is supersonic, with visible Mach diamonds. People nearby need hearing protection, and attendees hundreds of feet away wore earplugs. | B | Autocar Professional, 16 Oct 2026 ; evo, 16 Oct 2026 ; Electrek analysis, 15 Oct 2026 | |
| F14 | Fan-suction system: four rear fans of about 20 kW each (about 80 kW), based on the heat-pump compressor motor family. Four drop-down skirts. More than 2 g lateral from 0–50 mph. Moravy said the downforce is "like 2,500 kilos or something". Electrek says Tesla's on-screen display showed about **4,700 kg** of downforce. | C (Moravy); B (Electrek's reading of the display) | TeslaNorth, 16 Oct 2026 ; Electron Motion, 17 Oct 2026 ; Electrek analysis, 15 Oct 2026 | **Conflict** on downforce (2,500 kg vs 4,700 kg). evo says the patent design has no skirt, while the engineers describe skirts. |
| F15 | Patents: **US 12,746,987 B1 "Electric Fan Car"**, granted 29 Sep 2026 (filed Jan 2024; provisional 17 Jan 2023), with four axial fans in the rear diffuser and an underbody suction region. **US 2026/0285418 A1 "Deployable and Active Rear Wing Assembly with Safety Features"**, published 24 Sep 2026, giving "up to 700 kg of downforce in high downforce mode at top speed". | B (as reported; I could not open the patent PDFs) | Electrek, 29 Sep 2026, https://electrek.co/2026/09/29/tesla-electric-fan-car-patent-model-s-roadster/ (PDF: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12746987) ; Electrek, 25 Sep 2026, https://electrek.co/2026/09/25/tesla-patent-new-roadster-hidden-active-rear-wing-700-kg-downforce/ (PDF: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20260285418) | The fan-car patent drawings show a Model S. Patents are primary documents, so check the PDFs before relying on them. |

### 2c. Vehicle specs (2026 car)

| id | fact | level | source | notes |
|---|---|---|---|---|
| S1 | 0-60 mph targets: Performance under 1.6 s; Thrust under 0.9 s; Rocket under 0.59 s. | A (official targets; not independently tested) | Teslarati, 15 Oct 2026 ; Electrek, 15 Oct 2026 ; EVwire, 16 Oct 2026 ; Yahoo Finance, 16 Oct 2026 | evo says Tesla's page shows only "sub-1 s" for Thrust; the other trim figures come from coverage of the event. |
| S2 | Moravy's figures: about 0.55 s for the top configuration (a "rollout" figure, with fans, thrusters and powertrain combined); 0.85 s for Thrust (rollout subtracted); 1.6 s for Performance (fans only). | C | TeslaNorth, 16 Oct 2026 ; Electrek analysis, 15 Oct 2026 ; Not a Tesla App, Oct 2026, https://notateslaapp.com/news/4840/new-tesla-roadster-specs-battery-range-speed-trims-and-more | Rollout conventions are reported inconsistently. Tesla's own video: 0.81 s, or 0.67 s with rollout subtracted. |
| S3 | Top speed: Tesla says **over 230 mph** (370 km/h). Electrek reads the trims as Performance 210, Thrust 230, Rocket "over 230". Top Gear: 214 mph initially, with a **330 mph target**. Musk: Mach 0.5 (about 383 mph) eventually. | A (">230", official claim); C (the rest) | TechCrunch ; Reuters ; Electrek analysis ; Top Gear video title "330mph…" (https://www.youtube.com/watch?v=JdkIOhFmbKI) ; Autocar Pro ; Not a Tesla App | **Conflicting.** In 2017 the claim was over 250 mph. |
| S4 | Range: **over 300 mi** (about 483 km). Top Gear cites 310–320 mi. | A (">300", official); C (310–320) | Reuters (Moravy) ; TechCrunch ; EVwire | Less than half of 2017's 620 mi. |
| S5 | Seats: 2 for Performance and Thrust, 1 for Rocket. Left-hand drive only. | A (seats); B (LHD, per evo and Autocar Pro) | TechCrunch ; evo | 2017 was 2+2. |
| S6 | Mass: target "**just under 1,700 kilos**" (about 3,700 lb), not final. Top Gear chapter: "Sub 1700kg". | C | TeslaNorth (Moravy to Hagerty), 16 Oct 2026 ; Top Gear video chapter 05:30 | **Conflict:** TechCrunch quotes MKBHD's post calling it a "4000+ pound car" (D). The demo cars may have been lightened, possibly with no battery (Electrek, SlashGear speculation; D). It is unclear whether the 1,700 kg includes the Thrust or Rocket tanks and gas. |
| S7 | Powertrain: two rear motors, rear-wheel drive, no differential, an 8.4:1 planetary reduction for each wheel, "over a megawatt" (about 1,341 hp for Performance), more than 1,400 N·m. "1,500 hp" for the top build. | C | TeslaNorth, 16 Oct 2026 ; Top Gear chapter "1500hp From Two Motors" and description "Performance model that produces over 1340hp" ; MotorTrend chapter "Two Motors, More Than a Megawatt" | 2017 was three motors with AWD. |
| S8 | Battery: **size not officially disclosed.** 4680 cells in aluminium cans, double-sided cooling, about 800 V, and a titanium upper plate. 15–80% in about 10 min. Track endurance 25–30 min. | C | TeslaNorth ; EVwire ; Electrek analysis | |
| S9 | Battery capacity guesses: "100+ kWh" (MotorTrend video chapter title); "115 kWh" (Electron Motion, attributed to von Holzhausen on MotorTrend); "roughly 150 kWh" (Not a Tesla App, no attribution). | C / D / D | MotorTrend https://www.youtube.com/watch?v=y7oKy09ALfM chapter 3:19 ; Electron Motion, 17 Oct 2026 ; Not a Tesla App, Oct 2026 | Do not use any single number. 2017's 200 kWh was a stage claim for the old concept. |
| S10 | Dimensions: width about 2 m (78.7 in). Wikipedia gives a wheelbase of 2,825 mm (111.2 in), citing the Top Gear video. **Length and height have not been disclosed.** | C/D | EVwire, 16 Oct 2026 ; Wikipedia "Tesla Roadster (second generation)" (accessed 2026-10-18), https://en.wikipedia.org/wiki/Tesla_Roadster_(second_generation) | I could not check these against the video myself. |
| S11 | Roof: removable roof panels (open-air driving). Steer-by-wire with a yoke; brake- and throttle-by-wire; fixed seat with adjustable pedals; magnesium, titanium and carbon fibre; Pirelli Trofeo RS tyres. | A (materials, manual controls, fixed seat: official description); B (the rest) | Tesla YouTube description (F1) ; MotorTrend chapter 31:06 "Removable Roof Panels…" ; evo, 16 Oct 2026 | |
| S12 | **Three or four versions?** Tesla's page lists 3 (Performance, Thrust, Rocket). Top Gear and MotorTrend describe a base "Roadster" below Performance, with base specs "estimated/TBC". | B, conflicting | Top Gear video description (2026-10-16) ; MotorTrend chapter "Four Versions: Roadster, Performance, Thrust and Rocket" | |

### 2d. Independent analysis, skepticism and regulation

| id | fact | level | source | notes |
|---|---|---|---|---|
| E1 | FAA: "The Tesla vehicle does not meet the FAA definition of an aircraft." | B | "We asked the DOT who would oversee a flying car like Tesla's Roadster…", CBS News (Kris Van Cleave), 16 Oct 2026, https://cbsnews.com/news/tesla-roadster-dot-flying-car ; Fortune, 17 Oct 2026 (citing CBS and Politico) | The FAA gave no reasoning. |
| E2 | The FAA's legal definition (14 CFR 1.1): "Aircraft means a device that is used or intended to be used for flight in the air." | A | LII / Cornell, https://www.law.cornell.edu/cfr/text/14/1.1 | Useful for explaining why the FAA ruling is notable. |
| E3 | NHTSA: "While the vehicle may appear to defy the laws of physics, the manufacturer must ensure that it does not defy applicable Federal Motor Vehicle Safety Standards… NHTSA will continue to monitor the situation and won't hesitate to act to protect the driving public." An unnamed senior DOT official doubted the car would take off and said there is no clear answer on who decides whether it is safe. | B | CBS News, 16 Oct 2026 | NHTSA relies on manufacturers to certify themselves. |
| E4 | Legal experts (AP). Bryant Walker Smith: "This was a demonstration of a one-off car using a technology around for many years." David Vladeck: "I'm not sure every state is going to allow a driver in the middle of traffic to suddenly elevate himself and fly." | B | AP via Boston Globe, 16 Oct 2026 | |
| E5 | evo: Tesla's 80 kN "cannot be verified" but would match an F-16 without afterburner, in bursts. Mate Rimac said in 2024 that thrusters empty their air in about 2–3 s and leave dead weight (tanks, compressor, valves, nozzles): "thrusters are really the only way to go. But bring a lot of downsides as well." | B (evo); C (Rimac) | evo (Sam Jenkins), 16 Oct 2026 | |
| E6 | Electrek's technical critique (Jameson Dow): only a few seconds at full power; different cars per demo; slow-motion video shows the thrusters "spinning up" before the car moves (a possible "electric version of turbo lag"); timing starts after about 1 ft of rollout; thrusters do little at high speed because drag dominates; exhaust and debris spread tens of metres; the demo car may have had no battery. | B (analysis by a named outlet) | "Are Tesla's claims for its new 'flying' Roadster real, or is it just full of cold gas?", Electrek, 15 Oct 2026 (updated 16 Oct), https://electrek.co/2026/10/15/an-updated-technical-look-at-teslas-kick-flipping-0-60-in-1s-next-gen-roadster/ | Useful framing for the "design principles" angle. |
| E7 | Jalopnik with physicist Dr Stephen Granade (2021, the 1.1 s claim): car 1,600 kg; about 39 kN needed in total, of which wheels give about 20 kN and thrusters about 19 kN; **nitrogen Isp "about 70 seconds"**; about 27 kg/s; about 30 kg of gas for one 1.1 s run; 55 L at 6,000 psi; refill 2.5–4 h and about 7.2–7.5 kWh. Verdict: "technically possible" but "likely not practical"; a one-shot system. | B | "We Did Some Math On The Tesla Roadster's Claimed 1.1 Second 0-60 Time", Jalopnik (Jason Torchinsky), 7 Jun 2021, https://www.jalopnik.com/we-did-some-math-on-the-tesla-roadsters-claimed-1-1-sec-1847046660/ | This was before the 2026 numbers but is methodologically sound. |
| E8 | Rhett Allain (Wired): a *fan or air-moving* hover of an 1,800 kg car with 0.81 m² of rotor area needs air at about 190 m/s and about **1.7 MW**, which is about 2.6 min on a 75 kWh pack. | B (as summarised; Wired could not be fetched) | Wired, "A Flying Tesla? Sure, We Calculate the Power Demands", https://www.wired.com/story/a-flying-tesla-sure-we-calculate-the-power-demands/ ; summary: CleanTechnica (Steve Hanley), 15 Jan 2019, https://cleantechnica.com/2019/01/15/can-the-tesla-roadster-really-fly-wired-says-it-has-the-answer/ | This models electric fans, not stored gas. It contrasts well with cold gas. |
| E9 | The Drive (2024): in 2024 only a 309-lb vacuum-assisted student car had done 0-60 in under 1 s. The Rimac Nevera (1.74 s; 1,914 hp; 5,070 lb) was then the quickest production car. | B | The Drive, 28 Feb 2024 (above) | Context for why fans and thrusters are needed: tyre grip limits acceleration to roughly μ·g. |
| E10 | Hobbyist engineer blog (Mark VandeWettering, co-written with an AI tool): about 99 kg of N₂ in 200 L at 10 ksi; v_e of about 500–600 m/s on average; Thrust tank gives about 1 launch per fill; Rocket hover about 6–8 s; refill about 40 kWh ideal and 60–80 kWh realistic. | D (single blog) | "Tesla Roadster 2: Just so much (hot?) air?", brainwagon.org, 16 Oct 2026, https://brainwagon.org/blog/2026-10-16-tesla-roadster-2-just-so-much-hot-air | My own calculation in section 4 independently gives similar numbers. |
| E11 | Opinion: the demo car was "very likely a hollow or significantly lightened mockup built specifically for the feat." | D (opinion, no evidence given) | SlashGear (Alex Hevesy), 16 Oct 2026, https://www.slashgear.com/2288900/was-tesla-roadster-flip-stunt-real-or-ai-generated/ | |
| E12 | Engineering Explained (2018) put the minimum hover thrust at about 20,000 N for an air-tank concept. | D (only a secondary summary seen) | Drive.com.au / CarAdvice (2018), https://www.drive.com.au/news/tesla-roasters-rocket-propulsion-explained/ (403; seen only as a search summary) | Check the video before using. |
| E13 | Analysts: Gene Munster: "an engineering flex with no commercial value beyond embarrassing traditional car makers." Morningstar: a "halo car". Musk: "not sure it moves the needle massively from a revenue standpoint." | B | Reuters, 16 Oct 2026 ; TechCrunch, 15 Oct 2026 | |

### 2e. Official images and video, and usage terms

| id | fact | level | source | notes |
|---|---|---|---|---|
| M1 | Official Tesla YouTube uploads, read from the channel's RSS feed on 2026-10-18 (title, ID, publish time in UTC): "Roadster Event" qt5p-_tE8d0 (10-16 01:34); "Roadster \| The Last Best Driver's Car" cvKIR-c1SsU (10-16 01:34); "The Ramp \| Roadster" 7p5LxFdc-Qg (02:23) and -yRQsurykGw (03:04); "The Kickflip \| Roadster" r5vsHHPVhJg (02:52) and Uq_0kEthH3U (03:14); "The 0-60 \| Roadster" Zg9Q56t7bdo (05:51). | A | https://www.youtube.com/feeds/videos.xml?user=TeslaMotors | These are the primary footage of the thrusters firing, the ramp and the flips. |
| M2 | Hardware close-ups appear in third-party media videos recorded with Tesla engineers: MotorTrend walkaround y7oKy09ALfM ("The Rear Diffuser, Fans and Thruster Nozzles" 17:01; "Inside the 10,000 PSI Carbon Fiber Tank" 20:47); MotorTrend x Moravy 6D5MlPZQFOw ("Inside the 10,000 PSI Pressure Vessel" 13:01; "How the Cold Gas Thrusters Work" 14:02); Top Gear JdkIOhFmbKI (thruster segment about 19:58–24:38; "How Long Do The Thrusters Last?" 22:18); Hagerty 22rvpUecLts ("The FLYING Tesla Roadster explained by the man who engineered it"). | A (videos exist; chapter titles read from feeds and oEmbed); C (claims inside them) | YouTube feeds for Top Gear and MotorTrend; YouTube oEmbed for Hagerty | These are copyrighted by the media outlets, not Tesla. |
| M3 | The September 2026 teaser, in Electrek's description: the red Roadster under bright vertical lighting "like a car on a launch pad", with "Go for launch" and "10.01". | B | Electrek, 12 Sep 2026 (above) | **Conflict:** a merchant blog describes an upside-down car with four white plumes, which may be a different later teaser (D). |
| M4 | Tesla press gallery terms: images are for news media use tied to a news story only. They remain Tesla's property. No magazine covers, advertising, promotion or other commercial use. Every use needs the credit "Courtesy of Tesla, Inc." Other uses need Tesla's prior written consent. | B (seen in search snippets of the official page; the page returned 403) | Tesla Gallery, https://www.tesla.com/about/press (also /en_NZ/press and others) | **For a monetised explainer video, these terms probably do not cover use. Ask Tesla, or use your own diagrams.** |
| M5 | Tesla website legal notice: marks shown are subject to Tesla, Inc. trademark rights, and nothing on the site grants a licence to Tesla's IP. | B (search snippet) | https://www.tesla.com/en_gb/legal/additional-resources | |

---

## 3. Unknown / not disclosed (as of 2026-10-18)

**Flight and thrusters**
- Any hover height, hover duration or flight range. The demo showed only jumps and flips. No stationary vertical take-off was described by any source.
- How much thrust each nozzle gives. Whether "over 80 kN" is a peak, an average or a total, and for which trim. The thrust-versus-time curve.
- Operating pressure (as opposed to the "rated to 10,000 psi"). The official propellant mass (only "about 250 kg", attributed). Whether the gas is **air or nitrogen** (sources conflict).
- Nozzle design (expansion ratio, throat size). Valve and regulator design. How the thrusters are throttled.
- The flight-control setup: sensors, control law, and what the pilot inputs while airborne. Whether the Rocket can be flown by a human at all, versus the "technically autonomous" or remote-controlled demo.
- Whether the production car refills its own tank, uses a station, or both. Refill time in production (claims range from 2–7 h today to a "<30 min target").

**The demo cars**
- How much the demo cars weighed and how they were configured: battery fitted, ballast, which trim. How many cars were used across the three demos.

**Vehicle specs**
- Battery capacity in kWh. Official curb weight. Official length and height. An official wheelbase.
- Final top speed for each trim (several figures conflict).

**Price, production and regulation**
- Final prices for all trims. What happens to Founders Series deposits. Whether the Rocket will be sold, leased or loaned (a track-programme model was reported in August).
- Production volume. Which regions get which trims. Whether the Thrust trim is road-legal (Tesla's page says nothing). Regulatory certification (FMVSS compliance, state laws). Noise levels.
- Any independent instrumented test of 0-60 or of the thrust.

---

## 4. Numbers usable for a physics estimate

### 4a. Constants and reference values (with sources)

| quantity | value | source |
|---|---|---|
| Standard gravity g₀ | 9.80665 m/s² (exact by definition) | NIST CODATA, https://physics.nist.gov/cgi-bin/cuu/Value?gn |
| Specific impulse definition | Isp = F / (ṁ·g₀) = v_eq / g₀ | NASA Glenn, "Specific Impulse", https://www.grc.nasa.gov/www/k-12/airplane/specimp.html |
| Cold-gas Isp, nitrogen | theoretical 80 s, measured 73 s (at 0 °C and 241 bar storage) | Table in Wikipedia "Cold gas thruster", https://en.wikipedia.org/wiki/Cold_gas_thruster , citing Nguyen, Köhler & Stenmark (2002), "The merits of cold gas micropropulsion in state-of-the-art space missions", IAF |
| Cold-gas Isp, other gases (same table) | He 179/165 s; H₂ 296/272 s; Ar 57/52 s; CO₂ 67/61 s | same as above |
| Cold-gas Isp, all propellants | 40–110 s; thrust 10 µN–3.6 N (spacecraft scale) | NASA, *State-of-the-Art of Small Spacecraft Technology*, ch. 4 In-Space Propulsion, 2026 edition (7 May 2026), Table 4-1, https://www.nasa.gov/smallsat-institute/sst-soa/in-space_propulsion/ |
| N₂ Isp used by an independent physicist for the Roadster | "about 70 seconds" | Jalopnik / Granade, 7 Jun 2021 (E7) |
| Air | about 78% N₂ by volume. Use cp ≈ 1005 J/(kg·K), γ = 1.4, R = 287 J/(kg·K) | standard textbook values; not separately sourced here |

**Caveat for the video.** Spacecraft Isp values are for vacuum. At sea level the exhaust has to expand against 1 atm, which lowers Isp. And as the tank empties, the gas inside cools, which lowers Isp further (see 4c).

### 4b. Claimed inputs (use with their evidence levels)

| input | value | level | id |
|---|---|---|---|
| Target vehicle mass | "just under 1,700 kg" (MKBHD: "4000+ lb", about 1,814 kg) | C (D) | S6 |
| Tank volume | Thrust 200 L; Rocket 600 L total | C | F4 |
| Tank rating | 10,000 psi ≈ 689 bar | C | F4 |
| Gas mass | about 250 kg (600 L) | C | F6 |
| Thrust | > 80 kN | C | F7 |
| Thruster count | Thrust 4; Rocket 10 | C | F3 |
| Burn per fill | about 5 s | C | F8 |
| Fan power | 4 × about 20 kW | C | F14 |
| Downforce | > 2 g; "2,500 kg"; display about 4,700 kg | C/B, conflicting | F14 |
| 0-60 shown | 0.81 s (0.67 s with rollout subtracted) | A (Tesla timer) | T25 |
| 0-60 targets | 1.6 / 0.9 / 0.59 s | A (official target) | S1 |
| 60 mph | 26.82 m/s | exact conversion | — |

### 4c. Derived numbers (my own calculations, not sourced facts)

Method: real-gas densities and the isothermal compression work come from the CoolProp 8.0.0 property library. The exhaust model is an ideal nozzle with v = √(2·cp·T₀·[1 − (pₐ/p₀)^((γ−1)/γ)]). In the video, label these as estimates.

**1. How much gas the tanks hold at the rated pressure (20 °C)**
- N₂ at 689 bar: about 495 kg/m³. So **200 L ≈ 99 kg** and **600 L ≈ 297 kg**.
- Air at 689 bar: about 531 kg/m³. So 200 L ≈ 106 kg and 600 L ≈ 319 kg.

**2. Consistency check on "250 kg in 600 L"**
- That mass needs about **437 bar (≈6,340 psi) for air**, or about 492 bar for N₂, at 20 °C.
- So either the tanks are not filled to the 10,000 psi rating, or the 250 kg / 600 L / 10 ksi figures are rounded or inconsistent.
- If there really were two 600 L tanks (the Globe TV claim), 250 kg would need only about 178 bar. That is further evidence against the two-tank reading.

**3. Exhaust velocity (sea level, expanding to 1 bar)**
- Ideal ceiling for air at 293 K: √(2·cp·T₀) ≈ 768 m/s, or Isp ≈ 78 s.
- From 690 bar at 293 K: about 706 m/s (72 s). From 100 bar at 293 K: about 657 m/s (67 s).
- During blowdown, the gas left in the tank cools isentropically. With real gas, N₂ goes from 690 bar and 293 K to about 215 K at 200 bar (about 67% of the mass still in the tank), about 180 K at 100 bar (50% left) and about 149 K at 50 bar (35% left).
- At 150–200 K, v_e falls to about 430–590 m/s (Isp about 44–60 s).
- **A realistic average v_e is about 500–650 m/s (Isp ≈ 50–66 s).** This matches the spacecraft tables and Jalopnik's 70 s as an upper end.

**4. Weight against claimed thrust**
- A 1,700 kg car weighs 16.7 kN; 2,000 kg weighs 19.6 kN; 2,300 kg weighs 22.6 kN.
- **80 kN gives a thrust-to-weight ratio of about 3.5–4.8.**
- With tyre grip μ ≈ 1–1.2 on a 1,700 kg car, the tyres manage about 17–20 kN. So "4–5x the tire force" is consistent with 80 kN.

**5. How long the gas lasts at full 80 kN**
- Mass flow ṁ = F / v_e ≈ 114–160 kg/s for v_e between 700 and 500 m/s.
- Thrust tank (about 99 kg): **about 0.6–0.9 s**. 250–300 kg: **about 1.6–2.6 s**.
- Moravy's "about 5 s per fill" therefore means **the average thrust is far below 80 kN**. For example, 99 kg × 600 m/s ≈ 59 kN·s of total impulse, spread over 5 s, averages about 12 kN.
- So 80 kN is best read as a peak at full tank pressure.

**6. Ideal hover time (Rocket)**
- Formula: t = (v_e / g)·ln(m₀ / m₁).
- m₀ = 2,300 kg with 250 kg of propellant: **5.9 s at v_e = 500 m/s; 7.0 s at 600 m/s; 8.2 s at 700 m/s.**
- m₀ = 2,000 kg with 250 kg: 6.8–9.5 s.
- Starting mass flow is about 28–45 kg/s.
- **These are upper bounds.** They assume all the gas is usable, but residual tank pressure is needed and some gas goes to attitude control. That fits the demo: hops and flips only.

**7. Acceleration implied by 0-60 times (average)**
- 0.55 s → 4.97 g; 0.67 s → 4.08 g; **0.81 s → 3.38 g**; 0.9 s → 3.04 g; 1.6 s → 1.71 g; 1.9 s (2017 claim) → 1.44 g.
- For comparison, tyres alone without downforce manage roughly 1–1.2 g. That is why fans (downforce) and thrusters (a force that does not depend on grip) are needed.

**8. Impulse needed for 0-60 if the thrusters did it alone**
- An 1,800 kg car needs 1,800 × 26.82 ≈ **48 kN·s**. That is about all of the Thrust tank's impulse. The tyres share the work in reality.

**9. Energy cost of refilling**
- Minimum isothermal compression work for air from 1 atm to 10,000 psi at 293 K is about 569 kJ/kg (N₂: about 595 kJ/kg).
- 100 kg ≈ 15.8 kWh. 250 kg ≈ 39.5 kWh. Real compressors need perhaps 1.5–2× that (my assumption).
- For comparison, the kinetic energy of 1,800 kg at 60 mph is about 0.18 kWh. **Cold gas stores energy very inefficiently.** That is the core design trade-off.

**10. Fan downforce versus air-moving hover**
- The fans use 4 × 20 kW = 80 kW to make suction (downforce) at near-zero speed.
- Allain's estimate (E8) for *lifting* an 1,800 kg car with fans is about 1.7 MW.
- This gives a clean "why suction is cheap but lift is expensive" comparison for the video.
