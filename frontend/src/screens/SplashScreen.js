import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import COLORS from '../utils/colors';

const SplashScreen = () => {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.icon}>💊</Text>
        <Text style={styles.name}>MedLink</Text>
        <Text style={styles.tagline}>Your Health, Managed Smartly</Text>
      </Animated.View>
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { alignItems: 'center' },
  icon: { fontSize: 72, marginBottom: 16 },
  name: { fontSize: 42, fontWeight: '800', color: COLORS.white, letterSpacing: 2 },
  tagline: { fontSize: 16, color: COLORS.primaryLight, marginTop: 8 },
  version: { position: 'absolute', bottom: 40, color: COLORS.primaryLight, fontSize: 13 },
});

export default SplashScreen;
