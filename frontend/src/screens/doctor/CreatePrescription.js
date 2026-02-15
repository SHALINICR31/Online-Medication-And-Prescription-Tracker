import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import prescriptionService from '../../services/prescriptionService';
import COLORS from '../../utils/colors';
import { FREQUENCY_OPTIONS } from '../../utils/constants';

// ── Shared dark palette ────────────────────────────────────────────────────
const C = {
  bg:        '#0F1B2D',
  panel:     '#162032',
  card:      '#1C2B3A',
  teal:      '#00C9B1',
  tealDim:   '#00C9B133',
  tealGlow:  '#00C9B166',
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

const CreatePrescription = ({ navigation, route }) => {
  // ── ALL ORIGINAL LOGIC — UNTOUCHED ────────────────────────────────────
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientId:   route?.params?.patientId   || '',
    patientName: route?.params?.patientName || '',
    diagnosis:   '',
    notes:       '',
    expiryDate:  '',
  });
  const [medications, setMedications] = useState([{
    medicationName: '', dosage: '', frequency: 'ONCE_DAILY',
    instructions: '', durationDays: 7,
  }]);

  const set    = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setMed = (index, key, val) => {
    setMedications(prev => prev.map((m, i) => i === index ? { ...m, [key]: val } : m));
  };

  const addMedication = () => {
    setMedications(prev => [...prev, {
      medicationName: '', dosage: '', frequency: 'ONCE_DAILY',
      instructions: '', durationDays: 7,
    }]);
  };

  const removeMedication = (index) => {
    if (medications.length === 1) return;
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.patientId.trim())   { Alert.alert('Error', 'Patient ID is required'); return; }
    if (!form.diagnosis.trim())   { Alert.alert('Error', 'Diagnosis is required'); return; }
    if (medications.some(m => !m.medicationName.trim())) {
      Alert.alert('Error', 'All medications need a name');
      return;
    }
    setLoading(true);
    try {
      const prescription = {
        doctorId:   user.profileId,
        doctorName: user.name,
        ...form,
        expiryDate: form.expiryDate || getDefaultExpiry(),
        medications,
      };
      await prescriptionService.create(prescription);
      Alert.alert('Success', 'Prescription created!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };
  // ──────────────────────────────────────────────────────────────────────

  const MED_COLORS = [C.teal, C.purple, C.amber, C.green, C.red];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.root}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>New Prescription</Text>
            <Text style={s.headerSub}>
              {form.patientName ? `For ${form.patientName}` : 'Fill in patient details below'}
            </Text>
          </View>
          {/* Progress pill */}
          <View style={s.progressPill}>
            <Text style={s.progressTxt}>{medications.length} med{medications.length > 1 ? 's' : ''}</Text>
          </View>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── SECTION 1: PATIENT INFO ────────────────────── */}
          <View style={s.sectionWrap}>
            <View style={s.sectionLabelRow}>
              <View style={[s.sectionDot, { backgroundColor: C.purple }]} />
              <Text style={s.sectionLabel}>Patient Information</Text>
            </View>
            <View style={s.sectionCard}>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Patient ID</Text>
                <InputField
                  value={form.patientId}
                  onChangeText={v => set('patientId', v)}
                  placeholder="Enter patient ID"
                />
              </View>
              <View style={[s.fieldWrap, { marginBottom: 0 }]}>
                <Text style={s.fieldLabel}>Patient Name</Text>
                <InputField
                  value={form.patientName}
                  onChangeText={v => set('patientName', v)}
                  placeholder="Patient full name"
                />
              </View>
            </View>
          </View>

          {/* ── SECTION 2: DIAGNOSIS & NOTES ──────────────── */}
          <View style={s.sectionWrap}>
            <View style={s.sectionLabelRow}>
              <View style={[s.sectionDot, { backgroundColor: C.amber }]} />
              <Text style={s.sectionLabel}>Diagnosis & Notes</Text>
            </View>
            <View style={s.sectionCard}>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Diagnosis <Text style={s.required}>*</Text></Text>
                <InputField
                  value={form.diagnosis}
                  onChangeText={v => set('diagnosis', v)}
                  placeholder="e.g., Type 2 Diabetes, Hypertension"
                />
              </View>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Doctor's Notes <Text style={s.optional}>(Optional)</Text></Text>
                <InputField
                  value={form.notes}
                  onChangeText={v => set('notes', v)}
                  placeholder="Additional instructions..."
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={[s.fieldWrap, { marginBottom: 0 }]}>
                <Text style={s.fieldLabel}>Expiry Date <Text style={s.optional}>(YYYY-MM-DD)</Text></Text>
                <InputField
                  value={form.expiryDate}
                  onChangeText={v => set('expiryDate', v)}
                  placeholder={getDefaultExpiry()}
                />
              </View>
            </View>
          </View>

          {/* ── SECTION 3: MEDICATIONS ────────────────────── */}
          <View style={s.sectionWrap}>
            <View style={s.sectionLabelRow}>
              <View style={[s.sectionDot, { backgroundColor: C.teal }]} />
              <Text style={s.sectionLabel}>Medications</Text>
              <View style={[s.countBubble, { backgroundColor: C.tealDim }]}>
                <Text style={[s.countTxt, { color: C.teal }]}>{medications.length}</Text>
              </View>
            </View>

            {medications.map((med, index) => {
              const medColor = MED_COLORS[index % MED_COLORS.length];
              return (
                <View key={index} style={[s.medCard, { borderTopColor: medColor }]}>
                  {/* Med card header */}
                  <View style={s.medCardHeader}>
                    <View style={[s.medNumBubble, { backgroundColor: medColor + '22' }]}>
                      <Text style={[s.medNumTxt, { color: medColor }]}>Rx #{index + 1}</Text>
                    </View>
                    {medications.length > 1 && (
                      <TouchableOpacity
                        style={s.removeBtn}
                        onPress={() => removeMedication(index)}
                      >
                        <Text style={s.removeTxt}>✕ Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Medicine Name */}
                  <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>Medicine Name <Text style={s.required}>*</Text></Text>
                    <InputField
                      value={med.medicationName}
                      onChangeText={v => setMed(index, 'medicationName', v)}
                      placeholder="e.g., Metformin"
                    />
                  </View>

                  {/* Dosage */}
                  <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>Dosage</Text>
                    <InputField
                      value={med.dosage}
                      onChangeText={v => setMed(index, 'dosage', v)}
                      placeholder="e.g., 500mg"
                    />
                  </View>

                  {/* Frequency chips */}
                  <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>Frequency</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                      {FREQUENCY_OPTIONS.map(f => {
                        const isActive = med.frequency === f.value;
                        return (
                          <TouchableOpacity
                            key={f.value}
                            style={[
                              s.freqChip,
                              isActive && { backgroundColor: medColor, borderColor: medColor },
                            ]}
                            onPress={() => setMed(index, 'frequency', f.value)}
                          >
                            <Text style={[s.freqTxt, isActive && { color: '#0F1B2D', fontWeight: '800' }]}>
                              {f.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Instructions */}
                  <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>Instructions</Text>
                    <InputField
                      value={med.instructions}
                      onChangeText={v => setMed(index, 'instructions', v)}
                      placeholder="e.g., After meals"
                    />
                  </View>

                  {/* Duration */}
                  <View style={[s.fieldWrap, { marginBottom: 0 }]}>
                    <Text style={s.fieldLabel}>Duration (Days)</Text>
                    <InputField
                      value={String(med.durationDays)}
                      onChangeText={v => setMed(index, 'durationDays', parseInt(v) || 7)}
                      keyboardType="numeric"
                      placeholder="7"
                    />
                  </View>
                </View>
              );
            })}

            {/* Add medication button */}
            <TouchableOpacity style={s.addMedBtn} onPress={addMedication}>
              <Text style={s.addMedIcon}>+</Text>
              <Text style={s.addMedTxt}>Add Another Medication</Text>
            </TouchableOpacity>
          </View>

          {/* ── SUBMIT BUTTON ─────────────────────────────── */}
          <View style={s.submitWrap}>
            <TouchableOpacity
              style={[s.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={s.submitTxt}>
                {loading ? '⏳  Creating...' : '✓  Create Prescription'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.panel,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.tealDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.teal + '44',
  },
  backArrow:    { fontSize: 18, color: C.teal, fontWeight: '700' },
  headerTitle:  { fontSize: 18, fontWeight: '900', color: C.textPri },
  headerSub:    { fontSize: 11, color: C.textSec, marginTop: 1 },
  progressPill: {
    marginLeft: 'auto',
    backgroundColor: C.tealDim,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  progressTxt:  { color: C.teal, fontSize: 12, fontWeight: '800' },

  // Section
  sectionWrap:     { paddingHorizontal: 16, paddingTop: 20, marginBottom: 4 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot:      { width: 8, height: 8, borderRadius: 4 },
  sectionLabel:    { fontSize: 13, fontWeight: '800', color: C.textPri, flex: 1 },
  countBubble:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  countTxt:        { fontSize: 11, fontWeight: '800' },

  sectionCard: {
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  fieldWrap:  { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.textSec, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  required:   { color: C.red },
  optional:   { color: C.textDim, fontWeight: '400', textTransform: 'none' },

  // Med card
  medCard: {
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 3,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medNumBubble: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  medNumTxt:    { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  removeBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#FF5F7E22' },
  removeTxt:    { color: C.red, fontSize: 12, fontWeight: '700' },

  // Frequency chips
  freqChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
    backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border,
  },
  freqTxt: { fontSize: 12, color: C.textSec, fontWeight: '600' },

  // Add med button
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.tealDim,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: C.teal + '55',
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  addMedIcon: { fontSize: 20, color: C.teal, fontWeight: '700' },
  addMedTxt:  { fontSize: 13, color: C.teal, fontWeight: '700' },

  // Submit
  submitWrap: { padding: 16, paddingBottom: 36 },
  submitBtn: {
    backgroundColor: C.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.teal,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  submitTxt: { color: '#0F1B2D', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});

export default CreatePrescription;