# FitHex API Testing Guide

## Overview
This document provides a comprehensive reference for testing the FitHex backend APIs. Use this guide to quickly test endpoints via Postman, Thunder Client, or cURL.

## Global Configuration
- **Base URL:** `http://localhost:5000` (Update if running on a different port)
- **Authentication:** Most routes require a JWT token.
    1. Call `POST /auth/login` or `POST /users/register`.
    2. Extract the `token` from the response.
    3. Include it in subsequent requests as a Header: `Authorization: Bearer <your_token>`.

---

## 1. Auth & Users

### Send OTP (User Registration/Login)
**Method:** `POST` | **Endpoint:** `/users/send-otp`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Register User
**Method:** `POST` | **Endpoint:** `/users/register`
**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePassword123",
  "otp": "123456",
  "role": "member" 
}
```
*(Role can be `member` or `owner`)*

### Login
**Method:** `POST` | **Endpoint:** `/auth/login`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

### Get My Profile
**Method:** `GET` | **Endpoint:** `/users/profile`
**Auth Required:** Yes

---

## 2. Gyms (Management & Discovery)

### Create Gym
**Method:** `POST` | **Endpoint:** `/gyms/`
**Auth Required:** Yes (Owner)

**Request Body:**
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
```

### Get Nearby Gyms
**Method:** `GET` | **Endpoint:** `/gyms/nearby?lat=19.0760&lng=72.8777&radius=5`
**Auth Required:** No

### Search Gyms
**Method:** `GET` | **Endpoint:** `/gyms/search?q=Elite`
**Auth Required:** No

---

## 3. Plans

### Create Plan
**Method:** `POST` | **Endpoint:** `/plans/`
**Auth Required:** Yes (Owner)

**Request Body:**
```json
{
  "gymId": "GYM_ID_HERE",
  "name": "Monthly Pro",
  "description": "Full access to all facilities",
  "price": 1500,
  "durationInMonths": 1
}
```

---

## 4. Membership Requests

### Apply to Gym
**Method:** `POST` | **Endpoint:** `/requests/`
**Auth Required:** Yes (Member)

**Request Body:**
```json
{
  "gymId": "GYM_ID_HERE",
  "planId": "PLAN_ID_HERE"
}
```

---

## 5. Members (Memberships)

### Create Member (Offline)
**Method:** `POST` | **Endpoint:** `/members/`
**Auth Required:** Yes (Owner)

**Request Body:**
```json
{
  "userId": "USER_ID_HERE",
  "gymId": "GYM_ID_HERE",
  "subscriptionPlan": "PLAN_ID_HERE",
  "subscriptionMonths": 1,
  "startDate": "2024-04-22"
}
```

---

## 6. Entry & Check-ins

### Check-in
**Method:** `POST` | **Endpoint:** `/entry/checkin`
**Auth Required:** Yes (Member)

**Request Body:**
```json
{
  "gymId": "GYM_ID_HERE"
}
```

---

## 🚨 Implementation Notes / Discrepancies Found

- **Authentication Method:** Implementation uses **Email and Password** rather than PhoneNumber/OTP for login.
- **Payment Routes:** `paymentRoutes.js` is currently **NOT MOUNTED** in `app.js`.
- **Review Routes:** Mounted on `/gyms`, so they follow the pattern `/gyms/:id/reviews`.
