import React from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = [
  '#6C5CE7', '#E84393', '#FF6B6B', '#E17055',
  '#FDCB6E', '#00B894', '#00CEC9', '#74B9FF',
  '#A29BFE', '#FDA7DF', '#55E6C1', '#F8C291',
  '#82CCDD', '#B8E994', '#8E8E9A', '#DFE6E9',
];

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <View>
      <Text style={styles.label}>Color</Text>
      <FlatList
        data={COLORS}
        numColumns={4}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = item === selectedColor;
          return (
            <TouchableOpacity
              style={[styles.swatch, { backgroundColor: item }]}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E9A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
