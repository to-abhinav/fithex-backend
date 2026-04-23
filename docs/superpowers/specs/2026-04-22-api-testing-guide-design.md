# API Testing Guide Design Specification

## Overview
This document outlines the design and structure for the `api-testing-guide.md` file, which will serve as a comprehensive testing companion for the FitHex backend APIs.

## Goal
To provide a clean, organized, and easy-to-use reference document containing all API routes, required headers, and dummy JSON payloads, making it seamless to test the API via Postman, Thunder Client, or similar tools.

## Document Structure
The final markdown file will be structured as follows:

### 1. Global Configuration
- **Base URL**: e.g., `http://localhost:5000`
- **Authentication**: Instructions on how to extract the JWT token from login/register responses and pass it via the `Authorization: Bearer <token>` header.

### 2. Domain Sections (Grouped by Routes)
Each domain will list its respective endpoints matching the actual routing structure in `app.js`:

#### Auth & Login
- `POST /auth/send-otp`
- `POST /auth/login` (or verify)

#### Users
- `POST /users/send-otp`
- `POST /users/register`
- `GET /users/profile`
- `PUT /users/profile`
- `PATCH /users/profile-image`

#### Gyms
- `POST /gyms/`
- `GET /gyms/nearby`
- `GET /gyms/:id`
- `GET /gyms/owner/mine`
- `GET /gyms/owner/dashboard`

#### Plans
- `POST /plans/`
- `GET /plans/gym/:gymId`
- `GET /plans/owner/mine`

#### Requests (Gym Memberships)
- `POST /requests/` (Apply to gym)
- `GET /requests/mine`
- `PUT /requests/:id/approve`

#### Payments
- `POST /api/payment/webhook` (This one maintains the /api prefix as per app.js)
- `POST /payment/create-order` (or similar depending on paymentRoutes)
- `POST /payment/verify`

#### Entry & Check-ins
- `POST /entry/check-in`
- `POST /entry/check-out`

#### Streaks
- `GET /streaks/me`
- `POST /streaks/me/freeze`

#### Body Weight Logging
- `POST /weight/`
- `GET /weight/mine`

#### Reviews
- `POST /gyms/:id/reviews`

#### Notifications
- `GET /notifications/`
- `PATCH /notifications/read-all`

### 3. Endpoint Anatomy
Each endpoint block will follow a strict, scannable format:

```markdown
### Create Gym
**Method:** `POST` | **Endpoint:** `/gyms/`
**Auth Required:** Yes (Owner)

**Request Body (Dummy Data):**
```json
{
  "name": "FitHex Elite Fitness",
  "address": {
    "street": "123 Muscle Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pinCode": "400001",
    "coordinates": [72.8777, 19.0760]
  },
  "contactNumber": "9876543210"
}
\```
**Expected Response:** `201 Created`
```

## Dummy Data Guidelines
- Real-world constraints (e.g., proper 10-digit phone numbers, valid Indian locations).
- Realistic names and IDs.
- Valid JSON (ready for copy-paste).

## Next Steps
Once this specification is approved, I will transition to the `writing-plans` skill to generate the actual testing guide.
