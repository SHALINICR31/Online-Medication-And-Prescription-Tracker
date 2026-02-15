import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import DoctorDashboard from '../screens/doctor/DoctorDashboard';
import CreatePrescription from '../screens/doctor/CreatePrescription';
import PatientList from '../screens/doctor/PatientList';
import COLORS from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
    <Stack.Screen name="CreatePrescription" component={CreatePrescription} />
    <Stack.Screen name="PatientList" component={PatientList} />
  </Stack.Navigator>
);

const DoctorNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: { borderTopWidth: 1, borderTopColor: COLORS.divider, paddingBottom: 5, height: 60 },
      tabBarIcon: ({ focused }) => {
        const icons = { Home: '🏥', Patients: '👥', Prescriptions: '📋' };
        return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
      },
    })}
  >
    <Tab.Screen name="Home" component={DashboardStack} />
    <Tab.Screen name="Patients" component={PatientList} />
    <Tab.Screen name="Prescriptions" component={CreatePrescription} options={{ tabBarLabel: 'New Rx' }} />
  </Tab.Navigator>
);

export default DoctorNavigator;
