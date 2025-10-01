import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type FilterType = 'todas' | 'proximas' | 'anteriores' | 'negociadas';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filterOptions = [
  { key: 'todas' as FilterType, label: 'Todas', icon: '🏠' },
  { key: 'proximas' as FilterType, label: 'Próximas', icon: '⏰' },
  { key: 'anteriores' as FilterType, label: 'Anteriores', icon: '📋' },
  { key: 'negociadas' as FilterType, label: 'Venta Negociada', icon: '🤝' },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getFilterColor = (filterKey: FilterType) => {
    switch (filterKey) {
      case 'proximas':
        return colors.accent.green;
      case 'anteriores':
        return colors.accent.blue;
      case 'negociadas':
        return colors.accent.orange;
      default:
        return colors.accent.purple;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.key;
          const filterColor = getFilterColor(option.key);
          
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isActive ? filterColor : colors.cardBackground,
                  borderColor: isActive ? filterColor : colors.border,
                  shadowColor: isActive ? filterColor : '#000',
                  shadowOpacity: isActive ? 0.3 : 0.1,
                }
              ]}
              onPress={() => onFilterChange(option.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>{option.icon}</Text>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? '#FFFFFF' : colors.text,
                    fontWeight: isActive ? '700' : '600',
                  }
                ]}
              >
                {option.label}
              </Text>
              
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: '#FFFFFF' }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 120,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});