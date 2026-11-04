import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  isRevisit?: boolean;
  onClose?: () => void;
}

export function WelcomeScreen({ onGetStarted, isRevisit = false, onClose }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const contentMaxWidth = Math.min(width - Spacing.four * 2, 420);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((reducedMotion) => {
      if (!isMounted) return;
      if (reducedMotion) {
        fadeAnim.setValue(1);
        slideAnim.setValue(0);
        scaleAnim.setValue(1);
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }).catch(() => {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    });

    return () => {
      isMounted = false;
    };
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.container,
          {
            maxWidth: contentMaxWidth,
            paddingTop: Math.max(insets.top + Spacing.four, Spacing.six),
            paddingBottom: Math.max(insets.bottom + Spacing.four, Spacing.six),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        {/* Optional Revisit Close Button */}
        {isRevisit && onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close welcome screen"
            onPress={onClose}
            style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕ Close</Text>
          </Pressable>
        ) : (
          <View style={styles.spacerTop} />
        )}

        {/* Hero Branding */}
        <View style={styles.centerBlock}>
          <Animated.View
            style={[
              styles.logoIcon,
              {
                backgroundColor: theme.primary,
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            <Text style={styles.logoSymbol}>📱</Text>
          </Animated.View>

          <Text style={[styles.appName, { color: theme.text }]}>CallConnect</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Automatic Post-Call Follow-Ups
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

          <Text style={[styles.headline, { color: theme.text }]}>
            A thoughtful message,{'\n'}sent right on time.
          </Text>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            CallConnect automatically sends your custom SMS follow-up after phone calls conclude. Keep your communications prompt, reliable, and completely on-device.
          </Text>

          <View style={[styles.featureList, { borderColor: theme.cardBorder }]}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Works with incoming & outgoing calls
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Configurable delay with 1-tap cancel
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Allow/Block lists & scheduled quiet hours
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.bottomBlock}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started with CallConnect"
            onPress={onGetStarted}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={styles.ctaText}>
              {isRevisit ? 'Back to App' : 'Get Started'}
            </Text>
          </Pressable>
          <Text style={[styles.privacyNotice, { color: theme.textSecondary }]}>
            Private • 100% On-device • No cloud storage
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  spacerTop: {
    height: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerBlock: {
    alignItems: 'center',
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoSymbol: {
    fontSize: 32,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  divider: {
    width: 44,
    height: 2,
    borderRadius: 1,
    marginVertical: Spacing.three,
  },
  headline: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 27,
    letterSpacing: -0.4,
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 340,
    opacity: 0.85,
    marginBottom: Spacing.three,
  },
  featureList: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  featureBullet: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  privacyNotice: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.65,
    marginTop: 4,
  },
});
