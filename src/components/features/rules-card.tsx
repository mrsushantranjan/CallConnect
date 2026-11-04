import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NumberRule, RulesMode } from '@/types/call-connect';
import { normalizePhoneNumber } from '@/utils/call-connect-helpers';

interface RulesCardProps {
  mode: RulesMode;
  rules: NumberRule[];
  onChangeMode: (mode: RulesMode) => void;
  onAddRule: (phoneNumber: string, label?: string) => void;
  onRemoveRule: (id: string) => void;
}

export function RulesCard({
  mode,
  rules,
  onChangeMode,
  onAddRule,
  onRemoveRule,
}: RulesCardProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [labelInput, setLabelInput] = useState('');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleAdd = () => {
    const cleanPhone = phoneInput.trim();
    const cleanLabel = labelInput.trim();

    if (!cleanPhone) {
      Alert.alert('Phone Number Required', 'Please enter a valid phone number.');
      return;
    }

    const normalized = normalizePhoneNumber(cleanPhone);
    if (normalized.length < 3) {
      Alert.alert('Invalid Number', 'Please enter at least 3 digits.');
      return;
    }

    const alreadyExists = rules.some(
      (r) => normalizePhoneNumber(r.phoneNumber) === normalized
    );
    if (alreadyExists) {
      Alert.alert('Already Listed', 'This phone number is already configured in your rules.');
      return;
    }

    onAddRule(cleanPhone, cleanLabel || undefined);
    setPhoneInput('');
    setLabelInput('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Contact & Number Rules</ThemedText>
        <ThemedText style={styles.subtitle}>
          Control which phone numbers are allowed or blocked from auto-replies
        </ThemedText>
      </View>

      {/* Mode Segment Switch */}
      <View style={[styles.segmentContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exclude Mode: block listed numbers"
          onPress={() => onChangeMode('exclude')}
          style={[
            styles.segmentBtn,
            mode === 'exclude' && [styles.segmentBtnActive, { backgroundColor: theme.primary }],
          ]}>
          <Text
            style={[
              styles.segmentText,
              { color: mode === 'exclude' ? '#FFFFFF' : theme.textSecondary },
              mode === 'exclude' && styles.segmentTextActive,
            ]}>
            Blocklist Mode
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Allowlist Mode: only reply to listed numbers"
          onPress={() => onChangeMode('allowlist')}
          style={[
            styles.segmentBtn,
            mode === 'allowlist' && [styles.segmentBtnActive, { backgroundColor: theme.primary }],
          ]}>
          <Text
            style={[
              styles.segmentText,
              { color: mode === 'allowlist' ? '#FFFFFF' : theme.textSecondary },
              mode === 'allowlist' && styles.segmentTextActive,
            ]}>
            Allowlist Mode
          </Text>
        </Pressable>
      </View>

      <ThemedText style={styles.modeDescription}>
        {mode === 'exclude'
          ? '• Reply to everyone EXCEPT numbers on this list.'
          : '• ONLY reply to numbers explicitly added to this list.'}
      </ThemedText>

      {/* Add Rule Inputs */}
      <View style={styles.inputsRow}>
        <TextInput
          style={[
            styles.phoneInput,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Phone number (+1 555 1234)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="phone-pad"
          value={phoneInput}
          onChangeText={setPhoneInput}
        />
        <TextInput
          style={[
            styles.labelInput,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Label (e.g. VIP, Office)"
          placeholderTextColor={theme.textSecondary}
          value={labelInput}
          onChangeText={setLabelInput}
          maxLength={20}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add number rule"
          onPress={handleAdd}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
          ]}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {/* Rules List */}
      <View style={styles.rulesList}>
        {rules.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
            <ThemedText style={styles.emptyText}>
              {mode === 'exclude'
                ? 'No numbers blocked. All callers will receive follow-up SMS.'
                : 'No numbers allowlisted. Auto-replies are paused until numbers are added.'}
            </ThemedText>
          </View>
        ) : (
          rules.map((rule) => (
            <View
              key={rule.id}
              style={[
                styles.ruleItem,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}>
              <View style={styles.ruleInfo}>
                <ThemedText style={styles.ruleNumber}>{rule.phoneNumber}</ThemedText>
                {rule.label ? (
                  <View style={[styles.labelBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.labelText, { color: theme.primary }]}>
                      {rule.label}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => onRemoveRule(rule.id)}
                style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
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
    fontSize: 12,
    opacity: 0.7,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Radii.md,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTextActive: {
    fontWeight: '700',
  },
  modeDescription: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  phoneInput: {
    flex: 1.3,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 13,
  },
  labelInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rulesList: {
    gap: Spacing.two,
  },
  emptyBox: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  ruleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  ruleNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});

