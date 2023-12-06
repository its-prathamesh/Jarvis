import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppNavigation from './src/navigation';

export default function App() {
  return (
    <AppNavigation/>
  );
}