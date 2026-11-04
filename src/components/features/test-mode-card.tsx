import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TestModeCardProps {
  testModeEnabled: boolean;
  onToggleTestMode: (val: boolean) => void;
  onRunSimulation: (phoneNumber: string) => Promise<{ success: boolean; status: string }>;
}

export function TestModeCard({
  testModeEnabled,
  onToggleTestMode,
  onRunSimulation,
}: TestModeCardProps) {
  const [simNumber, setSimNumber] = useState('+1 555-0199');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await onRunSimulation(simNumber);
      setSimulationResult(res.status);
    } catch {
      Alert.alert('Simulation Failed', 'Could not run the simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <ThemedText style={styles.title}>Test Mode & Simulator</ThemedText>
          <ThemedText style={styles.subtitle}>
            Preview follow-up behavior without sending real SMS or using carrier credit
          </ThemedText>
        </View>
        <Switch
          value={testModeEnabled}
          onValueChange={onToggleTestMode}
          trackColor={{ false: theme.statusInactiveBorder, true: '#F59E0B' }}
          thumbColor={testModeEnabled ? '#FFFFFF' : '#F4F3F4'}
        />
      </View>

      {/* Warning banner when Test Mode is active */}
      {testModeEnabled && (
        <View style={[styles.warningBanner, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
          <Text style={styles.warningTitle}>⚠️ TEST MODE ACTIVE</Text>
          <Text style={styles.warningBody}>
            When an outgoing call ends, CallConnect will log the event and post a preview notification, but NO real SMS will be sent.
          </Text>
        </View>
      )}

      {/* Interactive Simulator */}
      <View
        style={[
          styles.simBox,
          { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
        ]}>
        <ThemedText style={styles.simTitle}>Simulate Completed Call</ThemedText>
        <ThemedText style={styles.simDescription}>
          Test rule evaluation, quiet hours check, and follow-up templates safely:
        </ThemedText>

        <View style={styles.simInputRow}>
          <TextInput
            style={[
              styles.numberInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Caller number (e.g. +1 555-0199)"
            placeholderTextColor={theme.textSecondary}
            value={simNumber}
            onChangeText={setSimNumber}
            keyboardType="phone-pad"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Simulate call end"
            disabled={isSimulating}
            onPress={handleSimulate}
            style={({ pressed }) => [
              styles.simButton,
              { backgroundColor: theme.primary, opacity: isSimulating ? 0.6 : pressed ? 0.8 : 1 },
            ]}>
            {isSimulating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.simButtonText}>Test Run</Text>
            )}
          </Pressable>
        </View>

        {simulationResult && (
          <View
            style={[
              styles.resultBox,
              { backgroundColor: theme.infoBg, borderColor: theme.infoBorder },
            ]}>
            <Text style={[styles.resultText, { color: theme.infoText }]}>
              {simulationResult}
            </Text>
          </View>
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
  warningBanner: {
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    gap: 4,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  warningBody: {
    fontSize: 12,
    lineHeight: 16,
    color: '#78350F',
  },
  simBox: {
    padding: Spacing.three,
    borderRadius: Radii.xl,
    borderWidth: 1,
    gap: Spacing.two,
  },
  simTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  simDescription: {
    fontSize: 12,
    opacity: 0.75,
    lineHeight: 16,
  },
  simInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 2,
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 13,
  },
  simButton: {
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md,
    minWidth: 90,
  },
  simButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  resultBox: {
    padding: Spacing.two + 2,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});

