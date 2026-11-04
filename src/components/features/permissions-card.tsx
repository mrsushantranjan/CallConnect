import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CallConnectPermissions } from '@/types/call-connect';

interface PermissionsCardProps {
  permissions: CallConnectPermissions;
  onRequestPermissions: () => void;
  onRequestDefaultSmsRole?: () => void;
  onOpenSettings: () => void;
  isAutoReplyEnabled: boolean;
  isQuietHoursActive: boolean;
  isTestMode: boolean;
  isDefaultSms?: boolean;
}

export function PermissionsCard({
  permissions,
  onRequestPermissions,
  onRequestDefaultSmsRole,
  onOpenSettings,
  isAutoReplyEnabled,
  isQuietHoursActive,
  isTestMode,
  isDefaultSms = false,
}: PermissionsCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const allCoreGranted =
    permissions.phoneState && permissions.callLog && permissions.sendSms;

  const isAutomationFullyActive =
    allCoreGranted && isAutoReplyEnabled && !isQuietHoursActive && !isTestMode;

  const getSystemStatus = () => {
    if (isTestMode) {
      return {
        label: 'TEST SIMULATION MODE',
        desc: 'Simulating follow-up actions safely without sending real SMS.',
        bg: theme.statusWarningBg,
        border: theme.statusWarningBorder,
        color: theme.statusWarning,
      };
    }
    if (!isAutoReplyEnabled) {
      return {
        label: 'AUTO-REPLY PAUSED',
        desc: 'Enable the master switch to start automatic post-call follow-ups.',
        bg: theme.statusInactiveBg,
        border: theme.statusInactiveBorder,
        color: theme.statusInactive,
      };
    }
    if (isQuietHoursActive) {
      return {
        label: 'QUIET HOURS ACTIVE',
        desc: 'Automatic SMS messages are currently paused according to your schedule.',
        bg: theme.statusWarningBg,
        border: theme.statusWarningBorder,
        color: theme.statusWarning,
      };
    }
    if (isAutomationFullyActive) {
      return {
        label: 'AUTOMATIC SENDING ACTIVE',
        desc: 'CallConnect will automatically send your message after completed calls.',
        bg: theme.statusSuccessBg,
        border: theme.statusSuccessBorder,
        color: theme.statusSuccess,
      };
    }
    return {
      label: 'PERMISSIONS REQUIRED',
      desc: 'Grant Phone, Call Log, and SMS permissions to enable automatic sending.',
      bg: '#FEE2E2',
      border: '#FCA5A5',
      color: '#DC2626',
    };
  };

  const statusInfo = getSystemStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Permissions & Telephony Role</ThemedText>
        <ThemedText style={styles.subtitle}>
          Required Android capabilities for automatic post-call SMS
        </ThemedText>
      </View>

      {/* Overall Automation Status Card */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: statusInfo.bg, borderColor: statusInfo.border },
        ]}>
        <Text style={[styles.statusBannerBadge, { color: statusInfo.color }]}>
          ● {statusInfo.label}
        </Text>
        <Text style={[styles.statusBannerDesc, { color: statusInfo.color }]}>
          {statusInfo.desc}
        </Text>
      </View>

      {/* Granular Permission Items */}
      <View
        style={[
          styles.permsCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
        ]}>
        <PermissionRow
          name="Send SMS"
          desc="Send configured text message automatically"
          granted={permissions.sendSms}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        <PermissionRow
          name="Call Log Access"
          desc="Identify caller phone number & classify 5 call outcomes"
          granted={permissions.callLog}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        <PermissionRow
          name="Phone State"
          desc="Detect when a call connects and disconnects"
          granted={permissions.phoneState}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        <PermissionRow
          name="Notifications"
          desc="Delayed cancel countdown & delivery status alerts"
          granted={permissions.notifications}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        <PermissionRow
          name="Default SMS Role (Optional)"
          desc="Ensures highest Android background reliability"
          granted={isDefaultSms}
          theme={theme}
          customStatus={isDefaultSms ? 'DEFAULT APP' : 'OPTIONAL'}
          customColor={isDefaultSms ? theme.statusSuccess : theme.textSecondary}
        />

        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Request required permissions"
            onPress={onRequestPermissions}
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.actionBtnTextWhite}>Grant Permissions</Text>
          </Pressable>

          {onRequestDefaultSmsRole && !isDefaultSms && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Set as default SMS app"
              onPress={onRequestDefaultSmsRole}
              style={[styles.actionBtn, { borderColor: theme.primary, borderWidth: 1 }]}>
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                Set Default SMS Role
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Android app settings"
            onPress={onOpenSettings}
            style={[styles.actionBtn, { borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
              App Settings
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PermissionRow({
  name,
  desc,
  granted,
  theme,
  customStatus,
  customColor,
}: {
  name: string;
  desc: string;
  granted: boolean;
  theme: any;
  customStatus?: string;
  customColor?: string;
}) {
  const label = customStatus || (granted ? 'GRANTED' : 'DENIED');
  const textColor = customColor || (granted ? theme.statusSuccess : '#DC2626');
  const bgColor = granted ? theme.statusSuccessBg : '#FEE2E2';
  const borderColor = granted ? theme.statusSuccessBorder : '#FCA5A5';

  return (
    <View style={styles.permRow}>
      <View style={styles.permTextCol}>
        <ThemedText style={styles.permName}>{name}</ThemedText>
        <ThemedText style={styles.permDesc}>{desc}</ThemedText>
      </View>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: customStatus ? theme.cardBackground : bgColor,
            borderColor: customStatus ? theme.cardBorder : borderColor,
          },
        ]}>
        <Text style={[styles.badgeText, { color: textColor }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  statusBanner: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: 4,
  },
  statusBannerBadge: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBannerDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  permsCard: {
    borderWidth: 1,
    borderRadius: Radii.xl,
    padding: Spacing.four,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  permTextCol: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  permName: {
    fontSize: 14,
    fontWeight: '600',
  },
  permDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  badge: {
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    borderRadius: Radii.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnTextWhite: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
