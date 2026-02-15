import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/Header';
import COLORS from '../../utils/colors';

const ReminderScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Reminders" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.title}>Medication Reminders</Text>
        <Text style={styles.desc}>
          Push notifications will be sent for each scheduled medication.
          Make sure notifications are enabled in your device settings.
        </Text>
        <View style={styles.tip}>
          <Text style={styles.tipText}>💡 You will receive reminders 15 minutes before each scheduled dose.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { alignItems: 'center', padding: 40 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  desc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  tip: {
    marginTop: 30, backgroundColor: COLORS.primaryLight + '40', borderRadius: 12,
    padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  tipText: { color: COLORS.primary, fontSize: 14 },
});

export default ReminderScreen;
