import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { QuietHoursConfig } from '@/types/call-connect';
import { formatTime, isCurrentlyInQuietHours } from '@/utils/call-connect-helpers';

interface QuietHoursCardProps {
  config: QuietHoursConfig;
  onChangeConfig: (newConfig: QuietHoursConfig) => void;
}

export function QuietHoursCard({ config, onChangeConfig }: QuietHoursCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const isCurrentlyActive = isCurrentlyInQuietHours(config);

  const toggleEnabled = (val: boolean) => {
    onChangeConfig({ ...config, enabled: val });
  };

  const adjustHour = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') {
      const next = (config.startHour + delta + 24) % 24;
      onChangeConfig({ ...config, startHour: next });
    } else {
      const next = (config.endHour + delta + 24) % 24;
      onChangeConfig({ ...config, endHour: next });
    }
  };

  const adjustMinute = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') {
      const next = (config.startMinute + delta + 60) % 60;
      onChangeConfig({ ...config, startMinute: next });
    } else {
      const next = (config.endMinute + delta + 60) % 60;
      onChangeConfig({ ...config, endMinute: next });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <ThemedText style={styles.title}>Quiet Hours</ThemedText>
          <ThemedText style={styles.subtitle}>
            Pause automatic SMS replies during night hours or personal time
          </ThemedText>
        </View>
        <Switch
          value={config.enabled}
          onValueChange={toggleEnabled}
          trackColor={{ false: theme.statusInactiveBorder, true: theme.primary }}
          thumbColor={config.enabled ? '#FFFFFF' : '#F4F3F4'}
        />
      </View>

      {/* Live Status Pill */}
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: !config.enabled
              ? theme.inputBackground
              : isCurrentlyActive
              ? theme.statusWarningBg
              : theme.statusSuccessBg,
            borderColor: !config.enabled
              ? theme.inputBorder
              : isCurrentlyActive
              ? theme.statusWarningBorder
              : theme.statusSuccessBorder,
          },
        ]}>
        <ThemedText
          style={[
            styles.statusPillText,
            {
              color: !config.enabled
                ? theme.textSecondary
                : isCurrentlyActive
                ? theme.statusWarning
                : theme.statusSuccess,
            },
          ]}>
          {!config.enabled
            ? 'Quiet Hours Disabled'
            : isCurrentlyActive
            ? '🌙 Active Now — Auto-replies paused'
            : `☀️ Scheduled (${formatTime(config.startHour, config.startMinute)} – ${formatTime(config.endHour, config.endMinute)})`}
        </ThemedText>
      </View>

      {/* Time Selectors */}
      <View
        style={[
          styles.timeControlsCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            opacity: config.enabled ? 1 : 0.6,
          },
        ]}
        pointerEvents={config.enabled ? 'auto' : 'none'}>
        <View style={styles.timeRow}>
          <View style={styles.timeLabelCol}>
            <ThemedText style={styles.timeTypeTitle}>Start Time</ThemedText>
            <ThemedText style={styles.timeDisplay}>
              {formatTime(config.startHour, config.startMinute)}
            </ThemedText>
          </View>
          <View style={styles.stepperGroup}>
            <View style={styles.stepperItem}>
              <Text style={[styles.stepperLabel, { color: theme.textSecondary }]}>HR</Text>
              <Pressable
                onPress={() => adjustHour('start', -1)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>-</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustHour('start', 1)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
              </Pressable>
            </View>
            <View style={styles.stepperItem}>
              <Text style={[styles.stepperLabel, { color: theme.textSecondary }]}>MIN</Text>
              <Pressable
                onPress={() => adjustMinute('start', -15)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>-</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustMinute('start', 15)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        <View style={styles.timeRow}>
          <View style={styles.timeLabelCol}>
            <ThemedText style={styles.timeTypeTitle}>End Time</ThemedText>
            <ThemedText style={styles.timeDisplay}>
              {formatTime(config.endHour, config.endMinute)}
            </ThemedText>
          </View>
          <View style={styles.stepperGroup}>
            <View style={styles.stepperItem}>
              <Text style={[styles.stepperLabel, { color: theme.textSecondary }]}>HR</Text>
              <Pressable
                onPress={() => adjustHour('end', -1)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>-</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustHour('end', 1)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
              </Pressable>
            </View>
            <View style={styles.stepperItem}>
              <Text style={[styles.stepperLabel, { color: theme.textSecondary }]}>MIN</Text>
              <Pressable
                onPress={() => adjustMinute('end', -15)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>-</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustMinute('end', 15)}
                style={[styles.stepBtn, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <ThemedText style={styles.midnightNotice}>
        Supports ranges that cross midnight (e.g. 10:00 PM to 7:00 AM).
      </ThemedText>
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
    marginRight: Spacing.two,
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
  statusPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  timeControlsCard: {
    padding: Spacing.three,
    borderRadius: Radii.xl,
    borderWidth: 1,
    gap: Spacing.three,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabelCol: {
    gap: 2,
  },
  timeTypeTitle: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timeDisplay: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepperGroup: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stepperItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginRight: 2,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  midnightNotice: {
    fontSize: 11,
    opacity: 0.6,
    lineHeight: 15,
  },
});

