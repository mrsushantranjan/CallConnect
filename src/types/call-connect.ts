export interface CallConnectPermissions {
  isNativeAvailable: boolean;
  phoneState: boolean;
  callLog: boolean;
  sendSms: boolean;
  notifications: boolean;
  isDefaultSms?: boolean;
  consentGranted?: boolean;
  canAutoSendDirect: boolean;
  canPromptComposer: boolean;
}

export interface LastCallStatus {
  status: string;
  timestamp: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  isDefault?: boolean;
}

export type DelayDurationSeconds = 0 | 15 | 30 | 60 | 120 | 300;

export type RulesMode = 'exclude' | 'allowlist';

export interface NumberRule {
  id: string;
  phoneNumber: string;
  label?: string;
  createdAt: number;
}

export interface QuietHoursConfig {
  enabled: boolean;
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
}

export type ActivityStatus =
  | 'composer_opened'
  | 'prompted'
  | 'sent'
  | 'sending'
  | 'skipped'
  | 'cancelled'
  | 'simulated'
  | 'failed'
  | 'pending';

export interface PickedContact {
  phoneNumber: string;
  name: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: number;
  phoneNumber: string;
  status: ActivityStatus;
  reason: string;
  messageSnippet: string;
}

export interface PendingSmsInfo {
  isPending: boolean;
  phoneNumber: string;
  message: string;
  sendAtTimestamp: number;
  secondsRemaining: number;
  isTest: boolean;
}

export interface EnhancedSyncSettings {
  enabled: boolean;
  message: string;
  delaySeconds: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "HH:mm"
  quietHoursEnd: string; // "HH:mm"
  rulesMode: RulesMode;
  rulesNumbers: string[];
  testModeEnabled: boolean;
}

export interface LastMessageRecord {
  phoneNumber: string;
  status: ActivityStatus;
  timestamp: number;
  messageSnippet?: string;
  reason?: string;
}

export interface NativeSettings {
  enabled: boolean;
  message: string;
  delaySeconds: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  rulesMode: RulesMode;
  rulesNumbers: string[];
  testModeEnabled: boolean;
}

