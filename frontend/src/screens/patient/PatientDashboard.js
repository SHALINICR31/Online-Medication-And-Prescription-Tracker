import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import MedicationCard from '../../components/MedicationCard';
import PrescriptionCard from '../../components/PrescriptionCard';
import CustomButton from '../../components/CustomButton';
import medicationService from '../../services/medicationService';
import prescriptionService from '../../services/prescriptionService';

// ── Palette ────────────────────────────────────────────────────────────────
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
  textPri:   '#F0F6FF',
  textSec:   '#7A95B0',
  textDim:   '#3D5168',
  border:    '#1E3045',
};

// ── Mini bar progress ──────────────────────────────────────────────────────
const MiniBar = ({ value, max, color }) => (
  <View style={{ flex: 1, height: 5, backgroundColor: '#1E3045', borderRadius: 3, overflow: 'hidden' }}>
    <View style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
  </View>
);

// ── Sparkline bars ─────────────────────────────────────────────────────────
const Sparkline = ({ data, color, height = 40 }) => {
  const max = Math.max(...data);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 3 }}>
      {data.map((v, i) => (
        <View key={i} style={{
          flex: 1,
          height: (v / max) * height,
          backgroundColor: i === data.length - 1 ? color : color + '55',
          borderRadius: 3,
        }} />
      ))}
    </View>
  );
};

// ── Ring indicator ─────────────────────────────────────────────────────────
const Ring = ({ percent, color, label }) => (
  <View style={{ alignItems: 'center', gap: 5 }}>
    <View style={{
      width: 54, height: 54, borderRadius: 27,
      borderWidth: 5,
      borderColor: color + '30',
      borderTopColor: percent > 0  ? color : color + '30',
      borderRightColor: percent > 25 ? color : color + '30',
      borderBottomColor: percent > 50 ? color : color + '30',
      borderLeftColor: percent > 75 ? color : color + '30',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 11, fontWeight: '900', color: C.textPri }}>{percent}%</Text>
    </View>
    <Text style={{ fontSize: 9, color: C.textSec, fontWeight: '600' }}>{label}</Text>
  </View>
);

// ══════════════════════════════════════════════════════════════════════════
const PatientDashboard = ({ navigation }) => {

  // ── ALL ORIGINAL LOGIC — UNTOUCHED ────────────────────────────────────
  const { user, logout } = useAuth();
  const [todayMeds, setTodayMeds]           = useState([]);
  const [prescriptions, setPrescriptions]   = useState([]);
  const [adherence, setAdherence]           = useState({ taken: 0, missed: 0, adherenceRate: 0 });
  const [refreshing, setRefreshing]         = useState(false);

  const patientId = user?.profileId;

  const loadData = async () => {
    if (!patientId) return;
    try {
      const [meds, prescr, adh] = await Promise.all([
        medicationService.getTodayIntakes(patientId),
        prescriptionService.getActiveByPatient(patientId),
        medicationService.getAdherence(patientId),
      ]);
      setTodayMeds(meds);
      setPrescriptions(prescr);
      setAdherence(adh);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleTake = async (med) => { await medicationService.updateIntakeStatus(med.id, 'TAKEN'); loadData(); };
  const handleSkip = async (med) => { await medicationService.updateIntakeStatus(med.id, 'SKIPPED'); loadData(); };

  const pendingCount = todayMeds.filter(m => m.status === 'PENDING').length;
  const takenToday   = todayMeds.filter(m => m.status === 'TAKEN').length;
  // ──────────────────────────────────────────────────────────────────────

  const firstName = user?.name?.split(' ')[0] || 'Patient';
  const initials  = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PT';

  const vitals = [
    { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', icon: '🩸', color: C.red,    bar: 72 },
    { label: 'Heart Rate',     value: '74',     unit: 'bpm',  icon: '💓', color: C.teal,   bar: 60 },
    { label: 'Sugar Level',    value: '105',    unit: 'mg/dL',icon: '🍬', color: C.amber,  bar: 55 },
    { label: 'Hemoglobin',     value: '13.8',   unit: 'g/dL', icon: '🔬', color: C.purple, bar: 80 },
  ];

  const weeklyTrend = [62, 70, 68, 85, 78, 90, 83];

  const reports = [
    { id: 'r1', title: 'Blood Panel',     date: 'Feb 10, 2026', doctor: 'Dr. Isabella Bowen', status: 'Normal',   icon: '🩸', color: C.green  },
    { id: 'r2', title: 'ECG Report',      date: 'Jan 28, 2026', doctor: 'Dr. R. Sharma',      status: 'Review',   icon: '📈', color: C.amber  },
    { id: 'r3', title: 'MRI Brain Scan',  date: 'Jan 15, 2026', doctor: 'Dr. A. Mehta',       status: 'Normal',   icon: '🧠', color: C.purple },
    { id: 'r4', title: 'Thyroid Profile', date: 'Dec 30, 2025', doctor: 'Dr. Isabella Bowen', status: 'Abnormal', icon: '⚗️',  color: C.red    },
  ];

  return (
    <View style={s.root}>

      {/* ╔══════════════════════════════╗
          ║  LEFT COLUMN                 ║
          ╚══════════════════════════════╝ */}
      <View style={s.leftCol}>

        {/* ── TOP-LEFT: PROFILE ───────────────────────── */}
        <View style={s.profileCard}>
          {/* Avatar with teal ring */}
          <View style={s.avatarRing}>
            <View style={s.avatarInner}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={s.onlineDot} />
          </View>

          <Text style={s.profileName}>{user?.name || 'Patient'}</Text>
          <Text style={s.greetingSmall}>
            Good Morning,{' '}
            <Text style={s.greetingName}>{firstName} 👋</Text>
          </Text>

          <View style={s.tagRow}>
            <View style={[s.tag, { backgroundColor: C.tealDim }]}>
              <Text style={[s.tagTxt, { color: C.teal }]}>Patient</Text>
            </View>
            <View style={[s.tag, { backgroundColor: C.greenDim }]}>
              <Text style={[s.tagTxt, { color: C.green }]}>Active</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Quick stats */}
          <View style={s.miniStats}>
            {[
              { label: 'Taken',     val: takenToday,                         color: C.teal  },
              { label: 'Pending',   val: pendingCount,                       color: C.amber },
              { label: 'Adherence', val: `${adherence.adherenceRate || 0}%`, color: C.green },
            ].map((st, i) => (
              <View key={i} style={s.miniStatItem}>
                <Text style={[s.miniStatVal, { color: st.color }]}>{st.val}</Text>
                <Text style={s.miniStatLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={s.logoutBtn} onPress={logout}>
            <Text style={s.logoutTxt}>↩  Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── BOTTOM-LEFT: HEART & VITALS ─────────────── */}
        <View style={s.vitalsCard}>
          {/* Header */}
          <View style={s.vitalsHeader}>
            <View style={s.heartBubble}>
              <Text style={s.heartEmoji}>♥</Text>
            </View>
            <View>
              <Text style={s.vitalsTitle}>Heart & Vitals</Text>
              <Text style={s.vitalsSub}>Updated: Today 9:00 AM</Text>
            </View>
          </View>

          {/* Decorative ECG line */}
          <View style={s.ecgRow}>
            {[3,6,2,9,4,7,3,10,5,6,2,7,4,9,3].map((v, i) => (
              <View key={i} style={[s.ecgBar, {
                height: v * 2.4,
                backgroundColor: i === 7 ? C.red : (i % 3 === 1 ? C.teal + '88' : C.tealDim),
              }]} />
            ))}
          </View>

          {/* Vital rows */}
          {vitals.map((v, i) => (
            <View key={i} style={s.vitalRow}>
              <Text style={s.vitalIcon}>{v.icon}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.vitalLabel}>{v.label}</Text>
                  <View style={[s.normalBadge, { backgroundColor: C.greenDim }]}>
                    <Text style={[s.normalTxt, { color: C.green }]}>✓ Normal</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={[s.vitalValue, { color: v.color }]}>{v.value}</Text>
                  <Text style={s.vitalUnit}>{v.unit}</Text>
                </View>
                <MiniBar value={v.bar} max={100} color={v.color} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ╔══════════════════════════════╗
          ║  RIGHT COLUMN                ║
          ╚══════════════════════════════╝ */}
      <ScrollView
        style={s.rightCol}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={C.teal}
          />
        }
      >

        {/* ── TOP-RIGHT: ANALYTICS BOARD ──────────────── */}
        <View style={s.analyticsCard}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>📊  Analytics Board</Text>
            <Text style={s.cardSub}>{new Date().toDateString()}</Text>
          </View>

          {/* Ring gauges + legend */}
          <View style={s.ringsRow}>
            <Ring
              percent={Math.min(adherence.adherenceRate || 83, 100)}
              color={C.teal}
              label="Taken"
            />
            <Ring
              percent={Math.min(((adherence.missed || 1) / (takenToday + pendingCount + (adherence.missed || 1))) * 100 | 0, 100)}
              color={C.red}
              label="Missed"
            />
            <Ring percent={5} color={C.amber} label="Skipped" />

            {/* Legend */}
            <View style={s.legend}>
              <Text style={s.legendTitle}>Summary</Text>
              {[
                { label: 'Total Doses', val: takenToday + pendingCount, color: C.textPri },
                { label: 'Taken',       val: takenToday,                color: C.teal   },
                { label: 'Pending',     val: pendingCount,              color: C.amber  },
                { label: 'Missed',      val: adherence.missed || 0,     color: C.red    },
              ].map((item, i) => (
                <View key={i} style={s.legendRow}>
                  <View style={[s.legendDot, { backgroundColor: item.color }]} />
                  <Text style={s.legendLabel}>{item.label}</Text>
                  <Text style={[s.legendVal, { color: item.color }]}>{item.val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sparkline */}
          <View style={{ gap: 6 }}>
            <Text style={s.sparkLabel}>7-Day Adherence Trend</Text>
            <Sparkline data={weeklyTrend} color={C.teal} height={44} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                <Text key={i} style={s.sparkDay}>{d}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── TODAY'S MEDICATIONS ─────────────────────── */}
        <View style={s.sectionCard}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>💊  Today's Medications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MedicationSchedule')}>
              <Text style={s.linkTxt}>View All →</Text>
            </TouchableOpacity>
          </View>
          {todayMeds.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🎉</Text>
              <Text style={s.emptyText}>No medications for today!</Text>
            </View>
          ) : (
            todayMeds.map(med => (
              <MedicationCard key={med.id} medication={med} onTake={handleTake} onSkip={handleSkip} />
            ))
          )}
        </View>

        {/* ── ACTIVE PRESCRIPTIONS ────────────────────── */}
        <View style={s.sectionCard}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>📋  Active Prescriptions</Text>
          </View>
          {prescriptions.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No active prescriptions</Text>
            </View>
          ) : (
            prescriptions.slice(0, 3).map(p => (
              <PrescriptionCard
                key={p.id}
                prescription={p}
                role="PATIENT"
                onPress={() => navigation.navigate('PrescriptionDetail', { prescription: p })}
              />
            ))
          )}
          <CustomButton
            title="View Full Schedule →"
            variant="outline"
            onPress={() => navigation.navigate('MedicationSchedule')}
            style={s.viewBtn}
          />
        </View>

        {/* ── BOTTOM-RIGHT: PREVIOUS REPORTS ──────────── */}
        <View style={[s.sectionCard, { marginBottom: 24 }]}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>🗂  Previous Reports</Text>
            <TouchableOpacity>
              <Text style={s.linkTxt}>See All →</Text>
            </TouchableOpacity>
          </View>

          {reports.map(rpt => (
            <TouchableOpacity key={rpt.id} style={s.reportRow} activeOpacity={0.75}>
              <View style={[s.reportIcon, { backgroundColor: rpt.color + '22' }]}>
                <Text style={{ fontSize: 20 }}>{rpt.icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.reportTitle}>{rpt.title}</Text>
                <Text style={s.reportMeta}>{rpt.doctor}</Text>
                <Text style={s.reportDate}>{rpt.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 5 }}>
                <View style={[s.reportBadge, {
                  backgroundColor:
                    rpt.status === 'Normal'   ? C.greenDim :
                    rpt.status === 'Abnormal' ? C.redDim   : C.amberDim,
                }]}>
                  <Text style={[s.reportBadgeTxt, {
                    color:
                      rpt.status === 'Normal'   ? C.green :
                      rpt.status === 'Abnormal' ? C.red   : C.amber,
                  }]}>{rpt.status}</Text>
                </View>
                <Text style={[s.reportArrow, { color: rpt.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

// ════════════════════════════════════════════════════════════════════════════
const SCALE = 1.2; // Adjust this factor for bigger or smaller UI

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },

  // ── LEFT COLUMN ───────────────────────────────────────────────
  leftCol: {
    width: 215 * SCALE,
    backgroundColor: C.panel,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },

  profileCard: {
    padding: 18 * SCALE,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatarRing: {
    width: 196 * SCALE,
    height: 196 * SCALE,
    borderRadius: 38 * SCALE,
    borderWidth: 2.5,
    borderColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10 * SCALE,
    position: 'relative',
  },
  avatarInner: {
    width: 80 * SCALE,
    height: 80 * SCALE,
    borderRadius: 32 * SCALE,
    backgroundColor: C.tealDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 * SCALE, fontWeight: '900', color: C.teal, letterSpacing: 1 },
  onlineDot: {
    position: 'absolute', bottom: 3 * SCALE, right: 3 * SCALE,
    width: 13 * SCALE, height: 13 * SCALE, borderRadius: 7 * SCALE,
    backgroundColor: C.green,
    borderWidth: 2, borderColor: C.panel,
  },
  profileName: { fontSize: 24 * SCALE, fontWeight: '800', color: C.textPri, textAlign: 'center', marginBottom: 3 * SCALE },
  greetingSmall: { fontSize: 20 * SCALE, color: C.textSec, textAlign: 'center', lineHeight: 18 * SCALE, marginBottom: 10 * SCALE },
  greetingName: { color: C.teal, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: 6 * SCALE, marginBottom: 12 * SCALE },
  tag: { paddingHorizontal: 19 * SCALE, paddingVertical: 3 * SCALE, borderRadius: 20 * SCALE },
  tagTxt: { fontSize: 19 * SCALE, fontWeight: '800', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: C.border, width: '100%', marginBottom: 12 * SCALE },
  miniStats: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 14 * SCALE },
  miniStatItem: { alignItems: 'center' },
  miniStatVal: { fontSize: 16 * SCALE, fontWeight: '900' },
  miniStatLabel: { fontSize: 16 * SCALE, color: C.textSec, marginTop: 2 * SCALE },
  logoutBtn: {
    backgroundColor: C.redDim,
    paddingHorizontal: 20 * SCALE, paddingVertical: 8 * SCALE,
    borderRadius: 10 * SCALE,
    borderWidth: 1, borderColor: C.red + '44',
  },
  logoutTxt: { color: C.red, fontSize: 13 * SCALE, fontWeight: '700' },

  // Vitals
  vitalsCard: { flex: 1, padding: 14 * SCALE },
  vitalsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 * SCALE, marginBottom: 10 * SCALE },
  heartBubble: {
    width: 36 * SCALE, height: 36 * SCALE, borderRadius: 18 * SCALE,
    backgroundColor: C.redDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: C.red + '55',
  },
  heartEmoji: { fontSize: 25 * SCALE, color: C.red },
  vitalsTitle: { fontSize: 14 * SCALE, fontWeight: '800', color: C.textPri },
  vitalsSub:   { fontSize: 11 * SCALE, color: C.textSec, marginTop: 1 * SCALE },
  ecgRow: { flexDirection: 'row', alignItems: 'center', gap: 2 * SCALE, height: 26 * SCALE, marginBottom: 12 * SCALE },
  ecgBar: { flex: 1, borderRadius: 1.5 * SCALE },
  vitalRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8 * SCALE,
    marginBottom: 10 * SCALE, backgroundColor: C.card,
    borderRadius: 11 * SCALE, padding: 9 * SCALE,
    borderWidth: 1, borderColor: C.border,
  },
  vitalIcon: { fontSize: 18 * SCALE, marginTop: 1 * SCALE },
  vitalLabel: { fontSize: 10 * SCALE, color: C.textSec, fontWeight: '600' },
  normalBadge: { paddingHorizontal: 6 * SCALE, paddingVertical: 2 * SCALE, borderRadius: 6 * SCALE },
  normalTxt: { fontSize: 9 * SCALE, fontWeight: '800' },
  vitalValue: { fontSize: 18 * SCALE, fontWeight: '900' },
  vitalUnit:  { fontSize: 10 * SCALE, color: C.textSec },

  // ── RIGHT COLUMN ───────────────────────────────────────────────
  rightCol: { flex: 1, paddingHorizontal: 14 * SCALE, paddingTop: 14 * SCALE },
  analyticsCard: { backgroundColor: C.panel, borderRadius: 18 * SCALE, padding: 16 * SCALE, marginBottom: 12 * SCALE, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 * SCALE },
  cardTitle: { fontSize: 15 * SCALE, fontWeight: '800', color: C.textPri },
  cardSub: { fontSize: 12 * SCALE, color: C.textSec },
  linkTxt: { fontSize: 13 * SCALE, color: C.teal, fontWeight: '700' },

  ringsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE, marginBottom: 14 * SCALE },
  legend: { flex: 1, gap: 5 * SCALE, marginLeft: 5 * SCALE },
  legendTitle: { fontSize: 11 * SCALE, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6 * SCALE, marginBottom: 3 * SCALE },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 * SCALE },
  legendDot: { width: 7 * SCALE, height: 7 * SCALE, borderRadius: 3.5 * SCALE },
  legendLabel: { flex: 1, fontSize: 11 * SCALE, color: C.textSec },
  legendVal: { fontSize: 12 * SCALE, fontWeight: '800' },
  sparkLabel: { fontSize: 12 * SCALE, color: C.textSec, fontWeight: '600' },
  sparkDay: { fontSize: 10 * SCALE, color: C.textDim, flex: 1, textAlign: 'center' },

  sectionCard: { backgroundColor: C.panel, borderRadius: 18 * SCALE, padding: 14 * SCALE, marginBottom: 12 * SCALE, borderWidth: 1, borderColor: C.border },
  empty: { alignItems: 'center', padding: 22 * SCALE, backgroundColor: C.card, borderRadius: 12 * SCALE },
  emptyIcon: { fontSize: 36 * SCALE, marginBottom: 6 * SCALE },
  emptyText: { fontSize: 14 * SCALE, color: C.textSec },
  viewBtn: { marginTop: 10 * SCALE, borderColor: C.teal, borderRadius: 12 * SCALE },

  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 * SCALE, backgroundColor: C.card, borderRadius: 13 * SCALE, padding: 11 * SCALE, marginBottom: 9 * SCALE },
  reportIcon: { width: 50 * SCALE, height: 50 * SCALE, borderRadius: 14 * SCALE, alignItems: 'center', justifyContent: 'center' },
  reportTitle: { fontSize: 14 * SCALE, fontWeight: '800', color: C.textPri },
  reportMeta: { fontSize: 10 * SCALE, color: C.textSec },
  reportDate: { fontSize: 10 * SCALE, color: C.textDim },
  reportBadge: { paddingHorizontal: 8 * SCALE, paddingVertical: 4 * SCALE, borderRadius: 7 * SCALE },
  reportBadgeTxt: { fontSize: 9 * SCALE, fontWeight: '800' },
  reportArrow: { fontSize: 26 * SCALE, fontWeight: '700', lineHeight: 26 * SCALE },
});


export default PatientDashboard;