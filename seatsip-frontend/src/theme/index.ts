// SeatSip Design System
// Warm coffee-inspired palette with modern minimalism

export const Colors = {
  // Primary - Dark brown (selected states)
  primary: '#6B3F1F',
  primaryLight: '#8D6E63',
  primaryDark: '#3E2723',

  // Accent - Warm Caramel / Light brown
  accent: '#D4A373',
  accentLight: '#E6DDD4',
  accentDark: '#8B5E3C',

  // Secondary - Medium brown (borders, icons)
  secondary: '#8D6E63',
  
  // Background - Beige topographic base
  background: '#E6DDD4',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F0EB', // Stepper bg, unselected pill bg

  // Existing SeatSip brand color
  brand: '#6B3F1F',

  // Greens for veg indicator
  vegGreen: '#4CAF50',

  // Semantic
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Text
  textPrimary: '#3E2723', // Almost black-brown
  textSecondary: '#8D6E63', // Muted brown
  textMuted: '#9E8A7A',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E8DDD0',
  borderLight: '#F0EAE0',
  divider: '#F0EAE0',

  // Tab bar
  tabActive: '#5D4037',
  tabInactive: '#9E8A7A',

  // Status
  open: '#27AE60',
  closed: '#E74C3C',
  busy: '#F39C12',

  // Overlay
  overlay: 'rgba(28, 16, 8, 0.5)',
  overlayLight: 'rgba(28, 16, 8, 0.3)',

  // Mood tags
  moodWork: '#3B82F6',
  moodDate: '#EC4899',
  moodChill: '#8B5CF6',
  moodArt: '#F59E0B',
  moodFood: '#EF4444',
};

export const Typography = {
  // Font families
  fontDisplay: 'serif', // Will use system serif
  fontBody: 'System',

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const MoodColors: Record<string, string> = {
  work: '#3B82F6',
  date: '#EC4899',
  chill: '#8B5CF6',
  art: '#F59E0B',
  creative: '#F59E0B',
  food: '#EF4444',
  rooftop: '#06B6D4',
  breakfast: '#F97316',
  romantic: '#EC4899',
  quick: '#10B981',
  authentic: '#8B5CF6',
  instagram: '#EC4899',
  celebration: '#F59E0B',
  friends: '#3B82F6',
  cozy: '#F97316',
};
