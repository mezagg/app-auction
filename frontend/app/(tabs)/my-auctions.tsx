import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { userService, Auction } from '@/services/auctionService';

export default function MyAuctionsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserAuctions = async () => {
    try {
      const data = await userService.getUserAuctions();
      setAuctions(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar tus subastas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAuctions();
  }, []);

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
      
      <View style={styles.cardFooter}>
        <Text style={[styles.itemCount, { color: colors.tint }]}>
          {item.total_items} artículos
        </Text>
        <Text style={[styles.registrationFee, { color: colors.text }]}>
          Inscripción: ${item.registration_fee.toLocaleString('es-MX')}
        </Text>
      </View>
    </TouchableOpacity>
  );

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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando tus subastas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (auctions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Mis Subastas
          </Text>
        </View>
        
        <View style={styles.centerContainer}>
          <IconSymbol name="star" size={64} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No tienes subastas registradas
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text }]}>
            Explora las subastas disponibles y regístrate en las que te interesen
          </Text>
          
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.exploreButtonText}>
              Explorar Subastas
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mis Subastas
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>
          {auctions.length} subasta{auctions.length !== 1 ? 's' : ''} registrada{auctions.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <FlashList
        data={auctions}
        renderItem={renderAuction}
        keyExtractor={(item) => item.auction_id}
        estimatedItemSize={180}
        contentContainerStyle={styles.listContainer}
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
    paddingHorizontal: 40,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});