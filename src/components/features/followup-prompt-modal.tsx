import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MessageTemplate, NumberRule } from '@/types/call-connect';
import { pickContactFromSystem } from '@/services/call-connect';

interface FollowUpPromptModalProps {
  visible: boolean;
  initialRecipient?: string;
  defaultMessage: string;
  templates: MessageTemplate[];
  savedRules: NumberRule[];
  onOpenComposer: (recipient: string, message: string) => void;
  onDismiss: () => void;
}

export function FollowUpPromptModal({
  visible,
  initialRecipient = '',
  defaultMessage,
  templates,
  savedRules,
  onOpenComposer,
  onDismiss,
}: FollowUpPromptModalProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [recipient, setRecipient] = useState(initialRecipient);
  const [selectedMessage, setSelectedMessage] = useState(defaultMessage);
  const [isPickingContact, setIsPickingContact] = useState(false);

  useEffect(() => {
    if (visible) {
      setRecipient(initialRecipient);
      setSelectedMessage(defaultMessage);
    }
  }, [visible, initialRecipient, defaultMessage]);

  const cleanRecipient = recipient.trim();
  const isValidRecipient = cleanRecipient.length >= 3;

  const handlePickContact = async () => {
    try {
      setIsPickingContact(true);
      const contact = await pickContactFromSystem();
      if (contact && contact.phoneNumber) {
        setRecipient(contact.phoneNumber);
      }
    } finally {
      setIsPickingContact(false);
    }
  };

  const handleOpenSms = () => {
    if (!isValidRecipient) return;
    onOpenComposer(cleanRecipient, selectedMessage);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <ThemedText style={styles.title}>Send Follow-Up SMS</ThemedText>
              <ThemedText style={styles.subtitle}>
                Review recipient and text before opening your SMS app
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss prompt"
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
            {/* Recipient Input Section */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.fieldLabel}>RECIPIENT PHONE NUMBER *</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pick contact from phone book"
                  onPress={handlePickContact}
                  disabled={isPickingContact}
                  style={({ pressed }) => [
                    styles.contactPickerBtn,
                    { opacity: pressed || isPickingContact ? 0.6 : 1 },
                  ]}>
                  <Text style={[styles.contactPickerText, { color: theme.primary }]}>
                    👤 Pick from Contacts
                  </Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: isValidRecipient ? theme.inputBorder : '#F59E0B',
                  },
                ]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter or paste phone number"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                  value={recipient}
                  onChangeText={setRecipient}
                  autoFocus
                />
                {recipient.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear recipient"
                    onPress={() => setRecipient('')}
                    style={styles.clearBtn}>
                    <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>✕</Text>
                  </Pressable>
                )}
              </View>

              {/* Safeguard status helper */}
              {!isValidRecipient ? (
                <Text style={styles.warningNote}>
                  ⚠️ Recipient required. CallConnect will never open a blank SMS draft.
                </Text>
              ) : (
                <Text style={[styles.successNote, { color: theme.statusSuccess }]}>
                  ✓ Valid recipient format. SMS will be prefilled to this number.
                </Text>
              )}

              {/* Quick Select Preset Chips */}
              {savedRules.length > 0 && (
                <View style={styles.presetsContainer}>
                  <Text style={[styles.presetsTitle, { color: theme.textSecondary }]}>
                    SAVED CONTACTS / RULES:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    {savedRules.map((rule) => (
                      <Pressable
                        key={rule.id}
                        onPress={() => setRecipient(rule.phoneNumber)}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor:
                              cleanRecipient === rule.phoneNumber
                                ? theme.primary
                                : theme.background,
                            borderColor: theme.cardBorder,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.presetChipText,
                            {
                              color:
                                cleanRecipient === rule.phoneNumber
                                  ? '#FFFFFF'
                                  : theme.text,
                            },
                          ]}>
                          {rule.label ? `${rule.label}: ` : ''}
                          {rule.phoneNumber}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Message Preview Section */}
            <View style={styles.section}>
              <ThemedText style={styles.fieldLabel}>FOLLOW-UP MESSAGE</ThemedText>
              <View
                style={[
                  styles.messagePreviewBox,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}>
                <TextInput
                  style={[styles.messageInput, { color: theme.text }]}
                  multiline
                  value={selectedMessage}
                  onChangeText={setSelectedMessage}
                  placeholder="Type follow-up message..."
                  placeholderTextColor={theme.textSecondary}
                />
                <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                  {selectedMessage.length} characters ({Math.ceil(selectedMessage.length / 160) || 1} SMS)
                </Text>
              </View>

              {/* Templates switcher */}
              {templates.length > 1 && (
                <View style={styles.templatesRow}>
                  <Text style={[styles.presetsTitle, { color: theme.textSecondary }]}>
                    SWITCH TEMPLATE:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    {templates.map((tpl) => {
                      const isChosen = selectedMessage === tpl.content;
                      return (
                        <Pressable
                          key={tpl.id}
                          onPress={() => setSelectedMessage(tpl.content)}
                          style={[
                            styles.presetChip,
                            {
                              backgroundColor: isChosen ? theme.primary : theme.background,
                              borderColor: theme.cardBorder,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.presetChipText,
                              { color: isChosen ? '#FFFFFF' : theme.text },
                            ]}>
                            {tpl.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss follow-up prompt"
              onPress={onDismiss}
              style={[styles.dismissBtn, { borderColor: theme.cardBorder }]}>
              <Text style={[styles.dismissBtnText, { color: theme.textSecondary }]}>Dismiss</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open system SMS app"
              disabled={!isValidRecipient}
              onPress={handleOpenSms}
              style={[
                styles.openSmsBtn,
                {
                  backgroundColor: isValidRecipient ? theme.primary : theme.inputBorder,
                  opacity: isValidRecipient ? 1 : 0.6,
                },
              ]}>
              <Text style={styles.openSmsBtnText}>Open in SMS App →</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderTopWidth: 1,
    maxHeight: '90%',
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
  closeButton: {
    padding: Spacing.one,
    marginLeft: Spacing.two,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
  },
  scrollInner: {
    paddingVertical: Spacing.two,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  contactPickerBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  contactPickerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  clearBtn: {
    padding: Spacing.one,
  },
  clearBtnText: {
    fontSize: 14,
  },
  warningNote: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  successNote: {
    fontSize: 12,
    fontWeight: '500',
  },
  presetsContainer: {
    marginTop: Spacing.one,
    gap: Spacing.one,
  },
  presetsTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  presetChip: {
    borderRadius: Radii.full,
    borderWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    marginRight: Spacing.two,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messagePreviewBox: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  messageInput: {
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
  },
  templatesRow: {
    marginTop: Spacing.one,
    gap: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  dismissBtn: {
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  dismissBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  openSmsBtn: {
    borderRadius: Radii.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  openSmsBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
