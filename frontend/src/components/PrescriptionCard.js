import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../utils/colors';
import { formatDate, getStatusColor, daysUntilExpiry } from '../utils/helpers';

const PrescriptionCard = ({ prescription, onPress, role }) => {
  const statusColor = getStatusColor(prescription.status);
  const daysLeft = daysUntilExpiry(prescription.expiryDate);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(prescription)} activeOpacity={0.85}>
      <View style={styles.header}>
        <View>
          <Text style={styles.diagnosis}>{prescription.diagnosis}</Text>
          <Text style={styles.sub}>
            {role === 'DOCTOR' ? `Patient: ${prescription.patientName}` : `Dr. ${prescription.doctorName}`}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{prescription.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <Text style={styles.label}>Prescribed</Text>
          <Text style={styles.value}>{formatDate(prescription.prescribedDate)}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.label}>Expires</Text>
          <Text style={[styles.value, daysLeft < 7 && daysLeft > 0 ? styles.expiringSoon : {}]}>
            {formatDate(prescription.expiryDate)}
          </Text>
        </View>
        <View style={styles.medCount}>
          <Text style={styles.countNumber}>{prescription.medications?.length || 0}</Text>
          <Text style={styles.countLabel}>Medications</Text>
        </View>
      </View>

      {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && prescription.status === 'ACTIVE' && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>⚠️ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</Text>
        </View>
      )}
    </TouchableOpacity>
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diagnosis: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  sub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInfo: {},
  label: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  expiringSoon: {
    color: COLORS.accent,
  },
  medCount: {
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  countLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  warning: {
    marginTop: 10,
    backgroundColor: COLORS.accentLight,
    padding: 8,
    borderRadius: 8,
  },
  warningText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PrescriptionCard;
