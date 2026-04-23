# Complete Gym Notification Feature List for FitHex

---

## 🔐 Auth & Account

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 1 | Welcome notification | New user registers | DB + Email |
| 2 | Login from new device | JWT issued on unrecognized device/IP | DB + Email |
| 3 | Password changed | Successful password reset | DB + Email |
| 4 | Profile updated | Name/photo/contact changed | DB |
| 5 | Account deactivated | Admin deactivates account | DB + Email |
| 6 | Account reactivated | Admin restores access | DB + Email |

---

## 💳 Membership Lifecycle

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 7 | Membership request submitted | Member submits request | DB |
| 8 | Membership approved | Admin approves | DB + Email |
| 9 | Membership rejected | Admin rejects (with reason) | DB + Email |
| 10 | Membership active confirmation | After first payment clears | DB + Email |
| 11 | Membership expiry — 7 days | Cron daily check | DB + Email |
| 12 | Membership expiry — 3 days | Cron daily check | DB + Email |
| 13 | Membership expiry — 1 day | Cron daily check | DB + Email |
| 14 | Membership expired | Day of expiry | DB + Email |
| 15 | Membership renewed | Renewal payment success | DB + Email |
| 16 | Membership upgraded | Plan changed to higher tier | DB + Email |
| 17 | Membership downgraded | Plan changed to lower tier | DB + Email |
| 18 | Membership paused | Admin/member freezes membership | DB + Email |
| 19 | Membership resumed | Freeze period ends | DB + Email |
| 20 | Win-back message | 3 days after expiry, no renewal | DB + Email |
| 21 | Trial period ending | 1 day before trial ends | DB + Email |
| 22 | Free trial converted | Trial → paid membership | DB + Email |

---

## 💰 Payments & Billing

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 23 | Payment successful | Payment recorded | DB + Email |
| 24 | Payment failed | Payment attempt fails | DB + Email |
| 25 | Payment pending | Payment initiated, awaiting confirmation | DB |
| 26 | Refund initiated | Admin triggers refund | DB + Email |
| 27 | Refund completed | Refund processed | DB + Email |
| 28 | Invoice generated | Monthly billing cycle | DB + Email |
| 29 | Auto-renewal upcoming | 3 days before auto-debit | DB + Email |
| 30 | Auto-renewal failed | Auto-debit fails | DB + Email |
| 31 | Outstanding dues alert | Unpaid balance exists | DB + Email |
| 32 | Discount/offer applied | Promo code used at checkout | DB + Email |
| 33 | Cashback credited | Referral/loyalty reward credited | DB |

---

## 🏋️ Gym Entry & Sessions

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 34 | Check-in confirmed | Member scans in / session starts | DB |
| 35 | Check-out confirmed | Member checks out | DB |
| 36 | Session duration alert | Member has been in gym over X hours | DB |
| 37 | Forgot to check out | Session still open after gym closing time | DB |
| 38 | Entry denied — expired membership | Access attempt with expired plan | DB + Email |
| 39 | Entry denied — unpaid dues | Access attempt with outstanding balance | DB |
| 40 | Suspicious entry attempt | Multiple failed access attempts | DB + Email |
| 41 | First visit of the month | First check-in in a new month | DB |
| 42 | 100th session milestone | Session count hits milestone (10, 50, 100...) | DB + Email |

---

## 🔥 Streaks & Engagement

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 43 | Streak started | First day of a new streak | DB |
| 44 | Streak milestone — 3 days | 3 consecutive days | DB |
| 45 | Streak milestone — 7 days | 7 consecutive days | DB + Email |
| 46 | Streak milestone — 30 days | 30 consecutive days | DB + Email |
| 47 | Streak milestone — 100 days | 100 consecutive days | DB + Email |
| 48 | Streak at risk | No visit by 8 PM, active streak | DB |
| 49 | Streak broken | First miss after active streak | DB |
| 50 | Streak recovery challenge | Day after streak broken | DB |
| 51 | New personal best streak | Current streak beats all-time best | DB + Email |
| 52 | Weekly consistency badge | 5+ days in a week | DB |
| 53 | Monthly consistency badge | 20+ days in a month | DB + Email |
| 54 | Comeback notification | First visit after 7+ day absence | DB |
| 55 | Inactive member nudge | No visit in 7 days | DB |
| 56 | Inactive member nudge — strong | No visit in 14 days | DB + Email |
| 57 | Long absence warning | No visit in 30 days | DB + Email |

---

## 📊 Progress & Goals

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 58 | Weight goal set | Member sets a target weight | DB |
| 59 | Weight milestone hit | Lost/gained X kg since start | DB + Email |
| 60 | Weight goal achieved | Target weight reached | DB + Email |
| 61 | Workout personal best | Reps/weight exceeds previous best | DB |
| 62 | Workout count milestone | 10th, 25th, 50th, 100th workout logged | DB |
| 63 | Weekly workout goal met | Hit self-set weekly workout target | DB |
| 64 | Weekly workout goal missed | End of week, target not met | DB |
| 65 | Monthly summary | Rollup of sessions, weight change, streaks | DB + Email |
| 66 | Yearly review | Annual stats recap (sessions, streaks, progress) | DB + Email |

---

## 📅 Scheduling & Bookings *(future feature)*

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 67 | Class booked | Member books a group class | DB + Email |
| 68 | Class booking cancelled | Member/admin cancels | DB + Email |
| 69 | Class reminder | 1 hour before booked class | DB |
| 70 | Class cancelled by gym | Trainer cancels class | DB + Email |
| 71 | Waitlist slot opened | Someone cancels, waitlist member gets in | DB + Email |
| 72 | Personal trainer session booked | PT session confirmed | DB + Email |
| 73 | PT session reminder | 24 hours before session | DB + Email |
| 74 | PT session cancelled | Trainer cancels | DB + Email |
| 75 | PT session rescheduled | Trainer changes time | DB + Email |

---

## 🧠 Smart / AI-Driven Notifications

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 76 | Best time to visit — weekly | Sunday digest based on traffic patterns | DB + Email |
| 77 | Gym is quiet right now 🟢 | Active sessions drop below 30% capacity | DB |
| 78 | Gym is getting busy 🔴 | Active sessions exceed 70% capacity | DB |
| 79 | Personalized visit reminder | Member's usual workout time approaching | DB |
| 80 | Unusual absence detected | Member visits daily but skipped usual slot | DB |
| 81 | Workout plateau detected | No improvement in logs for 3+ weeks | DB |
| 82 | Overtraining warning | More than 2 sessions in a single day | DB |
| 83 | Rest day recommendation | 6 consecutive training days logged | DB |
| 84 | Nutrition reminder | Linked with workout — post-session protein reminder | DB |
| 85 | Hydration reminder | During long sessions (1+ hr) | DB |

---

## 🏆 Leaderboard & Social

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 86 | Leaderboard rank up | Member moves up in monthly rankings | DB |
| 87 | Leaderboard rank lost | Member dropped in rankings | DB |
| 88 | Top 10 this month | Member enters top 10 of gym | DB + Email |
| 89 | Member of the month | Admin crowns top performer | DB + Email |
| 90 | Friend joined the gym | Referred friend's membership approved | DB |
| 91 | Challenge invite received | Another member sends a challenge | DB |
| 92 | Challenge completed | Both members finish a shared challenge | DB |
| 93 | Challenge won | Member beats opponent's stats | DB |
| 94 | Referral bonus earned | Referred member completes first payment | DB + Email |

---

## 📣 Admin Broadcasts & Gym Updates

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 95 | Gym holiday closure | Admin schedules closure | DB + Email |
| 96 | Gym timing changed | Operating hours updated | DB + Email |
| 97 | New equipment added | Admin posts equipment update | DB |
| 98 | Maintenance scheduled | Gym/equipment maintenance notice | DB + Email |
| 99 | New trainer joined | Gym onboards new PT | DB |
| 100 | New class added | New group class on schedule | DB |
| 101 | Special offer / discount | Admin broadcasts promo | DB + Email |
| 102 | Emergency closure | Sudden closure (weather, power, etc.) | DB + Email |
| 103 | Gym reopened | After closure/maintenance | DB + Email |
| 104 | Rule/policy update | New gym policies | DB + Email |
| 105 | App update available | New FitHex version released | DB |

---

## ⚙️ System & Admin Notifications (Owner/Staff)

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 106 | New membership request | Member submits join request | DB + Email |
| 107 | Payment received — summary | Daily payment digest for owner | Email |
| 108 | Expiring memberships today | Morning digest: who expires today | DB + Email |
| 109 | New member joined | First payment cleared | DB |
| 110 | Member left / churned | Expired + no renewal after 7 days | DB |
| 111 | Gym capacity alert | Live occupancy exceeds 90% | DB |
| 112 | Revenue milestone | Monthly revenue hits target | DB + Email |
| 113 | Negative feedback received | Member submits complaint/low rating | DB + Email |
| 114 | Trainer assigned to member | Admin assigns PT to a member | DB |
| 115 | Staff login alert | Staff account accessed | DB + Email |

---

## 🎂 Delight & Retention

| # | Notification | Trigger | Channel |
|---|---|---|---|
| 116 | Birthday greeting | Member's birthday | DB + Email |
| 117 | Membership anniversary | Yearly join date anniversary | DB + Email |
| 118 | First workout anniversary | 1 year since first logged session | DB + Email |
| 119 | Congratulations on goal | Any self-set goal marked complete | DB + Email |
| 120 | You're in the top X% | Monthly stats vs all gym members | DB |
| 121 | Seasonal greeting | New Year, Diwali, etc. | DB + Email |
| 122 | Re-engagement offer | Inactive 30+ days → special discount | DB + Email |

---

## Implementation Roadmap

```
Phase 1 — Core (Build now)
├── Auth (1–6)
├── Membership lifecycle (7–22)
├── Payments (23–33)
└── Entry & sessions (34–42)

Phase 2 — Engagement (Next sprint)
├── Streaks (43–57)
├── Progress & goals (58–66)
└── Admin broadcast (95–105)

Phase 3 — Intelligence (After launch)
├── Smart/AI notifications (76–85)
├── Leaderboard & social (86–94)
└── Delight & retention (116–122)

Phase 4 — Premium Features
├── Scheduling & bookings (67–75)
├── System/admin digest (106–115)
└── Nutrition & health integrations
```

Your existing `NotificationService.trigger()` handles all of these — the only additions needed per phase are new **type enums**, **cron jobs**, and **email templates**. The infrastructure is already done.