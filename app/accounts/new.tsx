import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { AccountForm } from '../../src/components/AccountForm';
import { createAccount } from '../../src/db/accounts';
import { useDatabase } from '../../src/hooks/useDatabase';
import { CreateAccountInput } from '../../src/db/types';

export default function NewAccountScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();

  const handleSubmit = async (input: CreateAccountInput) => {
    await createAccount(input);
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AccountForm onSubmit={handleSubmit} submitLabel="Create Account" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
