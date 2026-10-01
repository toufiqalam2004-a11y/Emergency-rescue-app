import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {THEME} from '../config/theme';

export type HazardCategory = 'WATER' | 'MEDICAL' | 'ROAD_ALERT' | 'EVACUATION' | 'SHELTER';

export interface HazardCardProps {
  id: string;
  category: HazardCategory;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  authorityName?: string;
  isVerified?: boolean;
}

export const HazardCard: React.FC<HazardCardProps> = ({
  category,
  title,
  description,
  location,
  timestamp,
  authorityName = 'Disaster Relief Unit',
  isVerified = true,
}) => {
  const getCategoryTheme = () => {
    switch (category) {
      case 'WATER':
        return {badge: 'DRINKING WATER', color: THEME.colors.signal, icon: '💧'};
      case 'MEDICAL':
        return {badge: 'MEDICAL AID', color: THEME.colors.emergency, icon: '🚑'};
      case 'ROAD_ALERT':
        return {badge: 'ROAD BLOCKED', color: THEME.colors.warning, icon: '⚠️'};
      case 'EVACUATION':
        return {badge: 'EVACUATION', color: THEME.colors.emergency, icon: '🏃'};
      case 'SHELTER':
      default:
        return {badge: 'SAFE SHELTER', color: THEME.colors.success, icon: '⛺'};
    }
  };

  const cat = getCategoryTheme();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.categoryBadge, {borderColor: cat.color}]}>
          <Text style={styles.categoryIcon}>{cat.icon}</Text>
          <Text style={[styles.categoryText, {color: cat.color}]}>
            {cat.badge}
          </Text>
        </View>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>{location}</Text>
        </View>
        {isVerified ? (
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedCheck}>✓</Text>
            <Text style={styles.authorityText}>{authorityName}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginVertical: THEME.spacing.sm,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1.5,
    backgroundColor: THEME.colors.surfaceRaised,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '800',
  },
  timestamp: {
    fontSize: 16,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    lineHeight: 26,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    paddingTop: 10,
    flexDirection: 'column',
    gap: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    fontSize: 18,
    marginRight: 6,
  },
  locationText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedCheck: {
    color: THEME.colors.success,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  authorityText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.success,
  },
});
