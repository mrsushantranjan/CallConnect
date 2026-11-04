import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MessageTemplate } from '@/types/call-connect';

interface MessageSheetModalProps {
  visible: boolean;
  currentMessage: string;
  templates: MessageTemplate[];
  onClose: () => void;
  onSave: (newMessage: string) => void;
  onSaveNewTemplate: (template: { title: string; content: string }) => void;
  maxLength?: number;
  defaultMessage: string;
}

export function MessageSheetModal({
  visible,
  currentMessage,
  templates,
  onClose,
  onSave,
  onSaveNewTemplate,
  maxLength = 300,
  defaultMessage,
}: MessageSheetModalProps) {
  const [draftMessage, setDraftMessage] = useState(currentMessage);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (visible) {
      setDraftMessage(currentMessage);
      setShowAddTemplate(false);
      setNewTemplateTitle('');
    }
  }, [visible, currentMessage]);

  const handleApplyTemplate = (tpl: MessageTemplate) => {
    setDraftMessage(tpl.content);
  };

  const handleSaveDraft = () => {
    const clean = draftMessage.trim();
    if (!clean) {
      Alert.alert('Message Required', 'Follow-up message cannot be empty.');
      return;
    }
    if (clean.length > maxLength) {
      Alert.alert('Too Long', `Message exceeds the ${maxLength}-character limit.`);
      return;
    }
    onSave(clean);
    onClose();
  };

  const handleCreateTemplate = () => {
    const cleanTitle = newTemplateTitle.trim();
    const cleanContent = draftMessage.trim();

    if (!cleanTitle) {
      Alert.alert('Title Required', 'Please enter a short template title.');
      return;
    }
    if (!cleanContent) {
      Alert.alert('Message Required', 'Please type a message to save as a template.');
      return;
    }

    onSaveNewTemplate({ title: cleanTitle, content: cleanContent });
    setShowAddTemplate(false);
    setNewTemplateTitle('');
    Alert.alert('Template Saved', `"${cleanTitle}" was added to your templates.`);
  };

  const charCount = draftMessage.length;
  const isOverLimit = charCount > maxLength;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
          ]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Change Message</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Pick a template or customize your follow-up SMS
              </Text>
            </View>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          {/* Quick Template Chips */}
          <View style={styles.templatesSection}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>PRESETS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}>
              {templates.map((tpl) => {
                const isMatching = draftMessage.trim() === tpl.content.trim();
                return (
                  <Pressable
                    key={tpl.id}
                    onPress={() => handleApplyTemplate(tpl)}
                    style={[
                      styles.templateChip,
                      {
                        backgroundColor: isMatching ? theme.primary : theme.inputBackground,
                        borderColor: isMatching ? theme.primary : theme.inputBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.templateChipText,
                        {
                          color: isMatching ? '#FFFFFF' : theme.text,
                          fontWeight: isMatching ? '700' : '500',
                        },
                      ]}>
                      {tpl.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Message Editor */}
          <View style={styles.editorSection}>
            <View style={styles.editorHeaderRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>SMS BODY</Text>
              <Text
                style={[
                  styles.counterText,
                  { color: isOverLimit ? '#EF4444' : theme.textSecondary },
                ]}>
                {charCount}/{maxLength}
              </Text>
            </View>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              multiline
              numberOfLines={4}
              maxLength={maxLength + 20}
              value={draftMessage}
              onChangeText={setDraftMessage}
              placeholder="Type your follow-up message..."
              placeholderTextColor={theme.textSecondary}
              textAlignVertical="top"
            />
          </View>

          {/* Save as Template / Reset Default Row */}
          <View style={styles.helperActionsRow}>
            <Pressable
              onPress={() => setDraftMessage(defaultMessage)}
              style={styles.subActionBtn}>
              <Text style={[styles.subActionText, { color: theme.textSecondary }]}>
                Reset to default
              </Text>
            </Pressable>

            {!showAddTemplate ? (
              <Pressable
                onPress={() => setShowAddTemplate(true)}
                style={styles.subActionBtn}>
                <Text style={[styles.subActionText, { color: theme.primary }]}>
                  + Save as new template
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Add Template Inline Form */}
          {showAddTemplate && (
            <View style={[styles.addTemplateBox, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Text style={[styles.addTemplateLabel, { color: theme.textSecondary }]}>
                NAME THIS TEMPLATE:
              </Text>
              <View style={styles.addTemplateInputRow}>
                <TextInput
                  style={[styles.addTemplateInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.inputBorder }]}
                  placeholder="e.g. Sales, Appointment, Casual"
                  placeholderTextColor={theme.textSecondary}
                  value={newTemplateTitle}
                  onChangeText={setNewTemplateTitle}
                  maxLength={30}
                />
                <Pressable
                  onPress={handleCreateTemplate}
                  style={[styles.addTemplateConfirmBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.addTemplateConfirmText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Bottom Actions */}
          <View style={styles.bottomButtonsRow}>
            <Pressable
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}>
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSaveDraft}
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.saveBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  templatesSection: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipsScroll: {
    gap: Spacing.two,
    paddingVertical: 4,
  },
  templateChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  templateChipText: {
    fontSize: 12,
  },
  editorSection: {
    gap: Spacing.one,
  },
  editorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 90,
  },
  helperActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subActionBtn: {
    paddingVertical: 2,
  },
  subActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addTemplateBox: {
    padding: Spacing.two + 2,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: 6,
  },
  addTemplateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addTemplateInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  addTemplateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: 13,
  },
  addTemplateConfirmBtn: {
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTemplateConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: Spacing.four + 4,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

