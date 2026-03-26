import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { DatabaseProvider, useDatabase } from '../src/hooks/useDatabase';
import { CurrencyProvider } from '../src/hooks/useCurrency';
import { ExchangeRatesProvider } from '../src/hooks/useExchangeRates';
import { useBiometricLock } from '../src/hooks/useBiometricLock';
import { BiometricLock } from '../src/components/BiometricLock';
import { colors } from '../src/constants/theme';

function RootLayoutContent() {
  const { isReady } = useDatabase();
  const { isLocked, unlock } = useBiometricLock();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLocked) {
    return <BiometricLock onUnlock={unlock} />;
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
        <Stack.Screen
          name="recurring/index"
          options={{ title: 'Recurring Transactions' }}
        />
        <Stack.Screen
          name="recurring/new"
          options={{ title: 'New Recurring', presentation: 'modal' }}
        />
        <Stack.Screen
          name="recurring/[id]"
          options={{ title: 'Edit Recurring' }}
        />
        <Stack.Screen
          name="budgets/index"
          options={{ title: 'Budgets' }}
        />
        <Stack.Screen
          name="budgets/new"
          options={{ title: 'New Budget', presentation: 'modal' }}
        />
        <Stack.Screen
          name="categories/index"
          options={{ title: 'Categories' }}
        />
        <Stack.Screen
          name="categories/new"
          options={{ title: 'New Category', presentation: 'modal' }}
        />
        <Stack.Screen
          name="categories/[id]"
          options={{ title: 'Edit Category' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <CurrencyProvider>
        <ExchangeRatesProvider>
          <RootLayoutContent />
        </ExchangeRatesProvider>
      </CurrencyProvider>
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
