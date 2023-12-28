import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import AppNavigation from './src/navigation';
import { apiCall } from './src/api/openAI';

export default function App() {
  useEffect(()=>{
  },[])
  return (
    <AppNavigation/>
  );
}