import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auctionService, Auction, AuctionItem } from '@/services/auctionService';

export default function AuctionDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  // Medir el ancho real del contenedor para decidir columnas en móvil
  const [gridWidth, setGridWidth] = useState<number | null>(null);
  const effectiveWidth = gridWidth ?? width;
  const numColumns =
    effectiveWidth >= 1200 ? 4 : effectiveWidth >= 800 ? 3 : effectiveWidth >= 480 ? 2 : 1;
  const columnWidthPercent =
    numColumns === 4 ? '24%'
    : numColumns === 3 ? '32%'
    : numColumns === 2 ? '48%'
    : '100%';
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAuctionDetail();
    }
  }, [id]);

  const loadAuctionDetail = async () => {
    try {
      const [auctionData, itemsData] = await Promise.all([
        auctionService.getAuctionDetail(id!),
        auctionService.getAuctionItems(id!),
      ]);
      
      setAuction(auctionData);
      setItems(itemsData);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la subasta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return '#10B981'; // Green
      case 'proxima':
        return '#F59E0B'; // Amber
      case 'finalizada':
        return '#6B7280'; // Gray
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activa':
        return 'EN VIVO';
      case 'proxima':
        return 'PRÓXIMA';
      case 'finalizada':
        return 'FINALIZADA';
      default:
        return status.toUpperCase();
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'cierre_empresa':
        return 'Cierre de Empresa';
      case 'renovacion_flotilla':
        return 'Renovación de Flota';
      default:
        return reason;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return 'Fecha no disponible';
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

  const renderItem = ({ item }: { item: AuctionItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push(`/item-detail/${item.item_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.itemBrand, { color: colors.tint }]}>
            {item.brand} {item.model && `• ${item.model}`} {item.year && `• ${item.year}`}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, { color: colors.text }]}>
            {getCategoryText(item.category)}
          </Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
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

      <View style={styles.itemFooter}>
        <Text style={[styles.conditionText, { color: colors.text }]}>
          Estado: {getConditionText(item.condition)}
        </Text>
        {item.mileage && (
          <Text style={[styles.mileageText, { color: colors.text }]}>
            {item.mileage.toLocaleString('es-MX')} km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando subasta...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!auction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Subasta no encontrada
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
          Detalle de Subasta
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Auction Header */}
        <View style={[styles.auctionCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.auctionHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(auction.status) }]}>
              <Text style={styles.statusText}>{getStatusText(auction.status)}</Text>
            </View>
            <Text style={[styles.reasonText, { color: colors.text }]}>
              {getReasonText(auction.reason)}
            </Text>
          </View>
          
          <Text style={[styles.auctionTitle, { color: colors.text }]}>
            {auction.title}
          </Text>
          
          <Text style={[styles.companyName, { color: colors.tint }]}>
            {auction.company_name}
          </Text>
          
          <View style={styles.auctionDetails}>
            <View style={styles.detailRow}>
              <IconSymbol name="location" size={16} color={colors.icon} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {auction.location}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <IconSymbol name="calendar" size={16} color={colors.icon} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {auction.status === 'activa' 
                  ? `Termina: ${formatDate(auction.end_date)}`
                  : `Inicia: ${formatDate(auction.start_date)}`
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.tint }]}>
                {auction.total_items}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Artículos
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.tint }]}>
                ${auction.registration_fee.toLocaleString('es-MX')}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Inscripción
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Descripción
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {auction.description}
          </Text>
        </View>

        {/* Items List */}
        <View style={[styles.itemsSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Artículos en Subasta ({items.length})
          </Text>
          <View
            style={styles.gridContainer}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.item_id}
                style={[
                  styles.itemCard,
                  {
                    width: columnWidthPercent,
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.accent.blue + '20',
                  },
                ]}
                onPress={() => router.push(`/item-detail/${item.item_id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemBrand, { color: colors.tint }]}>
                      {item.brand} {item.model && `• ${item.model}`} {item.year && `• ${item.year}`}
                    </Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={[styles.categoryText, { color: colors.text }]}>
                      {getCategoryText(item.category)}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceContainer}>
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

                <View style={styles.itemFooter}>
                  <Text style={[styles.conditionText, { color: colors.text }]}>
                    Estado: {getConditionText(item.condition)}
                  </Text>
                  {item.mileage && (
                    <Text style={[styles.mileageText, { color: colors.text }]}>
                      {item.mileage.toLocaleString('es-MX')} km
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Register Button */}
      {auction.status !== 'finalizada' && (
        <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.tint }]}
            onPress={() => Alert.alert('Próximamente', 'La inscripción estará disponible pronto')}
          >
            <Text style={styles.registerButtonText}>
              Registrarse en Subasta - ${auction.registration_fee.toLocaleString('es-MX')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  auctionCard: {
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
  auctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  auctionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 28,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  auctionDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  itemsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  // Contenedor de grid para los ítems
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridContent: {
    paddingBottom: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemCard: {
    minWidth: 0,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  startingPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentBid: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mileageText: {
    fontSize: 14,
    opacity: 0.7,
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
  registerButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
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