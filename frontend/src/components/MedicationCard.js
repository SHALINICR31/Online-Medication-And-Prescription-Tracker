import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../utils/colors';
import { getStatusColor } from '../utils/helpers';

const MedicationCard = ({ medication, onTake, onSkip, showActions = true }) => {
  const statusColor = getStatusColor(medication.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.pillIcon}>
          <Text style={styles.pillEmoji}>💊</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{medication.medicationName}</Text>
          <Text style={styles.dosage}>{medication.dosage}</Text>
          <Text style={styles.time}>{medication.scheduledTime}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {medication.status}
          </Text>
        </View>
      </View>

      {medication.instructions && (
        <Text style={styles.instructions}>ℹ️ {medication.instructions}</Text>
      )}

      {showActions && medication.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.takeBtn]}
            onPress={() => onTake && onTake(medication)}
          >
            <Text style={styles.takeBtnText}>✓ Taken</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.skipBtn]}
            onPress={() => onSkip && onSkip(medication)}
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dosage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  instructions: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 10,
    padding: 8,
    backgroundColor: COLORS.accentLight,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  takeBtn: {
    backgroundColor: COLORS.secondary,
  },
  skipBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  takeBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  skipBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MedicationCard;
