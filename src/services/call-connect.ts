import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { CallConnectNative } = NativeModules;

export interface CallConnectPermissions {
  isNativeAvailable: boolean;
  phoneState: boolean;
  callLog: boolean;
  sendSms: boolean;
  notifications: boolean;
  canAutoSendDirect: boolean;
  canPromptComposer: boolean;
}

export interface LastCallStatus {
  status: string;
  timestamp: number;
}

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
 * Open the system SMS composer with prefilled recipient and message (Play Store compliant fallback).
 */
export async function openSmsComposer(phoneNumber: string, message: string): Promise<boolean> {
  if (Platform.OS !== 'android' || !CallConnectNative?.openSmsComposer) {
    return false;
  }

  try {
    return await CallConnectNative.openSmsComposer(phoneNumber, message);
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

