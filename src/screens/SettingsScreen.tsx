import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader} from '../components';
import {NavigationProp} from '../navigation/types';

interface SettingsScreenProps {
  navigation: NavigationProp;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({navigation}) => {
  const handleProfilePress = () => {
    Alert.alert(
      'Profile',
      'Here you can save your emergency medical info, blood type, and medications so first responders can help you quickly.',
      [{text: 'OK'}]
    );
  };

  const handleContactsPress = () => {
    Alert.alert(
      'Emergency Contacts',
      'Saved emergency contacts: Family, neighbors, and doctor. These contacts will receive your help alerts automatically.',
      [{text: 'OK'}]
    );
  };

  const handlePreferencesPress = () => {
    Alert.alert(
      'App Preferences',
      'Text size is set to Large for high readability. Emergency sound and vibration alerts are ON.',
      [{text: 'OK'}]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'How to Use This App',
      '1. Red SOS Button: Press and hold for 2 seconds to call for immediate help.\n\n2. Request Help: Choose what you need (medical, food, water, or rescue).\n\n3. Flashlight: Turn on the bright strobe light so rescuers can see you in the dark.\n\n4. My Location: Find safe shelters nearby.',
      [{text: 'Got It'}]
    );
  };

  const handleAboutPress = () => {
    Alert.alert(
      'About ResQ Emergency',
      'ResQ Emergency App\nVersion 1.0\n\nWorks 100% offline without cellular or Wi-Fi internet to keep you safe in disasters.',
      [{text: 'OK'}]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Settings"
        subtitle="App Options & Help"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Select an option:</Text>

        <View style={styles.optionsList}>
          {/* 1. Profile */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleProfilePress}
            accessibilityRole="button"
            accessibilityLabel="Profile - Your name and medical information"
            style={styles.optionCard}>
            <Text style={styles.optionIcon}>👤</Text>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Profile</Text>
              <Text style={styles.optionDesc}>
                Your name, health notes & medical info
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          {/* 2. Emergency Contacts */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleContactsPress}
            accessibilityRole="button"
            accessibilityLabel="Emergency Contacts - Family and doctor numbers"
            style={styles.optionCard}>
            <Text style={styles.optionIcon}>📞</Text>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Emergency Contacts</Text>
              <Text style={styles.optionDesc}>
                Family members, neighbors & doctor
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          {/* 3. App Preferences */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handlePreferencesPress}
            accessibilityRole="button"
            accessibilityLabel="App Preferences - Sound and display settings"
            style={styles.optionCard}>
            <Text style={styles.optionIcon}>⚙️</Text>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>App Preferences</Text>
              <Text style={styles.optionDesc}>
                Sound alerts, vibrations & text size
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          {/* 4. Help */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleHelpPress}
            accessibilityRole="button"
            accessibilityLabel="Help - How to use this emergency app"
            style={styles.optionCard}>
            <Text style={styles.optionIcon}>❓</Text>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Help</Text>
              <Text style={styles.optionDesc}>
                Simple step-by-step guide on how to get help
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          {/* 5. About */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleAboutPress}
            accessibilityRole="button"
            accessibilityLabel="About - Version and app details"
            style={styles.optionCard}>
            <Text style={styles.optionIcon}>ℹ️</Text>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>About</Text>
              <Text style={styles.optionDesc}>
                ResQ Emergency Network • Version 1.0
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          {/* Bonus accessible link to Nearby Devices */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('NEARBY_DEVICES')}
            accessibilityRole="button"
            accessibilityLabel="Nearby Devices - Search for nearby phones"
            style={[styles.optionCard, styles.optionCardBonus]}>
            <Text style={styles.optionIcon}>📱</Text>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Nearby Devices</Text>
              <Text style={styles.optionDesc}>
                Search and connect with other phones
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
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
  sectionHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 14,
  },
  optionsList: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 18,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardBonus: {
    borderColor: THEME.colors.signal,
    backgroundColor: '#EFF6FF',
    marginTop: 6,
  },
  optionIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  optionDesc: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginLeft: 8,
  },
});
