# Google Play Internal Testing Handoff — CallConnect

**Date:** November 4, 2026  
**Application ID:** `com.boss_01.CallConnect`  
**Version:** `1.0.0` (versionCode `1`)  
**Target SDK:** `36` (Android 15+) | **Min SDK:** `24` (Android 7.0+)  
**Build Artifact:** [`android/app/build/outputs/bundle/release/app-release.aab`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/android/app/build/outputs/bundle/release/app-release.aab) (`71,693,286 bytes`)

---

## 1. Verified Project & Artifact Status

| Inspection Item | Verified Result | Source of Truth |
| :--- | :--- | :--- |
| **Package ID** | `com.boss_01.CallConnect` | Merged Release Manifest |
| **Version Code / Name** | `1` / `1.0.0` | `build.gradle` & Release Manifest |
| **Target / Min SDK** | `36` / `24` | Merged Release Manifest |
| **Release Signing Key** | Dedicated upload key: `CN=Sushant Pathak, OU=None, O=None, L=Rajkot, ST=Rajkot, C=IN` | `keytool -printcert -jarfile` |
| **Public SHA-256 Fingerprint** | `DF:94:36:3D:4D:EA:18:18:15:6F:66:A4:9C:2D:9C:39:61:55:C4:F9:5A:88:4D:CD:4C:9F:8A:01:4D:E9:00:58` | Verified from compiled AAB |
| **Public SHA-1 Fingerprint** | `2F:9E:A7:FB:10:66:CC:54:91:F6:78:AA:D1:A4:EE:8D:5B:7C:02:23` | Verified from compiled AAB |
| **Secret Tracking Audit** | **Protected:** `local.properties` and `*.keystore` are Git-ignored and excluded from the AAB. | Git check-ignore & unzip audit |
| **TypeScript Status** | **0 errors (PASS)** | `npx tsc --noEmit` |
| **Android Unit Tests** | **28 tests passing, 0 failures, 0 skipped (PASS)** | `./gradlew testDebugUnitTest` |
| **Restricted Permissions** | **0 restricted permissions:** `SEND_SMS`, `READ_CALL_LOG`, `SYSTEM_ALERT_WINDOW`, accessibility, and notification listeners are completely absent. | Merged Release Manifest |

---

## 2. Privacy Policy & Store Assets Summary

1. **Privacy Policy Markdown:**
   - Path: [`PRIVACY_POLICY.md`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/PRIVACY_POLICY.md)
   - Developer / Publisher: **Sushant Ranjan**
   - Support & Privacy Email: **sushantpathak2028@gmail.com**
   - No placeholders, escaped characters, or unsupported absolutes.
2. **Hostable Privacy Policy HTML Page:**
   - Path: [`privacy-policy/index.html`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/privacy-policy/index.html)
   - Standalone, accessible, mobile-responsive page with light/dark theme support. Verified with HTML parser (0 errors).
3. **Public Hosting Status:**
   - **NOT YET PUBLICLY HOSTED** (Local file only).
   - Antigravity does not publish or enable web hosting. You must publish `privacy-policy/index.html` (or `PRIVACY_POLICY.md`) to a public HTTPS URL.
4. **App Icon (512x512):**
   - Generated from approved master artwork: [`store-assets/icon-512x512.png`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/store-assets/icon-512x512.png)
   - Verified specs: `512 x 512 px`, 32-bit RGBA, `271,647 bytes` (~271 KB, well under the 1 MB limit). Ready to upload directly to Play Console.
5. **Missing Store Assets (Owner Must Supply):**
   - **Feature Graphic:** 1024 x 500 px, JPG or 24-bit PNG (no alpha).
   - **Phone Screenshots:** At least 2 real screenshots captured from your test device.

---

## 3. Classification of Responsibilities

### Category A: Completed and Verified Locally
- [x] Signed release AAB built with dedicated upload key (debug key fallback disabled).
- [x] Zero restricted SMS, Call Log, or overlay permissions in merged release manifest.
- [x] TypeScript check (0 errors) and 28 Kotlin unit tests verified passing.
- [x] Truthful status logging and prompt delay/cancel lifecycle confirmed.
- [x] Privacy policy finalized in Markdown ([`PRIVACY_POLICY.md`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/PRIVACY_POLICY.md)) and standalone HTML ([`privacy-policy/index.html`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/privacy-policy/index.html)).
- [x] Play Store compliant 512x512 app icon generated ([`store-assets/icon-512x512.png`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/store-assets/icon-512x512.png)).
- [x] Google Play Console declaration checklist updated ([`PLAY_CONSOLE_CHECKLIST.md`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/PLAY_CONSOLE_CHECKLIST.md)).

### Category B: Needs Owner Action (Outside the Codebase)
- [ ] **Publicly Host the Privacy Policy:**
  - Host [`privacy-policy/index.html`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/privacy-policy/index.html) or [`PRIVACY_POLICY.md`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/PRIVACY_POLICY.md) on GitHub Pages, Google Sites, a public repository/gist, or personal website.
  - Obtain and verify the public HTTPS URL.
- [ ] **Provide Missing Store Assets:**
  - Create a 1024x500 feature graphic.
  - Capture at least 2 screenshots from your connected phone.

### Category C: Owner Account Actions (In Google Play Console)
- [ ] **Enter Privacy Policy URL:** Under **App content > Privacy policy**, paste your public HTTPS URL.
- [ ] **Submit App Content Questionnaires:** Under **App content**, submit:
  - App Access: *"All functionality is available without special access"*
  - Ads: *"No, my app does not contain ads"*
  - Content Rating: Complete IARC questionnaire (Utility/Productivity)
  - Target Audience: Select **18 and over**, Appeals to children: *"No"*
  - Data Safety: Answer **"No"** to off-device collection/sharing; answer **"Yes"** to user data deletion.
- [ ] **Complete Main Store Listing:** Under **Store presence > Main store listing**:
  - Upload `store-assets/icon-512x512.png`.
  - Upload feature graphic and screenshots.
  - Copy and paste short & full descriptions from [`PLAY_CONSOLE_CHECKLIST.md`](file:///Users/sushantpathak/Downloads/PERSONAL%20WORK/SMS/CallConnect/PLAY_CONSOLE_CHECKLIST.md).
- [ ] **Upload AAB & Launch Internal Test:**
  - Under **Testing > Internal testing > Create new release**, upload `android/app/build/outputs/bundle/release/app-release.aab`.
  - Add your tester email addresses and start rollout.
