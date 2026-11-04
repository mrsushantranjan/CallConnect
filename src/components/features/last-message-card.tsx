import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityLogItem, LastMessageRecord } from '@/types/call-connect';
import { formatRelativeTimestamp, maskPhoneNumber } from '@/utils/call-connect-helpers';

interface LastMessageCardProps {
  lastMessage?: LastMessageRecord | null;
  lastLog?: ActivityLogItem | null;
}

export function LastMessageCard({ lastMessage, lastLog }: LastMessageCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const record = lastMessage || lastLog || null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'composer_opened':
        return theme.statusSuccess;
      case 'prompted':
      case 'pending':
        return theme.primary;
      case 'skipped':
        return theme.statusWarning;
      case 'cancelled':
        return theme.textSecondary;
      case 'simulated':
        return '#8B5CF6';
      case 'failed':
      default:
        return '#EF4444';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'composer_opened':
        return 'OPENED IN SMS';
      case 'prompted':
        return 'PROMPT READY';
      case 'sent':
        return 'SENT';
      case 'pending':
        return 'PENDING';
      case 'cancelled':
        return 'CANCELLED';
      case 'simulated':
        return 'SIMULATED';
      case 'skipped':
        return 'SKIPPED';
      case 'failed':
        return 'FAILED';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
      ]}>
      <View style={styles.topRow}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LAST FOLLOW-UP</Text>
        {record && (
          <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
            {formatRelativeTimestamp(record.timestamp)}
          </Text>
        )}
      </View>

      {record ? (
        <View style={styles.contentRow}>
          <View style={styles.mainInfo}>
            <View style={styles.recipientRow}>
              <Text style={[styles.recipientNumber, { color: theme.text }]}>
                {maskPhoneNumber(record.phoneNumber)}
              </Text>
              <View style={styles.dotSeparator} />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(record.status) },
                ]}>
                {getStatusLabel(record.status)}
              </Text>
            </View>

            {record.messageSnippet ? (
              <Text
                style={[styles.snippetText, { color: theme.textSecondary }]}
                numberOfLines={1}>
                &quot;{record.messageSnippet}&quot;
              </Text>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.emptyRow}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No follow-ups sent yet. Your latest activity will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  mainInfo: {
    flex: 1,
    gap: 3,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipientNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  snippetText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyRow: {
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
  },
});
