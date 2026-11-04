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

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/styles/responsive';

type AppTheme = typeof Colors.light | typeof Colors.dark;

interface CallTriggerCardProps {
  icon: string;
  title: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  summary: string;
  idealFor: string;
  theme: AppTheme;
}

function CallTriggerCard({
  icon,
  title,
  badge,
  badgeBg,
  badgeColor,
  summary,
  idealFor,
  theme,
}: CallTriggerCardProps) {
  return (
    <View
      style={[
        styles.triggerCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
        },
      ]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.cardIcon}>{icon}</Text>
        </View>
        <View style={styles.cardTitleWrap}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.cardSummary, { color: theme.textSecondary }]}>
        {summary}
      </Text>
      <View style={[styles.idealForBox, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.idealForLabel, { color: theme.primary }]}>Best for: </Text>
        <Text style={[styles.idealForText, { color: theme.textSecondary }]}>{idealFor}</Text>
      </View>
    </View>
  );
}

interface StepTileProps {
  step: string;
  title: string;
  desc: string;
  theme: AppTheme;
}

function StepTile({ step, title, desc, theme }: StepTileProps) {
  return (
    <View style={[styles.stepTile, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
      <View style={[styles.stepCircle, { backgroundColor: theme.primary }]}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>{title}</ThemedText>
        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>{desc}</Text>
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const responsive = useResponsive();

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
        
        {/* HERO BANNER */}
        <View style={[styles.heroCard, { backgroundColor: theme.heroBackground, borderColor: theme.heroCardBorder }]}>
          <View style={styles.heroPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.heroPillText}>AUTOMATIC FOLLOW-UP ENGINE</Text>
          </View>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            How CallConnect Works
          </ThemedText>
          <Text style={[styles.heroSubtext, { color: theme.heroAccent }]}>
            CallConnect monitors phone state transitions on your device and sends your personalized follow-up SMS automatically after calls end—without requiring you to press Send.
          </Text>
        </View>

        {/* 3-STEP PIPELINE */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            THE 3-STEP AUTOMATION FLOW
          </Text>
          <StepTile
            step="1"
            title="Call Concludes"
            desc="Telephony listener detects when any incoming or outgoing call disconnects, is rejected, or is missed."
            theme={theme}
          />
          <StepTile
            step="2"
            title="Rule & Schedule Verification"
            desc="Matches the caller against your allowlist/blocklist rules and checks if Quiet Hours are active."
            theme={theme}
          />
          <StepTile
            step="3"
            title="SmsManager Dispatch"
            desc="Sends your configured message instantly or counts down with an ongoing 1-tap notification cancel option."
            theme={theme}
          />
        </View>

        {/* SUPPORTED CALL OUTCOMES */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            AUTOMATIC TRIGGERS (ALL 5 CALL TYPES)
          </Text>

          <CallTriggerCard
            icon="📞"
            title="Incoming Answered"
            badge="ENDED"
            badgeBg="#DCFCE7"
            badgeColor="#15803D"
            summary="Transmits your follow-up note automatically when an incoming conversation concludes."
            idealFor="Sharing links, meeting summaries, or polite thank-yous."
            theme={theme}
          />

          <CallTriggerCard
            icon="🚫"
            title="Incoming Rejected"
            badge="DECLINED"
            badgeBg="#FEF3C7"
            badgeColor="#B45309"
            summary="Fires immediately when you reject or dismiss an incoming call."
            idealFor="In-meeting alerts: 'In a meeting, will call you right back.'"
            theme={theme}
          />

          <CallTriggerCard
            icon="⏳"
            title="Incoming Missed"
            badge="UNANSWERED"
            badgeBg="#FEE2E2"
            badgeColor="#B91C1C"
            summary="Delivers your text right away if a caller rings out without an answer."
            idealFor="Assuring callers: 'Sorry I missed your call! I will get back shortly.'"
            theme={theme}
          />

          <CallTriggerCard
            icon="📤"
            title="Outgoing Answered"
            badge="CONNECTED"
            badgeBg="#E0E7FF"
            badgeColor="#4338CA"
            summary="Automatically follows up after your dialed call connects and you hang up."
            idealFor="Sending your contact card or scheduled appointment confirmation."
            theme={theme}
          />

          <CallTriggerCard
            icon="↩️"
            title="Outgoing Unanswered"
            badge="CANCELLED"
            badgeBg="#F1F5F9"
            badgeColor="#475569"
            summary="Leaves an automated text notice when your dialed call goes unanswered or is cancelled."
            idealFor="Leaving a quick heads-up: 'Tried calling you, please call back when free.'"
            theme={theme}
          />
        </View>

        {/* BOTTOM ACTION CTA */}
        <View style={styles.ctaWrapper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Configure settings and rules"
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}
            onPress={() => router.navigate('/settings')}>
            <Text style={styles.ctaButtonText}>Configure Rules & Delay in Settings →</Text>
          </Pressable>
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
  heroCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    marginBottom: Spacing.two,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  heroSubtext: {
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.two,
  },
  stepTile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  triggerCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  cardIcon: {
    fontSize: 19,
  },
  cardTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  idealForBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
  },
  idealForLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  idealForText: {
    fontSize: 11,
    flex: 1,
  },
  ctaWrapper: {
    marginTop: Spacing.two,
    marginBottom: Spacing.five,
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
