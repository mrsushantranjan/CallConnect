import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import {
  ActivityLogItem,
  CallConnectPermissions,
  EnhancedSyncSettings,
  LastCallStatus,
  LastMessageRecord,
  NativeSettings,
  PendingSmsInfo,
  PickedContact,
} from '@/types/call-connect';

const { CallConnectNative } = NativeModules;

export type { CallConnectPermissions, LastCallStatus, LastMessageRecord, NativeSettings };

/**
 * Sync user settings to Android native SharedPreferences
 * so the CallBroadcastReceiver can read them even when the app is in the background.
 */
export async function syncNativeSettings(enabled: boolean, message: string): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.syncSettings) {
    return false;
  }
  try {
    return await CallConnectNative.syncSettings(enabled, message);
  } catch (error) {
    console.warn('[CallConnect] Failed to sync settings to native module:', error);
    return false;
  }
}

/**
 * Synchronize full enhanced settings (templates, delay, quiet hours, rules, test mode)
 * to Android native SharedPreferences.
 */
export async function syncEnhancedNativeSettings(options: Partial<EnhancedSyncSettings>): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.syncEnhancedSettings) {
    // Fallback to basic sync if available
    if (options.enabled !== undefined && options.message !== undefined) {
      return syncNativeSettings(options.enabled, options.message);
    }
    return true;
  }
  try {
    return await CallConnectNative.syncEnhancedSettings({
      ...(options.enabled !== undefined && { enabled: options.enabled }),
      ...(options.message !== undefined && { message: options.message }),
      ...(options.delaySeconds !== undefined && { delaySeconds: options.delaySeconds }),
      ...(options.quietHoursEnabled !== undefined && { quietHoursEnabled: options.quietHoursEnabled }),
      ...(options.quietHoursStart !== undefined && { quietHoursStart: options.quietHoursStart }),
      ...(options.quietHoursEnd !== undefined && { quietHoursEnd: options.quietHoursEnd }),
      ...(options.rulesMode !== undefined && { rulesMode: options.rulesMode }),
      ...(options.rulesNumbers !== undefined && { rulesNumbers: options.rulesNumbers }),
      ...(options.testModeEnabled !== undefined && { testModeEnabled: options.testModeEnabled }),
    });
  } catch (error) {
    console.warn('[CallConnect] Failed to sync enhanced settings:', error);
    return false;
  }
}

/**
 * Retrieve recent activity log from native module.
 */
export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  if (Platform.OS !== 'android' || !CallConnectNative?.getActivityLogs) {
    return [];
  }
  try {
    const rawLogs = await CallConnectNative.getActivityLogs();
    if (!Array.isArray(rawLogs)) return [];
    return rawLogs.map((item: any) => ({
      id: String(item.id || item.timestamp || Math.random()),
      timestamp: Number(item.timestamp) || Date.now(),
      phoneNumber: String(item.phoneNumber || 'Unknown'),
      status: item.status || 'sent',
      reason: String(item.reason || ''),
      messageSnippet: String(item.messageSnippet || ''),
    }));
  } catch (error) {
    console.warn('[CallConnect] Failed to fetch activity logs:', error);
    return [];
  }
}

/**
 * Clear all activity logs from native storage.
 */
export async function clearActivityLogs(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.clearActivityLogs) {
    return true;
  }
  try {
    return await CallConnectNative.clearActivityLogs();
  } catch (error) {
    console.warn('[CallConnect] Failed to clear activity logs:', error);
    return false;
  }
}

/**
 * Check if there is an in-flight delayed SMS waiting to be sent.
 */
export async function getPendingSms(): Promise<PendingSmsInfo> {
  const defaultPending: PendingSmsInfo = {
    isPending: false,
    phoneNumber: '',
    message: '',
    sendAtTimestamp: 0,
    secondsRemaining: 0,
    isTest: false,
  };

  if (Platform.OS !== 'android' || !CallConnectNative?.getPendingSms) {
    return defaultPending;
  }
  try {
    const result = await CallConnectNative.getPendingSms();
    if (!result || !result.isPending) return defaultPending;
    return {
      isPending: Boolean(result.isPending),
      phoneNumber: String(result.phoneNumber || ''),
      message: String(result.message || ''),
      sendAtTimestamp: Number(result.sendAtTimestamp) || 0,
      secondsRemaining: Math.max(0, Number(result.secondsRemaining) || 0),
      isTest: Boolean(result.isTest),
    };
  } catch (error) {
    console.warn('[CallConnect] Failed to get pending SMS:', error);
    return defaultPending;
  }
}

/**
 * Cancel an in-flight pending SMS before its delay timer expires.
 */
export async function cancelPendingSms(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.cancelPendingSms) {
    return false;
  }
  try {
    return await CallConnectNative.cancelPendingSms();
  } catch (error) {
    console.warn('[CallConnect] Failed to cancel pending SMS:', error);
    return false;
  }
}

/**
 * Trigger a simulated call end event to verify the pipeline end-to-end
 * without sending a real SMS or charging the phone carrier.
 */
export async function simulateCallEnded(phoneNumber: string): Promise<{ success: boolean; status: string }> {
  if (Platform.OS !== 'android' || !CallConnectNative?.simulateCallEnded) {
    return {
      success: true,
      status: `[Simulated Preview] Auto-reply tested for ${phoneNumber} (Native receiver simulation ready)`,
    };
  }
  try {
    const result = await CallConnectNative.simulateCallEnded(phoneNumber);
    return {
      success: Boolean(result.success),
      status: String(result.status || 'Simulation completed'),
    };
  } catch (error: any) {
    console.warn('[CallConnect] Simulation error:', error);
    return {
      success: false,
      status: error?.message || 'Simulation error',
    };
  }
}

/**
 * Check the status of telephony, call log, and SMS permissions.
 */
export async function checkCallConnectPermissions(): Promise<CallConnectPermissions> {
  if (Platform.OS !== 'android' || !CallConnectNative?.checkPermissions) {
    return {
      isNativeAvailable: false,
      phoneState: false,
      callLog: false,
      sendSms: false,
      notifications: false,
      isDefaultSms: false,
      consentGranted: false,
      canAutoSendDirect: false,
      canPromptComposer: false,
    };
  }

  try {
    const result = await CallConnectNative.checkPermissions();
    return {
      isNativeAvailable: true,
      phoneState: !!result.phoneState,
      callLog: !!result.callLog,
      sendSms: !!result.sendSms,
      notifications: !!result.notifications,
      isDefaultSms: !!result.isDefaultSms,
      consentGranted: !!result.consentGranted,
      canAutoSendDirect: !!result.canAutoSendDirect,
      canPromptComposer: !!result.canPromptComposer,
    };
  } catch (error) {
    console.warn('[CallConnect] Failed to check permissions:', error);
    return {
      isNativeAvailable: true,
      phoneState: false,
      callLog: false,
      sendSms: false,
      notifications: false,
      isDefaultSms: false,
      consentGranted: false,
      canAutoSendDirect: false,
      canPromptComposer: false,
    };
  }
}

/**
 * Request necessary permissions (Phone State, Call Log, Send SMS, Notifications).
 */
export async function requestCallConnectPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    if (CallConnectNative?.requestPermissions) {
      const nativeResult = await CallConnectNative.requestPermissions();
      if (nativeResult) return true;
    }

    const permissionsToRequest = [
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
    ];

    if (Platform.Version >= 33) {
      permissionsToRequest.push('android.permission.POST_NOTIFICATIONS' as any);
    }

    const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
    return Object.values(results).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.warn('[CallConnect] Failed to request permissions:', error);
    return false;
  }
}

/**
 * Check whether CallConnect holds the Android Default SMS App role (RoleManager.ROLE_SMS).
 */
export async function isDefaultSmsApp(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.isDefaultSmsApp) {
    return false;
  }
  try {
    return await CallConnectNative.isDefaultSmsApp();
  } catch (error) {
    console.warn('[CallConnect] Failed to check default SMS role:', error);
    return false;
  }
}

/**
 * Request the Android system Default SMS App role dialog.
 */
export async function requestDefaultSmsRole(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.requestDefaultSmsRole) {
    return false;
  }
  try {
    return await CallConnectNative.requestDefaultSmsRole();
  } catch (error) {
    console.warn('[CallConnect] Failed to request default SMS role:', error);
    return false;
  }
}

/**
 * Check whether the user has granted consent for automatic post-call SMS sending.
 */
export async function isAutoSendConsentGranted(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.isAutoSendConsentGranted) {
    return false;
  }
  try {
    return await CallConnectNative.isAutoSendConsentGranted();
  } catch (error) {
    console.warn('[CallConnect] Failed to check consent status:', error);
    return false;
  }
}

/**
 * Set the user's explicit consent for automatic post-call SMS sending.
 */
export async function setAutoSendConsentGranted(granted: boolean): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.setAutoSendConsentGranted) {
    return false;
  }
  try {
    return await CallConnectNative.setAutoSendConsentGranted(granted);
  } catch (error) {
    console.warn('[CallConnect] Failed to set consent status:', error);
    return false;
  }
}

/**
 * Direct SMS dispatch using native SmsManager.
 */
export async function sendDirectSms(phoneNumber: string, message: string): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.sendDirectSms) {
    return false;
  }
  try {
    return await CallConnectNative.sendDirectSms(phoneNumber, message);
  } catch (error) {
    console.warn('[CallConnect] Failed to send direct SMS:', error);
    return false;
  }
}

/**
 * Open the Android system contact picker dialog (Intent.ACTION_PICK)
 * to let the user select a contact securely without requiring any READ_CONTACTS permission.
 */
export async function pickContactFromSystem(): Promise<PickedContact | null> {
  if (Platform.OS !== 'android' || !CallConnectNative?.pickContact) {
    return null;
  }

  try {
    const result = await CallConnectNative.pickContact();
    if (!result || !result.phoneNumber) return null;
    return {
      phoneNumber: String(result.phoneNumber).trim(),
      name: String(result.name || '').trim(),
    };
  } catch (error) {
    console.warn('[CallConnect] Failed to pick contact:', error);
    return null;
  }
}

/**
 * Open Android system App Settings if permissions are permanently denied.
 */
export async function openCallConnectSettings(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.openAppSettings) {
    return false;
  }

  try {
    return await CallConnectNative.openAppSettings();
  } catch (error) {
    console.warn('[CallConnect] Failed to open app settings:', error);
    return false;
  }
}

/**
 * Retrieve the status of the last processed call.
 */
export async function getLastCallStatus(): Promise<LastCallStatus> {
  if (Platform.OS !== 'android' || !CallConnectNative?.getLastCallStatus) {
    return {
      status: Platform.OS === 'android'
        ? 'Native module not initialized (run in Android development build)'
        : 'Telephony features require an Android device',
      timestamp: 0,
    };
  }

  try {
    const result = await CallConnectNative.getLastCallStatus();
    return {
      status: result.status || 'Ready for calls',
      timestamp: Number(result.timestamp) || 0,
    };
  } catch (error) {
    console.warn('[CallConnect] Failed to get call status:', error);
    return {
      status: 'Ready for calls',
      timestamp: 0,
    };
  }
}

/**
 * Open the system SMS composer with prefilled recipient and message (Play Store compliant).
 * Guarantees that a blank or empty recipient is rejected.
 */
export async function openSmsComposer(phoneNumber: string, message: string): Promise<boolean> {
  const cleanNumber = phoneNumber.trim();
  if (!cleanNumber) {
    console.warn('[CallConnect] Cannot open SMS composer with empty recipient');
    return false;
  }
  if (Platform.OS !== 'android' || !CallConnectNative?.openSmsComposer) {
    return false;
  }

  try {
    return await CallConnectNative.openSmsComposer(cleanNumber, message);
  } catch (error) {
    console.warn('[CallConnect] Failed to open SMS composer:', error);
    return false;
  }
}

/**
 * Check if the device has telephony/cellular hardware.
 */
export async function isTelephonyAvailable(): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.isTelephonyAvailable) {
    return false;
  }

  try {
    return await CallConnectNative.isTelephonyAvailable();
  } catch {
    return false;
  }
}

/**
 * Retrieve the dedicated last message record from native SharedPreferences.
 */
export async function getLastMessageRecord(): Promise<LastMessageRecord | null> {
  if (Platform.OS !== 'android' || !CallConnectNative?.getLastMessageRecord) {
    return null;
  }
  try {
    const res = await CallConnectNative.getLastMessageRecord();
    if (!res || !res.phoneNumber) return null;
    return {
      phoneNumber: res.phoneNumber,
      status: res.status,
      timestamp: Number(res.timestamp) || Date.now(),
      messageSnippet: res.messageSnippet || '',
      reason: res.reason || '',
    };
  } catch (error) {
    console.warn('[CallConnect] Failed to get last message record:', error);
    return null;
  }
}

/**
 * Retrieve existing native settings from native SharedPreferences.
 * Used during startup to safely hydrate settings if AsyncStorage lacks them.
 */
export async function getNativeSettings(): Promise<NativeSettings | null> {
  if (Platform.OS !== 'android' || !CallConnectNative?.getNativeSettings) {
    return null;
  }
  try {
    const res = await CallConnectNative.getNativeSettings();
    if (!res) return null;
    return {
      enabled: Boolean(res.enabled),
      message: typeof res.message === 'string' ? res.message : '',
      delaySeconds: Number(res.delaySeconds) || 0,
      quietHoursEnabled: Boolean(res.quietHoursEnabled),
      quietHoursStart: res.quietHoursStart || '22:00',
      quietHoursEnd: res.quietHoursEnd || '07:00',
      rulesMode: res.rulesMode || 'exclude',
      rulesNumbers: Array.isArray(res.rulesNumbers) ? res.rulesNumbers : [],
      testModeEnabled: Boolean(res.testModeEnabled),
    };
  } catch (error) {
    console.warn('[CallConnect] Failed to get native settings:', error);
    return null;
  }
}
