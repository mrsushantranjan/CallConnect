import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  cancelPendingSms,
  checkCallConnectPermissions,
  clearActivityLogs as clearNativeActivityLogs,
  getActivityLogs as getNativeActivityLogs,
  getLastCallStatus,
  getLastMessageRecord,
  getPendingSms as getNativePendingSms,
  getNativeSettings,
  isAutoSendConsentGranted,
  isDefaultSmsApp,
  openCallConnectSettings,
  openSmsComposer,
  requestCallConnectPermissions,
  requestDefaultSmsRole,
  sendDirectSms,
  setAutoSendConsentGranted,
  simulateCallEnded,
  syncEnhancedNativeSettings,
  syncNativeSettings,
  type CallConnectPermissions,
  type LastCallStatus,
  type LastMessageRecord,
  type NativeSettings,
} from '@/services/call-connect';
import {
  ActivityLogItem,
  MessageTemplate,
  NumberRule,
  PendingSmsInfo,
  QuietHoursConfig,
  RulesMode,
} from '@/types/call-connect';
import {
  DEFAULT_TEMPLATES,
  isCurrentlyInQuietHours,
  toTimeString,
} from '@/utils/call-connect-helpers';

// Preserved storage keys
export const ENABLED_KEY = 'callconnect_enabled';
export const MESSAGE_KEY = 'callconnect_message';
export const WELCOME_COMPLETED_KEY = 'callconnect_welcome_completed';
export const TEMPLATES_KEY = 'callconnect_templates';
export const DELAY_KEY = 'callconnect_delay_seconds';
export const RULES_MODE_KEY = 'callconnect_rules_mode';
export const RULES_LIST_KEY = 'callconnect_rules_list';
export const QUIET_HOURS_KEY = 'callconnect_quiet_hours';
export const ACTIVITY_LOGS_KEY = 'callconnect_activity_logs';
export const TEST_MODE_KEY = 'callconnect_test_mode';
export const LAST_MESSAGE_KEY = 'callconnect_last_message';
export const CONSENT_GRANTED_KEY = 'callconnect_auto_send_consent';

export const DEFAULT_MESSAGE = 'Thanks for connecting with us.';
export const MAX_MESSAGE_LENGTH = 300;

interface CallConnectContextType {
  // Core states
  enabled: boolean;
  message: string;
  loaded: boolean;
  welcomeCompleted: boolean | null;
  showWelcomeTour: boolean;
  setShowWelcomeTour: (show: boolean) => void;

  // Feature states
  templates: MessageTemplate[];
  delaySeconds: number;
  rulesMode: RulesMode;
  rulesList: NumberRule[];
  quietHours: QuietHoursConfig;
  activityLogs: ActivityLogItem[];
  lastMessage: LastMessageRecord | null;
  pendingSms: PendingSmsInfo;
  permissions: CallConnectPermissions;
  lastCall: LastCallStatus;
  testModeEnabled: boolean;

  // Derived states
  isQuietHoursActive: boolean;

  // Core Actions
  toggleEnabled: (val: boolean) => Promise<void>;
  saveMessage: (text: string) => Promise<boolean>;
  resetDefaultMessage: () => Promise<void>;
  completeWelcome: () => Promise<void>;

  // Templates
  selectTemplate: (tpl: MessageTemplate) => Promise<void>;
  saveTemplate: (template: { id?: string; title: string; content: string }) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Delay & Pending
  updateDelay: (seconds: number) => Promise<void>;
  cancelPending: () => Promise<void>;

  // Rules
  updateRulesMode: (mode: RulesMode) => Promise<void>;
  addRuleNumber: (phone: string, label?: string) => Promise<void>;
  deleteRuleNumber: (id: string) => Promise<void>;

  // Quiet Hours
  updateQuietHours: (config: QuietHoursConfig) => Promise<void>;

  // Activity Logs
  clearActivityLogs: () => Promise<void>;
  refreshActivityLogs: () => Promise<void>;

  // Permissions & Settings
  requestPermissions: () => Promise<void>;
  requestDefaultSmsRole: () => Promise<boolean>;
  openSettings: () => Promise<void>;
  openComposer: (recipient: string, messageText: string) => Promise<boolean>;
  sendDirectSms: (phoneNumber: string, message: string) => Promise<boolean>;

  // Consent
  isDefaultSms: boolean;
  consentGranted: boolean;
  grantConsent: () => Promise<void>;
  revokeConsent: () => Promise<void>;

  // Test Mode
  toggleTestMode: (val: boolean) => Promise<void>;
  simulateCall: (phoneNumber: string) => Promise<{ success: boolean; status: string }>;

  // Reset all
  resetAllSettings: () => Promise<void>;
}

const CallConnectContext = createContext<CallConnectContextType | undefined>(undefined);

export function CallConnectProvider({ children }: { children: React.ReactNode }) {
  // Onboarding & revisit tour states
  const [welcomeCompleted, setWelcomeCompleted] = useState<boolean | null>(null);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  // Core preferences
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [loaded, setLoaded] = useState(false);

  // Feature preferences
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [rulesMode, setRulesMode] = useState<RulesMode>('exclude');
  const [rulesList, setRulesList] = useState<NumberRule[]>([]);
  const [quietHours, setQuietHours] = useState<QuietHoursConfig>({
    enabled: false,
    startHour: 22,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [lastMessage, setLastMessage] = useState<LastMessageRecord | null>(null);
  const [pendingSms, setPendingSms] = useState<PendingSmsInfo>({
    isPending: false,
    phoneNumber: '',
    message: '',
    sendAtTimestamp: 0,
    secondsRemaining: 0,
    isTest: false,
  });
  const [testModeEnabled, setTestModeEnabled] = useState<boolean>(false);

  const [permissions, setPermissions] = useState<CallConnectPermissions>({
    isNativeAvailable: false,
    phoneState: false,
    callLog: false,
    sendSms: false,
    notifications: false,
    canAutoSendDirect: false,
    canPromptComposer: false,
  });

  const [isDefaultSms, setIsDefaultSms] = useState<boolean>(false);
  const [consentGranted, setConsentGranted] = useState<boolean>(false);

  const [lastCall, setLastCall] = useState<LastCallStatus>({
    status: 'Ready for calls',
    timestamp: 0,
  });

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Initial Load from AsyncStorage & Native SharedPreferences (Preserving existing data)
  useEffect(() => {
    async function loadPreferences() {
      try {
        const [
          savedEnabled,
          savedMessage,
          savedWelcomeCompleted,
          savedTemplates,
          savedDelay,
          savedRulesMode,
          savedRulesList,
          savedQuietHours,
          savedActivityLogs,
          savedTestMode,
          savedLastMessage,
        ] = await Promise.all([
          AsyncStorage.getItem(ENABLED_KEY),
          AsyncStorage.getItem(MESSAGE_KEY),
          AsyncStorage.getItem(WELCOME_COMPLETED_KEY),
          AsyncStorage.getItem(TEMPLATES_KEY),
          AsyncStorage.getItem(DELAY_KEY),
          AsyncStorage.getItem(RULES_MODE_KEY),
          AsyncStorage.getItem(RULES_LIST_KEY),
          AsyncStorage.getItem(QUIET_HOURS_KEY),
          AsyncStorage.getItem(ACTIVITY_LOGS_KEY),
          AsyncStorage.getItem(TEST_MODE_KEY),
          AsyncStorage.getItem(LAST_MESSAGE_KEY),
        ]);

        // Safely inspect native preferences to prevent overwriting existing data with defaults
        const [nativeSettings, nativeLastMsg, nativeLogs] = await Promise.all([
          getNativeSettings(),
          getLastMessageRecord(),
          getNativeActivityLogs(),
        ]);

        // 1. Message: AsyncStorage -> Native -> Default (Never overwrite with blank)
        let initialMessage = DEFAULT_MESSAGE;
        if (savedMessage !== null && savedMessage.trim().length > 0) {
          initialMessage = savedMessage;
        } else if (nativeSettings?.message && nativeSettings.message.trim().length > 0) {
          initialMessage = nativeSettings.message;
          await AsyncStorage.setItem(MESSAGE_KEY, initialMessage);
        }

        // 2. Enabled: AsyncStorage -> Native -> false
        let initialEnabled = false;
        if (savedEnabled !== null) {
          initialEnabled = savedEnabled === 'true';
        } else if (nativeSettings && nativeSettings.enabled !== undefined) {
          initialEnabled = nativeSettings.enabled;
          await AsyncStorage.setItem(ENABLED_KEY, String(initialEnabled));
        }

        // 3. Activity Logs: AsyncStorage -> Native -> []
        let initialLogs: ActivityLogItem[] = [];
        if (savedActivityLogs) {
          try {
            initialLogs = JSON.parse(savedActivityLogs);
          } catch {}
        }
        if (initialLogs.length === 0 && nativeLogs && nativeLogs.length > 0) {
          initialLogs = nativeLogs;
          await AsyncStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(nativeLogs));
        }

        // 4. Last Message Record: AsyncStorage -> Native -> initialLogs[0] -> null
        let initialLastMsg: LastMessageRecord | null = null;
        if (savedLastMessage) {
          try {
            initialLastMsg = JSON.parse(savedLastMessage);
          } catch {}
        }
        if (!initialLastMsg && nativeLastMsg) {
          initialLastMsg = nativeLastMsg;
          await AsyncStorage.setItem(LAST_MESSAGE_KEY, JSON.stringify(nativeLastMsg));
        } else if (!initialLastMsg && initialLogs.length > 0) {
          const top = initialLogs[0];
          initialLastMsg = {
            phoneNumber: top.phoneNumber,
            status: top.status,
            timestamp: top.timestamp,
            messageSnippet: top.messageSnippet,
            reason: top.reason,
          };
          await AsyncStorage.setItem(LAST_MESSAGE_KEY, JSON.stringify(initialLastMsg));
        }

        // 5. Delay: AsyncStorage -> Native -> 0
        let initialDelay = 0;
        if (savedDelay !== null) {
          initialDelay = parseInt(savedDelay, 10) || 0;
        } else if (nativeSettings && nativeSettings.delaySeconds !== undefined) {
          initialDelay = nativeSettings.delaySeconds;
          await AsyncStorage.setItem(DELAY_KEY, String(initialDelay));
        }

        // 6. Rules: AsyncStorage -> Native -> 'exclude' / []
        let initialRulesMode: RulesMode = 'exclude';
        if (savedRulesMode !== null) {
          initialRulesMode = (savedRulesMode as RulesMode) ?? 'exclude';
        } else if (nativeSettings?.rulesMode) {
          initialRulesMode = (nativeSettings.rulesMode as RulesMode) ?? 'exclude';
          await AsyncStorage.setItem(RULES_MODE_KEY, initialRulesMode);
        }

        let initialRulesList: NumberRule[] = [];
        if (savedRulesList) {
          try {
            initialRulesList = JSON.parse(savedRulesList);
          } catch {}
        } else if (nativeSettings?.rulesNumbers && nativeSettings.rulesNumbers.length > 0) {
          initialRulesList = nativeSettings.rulesNumbers.map((phone, idx) => ({
            id: `rule_migrated_${idx}_${Date.now()}`,
            phoneNumber: phone,
            createdAt: Date.now(),
          }));
          await AsyncStorage.setItem(RULES_LIST_KEY, JSON.stringify(initialRulesList));
        }

        // 7. Quiet Hours: AsyncStorage -> Native -> default
        let initialQuietHours: QuietHoursConfig = {
          enabled: false,
          startHour: 22,
          startMinute: 0,
          endHour: 7,
          endMinute: 0,
        };
        if (savedQuietHours) {
          try {
            initialQuietHours = JSON.parse(savedQuietHours);
          } catch {}
        } else if (nativeSettings?.quietHoursEnabled !== undefined) {
          const [startH, startM] = (nativeSettings.quietHoursStart || '22:00').split(':').map((n) => parseInt(n, 10) || 0);
          const [endH, endM] = (nativeSettings.quietHoursEnd || '07:00').split(':').map((n) => parseInt(n, 10) || 0);
          initialQuietHours = {
            enabled: nativeSettings.quietHoursEnabled,
            startHour: startH,
            startMinute: startM,
            endHour: endH,
            endMinute: endM,
          };
          await AsyncStorage.setItem(QUIET_HOURS_KEY, JSON.stringify(initialQuietHours));
        }

        // 8. Test Mode
        let initialTestMode = false;
        if (savedTestMode !== null) {
          initialTestMode = savedTestMode === 'true';
        } else if (nativeSettings?.testModeEnabled !== undefined) {
          initialTestMode = nativeSettings.testModeEnabled;
          await AsyncStorage.setItem(TEST_MODE_KEY, String(initialTestMode));
        }

        // 9. Templates
        let initialTemplates: MessageTemplate[] = DEFAULT_TEMPLATES;
        if (savedTemplates) {
          try {
            initialTemplates = JSON.parse(savedTemplates);
          } catch {}
        }

        // 10. Welcome tour completion: detect existing user vs brand new user
        let isWelcomeDone = false;
        if (savedWelcomeCompleted !== null) {
          isWelcomeDone = savedWelcomeCompleted === 'true';
        } else {
          // If the user already had saved data in ANY layer, they are an existing user upgrading!
          const hasExistingUserData =
            savedMessage !== null ||
            savedEnabled !== null ||
            (nativeSettings && (nativeSettings.enabled || (nativeSettings.message && nativeSettings.message !== DEFAULT_MESSAGE))) ||
            nativeLastMsg !== null ||
            initialLogs.length > 0 ||
            initialLastMsg !== null;

          if (hasExistingUserData) {
            isWelcomeDone = true;
            await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
          }
        }

        setEnabled(initialEnabled);
        setMessage(initialMessage);
        setWelcomeCompleted(isWelcomeDone);
        setTemplates(initialTemplates);
        setDelaySeconds(initialDelay);
        setRulesMode(initialRulesMode);
        setRulesList(initialRulesList);
        setQuietHours(initialQuietHours);
        setActivityLogs(initialLogs);
        setLastMessage(initialLastMsg);
        setTestModeEnabled(initialTestMode);

        // Sync the hydrated settings to native layer so background services are aligned
        await syncEnhancedNativeSettings({
          enabled: initialEnabled,
          message: initialMessage,
          delaySeconds: initialDelay,
          quietHoursEnabled: initialQuietHours.enabled,
          quietHoursStart: toTimeString(initialQuietHours.startHour, initialQuietHours.startMinute),
          quietHoursEnd: toTimeString(initialQuietHours.endHour, initialQuietHours.endMinute),
          rulesMode: initialRulesMode,
          rulesNumbers: initialRulesList.map((r) => r.phoneNumber),
          testModeEnabled: initialTestMode,
        });

        // Check permissions and status
        await refreshSystemStatus();
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoaded(true);
      }
    }

    loadPreferences();
  }, []);

  // 2. System Status & Permissions Refresh
  const refreshSystemStatus = useCallback(async () => {
    try {
      const perms = await checkCallConnectPermissions();
      setPermissions(perms);
      setIsDefaultSms(!!perms.isDefaultSms);
      setConsentGranted(!!perms.consentGranted);

      const status = await getLastCallStatus();
      setLastCall(status);

      const pending = await getNativePendingSms();
      setPendingSms(pending);

      const latestLastMsg = await getLastMessageRecord();
      if (latestLastMsg) {
        setLastMessage(latestLastMsg);
        await AsyncStorage.setItem(LAST_MESSAGE_KEY, JSON.stringify(latestLastMsg));
      }

      const nativeLogs = await getNativeActivityLogs();
      if (nativeLogs && nativeLogs.length > 0) {
        setActivityLogs(nativeLogs);
        await AsyncStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(nativeLogs));
      }
    } catch (e) {
      console.warn('Could not refresh system status:', e);
    }
  }, []);

  // 3. AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshSystemStatus();
      }
    });
    return () => subscription.remove();
  }, [refreshSystemStatus]);

  // 4. Polling for countdown when a message is pending
  useEffect(() => {
    if (pendingSms.isPending) {
      pollIntervalRef.current = setInterval(async () => {
        const updated = await getNativePendingSms();
        setPendingSms(updated);
        if (!updated.isPending) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          refreshSystemStatus();
        }
      }, 1000);
    } else if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pendingSms.isPending, refreshSystemStatus]);

  // Handlers
  const toggleEnabled = async (newValue: boolean) => {
    const previous = enabled;
    setEnabled(newValue);
    try {
      await AsyncStorage.setItem(ENABLED_KEY, String(newValue));
      await syncNativeSettings(newValue, message);
    } catch {
      setEnabled(previous);
      Alert.alert('Error', 'Failed to update auto-reply state.');
    }
  };

  const saveMessage = async (newText: string): Promise<boolean> => {
    const trimmed = newText.trim();
    if (!trimmed) {
      Alert.alert('Invalid Message', 'Follow-up message cannot be empty.');
      return false;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      Alert.alert('Message Too Long', `Please limit messages to ${MAX_MESSAGE_LENGTH} characters.`);
      return false;
    }

    const previous = message;
    setMessage(trimmed);
    try {
      await AsyncStorage.setItem(MESSAGE_KEY, trimmed);
      await syncNativeSettings(enabled, trimmed);
      return true;
    } catch {
      setMessage(previous);
      Alert.alert('Error', 'Failed to save message.');
      return false;
    }
  };

  const resetDefaultMessage = async () => {
    await saveMessage(DEFAULT_MESSAGE);
  };

  const completeWelcome = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
      setWelcomeCompleted(true);
      setShowWelcomeTour(false);
    } catch (e) {
      console.warn('Could not save welcome state:', e);
      setWelcomeCompleted(true);
      setShowWelcomeTour(false);
    }
  };

  const selectTemplate = async (tpl: MessageTemplate) => {
    await saveMessage(tpl.content);
  };

  const saveTemplate = async (templateData: { id?: string; title: string; content: string }) => {
    let updated: MessageTemplate[];
    if (templateData.id) {
      updated = templates.map((t) =>
        t.id === templateData.id
          ? { ...t, title: templateData.title.trim(), content: templateData.content.trim() }
          : t
      );
    } else {
      const newTpl: MessageTemplate = {
        id: `custom_${Date.now()}`,
        title: templateData.title.trim(),
        content: templateData.content.trim(),
        createdAt: Date.now(),
        isDefault: false,
      };
      updated = [...templates, newTpl];
    }
    setTemplates(updated);
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  };

  const deleteTemplate = async (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  };

  const updateDelay = async (seconds: number) => {
    setDelaySeconds(seconds);
    await AsyncStorage.setItem(DELAY_KEY, String(seconds));
    await syncEnhancedNativeSettings({ delaySeconds: seconds });
  };

  const cancelPending = async () => {
    try {
      await cancelPendingSms();
      setPendingSms({
        isPending: false,
        phoneNumber: '',
        message: '',
        sendAtTimestamp: 0,
        secondsRemaining: 0,
        isTest: false,
      });
      await refreshSystemStatus();
      Alert.alert('Cancelled', 'Follow-up SMS has been aborted.');
    } catch {
      Alert.alert('Error', 'Could not cancel pending follow-up.');
    }
  };

  const updateRulesMode = async (mode: RulesMode) => {
    setRulesMode(mode);
    await AsyncStorage.setItem(RULES_MODE_KEY, mode);
    await syncEnhancedNativeSettings({
      rulesMode: mode,
      rulesNumbers: rulesList.map((r) => r.phoneNumber),
    });
  };

  const addRuleNumber = async (phoneNumber: string, label?: string) => {
    const newRule: NumberRule = {
      id: `rule_${Date.now()}`,
      phoneNumber: phoneNumber.trim(),
      label: label?.trim() || undefined,
      createdAt: Date.now(),
    };
    const updated = [newRule, ...rulesList];
    setRulesList(updated);
    await AsyncStorage.setItem(RULES_LIST_KEY, JSON.stringify(updated));
    await syncEnhancedNativeSettings({
      rulesNumbers: updated.map((r) => r.phoneNumber),
    });
  };

  const deleteRuleNumber = async (id: string) => {
    const updated = rulesList.filter((r) => r.id !== id);
    setRulesList(updated);
    await AsyncStorage.setItem(RULES_LIST_KEY, JSON.stringify(updated));
    await syncEnhancedNativeSettings({
      rulesNumbers: updated.map((r) => r.phoneNumber),
    });
  };

  const updateQuietHours = async (config: QuietHoursConfig) => {
    setQuietHours(config);
    await AsyncStorage.setItem(QUIET_HOURS_KEY, JSON.stringify(config));
    await syncEnhancedNativeSettings({
      quietHoursEnabled: config.enabled,
      quietHoursStart: toTimeString(config.startHour, config.startMinute),
      quietHoursEnd: toTimeString(config.endHour, config.endMinute),
    });
  };

  const clearActivityLogs = async () => {
    try {
      await clearNativeActivityLogs();
      setActivityLogs([]);
      await AsyncStorage.removeItem(ACTIVITY_LOGS_KEY);
    } catch {
      Alert.alert('Error', 'Could not clear activity logs.');
    }
  };

  const refreshActivityLogs = async () => {
    await refreshSystemStatus();
  };

  const requestPermissions = async () => {
    await requestCallConnectPermissions();
    const perms = await checkCallConnectPermissions();
    setPermissions(perms);
  };

  const openSettings = async () => {
    await openCallConnectSettings();
  };

  const toggleTestMode = async (val: boolean) => {
    setTestModeEnabled(val);
    await AsyncStorage.setItem(TEST_MODE_KEY, String(val));
    await syncEnhancedNativeSettings({ testModeEnabled: val });
  };

  const simulateCall = async (phoneNumber: string): Promise<{ success: boolean; status: string }> => {
    try {
      const res = await simulateCallEnded(phoneNumber);
      await refreshSystemStatus();
      return res;
    } catch (e: any) {
      const err = { success: false, status: e.message || 'Unknown error' };
      return err;
    }
  };

  const openComposer = async (recipient: string, messageText: string): Promise<boolean> => {
    try {
      const success = await openSmsComposer(recipient, messageText);
      await refreshSystemStatus();
      return success;
    } catch (e) {
      console.warn('[CallConnect] Failed to open composer:', e);
      return false;
    }
  };

  const grantConsent = async () => {
    setConsentGranted(true);
    await AsyncStorage.setItem(CONSENT_GRANTED_KEY, 'true');
    await setAutoSendConsentGranted(true);
    await refreshSystemStatus();
  };

  const revokeConsent = async () => {
    setConsentGranted(false);
    await AsyncStorage.setItem(CONSENT_GRANTED_KEY, 'false');
    await setAutoSendConsentGranted(false);
    await toggleEnabled(false);
    await refreshSystemStatus();
  };

  const requestDefaultSmsRoleAction = async (): Promise<boolean> => {
    const res = await requestDefaultSmsRole();
    await refreshSystemStatus();
    return res;
  };

  const sendDirectSmsAction = async (phoneNumber: string, msg: string): Promise<boolean> => {
    const res = await sendDirectSms(phoneNumber, msg);
    await refreshSystemStatus();
    return res;
  };

  const resetAllSettings = async () => {
    try {
      await AsyncStorage.multiRemove([
        ENABLED_KEY,
        MESSAGE_KEY,
        TEMPLATES_KEY,
        DELAY_KEY,
        RULES_MODE_KEY,
        RULES_LIST_KEY,
        QUIET_HOURS_KEY,
        ACTIVITY_LOGS_KEY,
        TEST_MODE_KEY,
        LAST_MESSAGE_KEY,
      ]);
      setEnabled(false);
      setMessage(DEFAULT_MESSAGE);
      setTemplates(DEFAULT_TEMPLATES);
      setDelaySeconds(0);
      setRulesMode('exclude');
      setRulesList([]);
      setQuietHours({
        enabled: false,
        startHour: 22,
        startMinute: 0,
        endHour: 7,
        endMinute: 0,
      });
      setActivityLogs([]);
      setLastMessage(null);
      setTestModeEnabled(false);

      await syncEnhancedNativeSettings({
        enabled: false,
        message: DEFAULT_MESSAGE,
        delaySeconds: 0,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        rulesMode: 'exclude',
        rulesNumbers: [],
        testModeEnabled: false,
      });

      await refreshSystemStatus();
      Alert.alert('Reset Complete', 'All settings have been restored to defaults.');
    } catch {
      Alert.alert('Error', 'Could not reset settings.');
    }
  };

  const isQuietHoursActive = isCurrentlyInQuietHours(quietHours);

  return (
    <CallConnectContext.Provider
      value={{
        enabled,
        message,
        loaded,
        welcomeCompleted,
        showWelcomeTour,
        setShowWelcomeTour,
        templates,
        delaySeconds,
        rulesMode,
        rulesList,
        quietHours,
        activityLogs,
        lastMessage,
        pendingSms,
        permissions,
        lastCall,
        testModeEnabled,
        isQuietHoursActive,
        isDefaultSms,
        consentGranted,
        grantConsent,
        revokeConsent,
        requestDefaultSmsRole: requestDefaultSmsRoleAction,
        sendDirectSms: sendDirectSmsAction,
        toggleEnabled,
        saveMessage,
        resetDefaultMessage,
        completeWelcome,
        selectTemplate,
        saveTemplate,
        deleteTemplate,
        updateDelay,
        cancelPending,
        updateRulesMode,
        addRuleNumber,
        deleteRuleNumber,
        updateQuietHours,
        clearActivityLogs,
        refreshActivityLogs,
        requestPermissions,
        openSettings,
        toggleTestMode,
        simulateCall,
        openComposer,
        resetAllSettings,
      }}>
      {children}
    </CallConnectContext.Provider>
  );
}

export function useCallConnect() {
  const context = useContext(CallConnectContext);
  if (!context) {
    throw new Error('useCallConnect must be used within a CallConnectProvider');
  }
  return context;
}
