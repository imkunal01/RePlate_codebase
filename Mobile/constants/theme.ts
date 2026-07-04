// ─── Design System — RePlate ────────────────────────────────────────────────
// Warm amber-orange primary, deep forest green secondary, dark background.
// Every color, font, and spacing value in the app should reference this file.

export const Colors = {
  // Primary — warmth, urgency, food
  primary: '#F97316',       // amber-orange
  primaryLight: '#FED7AA',  // light peach
  primaryDark: '#C2410C',   // dark orange

  // Secondary — sustainability, NGOs
  secondary: '#16A34A',     // forest green
  secondaryLight: '#BBF7D0',
  secondaryDark: '#166534',

  // Background (dark mode)
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceElevated: '#242837',
  border: '#2E3244',
  borderLight: '#3A4060',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F1117',

  // Status colors — donation lifecycle
  statusAvailable: '#22C55E',   // green
  statusClaimed: '#F59E0B',     // amber
  statusCollected: '#3B82F6',   // blue
  statusCompleted: '#94A3B8',   // gray
  statusExpired: '#EF4444',     // red

  // Feedback
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Map
  mapPin: '#F97316',
  mapPinBg: 'rgba(249,115,22,0.15)',

  // Overlay
  overlay: 'rgba(15,17,23,0.85)',
  overlayLight: 'rgba(15,17,23,0.5)',

  // Card gradient
  cardGradientStart: '#1A1D27',
  cardGradientEnd: '#0F1117',

  // White & Black
  white: '#FFFFFF',
  black: '#000000',
};

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  primary: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Status badge config — color, label, icon
export const StatusConfig: Record<string, { color: string; label: string; icon: string }> = {
  available: { color: Colors.statusAvailable, label: 'Available', icon: 'check-circle' },
  claimed:   { color: Colors.statusClaimed,   label: 'Claimed',   icon: 'clock' },
  collected: { color: Colors.statusCollected, label: 'Collected', icon: 'package' },
  completed: { color: Colors.statusCompleted, label: 'Completed', icon: 'check-circle-2' },
  expired:   { color: Colors.statusExpired,   label: 'Expired',   icon: 'x-circle' },
};
