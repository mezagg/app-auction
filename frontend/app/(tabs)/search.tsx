import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auctionService, Auction } from '@/services/auctionService';

const categories = [
  { key: 'vehiculos', label: 'Vehículos', icon: 'star' },
  { key: 'camiones', label: 'Camiones', icon: 'star' },
  { key: 'equipo_medico', label: 'Equipo Médico', icon: 'star' },
];

const states = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const statuses = [
  { key: 'proxima', label: 'Próximas' },
  { key: 'activa', label: 'En Vivo' },
  { key: 'finalizada', label: 'Finalizadas' },
];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchResults, setSearchResults] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const handleSearch = async () => {
    setLoading(true);
    setShowResults(true);
    
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedState) params.state = selectedState;
      if (selectedStatus) params.status = selectedStatus;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);
      
      const results = await auctionService.searchAuctions(params);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedState('');
    setSelectedStatus('');
    setMinPrice('');
    setMaxPrice('');
    setSearchResults([]);
    setShowResults(false);
  };

  const renderAuction = ({ item }: { item: Auction }) => (
    <TouchableOpacity
      style={[styles.auctionCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push(`/auction-detail/${item.auction_id}`)}
      activeOpacity={0.7}
    >
      <Text style={[styles.auctionTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.companyName, { color: colors.tint }]}>
        {item.company_name}
      </Text>
      <Text style={[styles.locationText, { color: colors.text }]}>
        {item.state} • {item.total_items} artículos
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Buscar Subastas
        </Text>
      </View>

      <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Categoría</Text>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedCategory === category.key 
                      ? colors.tint 
                      : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.key ? '' : category.key
                )}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selectedCategory === category.key 
                        ? 'white' 
                        : colors.text,
                    },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Estado</Text>
          <View style={styles.chipContainer}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedStatus === status.key 
                      ? colors.tint 
                      : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedStatus(
                  selectedStatus === status.key ? '' : status.key
                )}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selectedStatus === status.key 
                        ? 'white' 
                        : colors.text,
                    },
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* State Selection */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Estado</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.chipContainer, { flexWrap: 'nowrap' }]}>
              {states.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.chip,
                    styles.stateChip,
                    {
                      backgroundColor: selectedState === state 
                        ? colors.tint 
                        : colors.cardBackground,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSelectedState(
                    selectedState === state ? '' : state
                  )}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selectedState === state 
                          ? 'white' 
                          : colors.text,
                      },
                    ]}
                  >
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Price Range */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Rango de Precio</Text>
          <View style={styles.priceInputContainer}>
            <View style={styles.priceInputWrapper}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>Desde</Text>
              <TextInput
                style={[
                  styles.priceInput,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="$0"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>Hasta</Text>
              <TextInput
                style={[
                  styles.priceInput,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="$999,999"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearButtonText, { color: colors.text }]}>
              Limpiar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.tint }]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Results */}
      {showResults && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
          </Text>
          
          <FlashList
            data={searchResults}
            renderItem={renderAuction}
            keyExtractor={(item) => item.auction_id}
            estimatedItemSize={100}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  filtersContainer: {
    flex: showResults ? 0 : 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  stateChip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  priceInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    flex: 2,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  auctionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.8,
  },
});