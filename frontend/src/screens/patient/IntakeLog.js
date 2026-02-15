// IntakeLog.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import medicationService from '../../services/medicationService';
import COLORS from '../../utils/colors';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const IntakeLog = ({ navigation }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  const load = async () => {
    if (!user?.profileId) return;
    try {
      const data = await medicationService.getIntakeHistory(user.profileId);
      const sorted = data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setHistory(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={styles.item}>
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
        <View style={styles.details}>
          <Text style={styles.medName}>{item.medicationName}</Text>
          <Text style={styles.time}>{item.scheduledDate} at {item.scheduledTime}</Text>
          {item.takenAt && <Text style={styles.takenAt}>Taken: {formatDateTime(item.takenAt)}</Text>}
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Intake History" onBack={() => navigation.goBack()} />
      <FlatList
        data={history}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 44 }}>📋</Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>No intake history yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', elevation: 2,
  },
  statusBar: { width: 5, height: '100%', minHeight: 60 },
  details: { flex: 1, padding: 14 },
  medName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  time: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  takenAt: { fontSize: 11, color: COLORS.secondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 40 },
});

export default IntakeLog;
