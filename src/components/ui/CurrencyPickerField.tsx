import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../../utils/currency';

interface CurrencyPickerFieldProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
}

export function CurrencyPickerField({ label, value, onChange }: CurrencyPickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const current = SUPPORTED_CURRENCIES.find((c) => c.code === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setVisible(true)}
        activeOpacity={0.6}
      >
        <Text style={styles.value}>
          {current ? `${current.symbol} ${current.code}` : value}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={SUPPORTED_CURRENCIES}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, item.code === value && styles.rowSelected]}
                onPress={() => {
                  onChange(item.code);
                  setVisible(false);
                }}
                activeOpacity={0.6}
              >
                <View style={styles.rowInfo}>
                  <Text style={styles.rowSymbol}>{item.symbol}</Text>
                  <View>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={styles.rowCode}>{item.code}</Text>
                  </View>
                </View>
                {item.code === value && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
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
  list: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  rowSelected: {
    backgroundColor: colors.primary + '15',
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    width: 40,
    textAlign: 'center',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowCode: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
