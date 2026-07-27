<p align="center">
  <h1 align="center">Fithex Backend</h1>
  <p align="center">
    A production-ready RESTful API powering the <strong>Fithex</strong> fitness platform — gym discovery, membership management, payments, attendance tracking, and more.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/express-5.x-blue?style=flat-square&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/database-MongoDB-47A248?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License">
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Cron Jobs](#-cron-jobs)
- [Security](#-security)
- [Testing](#-testing)
- [License](#-license)

---

## ✨ Features

| Module | Highlights |
|---|---|
| **Authentication** | JWT-based auth with OTP verification via email |
| **Gym Management** | Create, update, search & discover gyms with geolocation support |
| **Membership** | Request/approve memberships, plan subscriptions, member transfers |
| **Payments** | Razorpay integration with webhook handling for real-time payment verification |
| **Attendance** | QR/manual gym entry & exit logging with live session tracking |
| **Streaks** | Automatic streak evaluation and visit-based gamification |
| **Weight Tracking** | Log and visualize weight history over time |
| **Notifications** | In-app notifications and push notification support |
| **Reviews** | Gym review and rating system |
| **Announcements** | Gym-level announcements for members |
| **Analytics** | Gym owner analytics dashboard |
| **Closures** | Scheduled gym closure management |
| **Admin** | Platform-level admin controls |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT (`jsonwebtoken`) + bcrypt |
| **Payments** | Razorpay SDK |
| **File Storage** | Cloudinary (via `multer-storage-cloudinary`) |
| **Email** | Nodemailer |
| **Scheduling** | `node-cron` |
| **Security** | Helmet, CORS, rate limiting, mongo-sanitize |
| **Validation** | `express-validator` |
| **Testing** | Jest + Supertest + `mongodb-memory-server` |

---

## 📁 Project Structure

```
fithex-backend/
├── index.js                  # Entry point — boots server & DB connection
├── package.json
│
├── src/
│   ├── app.js                # Express app setup, middleware & route mounting
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   ├── cloudinary.js     # Cloudinary configuration
│   │   └── validateEnv.js    # Startup env-var validation
│   │
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Gym.js
│   │   ├── Members.js
│   │   ├── MembershipRequest.js
│   │   ├── PlanSchema.js
│   │   ├── Payment.js
│   │   ├── GymSession.js
│   │   ├── Streak.js
│   │   ├── WeightLog.js
│   │   ├── Review.js
│   │   ├── Notification.js
│   │   ├── Announcement.js
│   │   ├── GymClosure.js
│   │   ├── TransferLog.js
│   │   └── Otp.js
│   │
│   ├── controllers/          # Request handlers
│   ├── routes/               # API route definitions
│   ├── middleware/            # Auth, role & error-handling middleware
│   ├── services/             # Business logic (OTP, notifications, streaks, push)
│   ├── validators/           # express-validator rules per resource
│   ├── utils/                # Helpers (encryption, geo-distance calc)
│   ├── constants/            # Shared constants
│   └── api/                  # External API integrations
│
├── cron/                     # Scheduled background jobs
│   ├── autoCheckout.js       # Auto-checkout stale gym sessions
│   ├── sessionSweeper.js     # Clean up expired/orphaned sessions
│   ├── streakEvaluator.js    # Evaluate & update user streaks
│   ├── membershipNotifier.js # Membership expiry reminders
│   └── visitNudge.js         # Re-engagement nudge notifications
│
├── tests/                    # Jest test suites
└── docs/                     # Additional documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local instance or Atlas URI)
- **Cloudinary** account (for media uploads)
- **Razorpay** account (for payment processing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/to-abhinav/fithex-backend.git
cd fithex-backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Fill in all required variables (see section below)

# 4. Start the development server
node index.js
```

The server starts on `http://localhost:5000` (or the port specified in your `.env`).

---

## 🔐 Environment Variables

Create a `.env` file in the project root. The server validates all required variables on startup and will refuse to start if any are missing.

### Required

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_PLATFORM_KEY_ID` | Razorpay key ID |
| `RAZORPAY_PLATFORM_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_ENCRYPTION_KEY` | Encryption key for Razorpay data |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for verifying Razorpay webhook signatures |
| `EMAIL_USER` | Email address for sending OTPs & notifications |
| `EMAIL_PASS` | Email account password / app password |

### Optional

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `JWT_EXPIRES_IN` | — | JWT token expiration duration (e.g., `7d`) |
| `EMAIL_SERVICE` | — | Nodemailer transport service (e.g., `gmail`) |
| `ALLOWED_ORIGINS` | `localhost:3000,8081` | Comma-separated list of allowed CORS origins |
| `NODE_ENV` | — | Environment (`development`, `production`) |

---

## 📡 API Reference

All routes are prefixed from the root. The base URL is `http://localhost:5000`.

| Prefix | Resource | Description |
|---|---|---|
| `/auth` | Authentication | Login, OTP verification |
| `/users` | Users | Profile management, user CRUD |
| `/gyms` | Gyms | Gym CRUD, search, discovery |
| `/gyms` | Reviews | Gym reviews and ratings |
| `/members` | Members | Membership management |
| `/plans` | Plans | Subscription plan CRUD |
| `/requests` | Requests | Membership join/transfer requests |
| `/payment` | Payments | Razorpay orders, verification, webhooks |
| `/entry` | Entry Logs | Gym check-in / check-out |
| `/streaks` | Streaks | User streak data |
| `/weight` | Weight | Weight logging & history |
| `/notifications` | Notifications | User notification feed |
| `/analytics` | Analytics | Gym owner analytics |
| `/closures` | Closures | Scheduled gym closures |
| `/announcements` | Announcements | Gym-level announcements |
| `/admin` | Admin | Platform administration |

> **Authentication**: Most routes require a valid JWT in the `Authorization: Bearer <token>` header.

---

## ⏰ Cron Jobs

Automated background tasks run via `node-cron`:

| Job | Schedule | Purpose |
|---|---|---|
| **Auto Checkout** | Periodic | Automatically checks out users who forgot to exit the gym |
| **Session Sweeper** | Periodic | Cleans up expired or orphaned gym sessions |
| **Streak Evaluator** | Daily | Calculates and updates user visit streaks |
| **Membership Notifier** | Daily | Sends reminders for upcoming membership expirations |
| **Visit Nudge** | Periodic | Sends re-engagement notifications to inactive members |

---

## 🛡 Security

The API implements multiple layers of security:

- **Helmet** — Sets secure HTTP headers
- **Rate Limiting** — 100 requests per IP per 15-minute window
- **CORS** — Configurable origin whitelist (blocks unknown origins in production)
- **Mongo Sanitize** — Prevents NoSQL injection attacks
- **Input Validation** — Request validation on every endpoint via `express-validator`
- **Password Hashing** — bcrypt-based password hashing
- **Encrypted Secrets** — Razorpay credentials encrypted at rest

---

## 🧪 Testing

Tests use **Jest** with **Supertest** for HTTP assertions and **mongodb-memory-server** for an isolated in-memory database.

```bash
# Run all tests
npm test
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Abhinav Tomar**

- GitHub: [@to-abhinav](https://github.com/to-abhinav)

---

<p align="center">
  Made with ❤️ for fitness enthusiasts
</p>