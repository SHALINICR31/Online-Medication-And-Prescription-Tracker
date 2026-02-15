import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import MedicationCard from '../../components/MedicationCard';
import medicationService from '../../services/medicationService';
import COLORS from '../../utils/colors';
import { formatDate } from '../../utils/helpers';

const MedicationSchedule = ({ navigation }) => {
  const { user } = useAuth();
  const [intakes, setIntakes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadIntakes = async (date) => {
    if (!user?.profileId) return;
    try {
      const dateStr = date.toISOString().split('T')[0];
      const data = await medicationService.getIntakesByDate(user.profileId, dateStr);
      setIntakes(data);
    } catch (err) {
      console.error('Load intakes error:', err);
    }
  };

  useFocusEffect(useCallback(() => { loadIntakes(selectedDate); }, [selectedDate]));

  const getDayDates = () => {
    const dates = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const isSelected = (date) =>
    date.toDateString() === selectedDate.toDateString();

  const isToday = (date) =>
    date.toDateString() === new Date().toDateString();

  const handleTake = async (med) => {
    try {
      await medicationService.updateIntakeStatus(med.id, 'TAKEN');
      loadIntakes(selectedDate);
    } catch (err) {
      Alert.alert('Error', 'Could not update medication status');
    }
  };

  const handleSkip = async (med) => {
    Alert.alert('Skip Medication', 'Are you sure you want to skip this dose?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        onPress: async () => {
          try {
            await medicationService.updateIntakeStatus(med.id, 'SKIPPED');
            loadIntakes(selectedDate);
          } catch (err) {
            Alert.alert('Error', 'Could not update status');
          }
        }
      }
    ]);
  };

  const taken = intakes.filter(i => i.status === 'TAKEN').length;
  const pending = intakes.filter(i => i.status === 'PENDING').length;

  return (
    <View style={styles.container}>
      <Header title="Medication Schedule" onBack={() => navigation.goBack()} />

      {/* Week Strip */}
      <View style={styles.weekStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getDayDates().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayItem, isSelected(date) && styles.dayActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayName, isSelected(date) && styles.dayTextActive]}>
                {date.toLocaleDateString('en', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayNum, isSelected(date) && styles.dayTextActive]}>
                {date.getDate()}
              </Text>
              {isToday(date) && <View style={styles.todayDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date Header */}
      <View style={styles.dateRow}>
        <Text style={styles.selectedDate}>{formatDate(selectedDate.toISOString())}</Text>
        <Text style={styles.summary}>{taken} taken · {pending} pending</Text>
      </View>

      {/* Intake List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {intakes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>😴</Text>
            <Text style={styles.emptyTitle}>No medications scheduled</Text>
            <Text style={styles.emptyText}>You're all clear for this day!</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {intakes.map(intake => (
              <MedicationCard
                key={intake.id}
                medication={intake}
                onTake={handleTake}
                onSkip={handleSkip}
                showActions={isSelected(selectedDate) && new Date().toDateString() === selectedDate.toDateString()}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  weekStrip: { backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 8, elevation: 2 },
  dayItem: { alignItems: 'center', width: 52, paddingVertical: 8, borderRadius: 12, marginHorizontal: 3 },
  dayActive: { backgroundColor: COLORS.primary },
  dayName: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  dayNum: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  dayTextActive: { color: COLORS.white },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 3 },
  dateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
  },
  selectedDate: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  summary: { fontSize: 13, color: COLORS.textSecondary },
  scroll: { flex: 1 },
  list: { padding: 16 },
  empty: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
});

export default MedicationSchedule;
