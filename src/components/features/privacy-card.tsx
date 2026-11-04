import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PrivacyCardProps {
  onClearActivityData: () => void;
  onResetAllSettings: () => void;
  onRevisitWelcome?: () => void;
}

export function PrivacyCard({
  onClearActivityData,
  onResetAllSettings,
  onRevisitWelcome,
}: PrivacyCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const confirmReset = () => {
    Alert.alert(
      'Reset All Settings',
      'This will restore default messages, remove all custom templates and rules, and reset quiet hours. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: onResetAllSettings,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Privacy & Settings</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your communications never leave your device
        </ThemedText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
        ]}>
        <View style={styles.pointRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <View style={styles.pointTextCol}>
            <ThemedText style={styles.pointTitle}>100% On-Device Processing</ThemedText>
            <ThemedText style={styles.pointDesc}>
              Settings, templates, rules, and call logs are stored locally in your phone&apos;s encrypted internal storage.
            </ThemedText>
          </View>
        </View>

        <View style={styles.pointRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <View style={styles.pointTextCol}>
            <ThemedText style={styles.pointTitle}>Zero Cloud Telemetry</ThemedText>
            <ThemedText style={styles.pointDesc}>
              CallConnect contains no analytics, ad frameworks, crash log uploaders, or third-party network APIs.
            </ThemedText>
          </View>
        </View>

        <View style={styles.pointRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <View style={styles.pointTextCol}>
            <ThemedText style={styles.pointTitle}>User-Confirmed SMS Dispatch</ThemedText>
            <ThemedText style={styles.pointDesc}>
              Messages are always confirmed by you in your default SMS app. CallConnect never sends background SMS or reads restricted call logs.
            </ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {onRevisitWelcome && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View welcome guide tour"
              onPress={onRevisitWelcome}
              style={[styles.actionBtn, { borderColor: theme.cardBorder, borderWidth: 1 }]}>
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                Welcome Tour
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear activity log data"
            onPress={onClearActivityData}
            style={[styles.actionBtn, { borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
              Clear Logs
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset all settings to default"
            onPress={confirmReset}
            style={[styles.actionBtn, { borderColor: '#FCA5A5', borderWidth: 1 }]}>
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>
              Reset All
            </Text>
          </Pressable>
        </View>
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Radii.xl,
    borderWidth: 1,
    gap: Spacing.three,
  },
  pointRow: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
  },
  checkIcon: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '800',
    marginTop: 2,
  },
  pointTextCol: {
    flex: 1,
    gap: 2,
  },
  pointTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  pointDesc: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
