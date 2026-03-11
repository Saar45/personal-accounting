import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useDatabase } from '../../src/hooks/useDatabase';
import { pickAndParseCSV, mapRowsToTransactions, ParsedCSVRow } from '../../src/utils/csv-import';
import { bulkCreateTransactions } from '../../src/db/transactions';
import { getAllCategories } from '../../src/db/categories';
import { formatEUR } from '../../src/utils/currency';

export default function SettingsScreen() {
  const { triggerRefresh } = useDatabase();
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ParsedCSVRow[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
      </Card>

      {preview && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>
            Preview ({preview.length} transactions)
          </Text>

          {importErrors.length > 0 && (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>
                {importErrors.length} rows skipped
              </Text>
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
                    {row.type === 'income' ? '+' : '-'}{formatEUR(row.amount)}
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

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>About</Text>
      <Card>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Currency</Text>
          <Text style={styles.aboutValue}>EUR</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Storage</Text>
          <Text style={styles.aboutValue}>Local (SQLite)</Text>
        </View>
      </Card>
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
});
