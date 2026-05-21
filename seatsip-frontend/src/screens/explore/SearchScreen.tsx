import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';

const MENU_CATEGORIES = [
  {
    id: 'main',
    title: 'Main Menu',
    subtitle: 'Delivered within\n48 hours',
    backgroundColor: '#F5A623',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&q=80',
    route: 'MainMenu',
  },
  {
    id: 'express',
    title: 'Express Menu',
    subtitle: 'Delivered within\n2 hours',
    backgroundColor: '#F5C47A',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80',
    route: 'ExpressMenu',
  },
  {
    id: 'cakes',
    title: 'Custom Cakes',
    subtitle: 'Made and delivered\nwithin 72 hours',
    backgroundColor: '#D4929A',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80',
    route: 'CustomCakes',
  },
  {
    id: 'pies',
    title: 'Hot Pies',
    subtitle: 'Delivered within\n3 hours',
    backgroundColor: '#C17540',
    image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=300&q=80',
    route: 'HotPies',
  },
  {
    id: 'local',
    title: 'Local Delivery',
    subtitle: 'Made and delivered\nhot within 1 hour',
    backgroundColor: '#b0aaa2',
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&q=80',
    route: 'LocalDelivery',
    disabled: true,
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();

  const handleCategoryPress = (category: typeof MENU_CATEGORIES[0]) => {
    if (!category.disabled) {
      // Navigate to the specific menu screen
      navigation.navigate('Menu', { 
        cafeId: category.id, 
        cafeName: category.title 
      });
    }
  };

  return (
    <View style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar}>
        <Search size={16} color="#666" />
        <Text style={styles.searchText}>Search the full catalog</Text>
      </TouchableOpacity>

      {/* Menu Categories */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MENU_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.menuCard,
              category.disabled && styles.disabledCard,
            ]}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={category.disabled ? 1 : 0.8}
          >
            {/* Background Image - Full Cover */}
            <Image
              source={{ uri: category.image }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            {/* Gradient/Dim Overlay for text readability */}
            <View style={styles.imageDimOverlay} />
            {/* Text Content */}
            <View style={styles.cardOverlay}>
              <Text style={[
                styles.cardTitle,
                category.disabled && styles.disabledText,
              ]}>
                {category.title}
              </Text>
              <Text style={[
                styles.cardSubtitle,
                category.disabled && styles.disabledSubtext,
              ]}>
                {category.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0D8CC',
  },
  searchText: {
    fontSize: 15,
    color: '#666',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  menuCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledCard: {
    opacity: 0.65,
  },
  imageDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledText: {
    color: 'rgba(255,255,255,0.9)',
  },
  disabledSubtext: {
    color: 'rgba(255,255,255,0.75)',
  },
});
