/**
 * Neumorphic Dark Mode color scheme for auction platform
 * Soft UI with subtle shadows and bright accent colors
 */

// Base colors
const darkBackground = '#1A1D29'; // Deep dark blue-gray
const cardBackground = '#242938'; // Slightly lighter for cards
const surfaceElevated = '#2D3142'; // For elevated elements
const white = '#FFFFFF';
const lightGray = '#E2E8F0';
const mediumGray = '#94A3B8';

// Bright accent colors for dark mode
const accentBlue = '#3B82F6'; // Bright blue
const accentGreen = '#10B981'; // Emerald green
const accentPurple = '#8B5CF6'; // Violet
const accentOrange = '#F97316'; // Orange
const accentRed = '#EF4444'; // Red

// Neumorphic shadows
const shadowLight = 'rgba(255, 255, 255, 0.1)';
const shadowDark = 'rgba(0, 0, 0, 0.3)';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F8FAFC',
    cardBackground: white,
    surface: '#F1F5F9',
    tint: accentBlue,
    icon: mediumGray,
    tabIconDefault: mediumGray,
    tabIconSelected: accentBlue,
    border: '#E2E8F0',
    success: accentGreen,
    warning: accentOrange,
    danger: accentRed,
    info: accentBlue,
    primary: accentBlue,
    primaryDark: '#1E40AF',
    secondary: mediumGray,
    white: white,
    // Neumorphic shadows for light mode
    shadowLight: 'rgba(255, 255, 255, 0.8)',
    shadowDark: 'rgba(0, 0, 0, 0.1)',
    // Status colors for auctions
    activeAuction: accentGreen,
    upcomingAuction: accentBlue,
    endedAuction: mediumGray,
    realEstateAuction: accentPurple,
    vehicleAuction: accentOrange,
    // Additional accent colors
    accent: {
      blue: accentBlue,
      green: accentGreen,
      purple: accentPurple,
      orange: accentOrange,
      red: accentRed,
    }
  },
  dark: {
    text: lightGray,
    background: darkBackground,
    cardBackground: cardBackground,
    surface: surfaceElevated,
    tint: accentBlue,
    icon: mediumGray,
    tabIconDefault: mediumGray,
    tabIconSelected: accentBlue,
    border: '#374151',
    success: accentGreen,
    warning: accentOrange,
    danger: accentRed,
    info: accentBlue,
    primary: accentBlue,
    primaryDark: '#1E40AF',
    secondary: mediumGray,
    white: white,
    // Neumorphic shadows for dark mode
    shadowLight: shadowLight,
    shadowDark: shadowDark,
    // Status colors for auctions
    activeAuction: accentGreen,
    upcomingAuction: accentBlue,
    endedAuction: mediumGray,
    realEstateAuction: accentPurple,
    vehicleAuction: accentOrange,
    // Additional accent colors
    accent: {
      blue: accentBlue,
      green: accentGreen,
      purple: accentPurple,
      orange: accentOrange,
      red: accentRed,
    }
  },
};