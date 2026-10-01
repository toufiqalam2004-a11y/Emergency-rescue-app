import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader, HazardCard} from '../components';
import {NavigationProp} from '../navigation/types';

interface HazardBroadcastScreenProps {
  navigation: NavigationProp;
}

export const HazardBroadcastScreen: React.FC<HazardBroadcastScreenProps> = ({
  navigation,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'WATER' | 'MEDICAL' | 'ROAD'>('ALL');

  const handleCreateBroadcast = () => {
    Alert.alert(
      'Emergency Alert',
      'First responders can broadcast urgent safety notices to all nearby phones.',
      [{text: 'OK', style: 'default'}]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Safety Alerts"
        subtitle="Emergency Bulletins & Updates"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category Filter Pills */}
        <Text style={styles.filterTitle}>Filter by alert type:</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('ALL')}
            style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}>
            <Text
              style={[
                styles.filterText,
                filter === 'ALL' && styles.filterTextActive,
              ]}>
              ALL (3)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('WATER')}
            style={[styles.filterPill, filter === 'WATER' && styles.filterPillActive]}>
            <Text
              style={[
                styles.filterText,
                filter === 'WATER' && styles.filterTextActive,
              ]}>
              WATER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('MEDICAL')}
            style={[styles.filterPill, filter === 'MEDICAL' && styles.filterPillActive]}>
            <Text
              style={[
                styles.filterText,
                filter === 'MEDICAL' && styles.filterTextActive,
              ]}>
              MEDICAL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('ROAD')}
            style={[styles.filterPill, filter === 'ROAD' && styles.filterPillActive]}>
            <Text
              style={[
                styles.filterText,
                filter === 'ROAD' && styles.filterTextActive,
              ]}>
              ROAD
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hazard Cards */}
        {(filter === 'ALL' || filter === 'WATER') && (
          <HazardCard
            id="h-01"
            category="WATER"
            title="Clean Drinking Water Distribution"
            description="Clean drinking water tanker arrived at School Ground. Free drinking water available. Please bring clean containers."
            location="Central School Ground"
            timestamp="18 mins ago"
            authorityName="Water Relief Team"
            isVerified={true}
          />
        )}

        {(filter === 'ALL' || filter === 'MEDICAL') && (
          <HazardCard
            id="h-02"
            category="MEDICAL"
            title="Emergency Medical Camp Open"
            description="Doctors and nurses available for medical care, blood pressure, wound dressing, and insulin supplies."
            location="Community Health Center"
            timestamp="42 mins ago"
            authorityName="Red Cross Medical Team"
            isVerified={true}
          />
        )}

        {(filter === 'ALL' || filter === 'ROAD') && (
          <HazardCard
            id="h-03"
            category="ROAD_ALERT"
            title="River Bridge Flooded — Do Not Cross"
            description="The river bridge is completely flooded with deep rushing water. It is not safe to cross on foot or by vehicle."
            location="North River Expressway"
            timestamp="1 hr ago"
            authorityName="Disaster Safety Unit"
            isVerified={true}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreateBroadcast}
          style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>📢 Post Emergency Alert</Text>
        </TouchableOpacity>
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
  filterTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: THEME.colors.signal,
    borderColor: THEME.colors.signalDark,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  actionBtn: {
    backgroundColor: THEME.colors.surfaceRaised,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.warning,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 64,
  },
  actionBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.warning,
  },
});
