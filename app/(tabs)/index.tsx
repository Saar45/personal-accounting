import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../src/constants/theme';
import { BalanceCard } from '../../src/components/dashboard/BalanceCard';
import { UpcomingBills } from '../../src/components/dashboard/UpcomingBills';
import { CashFlowCard } from '../../src/components/dashboard/CashFlowCard';
import { SpendingBreakdown } from '../../src/components/dashboard/SpendingBreakdown';
import { getCurrentMonthYear, getMonthName } from '../../src/utils/dates';

export default function DashboardScreen() {
  const { month, year } = getCurrentMonthYear();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Overview</Text>
        <Text style={styles.period}>{getMonthName(month)} {year}</Text>
      </View>

      <BalanceCard />
      <UpcomingBills />
      <CashFlowCard />
      <SpendingBreakdown />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  greeting: {
    ...typography.largeTitle,
  },
  period: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
