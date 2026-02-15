import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import StatsCard from '../../components/StatsCard';
import PrescriptionCard from '../../components/PrescriptionCard';
import CustomButton from '../../components/CustomButton';
import prescriptionService from '../../services/prescriptionService';
import COLORS from '../../utils/colors';

// ── Shared dark palette (matches PatientDashboard) ─────────────────────────
const C = {
  bg:        '#0F1B2D',
  panel:     '#162032',
  card:      '#1C2B3A',
  teal:      '#00C9B1',
  tealDim:   '#00C9B133',
  red:       '#FF5F7E',
  redDim:    '#FF5F7E22',
  amber:     '#FBBF24',
  amberDim:  '#FBBF2422',
  green:     '#34D399',
  greenDim:  '#34D39922',
  purple:    '#A78BFA',
  purpleDim: '#A78BFA22',
  blue:      '#60A5FA',
  blueDim:   '#60A5FA22',
  textPri:   '#F0F6FF',
  textSec:   '#7A95B0',
  textDim:   '#3D5168',
  border:    '#1E3045',
};

const DoctorDashboard = ({ navigation }) => {
  // ── ALL ORIGINAL LOGIC — UNTOUCHED ────────────────────────────────────
  const { user, logout } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const doctorId = user?.profileId;

  const loadData = async () => {
    if (!doctorId) return;
    try {
      const data = await prescriptionService.getByDoctor(doctorId);
      setPrescriptions(data);
    } catch (err) {
      console.error('Doctor dashboard error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const activeCount    = prescriptions.filter(p => p.status === 'ACTIVE').length;
  const completedCount = prescriptions.filter(p => p.status === 'COMPLETED').length;
  const uniquePatients = new Set(prescriptions.map(p => p.patientId)).size;
  // ──────────────────────────────────────────────────────────────────────

  const firstName = user?.name?.split(' ')[0] || 'Doctor';
  const initials  = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';

  const stats = [
    { label: 'Patients',   val: uniquePatients, icon: '👥', color: C.blue,   bg: C.blueDim   },
    { label: 'Active Rx',  val: activeCount,    icon: '📋', color: C.teal,   bg: C.tealDim   },
    { label: 'Completed',  val: completedCount, icon: '✅', color: C.green,  bg: C.greenDim  },
  ];

  return (
    <View style={s.root}>

      {/* ── HEADER ───────────────────────────────────────── */}
      <View style={s.header}>
        {/* Left: avatar + greeting */}
        <View style={s.headerLeft}>
          <View style={s.avatarRing}>
            <View style={s.avatarInner}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={s.onlineDot} />
          </View>
          <View>
            <Text style={s.greetingSmall}>
              Good Day,{' '}
              <Text style={s.greetingAccent}>Dr. {firstName} 👨‍⚕️</Text>
            </Text>
            <Text style={s.greetingMain}>Doctor Dashboard</Text>
            <Text style={s.greetingSub}>Manage your patients' prescriptions</Text>
          </View>
        </View>
        {/* Right: logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutTxt}>↩  Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={C.teal}
          />
        }
      >

        {/* ── STATS ROW ────────────────────────────────────── */}
        <View style={s.statsRow}>
          {stats.map((st, i) => (
            <View key={i} style={[s.statCard, { borderTopColor: st.color }]}>
              <View style={[s.statIconBubble, { backgroundColor: st.bg }]}>
                <Text style={s.statIcon}>{st.icon}</Text>
              </View>
              <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── QUICK ACTIONS ────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>⚡  Quick Actions</Text>
          </View>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionCard, { borderColor: C.teal + '55' }]}
              onPress={() => navigation.navigate('CreatePrescription')}
              activeOpacity={0.8}
            >
              <View style={[s.actionIconBubble, { backgroundColor: C.tealDim }]}>
                <Text style={s.actionEmoji}>📝</Text>
              </View>
              <Text style={[s.actionTitle, { color: C.teal }]}>New Prescription</Text>
              <Text style={s.actionSub}>Create & assign instantly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionCard, { borderColor: C.purple + '55' }]}
              onPress={() => navigation.navigate('PatientList')}
              activeOpacity={0.8}
            >
              <View style={[s.actionIconBubble, { backgroundColor: C.purpleDim }]}>
                <Text style={s.actionEmoji}>👥</Text>
              </View>
              <Text style={[s.actionTitle, { color: C.purple }]}>Patient List</Text>
              <Text style={s.actionSub}>View all assigned patients</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── RECENT PRESCRIPTIONS ─────────────────────────── */}
        <View style={[s.section, { paddingBottom: 100 }]}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>📋  Recent Prescriptions</Text>
            <Text style={s.sectionCount}>{prescriptions.length} total</Text>
          </View>

          {prescriptions.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>No prescriptions yet</Text>
              <Text style={s.emptyText}>Start by creating your first prescription</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('CreatePrescription')}
              >
                <Text style={s.emptyBtnTxt}>+ Create First Prescription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            prescriptions.slice(0, 5).map(p => (
              <PrescriptionCard
                key={p.id}
                prescription={p}
                role="DOCTOR"
                onPress={() => navigation.navigate('PrescriptionDetail', { prescription: p })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────── */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreatePrescription')}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.panel,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: {
    width: 176, height: 176, borderRadius: 28,
    borderWidth: 2, borderColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarInner: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.tealDim,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:   { fontSize: 17, fontWeight: '900', color: C.teal, letterSpacing: 1 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.green,
    borderWidth: 2, borderColor: C.panel,
  },
  greetingSmall:  { fontSize: 11, color: C.textSec },
  greetingAccent: { color: C.teal, fontWeight: '700' },
  greetingMain:   { fontSize: 18, fontWeight: '900', color: C.textPri, marginTop: 1 },
  greetingSub:    { fontSize: 11, color: C.textSec, marginTop: 1 },
  logoutBtn: {
    backgroundColor: C.redDim,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1, borderColor: C.red + '44',
  },
  logoutTxt: { color: C.red, fontSize: 12, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  statIconBubble: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  statIcon:  { fontSize: 20 },
  statVal:   { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 10, color: C.textSec, fontWeight: '600' },

  // Section
  section:      { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontSize: 14, fontWeight: '800', color: C.textPri },
  sectionCount:  { fontSize: 11, color: C.textSec },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  actionIconBubble: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  actionEmoji: { fontSize: 26 },
  actionTitle: { fontSize: 13, fontWeight: '800' },
  actionSub:   { fontSize: 10, color: C.textSec, textAlign: 'center' },

  // Empty
  emptyCard: {
    backgroundColor: C.panel,
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyIcon:  { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.textPri },
  emptyText:  { fontSize: 13, color: C.textSec, textAlign: 'center' },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: C.teal,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnTxt: { color: '#000', fontWeight: '800', fontSize: 13 },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 28,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.teal,
    shadowOpacity: 0.5, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  fabText: { color: '#0F1B2D', fontSize: 30, fontWeight: '300', lineHeight: 34 },
});

export default DoctorDashboard;