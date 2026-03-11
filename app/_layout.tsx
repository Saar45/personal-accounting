import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { DatabaseProvider, useDatabase } from '../src/hooks/useDatabase';
import { colors } from '../src/constants/theme';

function RootLayoutContent() {
  const { isReady } = useDatabase();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/new"
          options={{ title: 'New Transaction', presentation: 'modal' }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{ title: 'Edit Transaction' }}
        />
        <Stack.Screen
          name="bill/new"
          options={{ title: 'New Bill', presentation: 'modal' }}
        />
        <Stack.Screen
          name="bill/[id]"
          options={{ title: 'Edit Bill' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <RootLayoutContent />
    </DatabaseProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
