import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader} from '../components';
import {NavigationProp} from '../navigation/types';

interface OfflineMapScreenProps {
  navigation: NavigationProp;
}

export const OfflineMapScreen: React.FC<OfflineMapScreenProps> = ({
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <AppHeader
        title="My Location & Map"
        subtitle="Safe Shelters & Danger Zones"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. MAP DISPLAY WITH 4 KEY LOCATIONS */}
        <View style={styles.mapFrame}>
          {/* Subtle grid lines for map feel */}
          <View style={styles.mapGridLineH} />
          <View style={styles.mapGridLineV} />

          {/* Compass */}
          <View style={styles.compassBadge}>
            <Text style={styles.compassText}>🧭 N</Text>
          </View>

          {/* Pin 1: My Location */}
          <View style={[styles.mapMarker, styles.markerLocation]}>
            <Text style={styles.markerIcon}>📍</Text>
            <Text style={styles.markerTextDark}>My Location</Text>
          </View>

          {/* Pin 2: Shelter */}
          <View style={[styles.mapMarker, styles.markerShelter]}>
            <Text style={styles.markerIcon}>⛺</Text>
            <Text style={styles.markerTextDark}>Shelter</Text>
          </View>

          {/* Pin 3: Safe Area */}
          <View style={[styles.mapMarker, styles.markerSafeArea]}>
            <Text style={styles.markerIcon}>🛡️</Text>
            <Text style={styles.markerTextDark}>Safe Area</Text>
          </View>

          {/* Pin 4: Danger */}
          <View style={[styles.mapMarker, styles.markerDanger]}>
            <Text style={styles.markerIcon}>⚠️</Text>
            <Text style={styles.markerTextDark}>Danger</Text>
          </View>
        </View>

        {/* 2. FOUR CLEAR LEGEND CARDS */}
        <Text style={styles.legendHeader}>Important Locations:</Text>

        {/* 1. My Location */}
        <View style={[styles.locationCard, styles.cardLocation]}>
          <Text style={styles.cardIcon}>📍</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Location</Text>
            <Text style={styles.cardDesc}>
              This is where you are currently located.
            </Text>
          </View>
        </View>

        {/* 2. Shelter */}
        <View style={[styles.locationCard, styles.cardShelter]}>
          <Text style={styles.cardIcon}>⛺</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Shelter</Text>
            <Text style={styles.cardDesc}>
              Central High School • Warm beds, doctor, food, and drinking water.
            </Text>
          </View>
        </View>

        {/* 3. Safe Area */}
        <View style={[styles.locationCard, styles.cardSafeArea]}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Safe Area</Text>
            <Text style={styles.cardDesc}>
              Stadium Ridge • High-ground area safe from rising flood waters.
            </Text>
          </View>
        </View>

        {/* 4. Danger */}
        <View style={[styles.locationCard, styles.cardDanger]}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Danger</Text>
            <Text style={styles.cardDesc}>
              Flooded River Crossing • Do not attempt to cross this bridge.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  mapFrame: {
    height: 280,
    backgroundColor: '#E0F2FE', // soft sky water blue
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 3,
    borderColor: THEME.colors.signal,
    position: 'relative',
    overflow: 'hidden',
    marginVertical: THEME.spacing.sm,
  },
  mapGridLineH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  mapGridLineV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  compassBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.surfaceBorder,
  },
  compassText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  mapMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  markerLocation: {
    bottom: 30,
    left: 30,
    borderColor: THEME.colors.signal,
  },
  markerShelter: {
    top: 24,
    right: 24,
    borderColor: THEME.colors.success,
  },
  markerSafeArea: {
    top: 110,
    left: 30,
    borderColor: '#0284C7',
  },
  markerDanger: {
    bottom: 40,
    right: 30,
    borderColor: THEME.colors.emergency,
  },
  markerIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  markerTextDark: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  legendHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  locationCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLocation: {
    borderColor: THEME.colors.signal,
  },
  cardShelter: {
    borderColor: THEME.colors.success,
  },
  cardSafeArea: {
    borderColor: '#0284C7',
  },
  cardDanger: {
    borderColor: THEME.colors.emergency,
  },
  cardIcon: {
    fontSize: 38,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  cardDesc: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    lineHeight: 24,
  },
});
