/**
 * Below are the colors and styles that are used in the app. The colors are defined in light and dark mode.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    primaryLight: '#EEF2FF',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardBorderHover: '#CBD5E1',
    inputBackground: '#F8FAFC',
    inputBorder: '#E2E8F0',
    inputBorderFocused: '#4F46E5',
    statusSuccess: '#16A34A',
    statusSuccessBg: '#DCFCE7',
    statusSuccessBorder: '#BBF7D0',
    statusInactive: '#94A3B8',
    statusInactiveBg: '#F1F5F9',
    statusInactiveBorder: '#E2E8F0',
    statusWarning: '#D97706',
    statusWarningBg: '#FEF3C7',
    statusWarningBorder: '#FDE68A',
    heroBackground: '#0F172A',
    heroCardBorder: '#1E293B',
    heroAccent: '#A5B4FC',
    infoBg: '#EEF2FF',
    infoBorder: '#E0E7FF',
    infoIcon: '#4F46E5',
    infoText: '#374151',
  },
  dark: {
    text: '#F8FAFC',
    background: '#090D16',
    backgroundElement: '#161F30',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
    primary: '#6366F1',
    primaryHover: '#818CF8',
    primaryLight: '#1E1B4B',
    cardBackground: '#111827',
    cardBorder: '#1F2937',
    cardBorderHover: '#374151',
    inputBackground: '#0B0F19',
    inputBorder: '#1F2937',
    inputBorderFocused: '#818CF8',
    statusSuccess: '#4ADE80',
    statusSuccessBg: '#064E3B',
    statusSuccessBorder: '#065F46',
    statusInactive: '#64748B',
    statusInactiveBg: '#1E293B',
    statusInactiveBorder: '#334155',
    statusWarning: '#FBBF24',
    statusWarningBg: '#451A03',
    statusWarningBorder: '#78350F',
    heroBackground: '#0B1120',
    heroCardBorder: '#1E293B',
    heroAccent: '#818CF8',
    infoBg: '#131B2E',
    infoBorder: '#1E293B',
    infoIcon: '#818CF8',
    infoText: '#CBD5E1',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
