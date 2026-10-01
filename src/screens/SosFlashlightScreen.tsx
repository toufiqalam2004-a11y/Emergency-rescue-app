import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader, EmergencyButton} from '../components';
import {NavigationProp} from '../navigation/types';
import {TorchServiceState, torchService} from '../services/torch';

interface SosFlashlightScreenProps {
  navigation: NavigationProp;
}

export const SosFlashlightScreen: React.FC<SosFlashlightScreenProps> = ({
  navigation,
}) => {
  const [torchState, setTorchState] = useState<TorchServiceState>(
    torchService.getState()
  );
  const [selectedMode, setSelectedMode] = useState<'SOS' | 'STROBE'>('SOS');

  useEffect(() => {
    const unsubscribe = torchService.subscribe(setTorchState);
    torchService.init();

    return () => {
      unsubscribe();
      torchService.stop().catch(() => {});
    };
  }, []);

  const handleStart = () => {
    if (selectedMode === 'SOS') {
      torchService.startSos();
    } else {
      torchService.startStrobe();
    }
  };

  const handleStop = () => {
    torchService.stop();
  };

  const handleBack = () => {
    torchService.stop().catch(() => {});
    navigation.goBack();
  };

  const isActive = torchState.status === 'ACTIVE';
  const isUnavailable = torchState.status === 'FLASHLIGHT_UNAVAILABLE';

  return (
    <View style={styles.container}>
      <AppHeader
        title="SOS Flashlight"
        subtitle="Emergency Distress Beacon"
        showBack
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Large ON/OFF Status Display */}
        <View
          style={[
            styles.statusCard,
            isActive ? styles.statusCardOn : styles.statusCardOff,
          ]}>
          <Text style={styles.statusIcon}>
            {isActive ? '⚡' : '🔦'}
          </Text>
          <Text
            style={[
              styles.statusText,
              isActive ? styles.statusTextOn : styles.statusTextOff,
            ]}>
            {isActive ? 'FLASHLIGHT IS ON' : 'FLASHLIGHT IS OFF'}
          </Text>
          <Text style={styles.statusSub}>
            {isActive
              ? selectedMode === 'SOS'
                ? 'Flashing SOS Morse Code (... --- ...)'
                : 'Rapid flashing strobe is active'
              : isUnavailable
              ? 'No flashlight detected on this phone'
              : 'Ready to flash bright emergency light'}
          </Text>
        </View>

        {/* 2. Mode Selector: SOS SIGNAL vs STROBE */}
        {!isActive ? (
          <View style={styles.modeContainer}>
            <Text style={styles.modeTitle}>Choose Flashlight Mode:</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedMode('SOS')}
              accessibilityRole="button"
              accessibilityLabel="SOS Signal - International emergency call"
              style={[
                styles.modeButton,
                selectedMode === 'SOS' && styles.modeButtonSelected,
              ]}>
              <Text style={styles.modeIcon}>🚨</Text>
              <View style={styles.modeTextCol}>
                <Text style={styles.modeName}>SOS SIGNAL</Text>
                <Text style={styles.modeDesc}>
                  3 short, 3 long, 3 short flashes (... --- ...)
                </Text>
              </View>
              {selectedMode === 'SOS' ? (
                <Text style={styles.checkIcon}>✓</Text>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedMode('STROBE')}
              accessibilityRole="button"
              accessibilityLabel="Strobe - Fast continuous flashing"
              style={[
                styles.modeButton,
                selectedMode === 'STROBE' && styles.modeButtonSelected,
              ]}>
              <Text style={styles.modeIcon}>⚡</Text>
              <View style={styles.modeTextCol}>
                <Text style={styles.modeName}>STROBE</Text>
                <Text style={styles.modeDesc}>
                  Fast continuous flashing for high visibility
                </Text>
              </View>
              {selectedMode === 'STROBE' ? (
                <Text style={styles.checkIcon}>✓</Text>
              ) : null}
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 3. Large TURN ON / TURN OFF Button */}
        <View style={styles.actionContainer}>
          {isActive ? (
            <EmergencyButton
              title="TURN OFF FLASHLIGHT"
              subtitle="Tap here to immediately turn off the light"
              variant="warning"
              onPress={handleStop}
              style={styles.mainButton}
            />
          ) : (
            <EmergencyButton
              title={
                isUnavailable
                  ? 'FLASHLIGHT UNAVAILABLE'
                  : selectedMode === 'SOS'
                  ? 'TURN ON SOS SIGNAL'
                  : 'TURN ON STROBE'
              }
              subtitle={
                isUnavailable
                  ? 'No camera flash unit found on this device'
                  : 'Tap here to turn on the camera flashlight'
              }
              variant={isUnavailable ? 'disabled' : 'emergency'}
              disabled={isUnavailable}
              onPress={handleStart}
              style={styles.mainButton}
            />
          )}
        </View>

        {/* 4. Helpful Tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Helpful Tip:</Text>
          <Text style={styles.tipText}>
            Point the back of your phone up toward the sky or toward rescuers so the bright light can be seen from far away.
          </Text>
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
  statusCard: {
    borderRadius: THEME.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
    borderWidth: 3,
  },
  statusCardOff: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.surfaceBorder,
  },
  statusCardOn: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  statusIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statusTextOff: {
    color: THEME.colors.textPrimary,
  },
  statusTextOn: {
    color: '#B45309',
  },
  statusSub: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  modeContainer: {
    marginVertical: THEME.spacing.sm,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  modeButton: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 80,
  },
  modeButtonSelected: {
    borderColor: THEME.colors.signal,
    backgroundColor: '#EFF6FF',
  },
  modeIcon: {
    fontSize: 34,
    marginRight: 16,
  },
  modeTextCol: {
    flex: 1,
  },
  modeName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modeDesc: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.signal,
    marginLeft: 8,
  },
  actionContainer: {
    marginTop: 12,
  },
  mainButton: {
    minHeight: 76,
  },
  tipBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 18,
    borderWidth: 1.5,
    borderColor: THEME.colors.surfaceBorder,
    marginTop: 24,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    lineHeight: 26,
  },
});
