import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import { api } from '../../services/api';
import COLORS from '../../utils/colors';

// ── Shared dark palette ────────────────────────────────────────────────────
const C = {
  bg:        '#0F1B2D',
  panel:     '#162032',
  card:      '#1C2B3A',
  teal:      '#00C9B1',
  tealDim:   '#00C9B133',
  red:       '#FF5F7E',
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

// Rotating avatar accent colors
const AVATAR_COLORS = [C.teal, C.purple, C.blue, C.amber, C.green, C.red];

const PatientList = ({ navigation }) => {
  // ── ALL ORIGINAL LOGIC — UNTOUCHED ────────────────────────────────────
  const { user } = useAuth();
  const [patients, setPatients]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = async () => {
    try {
      const data = await api.get(`/patient/doctor/${user.profileId}`);
      setPatients(data);
      setFiltered(data);
    } catch (err) {
      console.error('Load patients error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadPatients(); }, []));

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFiltered(patients);
    } else {
      setFiltered(patients.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.email.toLowerCase().includes(text.toLowerCase())
      ));
    }
  };

  const renderPatient = ({ item, index }) => {
    const accentColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('CreatePrescription', {
          patientId: item.id,
          patientName: item.name,
        })}
        activeOpacity={0.8}
      >
        {/* Left accent bar */}
        <View style={[s.cardAccentBar, { backgroundColor: accentColor }]} />

        {/* Avatar */}
        <View style={[s.avatar, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
          <Text style={[s.avatarText, { color: accentColor }]}>
            {item.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.detail}>✉  {item.email}</Text>
          {item.bloodGroup && (
            <View style={s.tagRow}>
              <View style={[s.tag, { backgroundColor: C.redDim ?? '#FF5F7E22' }]}>
                <Text style={[s.tagTxt, { color: C.red }]}>🩸 {item.bloodGroup}</Text>
              </View>
              {item.chronicConditions?.length > 0 && (
                <View style={[s.tag, { backgroundColor: C.amberDim }]}>
                  <Text style={[s.tagTxt, { color: C.amber }]} numberOfLines={1}>
                    {item.chronicConditions.slice(0, 2).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          )}
          {!item.bloodGroup && item.chronicConditions?.length > 0 && (
            <View style={s.tagRow}>
              <View style={[s.tag, { backgroundColor: C.amberDim }]}>
                <Text style={[s.tagTxt, { color: C.amber }]} numberOfLines={1}>
                  {item.chronicConditions.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Right arrow */}
        <View style={[s.arrowBubble, { backgroundColor: accentColor + '18' }]}>
          <Text style={[s.arrow, { color: accentColor }]}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };
  // ──────────────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>

      {/* ── HEADER ───────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>My Patients</Text>
          <Text style={s.headerSub}>
            {filtered.length} {filtered.length === 1 ? 'patient' : 'patients'} found
          </Text>
        </View>
        <View style={s.headerRight}>
          <View style={[s.countBubble, { backgroundColor: C.tealDim }]}>
            <Text style={[s.countTxt, { color: C.teal }]}>{patients.length}</Text>
          </View>
        </View>
      </View>

      {/* ── SEARCH BAR ───────────────────────────────────── */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={handleSearch}
            placeholder="Search by name or email..."
            placeholderTextColor={C.textDim}
            selectionColor={C.teal}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── PATIENT LIST ─────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPatient}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadPatients(); }}
            tintColor={C.teal}
          />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>No patients found</Text>
            <Text style={s.emptyText}>
              {search ? 'Try a different search term' : 'No patients assigned yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

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
  backArrow: { fontSize: 18, color: C.teal, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.textPri },
  headerSub:   { fontSize: 11, color: C.textSec, marginTop: 1 },
  headerRight: { marginLeft: 'auto' },
  countBubble: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  countTxt: { fontSize: 13, fontWeight: '800' },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.panel },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: C.textPri },
  clearBtn:    { fontSize: 13, color: C.textSec, fontWeight: '700' },

  // List
  list: { padding: 14, gap: 10 },

  // Patient card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardAccentBar: { width: 4, alignSelf: 'stretch' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 14, marginVertical: 14,
    borderWidth: 1.5,
  },
  avatarText: { fontSize: 20, fontWeight: '900' },
  info: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, gap: 3 },
  name:   { fontSize: 15, fontWeight: '800', color: C.textPri },
  detail: { fontSize: 12, color: C.textSec },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagTxt: { fontSize: 10, fontWeight: '700' },
  arrowBubble: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  arrow: { fontSize: 22, fontWeight: '700', lineHeight: 26 },

  // Empty
  empty: {
    alignItems: 'center',
    padding: 60,
    gap: 8,
  },
  emptyIcon:  { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.textPri },
  emptyText:  { fontSize: 13, color: C.textSec, textAlign: 'center' },
});

export default PatientList;