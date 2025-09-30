import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auctionService } from '@/services/auctionService';

type Auction = {
  auction_id: string;
  title: string;
  description: string;
  reason: string;
  company_name: string;
  start_date: string;
  end_date: string;
  status: 'proxima' | 'activa' | 'finalizada';
  location: string;
  state: string;
  total_items: number;
  registration_fee: number;
};

export default function AuctionsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAuctions = async () => {
    try {
      const data = await auctionService.getAuctions();
      setAuctions(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las subastas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuctions();
    setRefreshing(false);
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

  const renderAuction = ({ item }: { item: Auction }) => (
    <TouchableOpacity
      style={[styles.auctionCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push(`/auction-detail/${item.auction_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={[styles.reasonText, { color: colors.text }]}>
          {getReasonText(item.reason)}
        </Text>
      </View>
      
      <Text style={[styles.auctionTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={[styles.companyName, { color: colors.tint }]}>
        {item.company_name}
      </Text>
      
      <View style={styles.infoRow}>
        <IconSymbol name="location" size={16} color={colors.icon} />
        <Text style={[styles.locationText, { color: colors.text }]}>
          {item.location}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="calendar" size={16} color={colors.icon} />
        <Text style={[styles.dateText, { color: colors.text }]}>
          {item.status === 'activa' 
            ? `Termina: ${formatDate(item.end_date)}`
            : `Inicia: ${formatDate(item.start_date)}`
          }
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.itemsContainer}>
          <Text style={[styles.itemCount, { color: colors.tint }]}>
            {item.total_items} artículos
          </Text>
        </View>
        <Text style={[styles.registrationFee, { color: colors.text }]}>
          Inscripción: ${item.registration_fee.toLocaleString('es-MX')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando subastas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Subastas Elite
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>
          Vehículos, Camiones y Equipo Médico
        </Text>
      </View>
      
      <FlashList
        data={auctions}
        renderItem={renderAuction}
        keyExtractor={(item) => item.auction_id}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  auctionCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  itemsContainer: {
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  registrationFee: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
  },
});