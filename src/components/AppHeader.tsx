import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {THEME} from '../config/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSettings?: () => void;
  showBack?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onSettings,
  showBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}>
            <Text style={styles.backIcon}>◀</Text>
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {onSettings ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSettings}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          style={styles.settingsButton}>
          <Text style={styles.settingsText}>⚙️ SETTINGS</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 68,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    minHeight: 56,
    backgroundColor: THEME.colors.surfaceRaised,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.surfaceBorder,
  },
  backIcon: {
    fontSize: 20,
    color: THEME.colors.signal,
    fontWeight: '800',
    marginRight: 6,
  },
  backText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.signal,
    letterSpacing: 0.5,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    backgroundColor: THEME.colors.surfaceRaised,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.surfaceBorder,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
});
