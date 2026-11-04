import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DelayCard } from '@/components/features/delay-card';
import { PermissionsCard } from '@/components/features/permissions-card';
import { PrivacyCard } from '@/components/features/privacy-card';
import { QuietHoursCard } from '@/components/features/quiet-hours-card';
import { RulesCard } from '@/components/features/rules-card';
import { TemplatesManager } from '@/components/features/templates-manager';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Colors, Radii, Spacing } from '@/constants/theme';
import { useCallConnect } from '@/context/call-connect-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/styles/responsive';

export default function SettingsScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const responsive = useResponsive();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const {
    enabled,
    message,
    templates,
    delaySeconds,
    rulesMode,
    rulesList,
    quietHours,
    pendingSms,
    permissions,
    isDefaultSms,
    requestDefaultSmsRole,
    testModeEnabled,
    isQuietHoursActive,
    selectTemplate,
    saveTemplate,
    deleteTemplate,
    updateDelay,
    cancelPending,
    updateRulesMode,
    addRuleNumber,
    deleteRuleNumber,
    updateQuietHours,
    clearActivityLogs,
    requestPermissions,
    openSettings,
    resetAllSettings,
    setShowWelcomeTour,
  } = useCallConnect();

  const insets = useMemo(
    () => ({
      ...safeAreaInsets,
      bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
    }),
    [safeAreaInsets]
  );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? Spacing.two : Spacing.four),
          paddingBottom: insets.bottom,
          paddingLeft: responsive.horizontalPadding,
          paddingRight: responsive.horizontalPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.innerContainer, { maxWidth: responsive.contentMaxWidth }]}>
        
        {/* Modern Top Header Bar */}
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.navigate('/');
              }
            }}>
            <Text style={[styles.backButtonArrow, { color: theme.primary }]}>←</Text>
            <ThemedText style={styles.backButtonText} themeColor="primary">
              Home
            </ThemedText>
          </Pressable>

          <View style={styles.titleWrapper}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Settings & Rules
            </ThemedText>
          </View>
        </View>

        {/* SECTION 1: Message Templates */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionIconText, { color: theme.primary }]}>📝</Text>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
              MESSAGE TEMPLATES
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.sectionBadgeText, { color: theme.primary }]}>{templates.length} Saved</Text>
            </View>
          </View>
          <TemplatesManager
            templates={templates}
            activeMessage={message}
            onSelectTemplate={selectTemplate}
            onSaveTemplate={saveTemplate}
            onDeleteTemplate={deleteTemplate}
          />
        </View>

        {/* SECTION 2: Delay & Cancellation */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionIconText, { color: theme.primary }]}>⏱️</Text>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
              SEND DELAY & TIMER
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.sectionBadgeText, { color: theme.primary }]}>
                {delaySeconds === 0 ? 'Instant' : `${delaySeconds}s Delay`}
              </Text>
            </View>
          </View>
          <DelayCard
            delaySeconds={delaySeconds}
            onSelectDelay={updateDelay}
            pendingSms={pendingSms}
            onCancelPending={cancelPending}
          />
        </View>

        {/* SECTION 3: Allowlist / Blocklist Rules */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionIconText, { color: theme.primary }]}>🛡️</Text>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
              CONTACT & NUMBER RULES
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.sectionBadgeText, { color: theme.primary }]}>
                {rulesMode === 'exclude' ? 'Blocklist' : 'Allowlist'}
              </Text>
            </View>
          </View>
          <RulesCard
            mode={rulesMode}
            rules={rulesList}
            onChangeMode={updateRulesMode}
            onAddRule={addRuleNumber}
            onRemoveRule={deleteRuleNumber}
          />
        </View>

        {/* SECTION 4: Quiet Hours */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionIconText, { color: theme.primary }]}>🌙</Text>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
              SCHEDULED QUIET HOURS
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: quietHours.enabled ? theme.statusSuccessBg : theme.backgroundElement }]}>
              <Text style={[styles.sectionBadgeText, { color: quietHours.enabled ? theme.statusSuccess : theme.textSecondary }]}>
                {quietHours.enabled ? 'Enabled' : 'Off'}
              </Text>
            </View>
          </View>
          <QuietHoursCard config={quietHours} onChangeConfig={updateQuietHours} />
        </View>

        {/* SECTION 5: Permissions & App Tour */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionIconText, { color: theme.primary }]}>🔒</Text>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
              PERMISSIONS & PRIVACY
            </Text>
          </View>
          <PermissionsCard
            permissions={permissions}
            onRequestPermissions={requestPermissions}
            onRequestDefaultSmsRole={requestDefaultSmsRole}
            onOpenSettings={openSettings}
            isAutoReplyEnabled={enabled}
            isQuietHoursActive={isQuietHoursActive}
            isTestMode={testModeEnabled}
            isDefaultSms={isDefaultSms}
          />
          <View style={{ marginTop: Spacing.four }}>
            <PrivacyCard
              onClearActivityData={clearActivityLogs}
              onResetAllSettings={resetAllSettings}
              onRevisitWelcome={() => {
                setShowWelcomeTour(true);
                router.navigate('/');
              }}
            />
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  backButtonArrow: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  sectionIconText: {
    fontSize: 16,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1,
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
