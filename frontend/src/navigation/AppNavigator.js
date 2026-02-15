import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import DoctorNavigator from './DoctorNavigator';
import PatientNavigator from './PatientNavigator';
import SplashScreen from '../screens/SplashScreen';
import COLORS from '../utils/colors';

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'DOCTOR' ? (
        <DoctorNavigator />
      ) : (
        <PatientNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
