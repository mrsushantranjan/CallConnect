# Privacy Policy for CallConnect

**Effective Date:** November 4, 2026  
**Last Updated:** November 4, 2026  
**Application ID:** com.boss_01.CallConnect  

---

## 1. Overview and Core Purpose

CallConnect ("the Application", "we", or "us") is an Android utility application designed to assist users in preparing follow-up text messages after phone calls end. 

When a call completes, CallConnect provides an on-screen prompt and notification allowing you to select or confirm a recipient, choose or customize a message template, and open your device's default SMS application to review and send the message yourself.

---

## 2. Operating Model and On-Device Processing

CallConnect operates primarily through on-device processing:

- **No Developer Servers:** CallConnect does not operate, maintain, or communicate with developer-managed backend servers, cloud databases, user registration systems, or remote tracking infrastructure.
- **User-Confirmed Sending:** CallConnect does not send text messages automatically in the background. It creates a draft and passes your selected recipient and message text to your chosen Android SMS composer using standard Android system intents (`Intent.ACTION_SENDTO`). You retain control over reviewing, editing, and physically tapping "Send" in your SMS application.
- **Data Collection Definition:** Under Google Play's Data Safety standards, "data collection" refers to personal information transmitted off the user's device. Because CallConnect stores your configurations and activity history on your device and does not transmit this data to external developer servers, CallConnect does not engage in off-device data collection.

---

## 3. Information Handled and How It Is Used

CallConnect handles the following types of data to provide its features:

### A. Phone Numbers and Contact Information
- **Sources:**
  - *Call State Events:* On supported Android versions, a phone number may be provided with telephony broadcast events. On modern Android versions with standard privacy protections, telephony broadcasts without call-log permissions omit the caller number. In such cases, the app prompts you to select or enter the recipient directly in the app.
  - *System Contact Picker:* You may choose a recipient from your existing contacts using Android's system contact picker (`Intent.ACTION_PICK`). This picker runs through Android's built-in contact interface; upon selection, only the chosen contact's phone number and name are returned to populate the draft. CallConnect does not request broad address book read permissions (`READ_CONTACTS`).
  - *Manual Entry:* You may enter or paste a recipient phone number directly into the recipient field.
- **Usage:** The phone number is used to populate the recipient field of the follow-up prompt and prefill the destination address when opening your SMS application.
- **Storage:** If you save a contact rule or generate an activity log entry, the phone number is stored locally on your device within the app's private application storage (`SharedPreferences` and local storage). Phone numbers are masked in user-facing activity logs for privacy.

### B. Message Content and Templates
- **Sources:** Message text you type, edit, or select from built-in or custom templates.
- **Usage:** Prefills the text message body in the follow-up prompt and inside the system SMS composer.
- **Storage:** Saved locally within the app's private storage on your device.

### C. Operational Settings and Preferences
- **Usage:** Stores your configuration choices, including:
  - Follow-up enable/disable switch
  - Prompt delay countdown (grace period)
  - Quiet hours schedule (start and end times)
  - Number filtering rules (allowlist or exclude list)
  - Test mode / simulation options
- **Storage:** Saved locally within the app's private storage on your device.

### D. Activity History and Status Records
- **Usage:** Displays a local log of recent follow-up events so you can review recent activity. Records include:
  - Timestamp of the event
  - Masked phone number (e.g., `+1 555-***-0199`)
  - Message snippet
  - Truthful status label:
    - `PROMPT READY`: The call finished and a prompt notification was displayed.
    - `OPENED IN SMS`: You confirmed the prompt, and the app launched your default SMS composer. (CallConnect does not track or verify whether you tapped send or discarded the draft in your SMS app).
    - `CANCELLED`: A pending prompt countdown was cancelled before the composer opened.
    - `SKIPPED`: The prompt was skipped due to quiet hours, number filtering rules, or empty message text.
    - `SIMULATED`: A test simulation was conducted in test mode.
- **Storage:** Saved locally within the app's private storage on your device.

---

## 4. Android System Permissions and Justification

The release build of CallConnect requests only the following permissions:

| Permission | Purpose |
| :--- | :--- |
| `android.permission.READ_PHONE_STATE` | Required to register for telephony broadcast events (`ACTION_PHONE_STATE_CHANGED`) to detect state transitions (ringing, offhook, call ended/idle) so the app knows when a phone call has finished and can trigger the follow-up prompt. It is not used to record call audio or read call history logs. |
| `android.permission.POST_NOTIFICATIONS` | (Android 13+ / API 33+) Required to show interactive notifications when a call ends, including delay countdowns, cancel actions, and quick actions to open the prompt. |
| `android.permission.VIBRATE` | Provides haptic feedback when interacting with buttons and controls in the app. |
| `android.permission.INTERNET` & `ACCESS_NETWORK_STATE` | Included by the underlying React Native / Expo application framework base configuration. CallConnect application logic does not initiate network requests, transmit telemetry, or transfer user information over the network. |

### Restricted Permissions Not Requested
- **No `android.permission.SEND_SMS`:** CallConnect does not send background text messages. All messages are dispatched by the user through their default SMS application.
- **No `android.permission.READ_CALL_LOG` / `WRITE_CALL_LOG`:** CallConnect does not access or inspect your device's call log records.
- **No `android.permission.SYSTEM_ALERT_WINDOW`:** CallConnect does not draw overlay windows on top of other running applications.
- **No Accessibility Services or Notification Listeners:** CallConnect does not scrape on-screen content or read other applications' notifications.

---

## 5. Third-Party Services and External Hand-Off

- **No Third-Party Analytics or Advertising:** CallConnect does not integrate advertising SDKs (such as Google AdMob), user analytics SDKs (such as Firebase Analytics or Google Analytics), or third-party behavioral trackers.
- **Default SMS Application and Carrier Hand-Off:** When you choose to proceed with a follow-up, CallConnect transfers the recipient phone number and message body to your device's default SMS application using Android's standard intent mechanism (`Intent.ACTION_SENDTO`). Once your default SMS application opens, handling, transmission, and delivery of that message are governed by the privacy policy of your SMS application and your mobile network operator.
- **Android System Backups:** If you have enabled Android's automated cloud backup on your device, Android may include the application's local settings and preferences in your private Google Drive backup associated with your personal Google account, in accordance with your Android system settings.

---

## 6. Data Retention, Control, and Deletion

- **Retention:** All settings, templates, rules, and activity logs remain stored in the application's private storage on your device for as long as the application remains installed.
- **In-App Deletion:** You can clear your activity log at any time by tapping **Clear History** in the Activity Log section of the app.
- **Full Removal:** You can remove all locally stored application data at any time by:
  1. Opening Android **Settings > Apps > CallConnect > Storage**.
  2. Selecting **Clear Storage** or **Clear Data**.
  3. Alternatively, uninstalling CallConnect deletes the application's sandbox directory and its local data files from your device.

---

## 7. Security of Stored Data

CallConnect relies on the Android application sandbox security architecture, which prevents other standard applications on your device from accessing CallConnect's private files. 

To help maintain the security of information stored on your device:
- Use a secure screen lock (PIN, password, pattern, or biometric authentication).
- Keep your device operating system updated with current security patches.
- Avoid using modified or rooted device operating systems that bypass platform security sandboxing.

---

## 8. Children's Privacy

CallConnect is intended for a general audience and is not directed to children under 13 years of age (or the minimum legal age in your jurisdiction). The application does not knowingly request or collect personal information from children.

---

## 9. Changes to This Privacy Policy

This Privacy Policy may be updated periodically to reflect changes in our practices or applicable legal requirements. The "Effective Date" and "Last Updated" dates at the top of this policy indicate when revisions took effect. We encourage you to review this policy periodically.

---

## 10. Contact Information

If you have questions, feedback, or inquiries regarding this Privacy Policy or CallConnect, please contact:

- **Developer / Publisher:** Sushant Ranjan
- **Support & Privacy Email:** sushantpathak2028@gmail.com
