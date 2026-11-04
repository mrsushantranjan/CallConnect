import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PendingSmsInfo } from '@/types/call-connect';
import { DELAY_OPTIONS, maskPhoneNumber } from '@/utils/call-connect-helpers';

interface DelayCardProps {
  delaySeconds: number;
  onSelectDelay: (seconds: number) => void;
  pendingSms: PendingSmsInfo;
  onCancelPending: () => void;
}

export function DelayCard({
  delaySeconds,
  onSelectDelay,
  pendingSms,
  onCancelPending,
}: DelayCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      {/* Active Pending Delayed Send Alert Banner */}
      {pendingSms.isPending && (
        <View style={[styles.pendingBanner, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
          <View style={styles.pendingTextGroup}>
            <Text style={styles.pendingBadge}>SENDING IN {pendingSms.secondsRemaining}s</Text>
            <Text style={styles.pendingTitle}>
              {pendingSms.phoneNumber ? `Auto-sending to ${maskPhoneNumber(pendingSms.phoneNumber)}` : 'Auto-sending message...'}
            </Text>
            <Text style={styles.pendingSnippet} numberOfLines={1}>
              &ldquo;{pendingSms.message}&rdquo;
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel pending automatic SMS send"
            onPress={onCancelPending}
            style={({ pressed }) => [
              styles.cancelButton,
              { backgroundColor: '#DC2626', opacity: pressed ? 0.8 : 1 },
            ]}>
            <Text style={styles.cancelButtonText}>Cancel Send</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.header}>
        <ThemedText style={styles.title}>Send Delay & Cancel Window</ThemedText>
        <ThemedText style={styles.subtitle}>
          Set a grace period before the automatic message sends after a call concludes
        </ThemedText>
      </View>

      <View style={styles.pillsRow}>
        {DELAY_OPTIONS.map((opt) => {
          const isSelected = delaySeconds === opt.value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Delay ${opt.label}`}
              onPress={() => onSelectDelay(opt.value)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                  borderColor: isSelected ? theme.primary : theme.inputBorder,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.infoBg, borderColor: theme.infoBorder }]}>
        <ThemedText style={[styles.infoText, { color: theme.infoText }]}>
          • <Text style={{ fontWeight: '600' }}>Cancel window:</Text> While the countdown is running, an ongoing notification allows you to cancel sending with 1 tap.{'\n'}
          • <Text style={{ fontWeight: '600' }}>Platform reliability:</Text> Uses Android&apos;s AlarmManager so scheduled messages send even if the screen is turned off.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    gap: Spacing.two,
  },
  pendingTextGroup: {
    flex: 1,
    gap: 2,
  },
  pendingBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  pendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  pendingSnippet: {
    fontSize: 12,
    color: '#78350F',
    opacity: 0.85,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.md,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
    fontSize: 12,
    opacity: 0.7,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  infoBox: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
