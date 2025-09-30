import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auctionService, AuctionItem } from '@/services/auctionService';

export default function ItemDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [item, setItem] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadItemDetail();
    }
  }, [id]);

  const loadItemDetail = async () => {
    try {
      const itemData = await auctionService.getItemDetail(id!);
      setItem(itemData);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el artículo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'vehiculos':
        return 'Vehículos';
      case 'camiones':
        return 'Camiones';
      case 'equipo_medico':
        return 'Equipo Médico';
      default:
        return category;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excelente':
        return 'Excelente';
      case 'bueno':
        return 'Bueno';
      case 'regular':
        return 'Regular';
      case 'para_reparacion':
        return 'Para Reparación';
      default:
        return condition;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excelente':
        return colors.success;
      case 'bueno':
        return colors.info;
      case 'regular':
        return colors.warning;
      case 'para_reparacion':
        return colors.danger;
      default:
        return colors.text;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando artículo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Artículo no encontrado
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Detalle del Artículo
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery Placeholder */}
        <View style={[styles.imageContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <IconSymbol name="star" size={48} color={colors.icon} />
            <Text style={[styles.imagePlaceholderText, { color: colors.icon }]}>
              Imagen del artículo
            </Text>
          </View>
        </View>

        {/* Item Header */}
        <View style={[styles.itemCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.headerRow}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.brandModel, { color: colors.tint }]}>
                {item.brand} {item.model && `• ${item.model}`} {item.year && `• ${item.year}`}
              </Text>
            </View>
            
            <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: colors.text }]}>
                {getCategoryText(item.category)}
              </Text>
            </View>
          </View>
          
          <View style={styles.conditionContainer}>
            <Text style={[styles.conditionLabel, { color: colors.text }]}>
              Estado:
            </Text>
            <Text style={[styles.conditionValue, { color: getConditionColor(item.condition) }]}>
              {getConditionText(item.condition)}
            </Text>
          </View>
        </View>

        {/* Price Information */}
        <View style={[styles.priceCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Información de Precios
          </Text>
          
          <View style={styles.priceRow}>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>Precio Inicial</Text>
              <Text style={[styles.startingPrice, { color: colors.text }]}>
                ${item.starting_price.toLocaleString('es-MX')}
              </Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>Puja Actual</Text>
              <Text style={[styles.currentBid, { color: colors.success }]}>
                ${item.current_bid.toLocaleString('es-MX')}
              </Text>
            </View>
          </View>
          
          <View style={styles.estimatedValue}>
            <Text style={[styles.estimatedLabel, { color: colors.text }]}>
              Valor Estimado
            </Text>
            <Text style={[styles.estimatedRange, { color: colors.tint }]}>
              ${item.estimated_value.min.toLocaleString('es-MX')} - ${item.estimated_value.max.toLocaleString('es-MX')}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Descripción
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {item.description}
          </Text>
        </View>

        {/* Specifications */}
        <View style={[styles.specsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Especificaciones Técnicas
          </Text>
          
          {item.mileage && (
            <View style={styles.specRow}>
              <Text style={[styles.specLabel, { color: colors.text }]}>Kilometraje:</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>
                {item.mileage.toLocaleString('es-MX')} km
              </Text>
            </View>
          )}
          
          {Object.entries(item.specifications).map(([key, value]) => (
            <View key={key} style={styles.specRow}>
              <Text style={[styles.specLabel, { color: colors.text }]}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
              </Text>
              <Text style={[styles.specValue, { color: colors.text }]}>
                {String(value)}
              </Text>
            </View>
          ))}
        </View>

        {/* Location */}
        <View style={[styles.locationCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ubicación
          </Text>
          <View style={styles.locationRow}>
            <IconSymbol name="location" size={20} color={colors.icon} />
            <Text style={[styles.locationText, { color: colors.text }]}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bid Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.bidButton, { backgroundColor: colors.tint }]}
          onPress={() => Alert.alert('Próximamente', 'Las pujas estarán disponibles pronto')}
        >
          <Text style={styles.bidButtonText}>
            Realizar Puja - Actual: ${item.current_bid.toLocaleString('es-MX')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  itemCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 28,
  },
  brandModel: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  startingPrice: {
    fontSize: 20,
    fontWeight: '600',
  },
  currentBid: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  estimatedValue: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  estimatedLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  estimatedRange: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  specsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  specValue: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
  },
  locationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  bidButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
});