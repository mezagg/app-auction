import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
    title: 'Gran Subasta Multimarcas',
    subtitle: 'Jueves 9 de octubre del 2025 - 11:00 hrs vía webcast',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center',
    type: 'destacada',
    price: 'Webcast',
    location: 'Motocicletas · Automóviles · Rines · Refacciones · Camionetas · Tractocamiones · Camiones · Cajas Secas · Equipo de Minería · Equipo de Construcción · Maquinaria Amarilla y mucho más.',
  },
  {
    id: '2',
    title: 'Gran Subasta por Cierre de Planta Pacific Aquaculture',
    subtitle: 'Jueves 16 de octubre del 2025 - 11:00 hrs',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center',
    type: 'proxima',
    price: 'Presencial y por Internet',
    location: 'City Express Plus Ensenada - Equipo de Pesca y Cultivo',
  },
];

export const FeaturedCarousel: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const numVisible = width < 480 ? 1 : width < 768 ? 2 : width < 1024 ? 3 : 4;
  const spacing = width < 480 ? 8 : width < 768 ? 12 : 16;
  const peek = numVisible === 1 ? 24 : 0;
  const cardWidth = Math.max(
    240,
    Math.floor((width - (numVisible + 1) * spacing) / numVisible) - (numVisible === 1 ? peek : 0)
  );

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
    const index = Math.round(scrollPosition / (cardWidth + spacing));
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
        snapToInterval={cardWidth + spacing}
        snapToAlignment="start"
        contentInset={{ left: spacing / 2, right: Math.max(spacing / 2 - peek, 0) }}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingLeft: spacing / 2, paddingRight: Math.max(spacing / 2 - peek, 0) }
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {featuredItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: colors.cardBackground, width: cardWidth, marginHorizontal: spacing / 2 }
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
                    <Text style={[styles.location, { color: colors.secondary }]} numberOfLines={2}>
                      {item.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hint de más tarjetas al borde derecho */}
      {featuredItems.length > numVisible && currentIndex < featuredItems.length - numVisible && (
        <View style={styles.rightHint} pointerEvents="none">
          <LinearGradient
            colors={["transparent", colors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rightGradient}
          />
          <View style={[styles.hintBubble, { backgroundColor: colors.cardBackground }]}> 
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </View>
        </View>
      )}

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
    position: 'relative',
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  card: {
    height: 320,
    borderRadius: 20,
    marginHorizontal: 0,
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
  rightHint: {
    position: 'absolute',
    top: 0,
    bottom: 40,
    right: 0,
    width: 56,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  hintBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  imageContainer: {
    height: 160,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 16,
  },
  details: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
  },
  priceContainer: {
    width: '100%',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    justifyContent: 'flex-start',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    flex: 1,
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