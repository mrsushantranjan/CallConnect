import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const NORMAL_DURATION = 1100;
const REDUCED_DURATION = 500;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  if (!visible) return null;

  // Standard animation: gentle scale-in, hold, and smooth fade-out
  const standardKeyframe = new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scale: 0.92 }],
    },
    25: {
      opacity: 1,
      transform: [{ scale: 1.0 }],
      easing: Easing.out(Easing.cubic),
    },
    75: {
      opacity: 1,
      transform: [{ scale: 1.0 }],
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1.02 }],
      easing: Easing.in(Easing.cubic),
    },
  });

  // Reduced motion: simple opacity fade without scale/transform effects
  const reducedKeyframe = new Keyframe({
    0: {
      opacity: 0,
    },
    25: {
      opacity: 1,
    },
    75: {
      opacity: 1,
    },
    100: {
      opacity: 0,
    },
  });

  const activeKeyframe = reducedMotion ? reducedKeyframe : standardKeyframe;
  const activeDuration = reducedMotion ? REDUCED_DURATION : NORMAL_DURATION;

  return animate ? (
    <Animated.View
      entering={activeKeyframe.duration(activeDuration).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      <View style={styles.brandContainer}>
        {/* CallConnect App Icon Mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>C</Text>
          <View style={styles.signalDot} />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>CallConnect</Text>

        {/* Tagline */}
        <Text style={styles.brandTagline}>Stay connected, effortlessly</Text>
      </View>
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      <View style={styles.brandContainer}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>C</Text>
          <View style={styles.signalDot} />
        </View>
        <Text style={styles.brandTitle}>CallConnect</Text>
        <Text style={styles.brandTagline}>Stay connected, effortlessly</Text>
      </View>
    </View>
  );
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.logoMark}>
        <Text style={styles.logoText}>C</Text>
        <View style={styles.signalDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    position: 'relative',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  signalDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  brandTagline: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
});
