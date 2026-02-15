import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ImageBackground
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import COLORS from '../../utils/colors';
import { validateEmail, validatePassword } from '../../utils/helpers';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phoneNumber: '',
    role: 'PATIENT', specialization: '', licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!validateEmail(form.email)) e.email = 'Enter a valid email';
    if (!validatePassword(form.password)) e.password = 'At least 6 characters';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone is required';
    if (form.role === 'DOCTOR') {
      if (!form.specialization.trim()) e.specialization = 'Specialization is required';
      if (!form.licenseNumber.trim()) e.licenseNumber = 'License number is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const registerData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
        role: form.role.toUpperCase(),
        specialization: form.specialization || 'General',
        licenseNumber: form.licenseNumber || '',
      };
      console.log('Registering with:', registerData);
      await register(registerData);
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
      console.log('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/rl.jpg')} // <-- add your background image here
      style={styles.background}
      resizeMode="cover"
    >
      {/* Optional overlay for readability */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>💊 MedLink</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Sign Up</Text>

            {/* Role Selector */}
            <Text style={styles.sectionLabel}>I am a:</Text>
            <View style={styles.roleRow}>
              {['PATIENT', 'DOCTOR'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleBtn, form.role === role && styles.roleActive]}
                  onPress={() => set('role', role)}
                >
                  <Text style={styles.roleIcon}>{role === 'PATIENT' ? '🤒' : '👨‍⚕️'}</Text>
                  <Text style={[styles.roleText, form.role === role && styles.roleTextActive]}>
                    {role === 'PATIENT' ? 'Patient' : 'Doctor'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputField label="Full Name" value={form.name} onChangeText={v => set('name', v)}
              placeholder="John Doe" error={errors.name}  />
            <InputField label="Email" value={form.email} onChangeText={v => set('email', v)}
              placeholder="john@email.com" keyboardType="email-address" error={errors.email} />
            <InputField label="Password" value={form.password} onChangeText={v => set('password', v)}
              placeholder="Min. 6 characters" secureTextEntry error={errors.password} />
            <InputField label="Phone Number" value={form.phoneNumber} onChangeText={v => set('phoneNumber', v)}
              placeholder="+91 9876543210" keyboardType="phone-pad" error={errors.phoneNumber} />

            {form.role === 'DOCTOR' && (
              <>
                <InputField label="Specialization" value={form.specialization}
                  onChangeText={v => set('specialization', v)} placeholder="Cardiology"
                  error={errors.specialization} />
                <InputField label="License Number" value={form.licenseNumber}
                  onChangeText={v => set('licenseNumber', v)} placeholder="MCI-12345"
                  
                  error={errors.licenseNumber}
                   />
              </>
            )}

            <CustomButton title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // optional dark overlay for readability
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 36, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  tagline: { color: COLORS.primaryLight, marginTop: 6, fontSize: 14 },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    width: 600,
    height: 600,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignSelf: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1, alignItems: 'center', padding: 14, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  roleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '30' },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleText: { fontWeight: '600', color: COLORS.textSecondary },
  roleTextActive: { color: COLORS.primary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});

export default RegisterScreen;
