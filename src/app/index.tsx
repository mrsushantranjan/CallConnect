import { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  checkCallConnectPermissions,
  getLastCallStatus,
  openCallConnectSettings,
  requestCallConnectPermissions,
  syncNativeSettings,
  type CallConnectPermissions,
  type LastCallStatus,
} from '@/services/call-connect';
import { useResponsive } from '@/styles/responsive';

const ENABLED_KEY = 'callconnect_enabled';
const MESSAGE_KEY = 'callconnect_message';
const DEFAULT_MESSAGE = 'Thanks for connecting with us.';
const MAX_MESSAGE_LENGTH = 300;

export default function HomeScreen() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [loaded, setLoaded] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [permissions, setPermissions] = useState<CallConnectPermissions>({
    isNativeAvailable: false,
    phoneState: false,
    callLog: false,
    sendSms: false,
    notifications: false,
    canAutoSendDirect: false,
    canPromptComposer: false,
  });

  const [lastCall, setLastCall] = useState<LastCallStatus>({
    status: 'Ready for calls',
    timestamp: 0,
  });

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();

  // Load saved preferences and sync with native module
  useEffect(() => {
    async function loadSettings() {
      let initialEnabled = false;
      let initialMessage = DEFAULT_MESSAGE;

      try {
        const savedEnabled = await AsyncStorage.getItem(ENABLED_KEY);
        const savedMessage = await AsyncStorage.getItem(MESSAGE_KEY);

        if (savedEnabled !== null) {
          initialEnabled = savedEnabled === 'true';
          setEnabled(initialEnabled);
        }
        if (savedMessage !== null) {
          initialMessage = savedMessage;
          setMessage(savedMessage);
        }
      } catch {
        Alert.alert('Could not load saved settings.');
      } finally {
        setLoaded(true);
      }

      // Sync to native Android SharedPreferences
      syncNativeSettings(initialEnabled, initialMessage);

      // Check current permissions and call status
      refreshStatus();
    }

    loadSettings();
  }, []);

  // Refresh permissions and status when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshStatus();
      }
    });
    return () => subscription.remove();
  }, []);

  async function refreshStatus() {
    try {
      const perms = await checkCallConnectPermissions();
      setPermissions(perms);
      const status = await getLastCallStatus();
      setLastCall(status);
    } catch {
      // Graceful fallback
    }
  }

  async function saveEnabled(value: boolean) {
    setEnabled(value);
    setSavedNotice(false);

    try {
      await AsyncStorage.setItem(ENABLED_KEY, String(value));
      setSavedNotice(true);
      // Synchronize with Android background broadcast receiver
      syncNativeSettings(value, message);
    } catch {
      Alert.alert('Could not save the setting.');
    }

    // If enabling and permissions are needed on Android, prompt user
    if (value && permissions.isNativeAvailable && !permissions.canAutoSendDirect && !permissions.canPromptComposer) {
      handleRequestPermissions();
    }
  }

  async function saveMessage(value: string) {
    setMessage(value);
    setSavedNotice(false);

    try {
      await AsyncStorage.setItem(MESSAGE_KEY, value);
      setSavedNotice(true);
      // Synchronize with Android background broadcast receiver
      syncNativeSettings(enabled, value);
    } catch {
      Alert.alert('Could not save the message.');
    }
  }

  async function handleRequestPermissions() {
    const granted = await requestCallConnectPermissions();
    refreshStatus();
    if (!granted) {
      Alert.alert(
        'Permissions Recommended',
        'CallConnect needs Phone State and Call Log permissions to detect when an answered phone call finishes.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openCallConnectSettings },
        ]
      );
    }
  }

  const charCount = message.length;
  const isNearLimit = charCount >= 270;
  const isAtLimit = charCount >= MAX_MESSAGE_LENGTH;

  // Safe vertical padding calculating status bar and bottom navigation tab inset
  const topPadding = Math.max(insets.top + Spacing.two, Spacing.four);
  const bottomPadding = insets.bottom + BottomTabInset + Spacing.four;

  // Derive operational readiness
  const isOperationallyReady = enabled && permissions.canAutoSendDirect;
  const isPromptReady = enabled && permissions.canPromptComposer && !permissions.canAutoSendDirect;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: topPadding,
                paddingBottom: bottomPadding,
                paddingHorizontal: responsive.horizontalPadding,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Centered responsive container constrained on tablets */}
            <View
              style={[
                styles.responsiveContainer,
                { maxWidth: responsive.contentMaxWidth },
              ]}>
              {/* Top Branding Header */}
              <View style={styles.header}>
                <View style={styles.logoAndBrand}>
                  <View style={[styles.logo, { backgroundColor: theme.primary }]}>
                    <Text style={styles.logoText}>C</Text>
                  </View>
                  <View style={styles.brandContainer}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.brand,
                        {
                          color: theme.text,
                          fontSize: responsive.titleSize,
                        },
                      ]}>
                      CallConnect
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.tagline, { color: theme.textSecondary }]}>
                      Stay connected, effortlessly
                    </Text>
                  </View>
                </View>

                {/* Local storage status chip */}
                <View
                  style={[
                    styles.storageChip,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.cardBorder,
                    },
                  ]}>
                  <View
                    style={[
                      styles.deviceDot,
                      {
                        backgroundColor: isOperationallyReady
                          ? theme.statusSuccess
                          : theme.primary,
                      },
                    ]}
                  />
                  <Text style={[styles.storageChipText, { color: theme.textSecondary }]}>
                    On-device
                  </Text>
                </View>
              </View>

              {/* Modern Dark Hero Card */}
              <View
                style={[
                  styles.hero,
                  {
                    backgroundColor: theme.heroBackground,
                    borderColor: theme.heroCardBorder,
                    padding: responsive.heroPadding,
                  },
                ]}>
                <View style={styles.eyebrowContainer}>
                  <Text style={[styles.eyebrow, { color: theme.heroAccent }]}>
                    YOUR CALL ASSISTANT
                  </Text>
                </View>

                <Text
                  style={[
                    styles.heroTitle,
                    {
                      fontSize: responsive.heroTitleSize,
                      lineHeight: Math.round(responsive.heroTitleSize * 1.25),
                    },
                  ]}>
                  A thoughtful follow-up,
                </Text>
                <Text
                  style={[
                    styles.heroTitleAccent,
                    {
                      color: theme.heroAccent,
                      fontSize: responsive.heroTitleSize,
                      lineHeight: Math.round(responsive.heroTitleSize * 1.25),
                    },
                  ]}>
                  after every call.
                </Text>

                <Text style={styles.heroDescription}>
                  Set a message to send when your call is finished.
                </Text>

                {/* Status indicator pill with clear active state */}
                <View
                  style={[
                    styles.statusPill,
                    enabled ? styles.statusPillActive : styles.statusPillInactive,
                  ]}>
                  <View
                    style={[
                      styles.statusDot,
                      enabled ? styles.statusDotActive : styles.statusDotInactive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      enabled ? styles.statusTextActive : styles.statusTextInactive,
                    ]}>
                    {enabled ? 'Auto-reply enabled' : 'Auto-reply is off'}
                  </Text>
                </View>
              </View>

              {/* Android Platform & Permission Feedback Section */}
              {permissions.isNativeAvailable ? (
                <View
                  style={[
                    styles.permissionCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: isOperationallyReady
                        ? theme.statusSuccessBorder
                        : isPromptReady
                        ? '#FDE68A'
                        : theme.cardBorder,
                    },
                  ]}>
                  <View style={styles.permissionHeaderRow}>
                    <View
                      style={[
                        styles.statusCircle,
                        {
                          backgroundColor: isOperationallyReady
                            ? theme.statusSuccessBg
                            : isPromptReady
                            ? '#FEF3C7'
                            : theme.primaryLight,
                        },
                      ]}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: isOperationallyReady
                            ? theme.statusSuccess
                            : isPromptReady
                            ? '#D97706'
                            : theme.primary,
                        }}>
                        {isOperationallyReady ? '✓' : isPromptReady ? '💬' : '⚙'}
                      </Text>
                    </View>

                    <View style={styles.permissionHeaderText}>
                      <Text style={[styles.permissionTitle, { color: theme.text }]}>
                        {isOperationallyReady
                          ? 'Background SMS Ready'
                          : isPromptReady
                          ? 'Interactive Composer Ready'
                          : 'Permissions Required for Call-End Detection'}
                      </Text>
                      <Text style={[styles.permissionSubtitle, { color: theme.textSecondary }]}>
                        {isOperationallyReady
                          ? 'Automatic SMS will trigger after completed answered calls.'
                          : isPromptReady
                          ? 'Direct SEND_SMS not granted: Call-end prompts 1-tap SMS composer (Play Store compliant).'
                          : 'Phone State and Call Log permissions are needed to detect answered calls.'}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons if permissions are incomplete */}
                  {!isOperationallyReady && (
                    <View style={styles.permissionActionRow}>
                      <Pressable
                        onPress={handleRequestPermissions}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          { backgroundColor: theme.primary },
                          pressed && styles.pressed,
                        ]}>
                        <Text style={styles.actionBtnText}>
                          {!permissions.canPromptComposer ? 'Grant Permissions' : 'Enable Direct SMS'}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={openCallConnectSettings}
                        style={({ pressed }) => [
                          styles.secondaryBtn,
                          { borderColor: theme.cardBorder },
                          pressed && styles.pressed,
                        ]}>
                        <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
                          App Settings
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* Last Event Feedback Row */}
                  <View style={[styles.lastEventRow, { borderTopColor: theme.cardBorder }]}>
                    <Text style={[styles.lastEventLabel, { color: theme.textSecondary }]}>
                      LAST CALL EVENT:
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.lastEventValue, { color: theme.text }]}>
                      {lastCall.status}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.permissionCard,
                    {
                      backgroundColor: theme.infoBg,
                      borderColor: theme.infoBorder,
                    },
                  ]}>
                  <View style={styles.permissionHeaderRow}>
                    <View
                      style={[
                        styles.statusCircle,
                        { backgroundColor: theme.primaryLight },
                      ]}>
                      <Text style={{ fontSize: 13, color: theme.primary }}>ℹ</Text>
                    </View>
                    <View style={styles.permissionHeaderText}>
                      <Text style={[styles.permissionTitle, { color: theme.text }]}>
                        Android Development Build Note
                      </Text>
                      <Text style={[styles.permissionSubtitle, { color: theme.textSecondary }]}>
                        Native telephony call detection requires an Android build (`npx expo run:android`). The native Kotlin receiver and preferences bridge are preconfigured.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Main Interaction Card */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.cardBorder,
                    padding: responsive.cardPadding,
                  },
                ]}>
                {/* Auto-reply Switch Row */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardIcon,
                      { backgroundColor: theme.primaryLight },
                    ]}>
                    <Text style={[styles.cardIconText, { color: theme.primary }]}>
                      ↗
                    </Text>
                  </View>

                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      Auto-reply
                    </Text>
                    <Text
                      style={[
                        styles.cardSubtitle,
                        { color: theme.textSecondary },
                      ]}>
                      Turn your follow-up preference on or off
                    </Text>
                  </View>

                  <View style={styles.switchWrapper}>
                    <Switch
                      value={enabled}
                      onValueChange={saveEnabled}
                      disabled={!loaded}
                      trackColor={{
                        false: colorScheme === 'dark' ? '#334155' : '#D8DFEA',
                        true: colorScheme === 'dark' ? '#4F46E5' : '#A5B4FC',
                      }}
                      thumbColor={enabled ? theme.primary : '#FFFFFF'}
                    />
                  </View>
                </View>

                {/* Divider */}
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.cardBorder },
                  ]}
                />

                {/* Message Field Header */}
                <View style={styles.fieldHeaderRow}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: theme.textSecondary },
                    ]}>
                    YOUR MESSAGE
                  </Text>
                  {message !== DEFAULT_MESSAGE && (
                    <Pressable
                      onPress={() => saveMessage(DEFAULT_MESSAGE)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={({ pressed }) => [
                        styles.resetButton,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.resetText, { color: theme.primary }]}>
                        Reset default
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Styled Message Input */}
                <TextInput
                  value={message}
                  onChangeText={saveMessage}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Type your message"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  maxLength={MAX_MESSAGE_LENGTH}
                  style={[
                    styles.input,
                    {
                      minHeight: responsive.inputMinHeight,
                      backgroundColor: theme.inputBackground,
                      borderColor: isInputFocused
                        ? theme.inputBorderFocused
                        : theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  editable={loaded}
                  textAlignVertical="top"
                />

                {/* Message Footnote & Character Counter */}
                <View style={styles.messageFooter}>
                  <View style={styles.saveNoticeContainer}>
                    {savedNotice ? (
                      <Text
                        style={[
                          styles.savedNotice,
                          { color: theme.statusSuccess },
                        ]}>
                        ✓ Saved on this device
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.savedNoticeMuted,
                          { color: theme.textSecondary },
                        ]}>
                        Saved on this device
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.characterCount,
                      {
                        color: isAtLimit
                          ? '#EF4444'
                          : isNearLimit
                          ? '#F59E0B'
                          : theme.textSecondary,
                      },
                    ]}>
                    {charCount}/{MAX_MESSAGE_LENGTH}
                  </Text>
                </View>
              </View>

              {/* Informational & Transparency Callout */}
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: theme.infoBg,
                    borderColor: theme.infoBorder,
                  },
                ]}>
                <View
                  style={[
                    styles.infoIconWrapper,
                    { backgroundColor: theme.primaryLight },
                  ]}>
                  <Text style={[styles.infoIconText, { color: theme.infoIcon }]}>
                    i
                  </Text>
                </View>
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.infoText },
                  ]}>
                  {permissions.isNativeAvailable
                    ? permissions.canAutoSendDirect && enabled
                      ? 'Your preferences are saved on this device. Auto-reply is active for completed answered calls.'
                      : 'Your preferences are saved on this device. Permissions or auto-reply switch are required to initiate SMS.'
                    : 'Your preferences are saved on this device. Automatic SMS sending is active when running in the native Android build with required permissions.'}
                </Text>
              </View>

              {/* Privacy Notice Card */}
              <View
                style={[
                  styles.privacyCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.cardBorder,
                  },
                ]}>
                <Text style={[styles.privacyTitle, { color: theme.text }]}>
                  Privacy & Data Handling
                </Text>
                <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                  CallConnect operates 100% on-device. Phone numbers and message contents are processed locally to initiate follow-ups and are never sent to external servers, cloud storage, or third-party analytics.
                </Text>
              </View>

              {/* Footer */}
              <Text
                style={[
                  styles.footer,
                  { color: theme.textSecondary },
                ]}>
                MADE TO KEEP YOU CONNECTED
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  responsiveContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  logoAndBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  brandContainer: {
    flex: 1,
  },
  brand: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 12,
    marginTop: 2,
  },
  storageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one + 1,
    borderRadius: Radii.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  deviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  storageChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hero: {
    borderRadius: Radii.xxl,
    marginBottom: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  eyebrowContainer: {
    marginBottom: Spacing.two,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroTitleAccent: {
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroDescription: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 3,
    marginTop: Spacing.four,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: '#0F2922',
    borderColor: '#065F46',
  },
  statusPillInactive: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: Spacing.two,
  },
  statusDotActive: {
    backgroundColor: '#4ADE80',
  },
  statusDotInactive: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#86EFAC',
  },
  statusTextInactive: {
    color: '#94A3B8',
  },
  permissionCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  permissionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusCircle: {
    width: 26,
    height: 26,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two + 2,
    marginTop: 1,
  },
  permissionHeaderText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  permissionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  permissionActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  actionBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.sm,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  lastEventLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginRight: Spacing.two,
  },
  lastEventValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    marginBottom: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  cardIconText: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  switchWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
    flexShrink: 0,
  },
  separator: {
    height: 1,
    marginVertical: Spacing.three + 2,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  resetButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    minHeight: 20,
  },
  saveNoticeContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  savedNotice: {
    fontSize: 11,
    fontWeight: '600',
  },
  savedNoticeMuted: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  infoIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two + 2,
    marginTop: 1,
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  privacyCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    opacity: 0.8,
  },
  pressed: {
    opacity: 0.7,
  },
});
