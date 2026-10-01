import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {THEME} from '../config/theme';

export type ButtonVariant = 'emergency' | 'primary' | 'secondary' | 'warning' | 'disabled';

interface EmergencyButtonProps extends TouchableOpacityProps {
  title: string;
  subtitle?: string;
  variant?: ButtonVariant;
  icon?: string;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  title,
  subtitle,
  variant = 'primary',
  disabled,
  style,
  onPress,
  ...rest
}) => {
  const isActuallyDisabled = disabled || variant === 'disabled';

  const getVariantStyles = () => {
    switch (variant) {
      case 'emergency':
        return {
          container: styles.emergencyContainer,
          text: styles.emergencyText,
          subtitle: styles.emergencySubtitle,
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          text: styles.warningText,
          subtitle: styles.warningSubtitle,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          subtitle: styles.secondarySubtitle,
        };
      case 'disabled':
        return {
          container: styles.disabledContainer,
          text: styles.disabledText,
          subtitle: styles.disabledSubtitle,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          subtitle: styles.primarySubtitle,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={isActuallyDisabled ? 1 : 0.75}
      disabled={isActuallyDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{disabled: isActuallyDisabled}}
      style={[
        styles.baseContainer,
        vStyles.container,
        isActuallyDisabled && styles.disabledContainer,
        style,
      ]}
      {...rest}>
      <View style={styles.contentWrapper}>
        <Text
          style={[
            styles.baseText,
            vStyles.text,
            isActuallyDisabled && styles.disabledText,
          ]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              vStyles.subtitle,
              isActuallyDisabled && styles.disabledSubtitle,
            ]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    minHeight: 64,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: THEME.spacing.sm,
    borderWidth: 2,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  baseText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  // Emergency (Bright Crimson Red)
  emergencyContainer: {
    backgroundColor: THEME.colors.emergency,
    borderColor: THEME.colors.emergencyBorder,
    shadowColor: '#B91C1C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  emergencySubtitle: {
    color: '#FEE2E2',
  },

  // Primary (Royal Blue)
  primaryContainer: {
    backgroundColor: THEME.colors.signal,
    borderColor: THEME.colors.signalDark,
    shadowColor: '#1D4ED8',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  primarySubtitle: {
    color: '#DBEAFE',
  },

  // Warning (Amber / Gold)
  warningContainer: {
    backgroundColor: THEME.colors.warning,
    borderColor: THEME.colors.warningBorder,
  },
  warningText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  warningSubtitle: {
    color: '#FEF3C7',
  },

  // Secondary (Light card with distinct border)
  secondaryContainer: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.signal,
  },
  secondaryText: {
    color: THEME.colors.signal,
  },
  secondarySubtitle: {
    color: THEME.colors.textSecondary,
  },

  // Disabled
  disabledContainer: {
    backgroundColor: THEME.colors.disabledBg,
    borderColor: THEME.colors.disabledBorder,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledText: {
    color: THEME.colors.disabledText,
  },
  disabledSubtitle: {
    color: THEME.colors.disabledText,
  },
});
