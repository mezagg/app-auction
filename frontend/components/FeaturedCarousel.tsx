import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_SPACING = 16;

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: 'destacada' | 'proxima' | 'negociada';
  price?: string;
  location?: string;
}

const featuredItems: FeaturedItem[] = [
  {
    id: '1',
    title: 'Vehículo Destacado',
    subtitle: 'Subasta Especial',
    imageUrl: 'https://prod.subastashilcoacetec.mx/Subastas/BIENES/38622/IMG_20241127_155530.jpg',
    type: 'destacada',
    price: '$450,000',
    location: 'Ciudad de México',
  },
  {
    id: '2',
    title: 'Inmueble Premium',
    subtitle: 'Oportunidad Única',
    imageUrl: 'https://subastashilcoacetec.mx/lp/7438-25/assets/images/std_7438-25.png',
    type: 'proxima',
    price: '$2,500,000',
    location: 'Guadalajara',
  },
  {
    id: '3',
    title: 'Maquinaria Industrial',
    subtitle: 'Venta Negociada',
    imageUrl: 'https://subastashilcoacetec.mx/lp/7478A-25/assets/images/std_7478b.webp',
    type: 'negociada',
    price: '$850,000',
    location: 'Monterrey',
  },
];

export const FeaturedCarousel: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'destacada':
        return colors.accent.blue;
      case 'proxima':
        return colors.accent.green;
      case 'negociada':
        return colors.accent.orange;
      default:
        return colors.accent.purple;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'destacada':
        return 'DESTACADA';
      case 'proxima':
        return 'PRÓXIMA';
      case 'negociada':
        return 'VENTA NEGOCIADA';
      default:
        return type.toUpperCase();
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleCardPress = (item: FeaturedItem) => {
    router.push(`/auction-detail/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        contentInset={{ left: CARD_SPACING, right: CARD_SPACING }}
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {featuredItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: colors.cardBackground }
            ]}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.95}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
                placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              />
              
              {/* Type Badge */}
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                <Text style={styles.typeText}>{getTypeText(item.type)}</Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]} numberOfLines={1}>
                {item.subtitle}
              </Text>
              
              <View style={styles.details}>
                <View style={styles.priceContainer}>
                  <Text style={[styles.priceLabel, { color: colors.secondary }]}>
                    PRECIO BASE
                  </Text>
                  <Text style={[styles.price, { color: getTypeColor(item.type) }]}>
                    {item.price}
                  </Text>
                </View>
                
                {item.location && (
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={[styles.location, { color: colors.secondary }]} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {featuredItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex 
                  ? colors.accent.blue 
                  : colors.border,
                width: index === currentIndex ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContainer: {
    paddingHorizontal: CARD_SPACING / 2,
  },
  card: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: 20,
    marginHorizontal: CARD_SPACING / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  typeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});