import React, { useState } from 'react';
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MessageTemplate } from '@/types/call-connect';

interface TemplatesManagerProps {
  templates: MessageTemplate[];
  activeMessage: string;
  onSelectTemplate: (template: MessageTemplate) => void;
  onSaveTemplate: (template: { id?: string; title: string; content: string }) => void;
  onDeleteTemplate: (templateId: string) => void;
  maxLength?: number;
}

export function TemplatesManager({
  templates,
  activeMessage,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  maxLength = 300,
}: TemplatesManagerProps) {
  // Modal states
  const [editorModalVisible, setEditorModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const openPreview = (tpl: MessageTemplate) => {
    setSelectedPreviewTemplate(tpl);
    setPreviewModalVisible(true);
  };

  const applyPreview = () => {
    if (selectedPreviewTemplate) {
      onSelectTemplate(selectedPreviewTemplate);
      setPreviewModalVisible(false);
    }
  };

  const openAddModal = () => {
    setEditingTemplate(null);
    setTitleInput('');
    setContentInput(activeMessage.trim() ? activeMessage : '');
    setEditorModalVisible(true);
  };

  const openEditModal = (tpl: MessageTemplate) => {
    setPreviewModalVisible(false);
    setEditingTemplate(tpl);
    setTitleInput(tpl.title);
    setContentInput(tpl.content);
    setEditorModalVisible(true);
  };

  const handleSave = () => {
    const cleanTitle = titleInput.trim();
    const cleanContent = contentInput.trim();

    if (!cleanTitle) {
      Alert.alert('Title Required', 'Please provide a short title for this template.');
      return;
    }
    if (!cleanContent) {
      Alert.alert('Message Required', 'Template content cannot be empty.');
      return;
    }
    if (cleanContent.length > maxLength) {
      Alert.alert('Too Long', `Message exceeds the ${maxLength}-character limit.`);
      return;
    }

    onSaveTemplate({
      id: editingTemplate ? editingTemplate.id : undefined,
      title: cleanTitle,
      content: cleanContent,
    });
    setEditorModalVisible(false);
  };

  const handleDelete = (tpl: MessageTemplate) => {
    setPreviewModalVisible(false);
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${tpl.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteTemplate(tpl.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <ThemedText style={styles.sectionTitle}>Message Templates</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Tap a template to preview or select as your active message
          </ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add new message template"
          onPress={openAddModal}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primaryLight, opacity: pressed ? 0.75 : 1 },
          ]}>
          <Text style={[styles.addButtonText, { color: theme.primary }]}>+ New</Text>
        </Pressable>
      </View>

      {/* Horizontal Chips / Compact Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollList}>
        {templates.map((tpl) => {
          const isSelected = activeMessage.trim() === tpl.content.trim();
          return (
            <Pressable
              key={tpl.id}
              accessibilityRole="button"
              accessibilityLabel={`Preview template ${tpl.title}`}
              onPress={() => openPreview(tpl)}
              style={({ pressed }) => [
                styles.templatePill,
                {
                  backgroundColor: isSelected ? theme.primaryLight : theme.cardBackground,
                  borderColor: isSelected ? theme.primary : theme.cardBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <View style={styles.pillHeader}>
                <ThemedText
                  style={[
                    styles.pillTitle,
                    isSelected && { color: theme.primary, fontWeight: '700' },
                  ]}
                  numberOfLines={1}>
                  {tpl.title}
                </ThemedText>
                {isSelected ? (
                  <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                ) : (
                  <Text style={[styles.previewTag, { color: theme.textSecondary }]}>Preview</Text>
                )}
              </View>
              <ThemedText style={styles.pillSnippet} numberOfLines={2}>
                {tpl.content}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Template Preview Modal */}
      {selectedPreviewTemplate && (
        <Modal
          visible={previewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView
              style={[
                styles.modalCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}>
              <View style={styles.modalHeaderRow}>
                <ThemedText style={styles.modalTitle}>
                  {selectedPreviewTemplate.title}
                </ThemedText>
                <Pressable
                  onPress={() => setPreviewModalVisible(false)}
                  hitSlop={8}
                  style={styles.closeIconBtn}>
                  <Text style={[styles.closeIconText, { color: theme.textSecondary }]}>✕</Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                ]}>
                <ThemedText style={styles.previewContent}>
                  {selectedPreviewTemplate.content}
                </ThemedText>
              </View>

              <View style={styles.previewMetaRow}>
                <Text style={[styles.charCountText, { color: theme.textSecondary }]}>
                  {selectedPreviewTemplate.content.length}/{maxLength} characters
                </Text>
                <View style={styles.previewButtonsRow}>
                  <Pressable
                    onPress={() => openEditModal(selectedPreviewTemplate)}
                    style={styles.textActionBtn}>
                    <Text style={[styles.textActionText, { color: theme.primary }]}>Edit</Text>
                  </Pressable>
                  {!selectedPreviewTemplate.isDefault && (
                    <Pressable
                      onPress={() => handleDelete(selectedPreviewTemplate)}
                      style={styles.textActionBtn}>
                      <Text style={[styles.textActionText, { color: '#EF4444' }]}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setPreviewModalVisible(false)}
                  style={[styles.modalButton, { borderColor: theme.cardBorder, borderWidth: 1 }]}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={applyPreview}
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {activeMessage.trim() === selectedPreviewTemplate.content.trim()
                      ? 'Currently Active'
                      : 'Use This Template'}
                  </Text>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>
      )}

      {/* Template Editor Modal */}
      <Modal
        visible={editorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView
            style={[
              styles.modalCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
            ]}>
            <ThemedText style={styles.modalTitle}>
              {editingTemplate ? 'Edit Template' : 'New Template'}
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Template Title</ThemedText>
              <TextInput
                style={[
                  styles.titleTextInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g. Work Callback, Friendly Hello"
                placeholderTextColor={theme.textSecondary}
                value={titleInput}
                onChangeText={setTitleInput}
                maxLength={40}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.counterRow}>
                <ThemedText style={styles.inputLabel}>Message Content</ThemedText>
                <ThemedText
                  style={[
                    styles.counterText,
                    contentInput.length > maxLength && { color: '#EF4444' },
                  ]}>
                  {contentInput.length}/{maxLength}
                </ThemedText>
              </View>
              <TextInput
                style={[
                  styles.contentTextInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="Enter SMS message text..."
                placeholderTextColor={theme.textSecondary}
                value={contentInput}
                onChangeText={setContentInput}
                multiline
                numberOfLines={4}
                maxLength={maxLength}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditorModalVisible(false)}
                style={[styles.modalButton, { borderColor: theme.cardBorder, borderWidth: 1 }]}>
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Template</Text>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radii.full,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalScrollList: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  templatePill: {
    width: 200,
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    gap: Spacing.one + 2,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
    marginLeft: 6,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  previewTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  pillSnippet: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.75,
    minHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radii.xl,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.three,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  closeIconBtn: {
    padding: 4,
  },
  closeIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewBox: {
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  previewContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCountText: {
    fontSize: 11,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  textActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  textActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 11,
    opacity: 0.6,
  },
  titleTextInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  contentTextInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radii.lg,
  },
});
