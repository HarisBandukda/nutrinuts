# NutriNuts — Firebase Cloud Messaging (FCM) Setup Guide

> **Complete step-by-step guide to configure push notifications from scratch.**
>
> After completing this guide, the NutriNuts admin will receive instant push
> notifications on their phone/desktop whenever a customer places an order —
> even when the browser is minimised or the phone is locked.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create Firebase Project](#2-create-firebase-project)
3. [Enable Cloud Messaging](#3-enable-cloud-messaging)
4. [Get Web App Config](#4-get-web-app-config)
5. [Generate VAPID Key](#5-generate-vapid-key)
6. [Create Service Account](#6-create-service-account)
7. [Update Website Code](#7-update-website-code)
8. [Deploy Google Apps Script](#8-deploy-google-apps-script)
9. [Register Admin Devices](#9-register-admin-devices)
10. [Architecture: Idempotency & Logging](#10-architecture-idempotency--logging)
11. [Deployment Safety Guarantees](#11-deployment-safety-guarantees)
12. [System Health Monitor](#12-system-health-monitor)
13. [Testing Checklist](#13-testing-checklist)
14. [Rollback Procedure](#14-rollback-procedure)
15. [Troubleshooting](#15-troubleshooting)
16. [File Reference](#16-file-reference)

---

## 1. Prerequisites

- A Google account (for Firebase and Google Sheets/Apps Script)
- The NutriNuts website deployed to **nutrinuts.pk** (or a test domain)
- Access to the NutriNuts Google Sheets spreadsheet
- A modern browser: Chrome 80+, Edge 80+, or Firefox 80+

---

## 2. Create Firebase Project

1. Go to **[console.firebase.google.com](https://console.firebase.google.com/)**
2. Click **"Add project"** (or "Create a project")
3. **Project name:** `nutrinuts` (or `nutrinuts-push`)
4. Enable Google Analytics if desired (recommended)
5. Accept terms and click **"Create project"**
6. Wait for the project to provision (~30 seconds), then click **"Continue"**

> ⚠️ **Important:** The Firebase project is on Google's free Spark plan by default.
> Cloud Messaging is free with no usage limits. You won't be billed.

---

## 3. Enable Cloud Messaging

1. In the Firebase Console, go to **Build → Cloud Messaging** in the left sidebar
2. You should see the Cloud Messaging dashboard — no explicit "enable" step is needed; it's on by default
3. Leave this page open — you'll come back for the VAPID key

---

## 4. Get Web App Config

1. In Firebase Console, go to **Project Settings** (gear icon ⚙️ near the top left)
2. Scroll to **"Your apps"** section
3. If no web app exists, click **"Add app" → Web** (</> icon)
   - **App nickname:** `NutriNuts Website`
   - Optionally check "Set up Firebase Hosting" — NOT needed for this setup
   - Click **"Register app"**
4. You'll see a `firebaseConfig` object. It looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "nutrinuts.firebaseapp.com",
  projectId: "nutrinuts",
  storageBucket: "nutrinuts.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
};
```

5. **Copy these values.** You'll paste them into two files in Step 7.

---

## 5. Generate VAPID Key

The VAPID key (Voluntary Application Server Identification) is a public/private key pair that identifies your server to push services.

1. In Firebase Console, go to **Project Settings → Cloud Messaging** tab
2. Scroll to **"Web configuration"** section
3. Under "Web Push certificates," click **"Generate Key Pair"**
4. Copy the generated key (looks like `BL4d9...` — long string)
5. This is your **VAPID key** — you'll paste it into the website code

> 📝 The VAPID key is public and safe to include in frontend code.

---

## 6. Create Service Account

The Service Account lets Google Apps Script send push notifications via the FCM API. The private key MUST be kept secret.

1. In Firebase Console, go to **Project Settings → Service accounts** tab
2. Click **"Generate new private key"** (button near the bottom)
3. A JSON file will download. **SAVE THIS FILE SECURELY** — it contains your private key
4. Open the JSON file. It looks like:

```json
{
  "type": "service_account",
  "project_id": "nutrinuts",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@nutrinuts.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

5. **Copy the ENTIRE JSON content** — you'll store this in Google Apps Script Properties

> ⚠️ **SECURITY:** Never commit this JSON file to GitHub or include it in any source code.
> It grants full access to your Firebase project. Store it ONLY in GAS Script Properties.

---

## 7. Update Website Code

You need to replace placeholder values in two files with your actual Firebase config.

### 7.1 Update `assets/js/config.js`

Edit these two objects at the bottom of the file:

```javascript
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD...',                    // ← From Step 4
  authDomain: 'nutrinuts.firebaseapp.com', // ← From Step 4
  projectId: 'nutrinuts',                  // ← From Step 4
  storageBucket: 'nutrinuts.appspot.com',  // ← From Step 4
  messagingSenderId: '123456789',          // ← From Step 4
  appId: '1:123456789:web:abc123...',      // ← From Step 4
};

const FCM_VAPID_KEY = 'BL4d9...';          // ← From Step 5
```

### 7.2 Update `assets/js/firebase-messaging.js`

Replace the `FIREBASE_CONFIG` and `VAPID_KEY` values with the same values from Step 7.1.

```javascript
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD...',                    // ← Same as above
  authDomain: 'nutrinuts.firebaseapp.com', // ← Same as above
  projectId: 'nutrinuts',                  // ← Same as above
  storageBucket: 'nutrinuts.appspot.com',  // ← Same as above
  messagingSenderId: '123456789',          // ← Same as above
  appId: '1:123456789:web:abc123...',      // ← Same as above
};

const VAPID_KEY = 'BL4d9...';              // ← Same as above
```

### 7.3 Update `firebase-messaging-sw.js`

Replace the `FIREBASE_CONFIG` object at the top of the service worker file with the same values.

### 7.4 Deploy updated files

Upload all modified files to your web host (nutrinuts.pk):
- `assets/js/config.js`
- `assets/js/firebase-messaging.js`
- `firebase-messaging-sw.js`

---

## 8. Deploy Google Apps Script

### 8.1 Open the Apps Script Editor

1. Go to the [NutriNuts Google Sheet](https://sheets.google.com/open?id=1MOY9SUTttdxCA4rGhEhmjbT0ZyYHJO05G1S-50NyHv8)
2. Go to **Extensions → Apps Script**
3. Replace ALL existing code with the updated `google-apps-script.js` from the repository

### 8.2 Store Service Account Credentials

1. In the Apps Script editor, go to **Project Settings** (gear icon ⚙️)
2. Scroll to **"Script Properties"** section at the bottom
3. Click **"Add script property"**
   - **Property:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Paste the **ENTIRE JSON content** of the Service Account key file you downloaded in Step 6
     - The value must be one continuous string — copy the whole JSON including `{ }` braces
     - Example: `{"type":"service_account","project_id":"nutrinuts","private_key_id":"abc...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@nutrinuts.iam.gserviceaccount.com",...}`
4. Click **"Save script properties"**

> ✅ The private key is now stored securely. It will NEVER appear in your source code or GitHub.

### 8.3 Create the DeviceTokens Sheet

1. In the Google Sheet, create a new sheet/tab named **"DeviceTokens"**
2. Set up these exact headers in Row 1:

| A: Token | B: Device Name | C: Platform | D: Registered At | E: Last Used | F: Status |
|----------|---------------|-------------|-----------------|--------------|-----------|

3. The Apps Script will auto-create this sheet if it doesn't exist, but creating it manually ensures the headers are correct.

### 8.4 Deploy as Web App

1. In the Apps Script editor, click **"Deploy" → "New deployment"** (or "Manage deployments" if updating an existing one)
2. **Type:** Web app
3. **Description:** `FCM integration v2.0`
4. **Execute as:** Me
5. **Who has access:** Anyone
6. Click **"Deploy"**
7. **Authorize** the app when prompted (it needs permissions for: Spreadsheets, Mail, external URLs)
8. Copy the deployment URL — it should be the same URL already in `assets/js/main.js` (`GOOGLE_SHEETS_URL`)

> 📝 If this is an UPDATE to an existing deployment (not the first deploy):
> - Click **"Deploy" → "Manage deployments"**
> - Click the pencil/edit icon on the existing deployment
> - Ensure Version is set to the latest, then click **"Deploy"**

### 8.5 Verify Deployment

Visit the deployment URL in your browser:
```
https://script.google.com/macros/s/.../exec
```

You should see:
```json
{"status":"NutriNuts API is running","version":"2.0.0-fcm"}
```

---

## 9. Register Admin Devices

Now register each device that should receive order notifications.

### 9.1 Open the Registration Page

On each admin device (phone, tablet, desktop), visit:

```
https://nutrinuts.pk/pages/admin-register.html
```

### 9.2 Enable Notifications

1. Click **"🔔 Enable Notifications"**
2. Your browser will prompt: **"nutrinuts.pk wants to show notifications"** → Click **"Allow"**
3. The page will show "Registered & Active" with a green dot
4. Your device token is now stored in the `DeviceTokens` sheet

### 9.3 Test the Setup

1. Click **"📬 Send Test Notification"**
2. Close or minimise your browser
3. Within a few seconds, you should receive a push notification: **"✅ Test Notification — NutriNuts push notifications are working!"**

### 9.4 Register All Admin Devices

Repeat Steps 9.1–9.3 on every device that should receive order alerts:
- Your main phone
- Your desktop/laptop
- Any backup phone or tablet

All registered devices will receive push notifications for every new order — simultaneously.

### 9.5 Unregister a Device

- Visit `https://nutrinuts.pk/pages/admin-register.html` on that device
- Click **"✕ Unregister"**
- The token is marked inactive in the sheet and auto-cleaned after 30 days

---

## 10. Architecture: Idempotency & Logging

### 10.1 Duplicate Protection (Idempotency)

Every FCM push notification uses the **Order ID as an idempotency key**. This prevents duplicate notifications if Google Apps Script retries the webhook call (which it can do on 5xx errors or network timeouts).

**How it works:**

1. Before sending FCM pushes, the backend checks the `NotificationLogs` sheet
2. If a successful FCM entry already exists for this `Order ID`, the push is **skipped**
3. If no entry exists (or previous attempts failed), the push proceeds
4. The result is logged to `NotificationLogs` for future idempotency checks

```
Order placed → handleOrder() called
  ├─ Record in Orders sheet (always)
  ├─ Send email (always — MailApp handles dedup)
  └─ Send FCM push
       ├─ Check NotificationLogs for Order ID + Type=FCM + Success=true
       ├─ FOUND → SKIP (already sent — idempotent)
       └─ NOT FOUND → Send to all devices → Log result
```

> 💡 **Why this matters:** Without idempotency, if GAS retries the webhook 3 times, the admin would get 3 push notifications for the same order. With idempotency, they get exactly one.

### 10.2 NotificationLogs Sheet

Every notification attempt (email, FCM, test) is logged to a **"NotificationLogs"** sheet in Google Sheets for audit, debugging, and idempotency.

**Columns:**

| Column | Field | Example |
|--------|-------|---------|
| A | Timestamp | `2026-08-03 14:22:00` |
| B | Order ID | `NN-000042` |
| C | Type | `FCM` / `Email` / `Test` |
| D | Recipient | `nutrinutspk@gmail.com` / `all-devices` |
| E | Success | `true` / `false` |
| F | Error Message | `FCM API returned 404: ...` (empty on success) |
| G | Devices Notified | `3` (number of devices, 0 for email) |

**The sheet is auto-created** on the first notification attempt — no manual setup needed.

### 10.3 Email Recipients

Order notification emails are sent to **both** addresses (independently — one failure doesn't affect the other):

| Recipient | Purpose |
|-----------|---------|
| `nutrinutspk@gmail.com` | Primary business email |
| `haris.hanif87@gmail.com` | Owner's personal email |

Each recipient gets the same email. If one fails, the other still goes through. Both attempts are logged separately in `NotificationLogs`.

---

## 11. Deployment Safety Guarantees

The system is designed with a **"checkout never fails"** principle. Here's exactly what's guaranteed:

### 11.1 Order Recording (Guaranteed)

Orders are **always** recorded in the Google Sheets `Orders` sheet — this is the first step and the only step that must succeed. If it fails, the order page shows an error (but WhatsApp still works as ultimate fallback).

### 11.2 Email Independence

Email sending is wrapped in its own try-catch per recipient. If `nutrinutspk@gmail.com` fails but `haris.hanif87@gmail.com` succeeds, the order is still fully processed. Neither affects the order.

### 11.3 FCM Independence

FCM push sending is wrapped in multiple layers of error handling:
- No active devices → logged, skipped
- OAuth2 token failure → logged, skipped
- Individual device failure → that device marked, others proceed
- Complete FCM crash → caught by outer try-catch, logged

**In all cases, the customer's order completes successfully and WhatsApp opens.**

### 11.4 Firebase Unavailability

If Firebase is entirely down (API unreachable, Service Account expired, project deleted):

- ✅ Orders still record in Google Sheets
- ✅ Emails still send (MailApp is independent of Firebase)
- ✅ WhatsApp Business flow still works (client-side, no Firebase dependency)
- ⚠️ FCM push notifications won't arrive until Firebase is restored
- 📋 NotificationLogs will show the failure details

### 11.5 WhatsApp Flow (Preserved)

The WhatsApp Business flow is **completely unchanged**:
- It runs client-side in `main.js` — no server dependency
- It fires after GAS processing regardless of GAS success/failure
- It's the ultimate fallback: even if GAS is completely down, the customer still reaches the admin via WhatsApp with their order details

---

## 12. System Health Monitor

The health monitor provides a real-time dashboard of all system components. It's the first place to check when something isn't working.

**URL:** `https://nutrinuts.pk/pages/admin/system-health.html`

> ⚠️ **Admin only.** This page has no public links — bookmark it for quick access. Do not share the URL publicly.

### 12.1 Features

| Feature | Description |
|---------|-------------|
| **Status Cards** | Live status of Google Sheets, Apps Script, Firebase, Email, WhatsApp, and Devices — each with ✅/⚠️/❌ indicators |
| **Run System Check** | Full diagnostic: verifies all integrations in one click |
| **Test Push (All Devices)** | Sends a real FCM push to every registered device — no order needed |
| **Test Email** | Sends a test email to both `nutrinutspk@gmail.com` and `haris.hanif87@gmail.com` — independently verified |
| **Today's Stats** | Orders today, notifications sent, failures — at a glance |
| **Recent Activity** | Last order, last push, last email with pass/fail badges |
| **Failure Explanations** | Every error card includes a plain-English explanation and recommended fix |

### 12.2 How to Use

1. **Bookmark the page** on your admin devices for quick access
2. **Run a System Check** daily or whenever you want to verify everything is healthy
3. **If a card shows ❌ FAIL:**
   - Read the detail line — it explains what went wrong
   - Follow the **🔧 Recommended Fix** shown below the error
   - Run the check again to confirm the fix worked
4. **Test push notifications:** Click "Test Push (All Devices)" — all registered devices should receive a test notification within seconds
5. **Test email delivery:** Click "Test Email" — both recipients should receive a test email within 30 seconds

### 12.3 Interpreting Status Cards

| Card | Green (OK) | Amber (Warning) | Red (Fail) |
|------|-----------|-----------------|------------|
| **Google Sheets** | Spreadsheet accessible | Sheet missing (auto-created on first use) | Cannot access spreadsheet |
| **Apps Script** | Always OK if page loads | — | Deployment broken — redeploy |
| **Firebase** | Service Account valid, OAuth2 OK | — | Check FIREBASE_SERVICE_ACCOUNT in Script Properties |
| **Email** | Quota available | — | Quota exhausted or MailApp not authorised |
| **WhatsApp** | Always OK (client-side) | — | — |
| **Devices** | ≥ 1 active | 0 active (registered but inactive) | No devices at all — visit registration page |

### 12.4 Auto-Check on Load

The dashboard runs a full system check automatically when the page loads. The timestamp in the top bar shows when the last check completed.

---

## 13. Testing Checklist

Use this checklist to verify end-to-end functionality:

### 13.1 Registration Test
- [ ] Admin visits `/pages/admin-register.html`
- [ ] Clicks "Enable Notifications"
- [ ] Browser shows notification permission prompt
- [ ] After allowing, status shows "Registered & Active" (green dot)
- [ ] Token appears in `DeviceTokens` sheet with Status = `active`

### 13.2 Test Notification
- [ ] Admin clicks "Send Test Notification"
- [ ] Closes/minimises the browser
- [ ] Receives push notification: "✅ Test Notification"
- [ ] Clicks the notification → browser opens nutrinuts.pk

### 13.3 Order Notification
- [ ] Place a test order through the website checkout
- [ ] Order appears in Google Sheets `Orders` tab
- [ ] Email notification received at **both** `nutrinutspk@gmail.com` and `haris.hanif87@gmail.com`
- [ ] ALL registered devices receive push notification with order details
- [ ] Push notification shows: "🔔 New Order: NN-XXXXXX"
- [ ] Notification body shows customer name, total, item count

### 13.4 NotificationLogs
- [ ] Check `NotificationLogs` sheet — a new row exists for the test order
- [ ] Row shows: Timestamp, Order ID, Type=FCM, Success=true, Devices Notified=N
- [ ] Email log rows also present (one per recipient)

### 13.5 Idempotency (Duplicate Protection)
- [ ] Note a recent Order ID from the `Orders` sheet
- [ ] Re-send the same order data (or use a testing tool to POST to the GAS URL with the same Order ID)
- [ ] Check `NotificationLogs` — only ONE FCM entry exists for that Order ID with Success=true
- [ ] No duplicate push notification received (idempotency check blocked it)

### 13.6 Token Cleanup
- [ ] Unregister a device via the admin page
- [ ] Token shows Status = `inactive` in `DeviceTokens` sheet
- [ ] (Wait 30 days or manually change Status to `invalid`)
- [ ] After next order, invalid tokens are removed from the sheet

### 13.7 System Health Monitor
- [ ] Visit `/pages/admin/system-health.html`
- [ ] Page loads and auto-runs system check
- [ ] All status cards show ✅ OK (or explain why they don't)
- [ ] Click "Test Push (All Devices)" → notification received on all active devices
- [ ] Click "Test Email" → both recipients receive test email
- [ ] "Today's Stats" shows correct counts
- [ ] "Recent Activity" shows last order/push/email
- [ ] Any ❌ FAIL cards show clear explanation and recommended fix

### 13.8 Error Handling
- [ ] Place order with no devices registered → order still completes, emails still send
- [ ] Place order with invalid FCM credentials → order still completes, emails still send
- [ ] Network error during FCM send → logged in NotificationLogs, order unaffected
- [ ] WhatsApp Business flow works regardless of Firebase/GAS status

---

## 14. Rollback Procedure

If the FCM push notification system causes issues in production and needs to be reverted, follow these steps. The rollback is safe — it won't affect order processing, email, or WhatsApp.

### 14.1 Immediate Mitigation (No Deploy Needed)

**Option A: Disable FCM via GAS (fastest)**

1. Open the Google Apps Script editor (Extensions → Apps Script in the Google Sheet)
2. In `sendOrderPushNotification()`, add `return;` as the first line:
   ```javascript
   function sendOrderPushNotification(orderData) {
     return; // ← Add this line to disable FCM immediately
     // ... rest of code
   }
   ```
3. Save (Ctrl+S) — this takes effect immediately for all future orders
4. Orders, emails, and WhatsApp continue working normally

**Option B: Disable FCM via client-side toggle**

1. In `assets/js/config.js`, set: `fcmEnabled: false`
2. Deploy the updated file to nutrinuts.pk
3. This prevents the FCM module from initialising on the admin page

### 14.2 Full Rollback (Remove FCM Entirely)

If you need to completely remove FCM and revert to the pre-FCM state:

**Step 1: Revert website files**

```bash
# Revert the 3 FCM-specific files (they were all new additions):
git checkout HEAD~1 -- assets/js/config.js
git checkout HEAD~1 -- assets/js/main.js
git checkout HEAD~1 -- assets/js/notifications.js
git checkout HEAD~1 -- sw.js

# Remove FCM-only files:
rm assets/js/firebase-messaging.js
rm firebase-messaging-sw.js
rm pages/admin-register.html
rm .env.example
```

Upload the reverted files to nutrinuts.pk.

**Step 2: Revert Google Apps Script**

1. In the Apps Script editor, replace the code with the **pre-FCM version** (the original `google-apps-script.js` without FCM)
2. Deploy → Manage deployments → Update
3. The GAS endpoint now only handles orders, email, and contacts — no FCM

**Step 3: Clean up Firebase (optional)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the NutriNuts project → Project Settings → Delete project
3. Or simply disable Cloud Messaging (Project Settings → Cloud Messaging → disable)

**Step 4: Clean up Google Sheets**

1. Delete the `DeviceTokens` sheet (if created)
2. Delete the `NotificationLogs` sheet (if created)
3. Keep `Orders` and `Contacts` sheets — they're unaffected

### 14.3 What Rollback Does NOT Affect

These systems are completely independent and continue working through any FCM rollback:

- ✅ Google Sheets order recording
- ✅ Email notifications (both `nutrinutspk@gmail.com` and `haris.hanif87@gmail.com`)
- ✅ WhatsApp Business order flow
- ✅ Website checkout process
- ✅ Contact form submissions
- ✅ All website pages and product listings

---

## 15. Troubleshooting

### "Browser not supported" on admin page

**Cause:** The browser doesn't support Service Workers + Notifications API.

**Solution:**
- Use Chrome, Edge, or Firefox (latest version)
- Ensure you're on HTTPS (FCM requires a secure context)
- On iOS, push notifications require iOS 16.4+ and the site must be added to Home Screen as a PWA

### "Permission denied" and can't re-prompt

**Cause:** The user clicked "Block" on the notification prompt previously.

**Solution:**
- **Chrome:** Click the lock icon in the address bar → Site Settings → Notifications → Allow
- **Edge:** Settings → Cookies and Site Permissions → Notifications → Add nutrinuts.pk to Allow
- **Firefox:** Click the lock icon → Permissions → Notifications → Allow
- **iPhone/iPad:** Settings → Safari → Notifications → find nutrinuts.pk → Allow

### "Could not get FCM token" error

**Possible causes:**
1. **Wrong VAPID key** — Verify you copied the full key from Firebase Console (Step 5)
2. **Firebase config mismatch** — Verify `messagingSenderId` and `projectId` match your Firebase project (Step 4)
3. **SW not loading** — Check `https://nutrinuts.pk/firebase-messaging-sw.js` loads in the browser
4. **HTTP (not HTTPS)** — FCM only works on HTTPS or localhost. If testing locally, use `http://localhost`

### Test notification not received

**Check in order:**
1. Is the device registered? Check `DeviceTokens` sheet for an `active` token
2. Is the Service Account JSON correct? Check Script Properties in Apps Script
3. Check Apps Script **Executions** page (in the Apps Script editor) for error logs
4. Did the browser/OS block the notification? Check system notification settings

### Order notification not received

1. Verify the order reached Google Sheets (check `Orders` tab for new rows)
2. Check Apps Script **Executions** page for `sendOrderPushNotification` errors
3. Verify there are `active` tokens in `DeviceTokens` sheet
4. Check browser console for any FCM errors on the admin device

### GAS returns "FIREBASE_SERVICE_ACCOUNT not set"

**Solution:** Go to Apps Script editor → Project Settings → Script Properties, and verify:
- Property name is exactly: `FIREBASE_SERVICE_ACCOUNT`
- Value is the complete JSON from the downloaded key file
- Click "Save script properties" after adding

### OAuth2 token request fails in GAS

**Possible causes:**
1. Service Account JSON is malformed (missing quotes, line breaks, etc.) — copy the raw JSON exactly
2. Service Account doesn't have Firebase permissions — the default Firebase Admin SDK role includes all needed permissions
3. GAS URL Fetch scope not authorised — re-deploy the web app and re-authorise

---

## 16. File Reference

All files in the FCM notification system:

| File | Purpose | Contains Secrets? |
|------|---------|-------------------|
| `assets/js/config.js` | Public config + Firebase values (placeholders) | ❌ No |
| `assets/js/firebase-messaging.js` | FCM client (token retrieval, registration) | ❌ No |
| `assets/js/notifications.js` | Local notification fallback channel | ❌ No |
| `assets/js/main.js` | Order checkout + notification triggers | ❌ No |
| `firebase-messaging-sw.js` | FCM Service Worker (background push) | ❌ No |
| `sw.js` | Legacy SW for local notifications | ❌ No |
| `pages/admin-register.html` | Admin device registration page | ❌ No |
| `pages/admin/system-health.html` | System health monitor dashboard | ❌ No |
| `google-apps-script.js` | GAS backend (orders, FCM, email, health, cleanup, logging) | ❌ No |
| `.env.example` | Configuration template (placeholders only) | ❌ No |
| **Google Apps Script Properties** | Service Account JSON storage | ✅ **YES — private key** |
| **Google Sheets → DeviceTokens** | Registered device tokens | ❌ No (but private data) |
| **Google Sheets → NotificationLogs** | Notification audit log | ❌ No (but private data) |

---

## Quick Reference: Required Values

| Value | Where to Find It | Goes Into |
|-------|-----------------|-----------|
| `apiKey` | Firebase Console → Project Settings → Web App | `config.js`, `firebase-messaging.js`, `firebase-messaging-sw.js` |
| `projectId` | Same as above | Same as above |
| `messagingSenderId` | Same as above | Same as above |
| `appId` | Same as above | Same as above |
| VAPID Key | Firebase Console → Cloud Messaging → Web configuration | `config.js`, `firebase-messaging.js` |
| Service Account JSON | Firebase Console → Service accounts → Generate key | **GAS Script Properties ONLY** |
| `GAS_REGISTER_URL` | GAS deployment URL | `firebase-messaging.js` |
| `GOOGLE_SHEETS_URL` | Same GAS deployment URL | `main.js` (already configured) |

---

*Setup complete? Return to the main CLAUDE.md for regular marketing tasks.*
