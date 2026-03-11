import React from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICONS = [
  'home', 'car', 'restaurant', 'cart', 'heart', 'game-controller', 'musical-note',
  'airplane', 'gift', 'book', 'briefcase', 'build', 'bus', 'cafe', 'camera',
  'card', 'cash', 'cellular', 'chatbubble', 'clipboard', 'cloud', 'code',
  'desktop', 'document', 'earth', 'fitness', 'flash', 'flower', 'football',
  'glasses', 'hammer', 'headset', 'key', 'laptop', 'leaf', 'library',
  'location', 'medical', 'megaphone', 'paw',
].map((name) => `${name}-outline`);

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

export default function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  return (
    <View>
      <Text style={styles.label}>Icon</Text>
      <FlatList
        data={ICONS}
        numColumns={5}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = item === selectedIcon;
          return (
            <TouchableOpacity
              style={[styles.iconItem, isSelected && styles.iconItemSelected]}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item as any}
                size={24}
                color={isSelected ? '#6C5CE7' : '#8E8E9A'}
              />
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
    gap: 8,
    marginBottom: 8,
  },
  iconItem: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#1A1A23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A2A35',
  },
  iconItemSelected: {
    borderColor: '#6C5CE7',
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
});
