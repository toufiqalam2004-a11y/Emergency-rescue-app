/**
 * Elderly-Friendly Design System & Theme Tokens (Ages 70+)
 *
 * Characteristics:
 * - Warm white / clean light background
 * - Very high contrast deep dark text (contrast ratio > 12:1)
 * - Large readable typography (Titles 26-30px, Buttons 20-24px, Body 18-20px, No text below 16px)
 * - Large touch targets (min 56-64px height)
 * - Clear primary colors: Blue for normal actions, Red for emergency, Green for safe
 */

export const THEME = {
  colors: {
    // Base backgrounds - Warm clean light theme
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceRaised: '#F1F5F9',
    surfaceBorder: '#CBD5E1',
    surfaceSubtle: '#F8FAFC',

    // Emergency Crimson (High contrast, clearly visible)
    emergency: '#DC2626',
    emergencyHover: '#B91C1C',
    emergencySubtle: '#FEE2E2',
    emergencyBorder: '#B91C1C',

    // Warning / Caution / Strobe
    warning: '#D97706',
    warningSubtle: '#FEF3C7',
    warningBorder: '#B45309',

    // Signal Blue (Primary action color for normal interactions)
    signal: '#2563EB',
    signalDark: '#1D4ED8',
    signalSubtle: '#DBEAFE',

    // Safe Green (Clear safety & active connection status)
    success: '#16A34A',
    successSubtle: '#DCFCE7',

    // Deep Dark Text Hierarchy (Maximum readability against light surfaces)
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textDisabled: '#94A3B8',

    // Disabled elements
    disabledBg: '#E2E8F0',
    disabledBorder: '#CBD5E1',
    disabledText: '#64748B',
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    full: 9999,
  },

  typography: {
    fontFamily: 'System',
    titleHero: {
      fontSize: 28,
      fontWeight: '800' as const,
      color: '#0F172A',
      lineHeight: 34,
    },
    titleSection: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#0F172A',
      lineHeight: 30,
    },
    titleCard: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: '#0F172A',
      lineHeight: 26,
    },
    body: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 26,
      color: '#334155',
    },
    bodyLarge: {
      fontSize: 20,
      fontWeight: '500' as const,
      lineHeight: 28,
      color: '#0F172A',
    },
    bodySmall: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 22,
      color: '#475569',
    },
    caption: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#475569',
    },
    buttonText: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
  },

  touchTarget: {
    minHeight: 64,
  },
};
