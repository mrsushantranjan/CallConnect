# CallConnect 14-Day Google Play Internal Testing Guide

**Application ID:** `com.boss_01.CallConnect`  
**Target:** Google Play Console — Internal Testing Track (14-day real-world verification)

---

## 1. Overview & Testing Objective

This guide covers real-device verification for CallConnect's automatic post-call SMS follow-up feature during your Google Play 14-day testing period.

CallConnect automatically sends a user-configured SMS follow-up when any call ends, provided:
1. The user has granted explicit consent via the in-app consent modal.
2. The runtime permissions (`SEND_SMS`, `READ_CALL_LOG`, `READ_PHONE_STATE`, `POST_NOTIFICATIONS`) are granted.
3. The contact number is not blocked by exclude/allowlist rules or quiet hours.

---

## 2. Test Device Prerequisites

- Android physical device (Android 9.0+ / API 28 through Android 15 / API 35)
- Active SIM card with working cellular SMS plan (carrier charges may apply)
- Secondary phone (or test phone line) to place and receive incoming/outgoing calls
- Google account added as an authorized internal tester in Google Play Console

---

## 3. Core Feature Verification Matrix (All 5 Call Outcomes)

For each call scenario below, ensure CallConnect is installed, permissions are granted, and "Automatic Post-Call SMS" is turned ON.

| Scenario | Action on Tester Device | Expected App & SMS Behavior | Verification Status |
| :--- | :--- | :--- | :--- |
| **1. Incoming Answered** | Receive call from secondary phone. Answer, speak for 5–10s, then hang up. | - Telephony triggers `INCOMING_ENDED`.<br>- Call log resolves outcome `incoming_answered`.<br>- Delay countdown shows (if configured).<br>- Follow-up SMS automatically dispatches.<br>- Status shows **Sent** (after `RESULT_OK`). | [ ] Verified |
| **2. Incoming Missed** | Call tester device from secondary phone. Let ring for 15s until it stops ringing without answering. | - Telephony triggers `INCOMING_ENDED`.<br>- Call log resolves outcome `incoming_missed`.<br>- Follow-up SMS automatically dispatches.<br>- Status shows **Sent** (after `RESULT_OK`). | [ ] Verified |
| **3. Incoming Rejected** | Call tester device from secondary phone. Press "Decline" / "Reject" or power button on tester phone. | - Telephony triggers `INCOMING_ENDED`.<br>- Call log resolves outcome `incoming_rejected`.<br>- Follow-up SMS automatically dispatches.<br>- Status shows **Sent** (after `RESULT_OK`). | [ ] Verified |
| **4. Outgoing Answered** | Dial secondary phone from tester device. Answer on secondary phone, speak for 5s, hang up. | - Telephony triggers `OUTGOING_ENDED`.<br>- Call log resolves outcome `outgoing_answered`.<br>- Follow-up SMS automatically dispatches to dialed number.<br>- Status shows **Sent** (after `RESULT_OK`). | [ ] Verified |
| **5. Outgoing Unanswered / Cancelled** | Dial secondary phone from tester device. Let ring for 3 rings, then cancel call before answer. | - Telephony triggers `OUTGOING_ENDED`.<br>- Call log resolves outcome `outgoing_unanswered`.<br>- Follow-up SMS automatically dispatches to dialed number.<br>- Status shows **Sent** (after `RESULT_OK`). | [ ] Verified |

---

## 4. Delay Countdown & Cancellation Verification

1. In CallConnect **Settings**, set Send Delay to **15 seconds** or **30 seconds**.
2. Complete a test call.
3. Observe:
   - Status notification appears: *"Sending auto-reply in Xs to [number]"* with a **Cancel** action button.
   - In-app home screen displays the active pending countdown card.
4. **Cancellation Test:**
   - Tap **"Cancel"** in the notification or on the home screen banner before the timer reaches 0.
   - **Expected Result:** SMS dispatch is immediately aborted. No SMS is sent. Recent result records status `cancelled`.

---

## 5. Contact Filtering & Rules Verification

### A. Exclude Rules Test
1. In **Settings > Rules**, select **"Exclude specific numbers"**.
2. Add the secondary phone number to the list.
3. Place a test call to/from the secondary phone.
4. **Expected Result:** CallConnect recognizes the rule. No SMS is dispatched.

### B. Allowlist Rules Test
1. In **Settings > Rules**, select **"Only send to allowlist"**.
2. Add a different number (not your secondary phone).
3. Place a test call to/from the secondary phone.
4. **Expected Result:** No SMS is dispatched because number is not in allowlist.
5. Add the secondary phone number to allowlist and test again: SMS should dispatch normally.

---

## 6. Quiet Hours Verification

1. In **Settings > Quiet Hours**, enable quiet hours and set the time window to cover the current time (e.g., current time is 3:00 PM, set 2:00 PM to 4:00 PM).
2. Complete a test call.
3. **Expected Result:** No SMS is dispatched. Recent result records quiet hours active.

---

## 7. Submission Confirmation & Truthful Status Verification

- **Status "Sent":** Displayed **only** when Android `SmsManager` invokes `SmsStatusReceiver` with `Activity.RESULT_OK` (cellular network accepted the message for delivery).
- **Status "Sending":** Displayed temporarily while the SMS is in transit to the telephony radio stack.
- **Status "Failed":** Displayed if the radio is off (airplane mode), no SIM card is present, or carrier service fails (`RESULT_ERROR_NO_SERVICE`, `RESULT_ERROR_RADIO_OFF`, etc.).
- **Airplane Mode Test:**
  1. Turn ON Airplane Mode.
  2. Use the in-app "Test Send SMS" button to dispatch an SMS.
  3. **Expected Result:** Status records **Failed** with radio off / no service description. Does NOT falsely show "Sent".

---

## 8. 14-Day Internal Testing Log Sheet

| Day | Date | Tested Scenario | Call Direction / Outcome | SMS Result (Sent / Failed) | Tester Notes |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | | Incoming Answered | Answered | | |
| 2 | | Incoming Missed | Missed | | |
| 3 | | Incoming Declined | Rejected | | |
| 4 | | Outgoing Answered | Answered | | |
| 5 | | Outgoing Unanswered | Cancelled/Unanswered | | |
| 6 | | Delay & Cancellation | Cancelled | | |
| 7 | | Allowlist Rule | Allowed / Filtered | | |
| 8 | | Exclude Rule | Filtered | | |
| 9 | | Quiet Hours | Filtered | | |
| 10 | | Airplane Mode (Failure check) | Failed (accurate) | | |
| 11 | | Incoming Answered | Answered | | |
| 12 | | Outgoing Answered | Answered | | |
| 13 | | Rapid Successive Calls | Deduplication check | | |
| 14 | | Full End-to-End Regression | All scenarios | | |

---

## 9. Triage & Troubleshooting

If an SMS does not send as expected:
1. **Consent Granted?** Check the "Automatic Post-Call SMS" toggle on the Home screen.
2. **Permissions Granted?** Check **Settings > Permissions** (SMS, Call Log, Phone State, Notifications).
3. **Delay Active?** If delay is set, wait for countdown timer to complete.
4. **Android Logcat:**
   ```bash
   adb logcat -s CallBroadcastReceiver CallLogLookup SmsSender SmsStatusReceiver CallDelayReceiver
   ```

