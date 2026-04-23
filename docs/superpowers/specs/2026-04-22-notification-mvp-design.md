# Notification MVP Design Spec

## 1. Scope & Feature List
This document outlines the Minimum Viable Product (MVP) for the FitHex Notification System. This subset of notifications balances revenue protection with user engagement (gamification).

### A. Membership (Revenue Protectors)
- **Membership expiring soon**: 3-day and 1-day warnings before membership end date.
- **Membership expired**: Alert on the day of expiration.
- **Payment alerts**: Payment successful and Payment failed notifications.

### B. Gym Entry & Sessions
- **Check-in/Check-out**: Confirmed alerts when users enter or leave.
- **Session duration alert**: Warning if a user is checked in for > 2.5 hours.
- **Forgot to check out**: End-of-day alert closing hanging sessions.

### C. Streaks & Habits
- **Streak started**: Sent on the first day of consecutive visits.
- **Streak milestones**: Sent on 3 consecutive days and 7 consecutive days.
- **Streak broken / Comeback reminder**: Sent when a day is missed breaking an active streak.

### D. Smart Visit Prompt
- **Personalized visit reminder**: An alert sent 1 hour before a user's statistically "usual" visit time, if they have not checked in yet today.

---

## 2. Architecture & Data Flow

The system divides notifications into instant triggers and scheduled sweeps to decouple heavy calculations from the API lifecycle.

### A. Instant Event Triggers
Handled inline during API requests:
- `POST /checkin` triggers "Check-in confirmed", "Streak started" (if applicable).
- `POST /checkout` triggers "Check-out confirmed".
- Webhooks/Payment APIs trigger "Payment successful" or "Payment failed".

### B. Background Scheduler (Cron Jobs)
Using a scheduled worker (e.g., `node-cron`):
- **Midnight Job (00:00)**: Checks for Memberships expiring in 1 or 3 days and dispatches alerts.
- **Hourly Sweeper (*:00)**: Checks for active sessions older than 2.5 hours to dispatch duration alerts. Also cleans up any unclosed sessions at 11:00 PM (e.g., dispatching "Forgot to check out").
- **End-of-Day Streak Job (23:59)**: Evaluates all check-ins for the day to increment streaks, trigger streak milestones, and break streaks for absent users. 

### C. Smart Visit Nudge Engine
- **Weekly Aggregator (Sunday 02:00)**: Analyzes check-in timestamps to determine the most frequent 1-hour window for each user. Saves `preferredVisitTime` to the user profile model.
- **Hourly Nudge Job**: Checks if any user has a `preferredVisitTime` equal to exactly 1 hour from now. If the user hasn't checked in yet today, dispatches the prompt.
