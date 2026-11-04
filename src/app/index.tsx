import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LastMessageCard } from '@/components/features/last-message-card';
import { MessageSheetModal } from '@/components/features/message-sheet-modal';
import { ThemedText } from '@/components/themed-text';
import { WelcomeScreen } from '@/components/welcome-screen';
import { BottomTabInset, Colors, Radii, Spacing } from '@/constants/theme';
import { useCallConnect } from '@/context/call-connect-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/styles/responsive';
import { formatRelativeTimestamp, maskPhoneNumber } from '@/utils/call-connect-helpers';

export default function HomeScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const responsive = useResponsive();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const {
    enabled,
    message,
    loaded,
    welcomeCompleted,
    showWelcomeTour,
    templates,
    pendingSms,
    activityLogs,
    lastMessage,
    permissions,
    consentGranted,
    delaySeconds,
    isQuietHoursActive,
    toggleEnabled,
    grantConsent,
    requestPermissions,
    saveMessage,
    saveTemplate,
    cancelPending,
    completeWelcome,
  } = useCallConnect();

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
  };

  const hasMissingCorePermissions =
    !permissions.phoneState || !permissions.callLog || !permissions.sendSms;

  const handleToggleSwitch = async (val: boolean) => {
    if (val && !consentGranted) {
      setIsConsentModalOpen(true);
      return;
    }
    await toggleEnabled(val);
  };

  const handleConfirmConsent = async () => {
    setIsConsentModalOpen(false);
    await grantConsent();
    await toggleEnabled(true);
    if (hasMissingCorePermissions) {
      await requestPermissions();
    }
  };

  // 1. First-launch / welcome tour gate
  if (!loaded) {
    return null;
  }

  if (welcomeCompleted === false || showWelcomeTour) {
    return <WelcomeScreen onGetStarted={completeWelcome} />;
  }

  const getStatusBadge = () => {
    if (!enabled) {
      return {
        label: 'AUTO-SMS PAUSED',
        desc: 'Automatic follow-up messages are paused. Enable the switch to resume.',
        bg: theme.statusInactiveBg,
        border: theme.statusInactiveBorder,
        color: theme.statusInactive,
        dot: theme.statusInactive,
      };
    }
    if (hasMissingCorePermissions) {
      return {
        label: 'PERMISSIONS NEEDED',
        desc: 'Phone, Call Log, and SMS permissions are required to detect calls and send SMS.',
        bg: '#FEE2E2',
        border: '#FCA5A5',
        color: '#DC2626',
        dot: '#DC2626',
      };
    }
    if (isQuietHoursActive) {
      return {
        label: 'QUIET HOURS ACTIVE',
        desc: 'Messages are paused during your scheduled quiet hours.',
        bg: theme.statusWarningBg,
        border: theme.statusWarningBorder,
        color: theme.statusWarning,
        dot: theme.statusWarning,
      };
    }
    return {
      label: 'AUTOMATIC SENDING ACTIVE',
      desc: 'CallConnect will automatically send your message after completed calls.',
      bg: theme.statusSuccessBg,
      border: theme.statusSuccessBorder,
      color: theme.statusSuccess,
      dot: theme.statusSuccess,
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? Spacing.two : Spacing.four),
          paddingBottom: insets.bottom,
          paddingLeft: responsive.horizontalPadding,
          paddingRight: responsive.horizontalPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.innerContainer, { maxWidth: responsive.contentMaxWidth }]}>
        {/* TOP BAR: Branding & Settings Gear */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.logoBadgeText}>CC</Text>
            </View>
            <View>
              <ThemedText style={styles.brandTitle}>CallConnect</ThemedText>
              <ThemedText style={styles.brandSubtitle}>Automatic Post-Call SMS</ThemedText>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Settings"
            style={({ pressed }) => [
              styles.gearButton,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              pressed && styles.pressed,
            ]}
            onPress={() => router.navigate('/settings')}>
            <Text style={styles.gearIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* SECTION 1: MASTER AUTOMATIC SMS CONTROL */}
        <View
          style={[
            styles.masterCard,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
          ]}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <ThemedText style={styles.switchHeading}>Automatic Post-Call SMS</ThemedText>
              <ThemedText style={styles.switchSubtext}>
                {enabled
                  ? 'Active: Automatically sends follow-up after call ends'
                  : 'Disabled: Follow-ups will not be sent'}
              </ThemedText>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggleSwitch}
              trackColor={{ false: theme.statusInactiveBorder, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Status Indicator Banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: statusBadge.bg, borderColor: statusBadge.border },
            ]}>
            <View style={styles.statusBadgeHeader}>
              <View style={[styles.statusDot, { backgroundColor: statusBadge.dot }]} />
              <Text style={[styles.statusBadgeTitle, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
            <Text style={[styles.statusBadgeDesc, { color: statusBadge.color }]}>
              {statusBadge.desc}
            </Text>
          </View>

          {/* Missing permissions call-to-action */}
          {hasMissingCorePermissions && (
            <View style={styles.permActionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Grant required permissions"
                style={[styles.grantButton, { backgroundColor: theme.primary }]}
                onPress={requestPermissions}>
                <Text style={styles.grantButtonText}>Grant Permissions</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ACTIVE PENDING DELAY COUNTDOWN (if delay active) */}
        {pendingSms.isPending && (
          <View
            style={[
              styles.pendingBanner,
              { backgroundColor: theme.statusWarningBg, borderColor: theme.statusWarningBorder },
            ]}>
            <View style={styles.pendingTextWrapper}>
              <Text style={[styles.pendingTitle, { color: theme.statusWarning }]}>
                ⏳ SENDING AUTO-REPLY IN {pendingSms.secondsRemaining}s
              </Text>
              <Text
                style={[styles.pendingSubtext, { color: theme.textSecondary }]}
                numberOfLines={1}>
                {pendingSms.phoneNumber
                  ? `To ${maskPhoneNumber(pendingSms.phoneNumber)}: `
                  : 'Follow-up: '}
                &ldquo;{pendingSms.message}&rdquo;
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel pending automatic SMS send"
              style={[styles.cancelButton, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={cancelPending}>
              <Text style={[styles.cancelButtonText, { color: '#EF4444' }]}>Cancel Send</Text>
            </Pressable>
          </View>
        )}

        {/* SECTION 2: CONFIGURED MESSAGE & DELAY SUMMARY */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              FOLLOW-UP MESSAGE
            </Text>
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {message.length} / 300
            </Text>
          </View>

          <View
            style={[
              styles.messageCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
            ]}>
            <Text style={[styles.quoteMark, { color: theme.primary }]}>&ldquo;</Text>
            <ThemedText style={styles.messageContent}>{message}</ThemedText>

            <View style={[styles.metaDivider, { backgroundColor: theme.cardBorder }]} />

            <View style={styles.messageMetaRow}>
              <View style={styles.delayBadge}>
                <Text style={[styles.delayBadgeText, { color: theme.textSecondary }]}>
                  ⏱️ Send Delay: {delaySeconds === 0 ? 'Instant (0s)' : `${delaySeconds} seconds`}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit follow-up message"
                style={({ pressed }) => [
                  styles.editButton,
                  { backgroundColor: theme.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setIsEditorModalOpen(true)}>
                <Text style={styles.editButtonText}>Edit Message</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* SECTION 3: RECENT ACTIVITY */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              RECENT ACTIVITY
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View settings"
              onPress={() => router.navigate('/settings')}>
              <Text style={[styles.settingsLinkText, { color: theme.primary }]}>
                Settings & Rules →
              </Text>
            </Pressable>
          </View>

          <LastMessageCard lastMessage={lastMessage} lastLog={activityLogs[0] || null} />

          {/* Activity items list (up to 3 recent items) */}
          {activityLogs.length > 1 && (
            <View
              style={[
                styles.recentLogsList,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}>
              {activityLogs.slice(1, 4).map((log, idx) => (
                <View
                  key={log.id || `log_${idx}`}
                  style={[
                    styles.logRow,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: theme.cardBorder },
                  ]}>
                  <View style={styles.logLeft}>
                    <Text style={[styles.logPhone, { color: theme.text }]}>
                      {maskPhoneNumber(log.phoneNumber)}
                    </Text>
                    <Text
                      style={[styles.logReason, { color: theme.textSecondary }]}
                      numberOfLines={1}>
                      {log.reason || log.messageSnippet}
                    </Text>
                  </View>
                  <View style={styles.logRight}>
                    <View
                      style={[
                        styles.logStatusBadge,
                        {
                          backgroundColor:
                            log.status === 'sent'
                              ? theme.statusSuccessBg
                              : log.status === 'failed'
                              ? '#FEE2E2'
                              : theme.statusInactiveBg,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.logStatusText,
                          {
                            color:
                              log.status === 'sent'
                                ? theme.statusSuccess
                                : log.status === 'failed'
                                ? '#DC2626'
                                : theme.textSecondary,
                          },
                        ]}>
                        {log.status === 'sent' ? 'SUBMITTED' : log.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.logTime, { color: theme.textSecondary }]}>
                      {formatRelativeTimestamp(log.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* USER CONSENT MODAL FOR AUTOMATIC SMS SENDING */}
      <Modal
        visible={isConsentModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConsentModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.consentBox,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
            ]}>
            <Text style={styles.consentIcon}>📱</Text>
            <ThemedText style={styles.consentTitle}>Automatic SMS Consent</ThemedText>
            <Text style={[styles.consentBody, { color: theme.textSecondary }]}>
              When enabled, CallConnect will automatically send your configured follow-up text
              message from your phone number after calls end (incoming answered, missed, rejected,
              and outgoing calls).
              {'\n\n'}
              • Calls are matched against your allow/block rules and quiet hours.
              {'\n'}• Carrier SMS rates may apply according to your cellular plan.
            </Text>
            <View style={styles.consentActions}>
              <Pressable
                style={[styles.consentCancelBtn, { borderColor: theme.cardBorder }]}
                onPress={() => setIsConsentModalOpen(false)}>
                <Text style={[styles.consentCancelText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.consentConfirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleConfirmConsent}>
                <Text style={styles.consentConfirmText}>I Consent & Enable</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MESSAGE SHEET / MODAL EDITOR */}
      <MessageSheetModal
        visible={isEditorModalOpen}
        currentMessage={message}
        templates={templates}
        defaultMessage="Thanks for connecting with us."
        onSave={saveMessage}
        onSaveNewTemplate={saveTemplate}
        onClose={() => setIsEditorModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    marginBottom: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.65,
    marginTop: 1,
  },
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 20,
  },
  masterCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.three,
  },
  switchHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchSubtext: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  statusBanner: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 2,
  },
  statusBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadgeDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  permActionRow: {
    marginTop: Spacing.three,
  },
  grantButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  pendingTextWrapper: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pendingSubtext: {
    fontSize: 12,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionWrapper: {
    marginBottom: Spacing.four,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  messageCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.four,
    position: 'relative',
  },
  quoteMark: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 28,
    height: 22,
    opacity: 0.4,
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: Spacing.three,
  },
  metaDivider: {
    height: 1,
    width: '100%',
    marginBottom: Spacing.three,
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  delayBadge: {
    flex: 1,
  },
  delayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recentLogsList: {
    marginTop: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  logLeft: {
    flex: 1,
    marginRight: Spacing.two,
  },
  logPhone: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  logReason: {
    fontSize: 12,
  },
  logRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  logStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  logStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logTime: {
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  consentBox: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.five,
    alignItems: 'center',
  },
  consentIcon: {
    fontSize: 36,
    marginBottom: Spacing.two,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  consentBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  consentActions: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.three,
  },
  consentCancelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  consentConfirmBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
