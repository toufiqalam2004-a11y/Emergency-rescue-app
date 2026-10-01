import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {THEME} from '../config/theme';
import {AppHeader, EmergencyButton} from '../components';
import {NavigationProp} from '../navigation/types';

interface RequestRescueScreenProps {
  navigation: NavigationProp;
}

type EmergencyChoice = 'MEDICAL' | 'FOOD' | 'WATER' | 'TRAPPED' | 'OTHER';

const CHOICES: {id: EmergencyChoice; label: string; icon: string; description: string}[] = [
  {id: 'MEDICAL', label: 'MEDICAL', icon: '🚑', description: 'Injury, sickness, or medicine needed'},
  {id: 'FOOD', label: 'FOOD', icon: '🍞', description: 'Need emergency food supply'},
  {id: 'WATER', label: 'WATER', icon: '💧', description: 'Need clean drinking water'},
  {id: 'TRAPPED', label: 'TRAPPED', icon: '🏚️', description: 'Cannot leave building or area'},
  {id: 'OTHER', label: 'OTHER', icon: '❓', description: 'Other urgent emergency assistance'},
];

export const RequestRescueScreen: React.FC<RequestRescueScreenProps> = ({
  navigation,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<EmergencyChoice>('MEDICAL');
  const [headcount, setHeadcount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const handleSendRequest = () => {
    Alert.alert(
      'Help Request Prepared',
      `Emergency: ${selectedChoice}\nPeople: ${headcount}\n\nYour request has been saved and prepared for the emergency network.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Request Help"
        subtitle="Step 1 of 1: Tell Us What You Need"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* 1. Large Choices */}
        <Text style={styles.sectionTitle}>What help do you need?</Text>
        <Text style={styles.sectionSubtitle}>Please tap one option below:</Text>

        <View style={styles.choicesList}>
          {CHOICES.map(item => {
            const isSelected = selectedChoice === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => setSelectedChoice(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.description}`}
                accessibilityState={{selected: isSelected}}
                style={[
                  styles.choiceCard,
                  isSelected && styles.choiceCardSelected,
                ]}>
                <Text style={styles.choiceIcon}>{item.icon}</Text>
                <View style={styles.choiceTextCol}>
                  <Text
                    style={[
                      styles.choiceLabel,
                      isSelected && styles.choiceLabelSelected,
                    ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.choiceDesc}>{item.description}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Headcount Stepper */}
        <Text style={styles.sectionTitle}>How many people need help?</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setHeadcount(Math.max(1, headcount - 1))}
            accessibilityLabel="Decrease count"
            style={styles.stepperButton}>
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>

          <View style={styles.headcountDisplay}>
            <Text style={styles.headcountNumber}>{headcount}</Text>
            <Text style={styles.headcountUnit}>
              {headcount === 1 ? 'PERSON' : 'PEOPLE'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setHeadcount(Math.min(99, headcount + 1))}
            accessibilityLabel="Increase count"
            style={styles.stepperButton}>
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Optional Simple Note */}
        <Text style={styles.sectionTitle}>Address or Extra Details (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 2nd floor, blue house, need insulin"
          placeholderTextColor={THEME.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          maxLength={100}
          multiline
        />

        {/* 4. Large Send Button */}
        <View style={styles.actionContainer}>
          <EmergencyButton
            title="🚨 SEND REQUEST"
            subtitle="Send your emergency call for help"
            variant="emergency"
            onPress={handleSendRequest}
            style={styles.sendButton}
          />
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
    marginBottom: 12,
  },
  choicesList: {
    gap: 12,
    marginVertical: 6,
  },
  choiceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 74,
  },
  choiceCardSelected: {
    borderColor: THEME.colors.emergency,
    backgroundColor: '#FEF2F2',
  },
  choiceIcon: {
    fontSize: 34,
    marginRight: 16,
  },
  choiceTextCol: {
    flex: 1,
  },
  choiceLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  choiceLabelSelected: {
    color: THEME.colors.emergency,
  },
  choiceDesc: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioCircleSelected: {
    borderColor: THEME.colors.emergency,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.emergency,
  },
  stepperContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  stepperButton: {
    width: 64,
    height: 64,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.signal,
  },
  stepperBtnText: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME.colors.signal,
  },
  headcountDisplay: {
    alignItems: 'center',
  },
  headcountNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  headcountUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  textInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.lg,
    color: THEME.colors.textPrimary,
    padding: 16,
    fontSize: 18,
    minHeight: 90,
    textAlignVertical: 'top',
    marginTop: 8,
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 8,
  },
  sendButton: {
    minHeight: 76,
  },
});
