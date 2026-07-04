# 🔥 Firebase Setup Guide for RePlate Push Notifications

This guide walks you through setting up **Firebase Cloud Messaging (FCM)** for RePlate.

FCM enables:
- 🍽️ Notify nearby NGOs when new food is posted
- ✅ Notify donors when their donation is claimed
- 🎉 Notify both parties when a donation is completed
- 🔐 Notify NGOs of verification status updates

---

## Part 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → Enter `RePlate` as the project name
3. Disable Google Analytics (optional for MVP) → Click **Create project**
4. Wait for project creation, then click **Continue**

---

## Part 2 — Register Your Android App

1. In the Firebase console, click the **Android icon** (➕ Add app)
2. Enter your Android package name: `com.replate.app`
   *(This must match exactly what's in your `app.json` → `android.package`)*
3. Enter App nickname: `RePlate Android`
4. Click **Register app**
5. Download the `google-services.json` file
6. Place it at: `Mobile/google-services.json`
7. Click **Next** through the remaining steps (SDK setup is handled by Expo)

---

## Part 3 — Register Your iOS App

1. In the Firebase console, click **➕ Add app** → iOS icon
2. Enter your iOS Bundle ID: `com.replate.app`
   *(Must match `app.json` → `ios.bundleIdentifier`)*
3. Enter App nickname: `RePlate iOS`
4. Click **Register app**
5. Download `GoogleService-Info.plist`
6. Place it at: `Mobile/GoogleService-Info.plist`

---

## Part 4 — Get the Firebase Admin SDK Service Account (for Backend)

1. In the Firebase console, click ⚙️ **Project Settings**
2. Go to the **Service accounts** tab
3. Click **Generate new private key**
4. Click **Generate key** → A JSON file will download
5. **Do NOT commit this file to Git!**

### Option A — Environment Variable (Recommended)
Open the downloaded JSON file, copy all its contents, and paste it as a **single line** into your `Backend/.env` file:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"replate-xxxxx",...}
```

> **Important:** Replace all newlines inside `private_key` with literal `\n` characters so it's a single line.

### Option B — File Reference
Save the JSON file as `Backend/firebase-service-account.json` (add to `.gitignore`!), then set:
```
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

---

## Part 5 — Configure the Expo Mobile App

### Install the required packages

```bash
cd Mobile
npx expo install expo-notifications expo-device expo-constants
```

### Configure `app.json`

Add the following inside `expo`:

```json
{
  "expo": {
    "name": "RePlate",
    "slug": "replate",
    "android": {
      "package": "com.replate.app",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.replate.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#F97316"
        }
      ]
    ]
  }
}
```

---

## Part 6 — Enable Cloud Messaging API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Search for **Cloud Messaging API** in the search bar
4. Click **Enable** (if not already enabled)

---

## Part 7 — Test Notifications

### Test from Firebase Console
1. Go to Firebase console → **Messaging** (left sidebar)
2. Click **Send your first message**
3. Enter a test message title and body
4. Click **Test on device** → Enter your device's registration token
5. Click **Test**

---

## Part 8 — Production Checklist

- [ ] `.gitignore` includes `firebase-service-account.json`
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` is set in production env vars
- [ ] `google-services.json` is included in your EAS build
- [ ] `GoogleService-Info.plist` is included in your EAS build
- [ ] APNs key is uploaded to Firebase for iOS push support

## APNs Key Setup for iOS

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles** → **Keys**
3. Click **+** → Enable **Apple Push Notifications service (APNs)**
4. Download the `.p8` key file
5. In Firebase console → Project Settings → Cloud Messaging → iOS App Configuration
6. Upload your APNs Auth Key → Enter Key ID and Team ID

---

## Summary of Files

| File | Purpose |
|------|---------|
| `Backend/.env` → `FIREBASE_SERVICE_ACCOUNT_JSON` | Backend sends notifications via Firebase Admin |
| `Mobile/google-services.json` | Android FCM config |
| `Mobile/GoogleService-Info.plist` | iOS FCM config |
| `Backend/services/notificationService.js` | Sends push notifications (backend) |
| `Mobile/services/notificationService.ts` | Registers device token + handles incoming notifications |
