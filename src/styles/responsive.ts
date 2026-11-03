import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  width: number;
  height: number;
  fontScale: number;
  isSmallPhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  horizontalPadding: number;
  contentMaxWidth: number;
  heroPadding: number;
  cardPadding: number;
  titleSize: number;
  heroTitleSize: number;
  inputMinHeight: number;
  cardWidth: string | number;
}

export function useResponsive(): ResponsiveLayout {
  const { width, height, fontScale } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Responsive horizontal padding based on screen width
  const horizontalPadding = isSmallPhone ? 14 : isTablet ? 32 : 20;

  // Responsive padding inside cards
  const heroPadding = isSmallPhone ? 16 : isTablet ? 28 : 22;
  const cardPadding = isSmallPhone ? 16 : isTablet ? 26 : 20;

  // Responsive typography
  const titleSize = isSmallPhone ? 18 : isTablet ? 22 : 20;
  const heroTitleSize = isSmallPhone ? 22 : isTablet ? 28 : 25;

  // Responsive text input minimum height
  const inputMinHeight = isSmallPhone ? 96 : isTablet ? 128 : 110;

  return {
    width,
    height,
    fontScale,
    isSmallPhone,
    isTablet,
    isLandscape,
    horizontalPadding,
    contentMaxWidth: 720,
    heroPadding,
    cardPadding,
    titleSize,
    heroTitleSize,
    inputMinHeight,
    cardWidth: isTablet ? '48%' : '100%',
  };
}
