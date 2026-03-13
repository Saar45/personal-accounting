import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useDatabase } from '../../src/hooks/useDatabase';
import { useBiometricLock } from '../../src/hooks/useBiometricLock';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useCurrency } from '../../src/hooks/useCurrency';
import { useExchangeRates } from '../../src/hooks/useExchangeRates';
import { pickAndParseCSV, mapRowsToTransactions, ParsedCSVRow } from '../../src/utils/csv-import';
import { exportTransactionsCSV } from '../../src/utils/csv-export';
import { bulkCreateTransactions } from '../../src/db/transactions';
import { getAllCategories } from '../../src/db/categories';
import { rescheduleNotificationsIfEnabled } from '../../src/utils/notifications';

function SettingRow({ icon, iconColor, label, description, onPress }: {
  icon: string;
  iconColor?: string;
  label: string;
  description?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || colors.primary) + '20' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor || colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();
  const { isEnabled, isSupported, enable, disable } = useBiometricLock();
  const { isEnabled: notificationsEnabled, isSupported: notificationsSupported, enable: enableNotifications, disable: disableNotifications } = useNotifications();
  const { currency, setCurrency, formatAmount, currencies } = useCurrency();
  const { lastRefresh, refreshRates } = useExchangeRates();
  const [importing, setImporting] = useState(false);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<ParsedCSVRow[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

  const currentCurrencyInfo = currencies.find((c) => c.code === currency);

  const handlePickCSV = async () => {
    setImporting(true);
    try {
      const result = await pickAndParseCSV();
      if (!result) {
        setImporting(false);
        return;
      }
      setPreview(result.rows);
      setImportErrors(result.errors);
      setImporting(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to parse CSV file');
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      const categories = await getAllCategories();
      const categoryMap: Record<string, number> = {};
      for (const cat of categories) {
        categoryMap[cat.name] = cat.id;
      }
      const transactions = mapRowsToTransactions(preview, categoryMap);
      await bulkCreateTransactions(transactions);
      triggerRefresh();
      setPreview(null);
      setImportErrors([]);
      Alert.alert('Success', `Imported ${transactions.length} transactions`);
    } catch (e) {
      Alert.alert('Error', 'Failed to import transactions');
    }
    setImporting(false);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportTransactionsCSV();
    } catch (e) {
      Alert.alert('Error', 'Failed to export transactions');
    }
    setExporting(false);
  };

  const handleToggleBiometric = async () => {
    if (isEnabled) {
      disable();
    } else {
      await enable();
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Manage</Text>
      <Card>
        <SettingRow
          icon="grid-outline"
          label="Manage Categories"
          description="Add, edit, or remove categories"
          onPress={() => router.push('/categories/')}
        />
        <View style={styles.separator} />
        <SettingRow
          icon="pie-chart-outline"
          iconColor={colors.warning}
          label="Budgets"
          description="Set spending limits per category"
          onPress={() => router.push('/budgets/')}
        />
        <View style={styles.separator} />
        <SettingRow
          icon="repeat-outline"
          iconColor={colors.success}
          label="Recurring Transactions"
          description="Auto-create transactions on schedule"
          onPress={() => router.push('/recurring/')}
        />
      </Card>

      <Text style={styles.sectionTitle}>Data</Text>
      <Card>
        <TouchableOpacity style={styles.settingRow} onPress={handlePickCSV} disabled={importing}>
          <View style={styles.settingIcon}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Import CSV</Text>
            <Text style={styles.settingDescription}>
              Import transactions from a bank statement CSV file
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.settingRow} onPress={handleExportCSV} disabled={exporting}>
          <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="download-outline" size={20} color={colors.success} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Export CSV</Text>
            <Text style={styles.settingDescription}>
              Export all transactions as a CSV file
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      {preview && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>
            Preview ({preview.length} transactions)
          </Text>
          {importErrors.length > 0 && (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>{importErrors.length} rows skipped</Text>
              {importErrors.slice(0, 3).map((err, i) => (
                <Text key={i} style={styles.errorText}>{err}</Text>
              ))}
              {importErrors.length > 3 && (
                <Text style={styles.errorText}>...and {importErrors.length - 3} more</Text>
              )}
            </Card>
          )}
          <Card>
            {preview.slice(0, 10).map((row, index) => (
              <View key={index}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.previewRow}>
                  <View style={styles.previewDetails}>
                    <Text style={styles.previewDescription} numberOfLines={1}>
                      {row.description || 'No description'}
                    </Text>
                    <Text style={styles.previewDate}>{row.date}</Text>
                  </View>
                  <Text style={[
                    styles.previewAmount,
                    { color: row.type === 'income' ? colors.success : colors.danger }
                  ]}>
                    {row.type === 'income' ? '+' : '-'}{formatAmount(row.amount)}
                  </Text>
                </View>
              </View>
            ))}
            {preview.length > 10 && (
              <Text style={styles.moreText}>
                ...and {preview.length - 10} more transactions
              </Text>
            )}
          </Card>
          <View style={styles.previewActions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => { setPreview(null); setImportErrors([]); }}
              style={styles.actionButton}
            />
            <Button
              title={`Import ${preview.length}`}
              onPress={handleConfirmImport}
              loading={importing}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Security</Text>
      <Card>
        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Biometric Lock</Text>
            <Text style={styles.settingDescription}>
              {isSupported ? 'Require Face ID / fingerprint to open' : 'Not available on this device'}
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={handleToggleBiometric}
            disabled={!isSupported}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Notifications</Text>
      <Card>
        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: '#74B9FF' + '20' }]}>
            <Ionicons name="notifications-outline" size={20} color="#74B9FF" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>
              {notificationsSupported ? 'Bill reminders & monthly salary reminder' : 'Not available on this device'}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={!notificationsSupported}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <Card>
        <TouchableOpacity style={styles.settingRow} onPress={() => setCurrencyPickerVisible(true)} activeOpacity={0.6}>
          <View style={[styles.settingIcon, { backgroundColor: '#FDCB6E' + '20' }]}>
            <Ionicons name="cash-outline" size={20} color="#FDCB6E" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingDescription}>
              {currentCurrencyInfo ? `${currentCurrencyInfo.name} (${currentCurrencyInfo.symbol})` : currency}
            </Text>
          </View>
          <Text style={styles.currencyCode}>{currency}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionTitle}>Exchange Rates</Text>
      <Card>
        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: '#00CEC9' + '20' }]}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#00CEC9" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Last Updated</Text>
            <Text style={styles.settingDescription}>
              {lastRefresh
                ? lastRefresh.toLocaleString()
                : 'Not yet fetched'}
            </Text>
          </View>
        </View>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.settingRow}
          onPress={async () => {
            setRefreshingRates(true);
            await refreshRates().catch(() => {});
            setRefreshingRates(false);
          }}
          disabled={refreshingRates}
          activeOpacity={0.6}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#00CEC9' + '20' }]}>
            <Ionicons name="refresh-outline" size={20} color="#00CEC9" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>
              {refreshingRates ? 'Refreshing...' : 'Refresh Rates'}
            </Text>
            <Text style={styles.settingDescription}>
              Fetch latest exchange rates from ECB
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>About</Text>
      <Card>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Currency</Text>
          <Text style={styles.aboutValue}>{currency}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Storage</Text>
          <Text style={styles.aboutValue}>Local (SQLite)</Text>
        </View>
      </Card>

      <Modal
        visible={currencyPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCurrencyPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setCurrencyPickerVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={currencies}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.currencyList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.currencyRow,
                  item.code === currency && styles.currencyRowSelected,
                ]}
                onPress={async () => {
                  await setCurrency(item.code);
                  setCurrencyPickerVisible(false);
                  refreshRates().catch(() => {});
                  rescheduleNotificationsIfEnabled().catch(() => {});
                }}
                activeOpacity={0.6}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                  <View>
                    <Text style={styles.currencyName}>{item.name}</Text>
                    <Text style={styles.currencyCodeLabel}>{item.code}</Text>
                  </View>
                </View>
                {item.code === currency && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  previewSection: {
    marginTop: spacing.md,
  },
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.danger + '10',
    borderColor: colors.danger + '30',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    opacity: 0.8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  previewDetails: {
    flex: 1,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  previewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  previewAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  aboutLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  aboutValue: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  currencyList: {
    padding: spacing.md,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  currencyRowSelected: {
    backgroundColor: colors.primary + '15',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    width: 40,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  currencyCodeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
