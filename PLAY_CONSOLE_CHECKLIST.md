# Google Play Console Declaration & Release Checklist for CallConnect

**Application ID:** `com.boss_01.CallConnect`  
**Target Release Track:** Internal Testing  
**AAB Path:** `android/app/build/outputs/bundle/release/app-release.aab`  
**Version Code:** `1`  
**Version Name:** `1.0.0`  
**Last Updated:** November 4, 2026  

---

## Overview

This checklist categorizes every Google Play Console requirement into:
1. **[CONFIRMED APP FACT]**: Verified directly from the codebase, manifest, dependencies, or compiled build artifacts.
2. **[OWNER MUST CONFIRM / CHOOSE]**: Requires your review, selection, or formal confirmation.
3. **[STEPS IN PLAY CONSOLE]**: Exact steps to perform in the Google Play Console under your developer account.

---

## Part 1: Policy & App Content Declarations (`Policy and programs` > `App content`)

### 1. Privacy Policy URL
- **[CONFIRMED APP FACT]:**
  - Markdown policy: [`PRIVACY_POLICY.md`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/PRIVACY_POLICY.md)
  - Standalone mobile-friendly HTML page: [`privacy-policy/index.html`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/privacy-policy/index.html)
  - Publisher / Developer: **Sushant Ranjan**
  - Contact Email: **sushantpathak2028@gmail.com**
- **[OWNER MUST CONFIRM / CHOOSE]:**
  - The policy is **not yet publicly hosted** on the internet (Antigravity does not publish or enable hosting).
  - You must publish `privacy-policy/index.html` (or `PRIVACY_POLICY.md`) to a public HTTPS URL (e.g. GitHub Pages, Google Sites, Notion public page, or personal website).
- **[STEPS IN PLAY CONSOLE]:**
  - Go to **Policy and programs > App content > Privacy policy**.
  - Paste your public HTTPS URL and click **Save**.

---

### 2. App Access
- **[CONFIRMED APP FACT]:** CallConnect does not contain user accounts, login screens, passwords, paywalls, or gated features. All features are open on installation.
- **[OWNER MUST CONFIRM / CHOOSE]:**
  - Confirm that no test credentials or special access instructions are needed.
- **[STEPS IN PLAY CONSOLE]:**
  - Go to **App content > App access**.
  - Select: **"All functionality is available without special access"**.
  - Click **Save**.

---

### 3. Ads Declaration
- **[CONFIRMED APP FACT]:** Zero advertising SDKs (no AdMob, Unity, AppLovin, etc.) exist in `package.json` or Gradle files.
- **[OWNER MUST CONFIRM / CHOOSE]:**
  - Confirm that the app displays no advertisements.
- **[STEPS IN PLAY CONSOLE]:**
  - Go to **App content > Ads**.
  - Select: **"No, my app does not contain ads"**.
  - Click **Save**.

---

### 4. Content Rating (IARC Questionnaire)
- **[CONFIRMED APP FACT]:**
  - No violence, gore, sexual content, profanity, drugs, alcohol, or real-money gambling.
  - The app does not operate in-app chat rooms, social feeds, or discussion boards; it opens the device's external SMS app.
  - The app does not share the user's physical GPS location.
  - The app does not sell digital goods.
- **[OWNER MUST CONFIRM / CHOOSE]:**
  - Confirm the email address associated with your IARC rating submission.
- **[STEPS IN PLAY CONSOLE]:**
  - Go to **App content > Content ratings > Start questionnaire**.
  - Category: Select **Utility, Productivity, Communication, or Other**.
  - Answer the questionnaire reflecting the facts above.
  - Review summary (typically Everyone / PEGI 3) and click **Submit**.

---

### 5. Target Audience and Content
- **[CONFIRMED APP FACT]:** CallConnect is a productivity utility designed for mobile phone users managing follow-up SMS messages. It is not specifically targeted at children.
- **[OWNER MUST CONFIRM / CHOOSE]:**
  - Select the target age group.
  - **Recommendation:** Select **18 and over** (or 16-17).
  - *Why:* Selecting age groups under 13 subjects the app to Google Play's Families Policy (neutral age screening, compliant SDK certifications, family-safe ad rules). Since CallConnect is not child-directed, 18+ avoids unnecessary policy complexity.
- **[STEPS IN PLAY CONSOLE]:**
  - Go to **App content > Target audience and content**.
  - Select **18 and over**.
  - Under "Appeals to children", select **"No"**.
  - Click **Save**.

---

### 6. Data Safety Form
Google Play policy defines **"Data collection"** as transmission of data off the user's device.
- **[CONFIRMED APP FACT]:**
  - CallConnect performs **0 remote network calls** (`fetch`, `XMLHttpRequest`, `axios`, etc.).
  - Phone numbers, message templates, user rules, quiet hours, and activity history are stored **on-device only** in Android `SharedPreferences` and local `AsyncStorage`.
  - No third-party analytics or crash reporting SDKs are present.
  - Note on Android Auto Backup: If enabled by the user in Android device settings, standard Android device backups may back up private app data to the user's Google Drive under their Google account.
- **[OWNER MUST CONFIRM / CHOOSE]:**
  - **Does your app collect or share any of the required user data types?**
    - Supported by code: **"No"** (data remains on device; no off-device transfer by the app).
  - **Do you provide a way for users to request that their data be deleted?**
    - Supported by code: **"Yes"** (Users can tap "Clear History" in-app or clear app storage/uninstall via Android settings).
- **[STEPS IN PLAY CONSOLE]:**
  - Go to **App content > Data safety**.
  - Complete the questionnaire reflecting on-device operation.
  - Click **Save**.

---

### 7. Standard Declarations
- **News Apps:** [CONFIRMED APP FACT] App is not a news app. -> Select **"No"**.
- **COVID-19 Tracing/Status:** [CONFIRMED APP FACT] App is not a COVID-19 app. -> Select **"My app is not a publicly available COVID-19 contact tracing or status app"**.
- **Government Apps:** [CONFIRMED APP FACT] App is not government-affiliated. -> Select **"No"**.
- **Financial Features:** [CONFIRMED APP FACT] App does not provide financial or banking features. -> Select **"My app doesn't provide any financial features"**.
- **Health Apps:** [CONFIRMED APP FACT] App does not provide medical or health features. -> Select **"My app doesn't provide any health features"**.

---

### 8. Permission Declarations
- **SMS & Call Log Permissions Declaration Form:**
  - **[CONFIRMED APP FACT]: NOT REQUIRED.**
  - `android.permission.SEND_SMS` and `android.permission.READ_CALL_LOG` are completely absent from the merged release manifest.
- **Runtime Permissions in Release Manifest:**
  - `android.permission.READ_PHONE_STATE`: Declared for post-call state transition detection. (Disclosed in Privacy Policy).
  - `android.permission.POST_NOTIFICATIONS`: Declared for prompt notifications on Android 13+.

---

## Part 2: Store Presence & Listing Assets (`Grow` > `Store presence` > `Main store listing`)

| Asset | Technical Specification | Current Status | Action |
| :--- | :--- | :---: | :--- |
| **App Name** | Max 30 characters | `CallConnect` | [OWNER MUST CONFIRM] |
| **Short Description** | Max 80 characters | Draft ready below | [OWNER MUST CONFIRM] |
| **Full Description** | Max 4,000 characters | Draft ready below | [OWNER MUST CONFIRM] |
| **App Icon** | 512 x 512 px, 32-bit PNG, max 1MB | **Generated** at [`store-assets/icon-512x512.png`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/store-assets/icon-512x512.png) (`512x512`, 271 KB, 32-bit RGBA) | **Ready to upload** |
| **Feature Graphic** | 1024 x 500 px, JPG or 24-bit PNG | Not in repository | [OWNER MUST PROVIDE] |
| **Phone Screenshots** | Min 2 screenshots (16:9 or 9:16 aspect ratio, min 320px, max 3840px) | Not in repository | [OWNER MUST CAPTURE] |

### Draft Store Listing Text

#### Short Description (68 characters):
> Follow up after phone calls easily with quick, user-confirmed SMS drafts.

#### Full Description:
```text
CallConnect helps you stay connected by preparing follow-up text messages right after your phone calls end.

KEY FEATURES:
• Post-Call Prompt: Receive an on-screen prompt or notification when a call finishes so you can follow up while conversations are fresh.
• User-Confirmed Sending: CallConnect does not send text messages in the background. It prepares your draft and opens your default SMS app so you review, edit, and send.
• Flexible Recipient Options: Enter a number manually, choose from your saved rules, or pick a contact using Android's system contact picker.
• Message Templates: Save and switch between reusable follow-up templates.
• Custom Grace Period: Set a countdown delay (5s, 10s, 30s) before prompts appear, with a 1-tap "Cancel Prompt" action.
• Quiet Hours & Rules: Prevent prompts during off-hours or filter specific numbers with allow/block rules.
• Privacy-Focused: Your templates, rules, and activity history remain stored locally on your device.
```

---

## Part 3: Internal Testing Track Setup (`Test and release` > `Testing` > `Internal testing`)

1. **Email List:**
   - Go to **Internal testing > Testers**.
   - Create an email list of authorized Google test accounts.
2. **Upload Bundle:**
   - Click **Create new release**.
   - Upload: `android/app/build/outputs/bundle/release/app-release.aab`.
   - Release Name: `1.0.0 (1)`.
   - Release Notes:
     ```text
     Initial internal test build of CallConnect.
     - Post-call follow-up prompts with user confirmation
     - System SMS composer integration
     - Reusable templates, quiet hours, delay countdown, and local activity history
     ```
3. **Save and Rollout:**
   - Save and review release.
   - Click **Start rollout to Internal testing**.
