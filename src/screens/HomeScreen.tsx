import React, {useRef} from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader} from '../components';
import {NavigationProp} from '../navigation/types';

interface HomeScreenProps {
  navigation: NavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSosLongPress = () => {
    navigation.navigate('REQUEST_RESCUE');
  };

  const handleSosPress = () => {
    Alert.alert(
      'Press & Hold',
      'Please press and hold the red SOS button for 2 seconds to get help.',
      [
        {
          text: 'Open Help Form Now',
          onPress: () => navigation.navigate('REQUEST_RESCUE'),
          style: 'default',
        },
        {text: 'OK', style: 'cancel'},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="ResQ Emergency"
        subtitle="Offline Help Ready"
        onSettings={() => navigation.navigate('SETTINGS')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* 1. HUGE SOS BUTTON (MAIN FOCUS) */}
        <View style={styles.sosContainer}>
          <Animated.View style={[styles.sosWrapper, {transform: [{scale: scaleAnim}]}]}>
            <TouchableOpacity
              activeOpacity={0.85}
              delayLongPress={2000}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleSosPress}
              onLongPress={handleSosLongPress}
              accessibilityRole="button"
              accessibilityLabel="SOS Get Help - Hold for 2 seconds"
              style={styles.sosButton}>
              <Text style={styles.sosIcon}>🚨</Text>
              <Text style={styles.sosTitle}>SOS – GET HELP</Text>
              <View style={styles.holdBadge}>
                <Text style={styles.holdText}>Hold for 2 seconds</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 2. THREE LARGE BUTTONS ONLY */}
        <View style={styles.actionButtonsContainer}>
          {/* Button 1: REQUEST HELP */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('REQUEST_RESCUE')}
            accessibilityRole="button"
            accessibilityLabel="Request Help"
            style={[styles.largeActionButton, styles.btnRequest]}>
            <Text style={styles.btnIcon}>🆘</Text>
            <View style={styles.btnTextWrapper}>
              <Text style={styles.btnTitleLight}>REQUEST HELP</Text>
              <Text style={styles.btnSubtitleLight}>
                Medical, food, water, or rescue
              </Text>
            </View>
            <Text style={styles.btnArrowLight}>›</Text>
          </TouchableOpacity>

          {/* Button 2: FLASHLIGHT */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('SOS_FLASHLIGHT')}
            accessibilityRole="button"
            accessibilityLabel="Flashlight"
            style={[styles.largeActionButton, styles.btnFlashlight]}>
            <Text style={styles.btnIcon}>🔦</Text>
            <View style={styles.btnTextWrapper}>
              <Text style={styles.btnTitleDark}>FLASHLIGHT</Text>
              <Text style={styles.btnSubtitleDark}>
                Turn on bright light & signal
              </Text>
            </View>
            <Text style={styles.btnArrowDark}>›</Text>
          </TouchableOpacity>

          {/* Button 3: MY LOCATION */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('OFFLINE_MAP')}
            accessibilityRole="button"
            accessibilityLabel="My Location"
            style={[styles.largeActionButton, styles.btnLocation]}>
            <Text style={styles.btnIcon}>📍</Text>
            <View style={styles.btnTextWrapper}>
              <Text style={styles.btnTitleDark}>MY LOCATION</Text>
              <Text style={styles.btnSubtitleDark}>
                View map & emergency safe shelters
              </Text>
            </View>
            <Text style={styles.btnArrowDark}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Clean status note */}
        <View style={styles.statusFooter}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Emergency Network Ready</Text>
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
    justifyContent: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  sosWrapper: {
    width: '100%',
  },
  sosButton: {
    backgroundColor: THEME.colors.emergency,
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#B91C1C',
    shadowColor: '#B91C1C',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    minHeight: 180,
  },
  sosIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  sosTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  holdBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  holdText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    marginTop: THEME.spacing.md,
    gap: 16,
  },
  largeActionButton: {
    minHeight: 80,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  btnRequest: {
    backgroundColor: THEME.colors.signal,
    borderColor: THEME.colors.signalDark,
  },
  btnFlashlight: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.signal,
  },
  btnLocation: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.success,
  },
  btnIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  btnTextWrapper: {
    flex: 1,
  },
  btnTitleLight: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnSubtitleLight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DBEAFE',
    marginTop: 2,
  },
  btnTitleDark: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  btnSubtitleDark: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  btnArrowLight: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
  },
  btnArrowDark: {
    fontSize: 32,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
    marginLeft: 8,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.success,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
});
