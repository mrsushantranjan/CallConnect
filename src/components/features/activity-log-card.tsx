import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityLogItem, ActivityStatus } from '@/types/call-connect';
import { formatRelativeTimestamp, maskPhoneNumber } from '@/utils/call-connect-helpers';

interface ActivityLogCardProps {
  logs: ActivityLogItem[];
  onClearLogs: () => void;
}

export function ActivityLogCard({ logs, onClearLogs }: ActivityLogCardProps) {
  const [unmaskedIds, setUnmaskedIds] = useState<Record<string, boolean>>({});

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const toggleMask = (id: string) => {
    setUnmaskedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Activity Log',
      'Are you sure you want to delete all locally stored activity records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: onClearLogs,
        },
      ]
    );
  };

  const getStatusBadgeConfig = (status: ActivityStatus) => {
    switch (status) {
      case 'composer_opened':
        return { label: 'OPENED IN SMS', bg: theme.statusSuccessBg, border: theme.statusSuccessBorder, text: theme.statusSuccess };
      case 'prompted':
        return { label: 'PROMPTED', bg: theme.infoBg, border: theme.infoBorder, text: theme.infoIcon };
      case 'sent':
        return { label: 'SENT', bg: theme.statusSuccessBg, border: theme.statusSuccessBorder, text: theme.statusSuccess };
      case 'simulated':
        return { label: 'SIMULATED', bg: theme.infoBg, border: theme.infoBorder, text: theme.infoIcon };
      case 'skipped':
        return { label: 'SKIPPED', bg: theme.statusWarningBg, border: theme.statusWarningBorder, text: theme.statusWarning };
      case 'cancelled':
        return { label: 'CANCELLED', bg: theme.statusInactiveBg, border: theme.statusInactiveBorder, text: theme.statusInactive };
      case 'pending':
        return { label: 'PENDING', bg: theme.statusWarningBg, border: theme.statusWarningBorder, text: theme.statusWarning };
      case 'failed':
      default:
        return { label: 'FAILED', bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <ThemedText style={styles.title}>Recent Activity Log</ThemedText>
          <ThemedText style={styles.subtitle}>
            On-device record of call events and follow-up actions ({logs.length} logged)
          </ThemedText>
        </View>
        {logs.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear activity log"
            onPress={handleClear}
            style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.logList}>
        {logs.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
            <ThemedText style={styles.emptyTitle}>No Activity Yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Completed phone calls and follow-up actions will appear here in chronological order.
            </ThemedText>
          </View>
        ) : (
          logs.slice(0, 15).map((item) => {
            const badge = getStatusBadgeConfig(item.status);
            const isUnmasked = unmaskedIds[item.id];
            const displayPhone = isUnmasked ? item.phoneNumber : maskPhoneNumber(item.phoneNumber);

            return (
              <View
                key={item.id}
                style={[
                  styles.logItem,
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                ]}>
                <View style={styles.logTopRow}>
                  <View style={styles.phoneGroup}>
                    <ThemedText style={styles.phoneNumber}>{displayPhone}</ThemedText>
                    <Pressable
                      hitSlop={6}
                      onPress={() => toggleMask(item.id)}
                      style={styles.maskToggleBtn}>
                      <Text style={[styles.maskToggleText, { color: theme.textSecondary }]}>
                        {isUnmasked ? 'Hide' : 'Reveal'}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <ThemedText style={styles.reasonText}>{item.reason}</ThemedText>

                {item.messageSnippet ? (
                  <ThemedText style={styles.snippetText} numberOfLines={1}>
                    &quot;{item.messageSnippet}&quot;
                  </ThemedText>
                ) : null}

                <ThemedText style={styles.timestampText}>
                  {formatRelativeTimestamp(item.timestamp)}
                </ThemedText>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  logList: {
    gap: Spacing.two,
  },
  emptyBox: {
    padding: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
  logItem: {
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: 4,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  maskToggleBtn: {
    paddingHorizontal: 4,
  },
  maskToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.85,
  },
  snippetText: {
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.65,
  },
  timestampText: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 2,
  },
});

