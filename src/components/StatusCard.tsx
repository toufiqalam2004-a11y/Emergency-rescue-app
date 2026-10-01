import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {THEME} from '../config/theme';

export interface StatusCardItem {
  label: string;
  value: string;
  color?: string;
  badge?: string;
}

interface StatusCardProps {
  title?: string;
  items: StatusCardItem[];
  variant?: 'default' | 'emergency' | 'warning' | 'info';
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  items,
  variant = 'default',
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'emergency':
        return THEME.colors.emergency;
      case 'warning':
        return THEME.colors.warning;
      case 'info':
        return THEME.colors.signal;
      case 'default':
      default:
        return THEME.colors.surfaceBorder;
    }
  };

  return (
    <View style={[styles.card, {borderColor: getBorderColor()}]}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      <View style={styles.itemsWrapper}>
        {items.map((item, idx) => (
          <View
            key={idx}
            style={[styles.row, idx > 0 && styles.rowBorder]}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.valueRow}>
              <Text
                style={[
                  styles.value,
                  item.color ? {color: item.color} : undefined,
                ]}>
                {item.value}
              </Text>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 2,
    marginVertical: THEME.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.signal,
    marginBottom: THEME.spacing.sm,
  },
  itemsWrapper: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceRaised,
  },
  label: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: THEME.colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
});
