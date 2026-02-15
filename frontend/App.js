import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { configureNotifications } from './src/config/notificationConfig';
import COLORS from './src/utils/colors';

const App = () => {
  useEffect(() => {
    try {
      configureNotifications();
    } catch (err) {
      console.warn('Push notifications not configured:', err.message);
    }
  }, []);

  return (
    <AuthProvider>
      <UserProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
        <AppNavigator />
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
