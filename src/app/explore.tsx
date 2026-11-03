import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/styles/responsive';

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const responsive = useResponsive();

  const insets = useMemo(
    () => ({
      ...safeAreaInsets,
      bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
    }),
    [safeAreaInsets]
  );

  const contentPlatformStyle = useMemo(
    () =>
      Platform.select({
        android: {
          paddingTop: insets.top + Spacing.two,
          paddingLeft: responsive.horizontalPadding,
          paddingRight: responsive.horizontalPadding,
          paddingBottom: insets.bottom,
        },
        default: {
          paddingTop: Spacing.six,
          paddingLeft: responsive.horizontalPadding,
          paddingRight: responsive.horizontalPadding,
          paddingBottom: insets.bottom,
        },
      }),
    [insets.top, insets.bottom, responsive.horizontalPadding]
  );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      showsVerticalScrollIndicator={false}>
      <ThemedView style={[styles.container, { maxWidth: responsive.contentMaxWidth }]}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">About CallConnect</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            A private, on-device assistant that delivers a thoughtful follow-up message after completed phone calls.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="How Call-End Detection Works">
            <ThemedText type="small">
              CallConnect uses Android&apos;s telephony broadcast subsystem to track call lifecycle states:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText type="small">• <ThemedText type="smallBold">Answered calls only:</ThemedText> Follow-ups trigger only when a call transitions from Ringing to Off-hook (answered) and then to Idle (ended).</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">Missed & rejected calls:</ThemedText> If an incoming call rings and ends without being answered, CallConnect discards the event with zero SMS sent.</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">Duplicate protection:</ThemedText> Multiple broadcasts within a 15-second window for the same number are automatically deduplicated.</ThemedText>
            </View>
          </Collapsible>

          <Collapsible title="Permissions & Google Play Policy">
            <ThemedText type="small">
              Android restricts background phone state and SMS capabilities to protect user privacy:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText type="small">• <ThemedText type="smallBold">READ_PHONE_STATE & READ_CALL_LOG:</ThemedText> Required to detect when a call starts and ends, and to read the caller&apos;s phone number on Android 9+.</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">SEND_SMS:</ThemedText> Allows direct background SMS transmission. Restricted by Google Play policy to default SMS/Phone apps or narrow declared exemptions.</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">Interactive Composer Fallback:</ThemedText> If direct SEND_SMS is not granted, CallConnect provides a compliant 1-tap notification that opens your system SMS app with recipient and text prefilled.</ThemedText>
            </View>
          </Collapsible>

          <Collapsible title="Privacy Guarantee">
            <ThemedText type="small">
              Your communications remain strictly confidential:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText type="small">• <ThemedText type="smallBold">100% On-Device:</ThemedText> All settings, caller numbers, and message bodies are stored locally in Android SharedPreferences and AsyncStorage.</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">No Tracking:</ThemedText> No analytics, crash telemetry, remote servers, or ad SDKs are included.</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">Private numbers:</ThemedText> Unknown, private, or restricted callers are ignored and never messaged.</ThemedText>
            </View>
          </Collapsible>

          <Collapsible title="Background Reliability & Limitations">
            <ThemedText type="small">
              Android&apos;s battery management and process lifecycle affect background receivers:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText type="small">• <ThemedText type="smallBold">App Standby & Doze:</ThemedText> For maximum reliability on devices from Samsung, Xiaomi, or Pixel, consider disabling battery optimization for CallConnect in Android Settings.</ThemedText>
              <ThemedText type="small">• <ThemedText type="smallBold">Force-stop:</ThemedText> Android will not deliver telephony broadcasts to apps that have been explicitly Force Stopped by the user until reopened.</ThemedText>
            </View>
          </Collapsible>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.two,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  centerText: {
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    paddingHorizontal: Spacing.three,
  },
  sectionsWrapper: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  bulletList: {
    marginTop: Spacing.two,
    gap: Spacing.one + 2,
  },
});
