import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  FlatList,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { cafesApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing } from '../../theme';
import AppIcon from '../../components/ui/AppIcon';
import ProductDetailSheet from '../../components/ui/ProductDetailSheet';

type Route = RouteProp<RootStackParamList, 'Menu'>;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'drinks', label: 'Drinks', icon: 'coffee' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'desserts', label: 'Desserts', icon: 'ice-cream' },
];

const CATEGORY_IMAGES: Record<string, string> = {
  drinks: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop',
  food: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&auto=format&fit=crop',
  desserts: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop',
};

const FALLBACK_MENU_ITEMS = [
  {
    id: 'dummy_1',
    name: 'Signature Mocha',
    description: 'Rich dark chocolate with espresso and velvety steamed milk.',
    price: 280,
    tags: ['Rich', 'Chocolatey'],
    prep_time: '12 min',
    calories: '310',
    is_popular: true,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'dummy_2',
    name: 'Iced Matcha Latte',
    description: 'Premium stone-ground matcha whisked with cold milk and honey.',
    price: 320,
    tags: ['Healthy', 'Iced'],
    prep_time: '8 min',
    calories: '180',
    is_popular: false,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1515822338988-152ec198a4af?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'dummy_3',
    name: 'Caramel Cloud',
    description: 'A dreamy macchiato topped with a thick layer of salted caramel foam.',
    price: 260,
    tags: ['Sweet', 'Creamy'],
    prep_time: '10 min',
    calories: '240',
    is_popular: true,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'dummy_4',
    name: 'Berry Blast',
    description: 'Refreshing blend of seasonal berries with a hint of cooling mint.',
    price: 240,
    tags: ['Fresh', 'Fruity'],
    prep_time: '6 min',
    calories: '160',
    is_popular: false,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1497534446932-c946e7316ba1?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'dummy_5',
    name: 'Nitro Cold Brew',
    description: 'Smooth, creamy nitro-infused cold brew with a chocolatey finish.',
    price: 350,
    tags: ['Strong', 'Creamy'],
    prep_time: '5 min',
    calories: '10',
    is_popular: true,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=500&auto=format&fit=crop',
  }
];

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { cafeId, cafeName } = route.params;
  const { cart } = useCart();
  const { insets, width, responsive, isTablet, isSmallPhone } = useResponsive();

  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<any[]>(FALLBACK_MENU_ITEMS);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    fetchMenu();
  }, [cafeId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await cafesApi.getById(cafeId);
      if (response.data.success && response.data.data.menu_items) {
        setMenuItems(response.data.data.menu_items.map((item: any) => ({
          ...item,
          tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
          sizes: item.sizes || [
            { name: "Small", volume: 237, unit: "ml", priceModifier: -30 },
            { name: "Regular", volume: 355, unit: "ml", priceModifier: 0 },
            { name: "Large", volume: 473, unit: "ml", priceModifier: 50 }
          ]
        })));
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((i) => i.category?.toLowerCase() === activeCategory);
  
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleOrder = (item: any) => {
    setSelectedItem(item);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/app_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
          >
            <AppIcon name="back" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontSize: responsive(18, 20, 22, 26) }]}>MENU</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{cafeName} · Freshly Prepared</Text>
          </View>

          <View style={styles.cartWrapper}>
            <TouchableOpacity
              style={styles.cartBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Cart')}
            >
              <AppIcon name="cart" size={20} color={Colors.white} />
            </TouchableOpacity>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Category filter */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip, 
                  activeCategory === cat.id ? styles.filterChipActive : styles.filterChipInactive
                ]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                {cat.icon && (
                  <AppIcon 
                    name={cat.icon} 
                    size={14} 
                    color={activeCategory === cat.id ? Colors.white : Colors.primary} 
                  />
                )}
                <Text
                  style={[
                    styles.filterLabel, 
                    activeCategory === cat.id && styles.filterLabelActive,
                    { fontSize: responsive(12, 13, 14, 16) }
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu list */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? 'tablet' : 'phone'}
          style={{ width: '100%' }}
          contentContainerStyle={[
            styles.listContent, 
            { paddingBottom: cartCount > 0 ? 100 : insets.bottom + Spacing.md }
          ]}
          columnWrapperStyle={isTablet ? { justifyContent: 'space-between', gap: Spacing.md } : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found in this category.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MenuCard 
              item={item} 
              onPreorder={handleOrder} 
              responsiveWidth={isTablet ? (width - Spacing.md * 3) / 2 : width - Spacing.md * 2}
            />
          )}
        />

        {cartCount > 0 && (
          <TouchableOpacity
            style={[styles.floatingCart, { bottom: Math.max(insets.bottom, Spacing.md) }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.floatingCartIcon}>
              <AppIcon name="cart" size={19} color={Colors.white} />
            </View>
            <View style={styles.floatingCartCopy}>
              <Text style={styles.floatingCartTitle}>View cart</Text>
              <Text style={styles.floatingCartMeta}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for checkout
              </Text>
            </View>
            <Text style={styles.floatingCartPrice}>₹{cart?.total?.toFixed(0) || '0'}</Text>
          </TouchableOpacity>
        )}

        <ProductDetailSheet
          visible={!!selectedItem}
          item={selectedItem}
          cafeId={cafeId}
          onClose={() => setSelectedItem(null)}
        />
      </View>
    </ImageBackground>
  );
}

const MenuCard = ({ item, onPreorder, responsiveWidth }: { item: any; onPreorder: (item: any) => void; responsiveWidth: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { responsive, isSmallPhone } = useResponsive();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: false }),
    ]).start();
    onPreorder(item);
  };

  const category = item.category?.toLowerCase() || 'drinks';
  const fallbackImage = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.drinks;

  return (
    <Animated.View style={[styles.card, { width: responsiveWidth, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.imageContainer}>
        <Image
          source={typeof (item.image_url || fallbackImage) === 'string' ? { uri: item.image_url || fallbackImage } : (item.image_url || fallbackImage)}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          {item.is_popular ? (
            <View style={styles.popularBadge}>
              <AppIcon name="popular" size={12} color={Colors.brand} fill={Colors.brand} />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          ) : <View />}
          <Text style={[styles.priceText, { fontSize: responsive(16, 18, 20) }]}>₹{item.price}</Text>
        </View>

        <Text style={[styles.itemName, { fontSize: responsive(16, 17, 19) }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemDesc, { fontSize: responsive(10, 11, 12) }]} numberOfLines={2}>{item.description}</Text>

        <View style={styles.tagsRow}>
          {(item.tags || []).slice(0, isSmallPhone ? 1 : 2).map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}><AppIcon name="time" size={10} color={Colors.textSecondary} /><Text style={styles.metaText}>{item.prep_time || '10 min'}</Text></View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}><AppIcon name="zap" size={10} color={Colors.textSecondary} /><Text style={styles.metaText}>{item.calories || '120'} cal</Text></View>
          </View>

          <TouchableOpacity 
            style={styles.orderBtn} 
            onPress={handlePress} 
            activeOpacity={0.85}
          >
            <Text style={styles.orderBtnText}>{isSmallPhone ? 'Add' : 'Order'}</Text>
            <AppIcon name="→" size={12} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};



const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EDE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Courgette_400Regular',
    color: '#6B3F1F',
    marginTop: 1,
  },
  cartWrapper: {
    position: 'relative',
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B9D5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B9D5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5EFE7',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  filterWrapper: {
    marginBottom: Spacing.xs,
  },
  filterScroll: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 50,
    borderWidth: 1.5,
    gap: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  filterChipInactive: {
    backgroundColor: '#FAF5EE',
    borderColor: '#6B3F1F',
  },
  filterLabel: {
    fontWeight: '700',
    color: '#6B3F1F',
  },
  filterLabelActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FAF3E8',
    borderRadius: 22,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#3A2010',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '32%',
    maxWidth: 115,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EDE8E1',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  popularText: {
    color: Colors.brand,
    fontSize: 10,
    fontWeight: '800',
  },
  priceText: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemName: {
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  itemDesc: {
    color: Colors.textSecondary,
    lineHeight: 15,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#D4C4B0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FAF5EE',
  },
  tagText: {
    fontSize: 9,
    color: Colors.primary,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  modalStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#D4C4B0',
  },
  orderBtn: {
    backgroundColor: '#8B9D5E',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    minWidth: 80,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#8B9D5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  orderBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  floatingCart: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    minHeight: 62,
    borderRadius: 22,
    backgroundColor: Colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingCartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B9D5E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  floatingCartCopy: {
    flex: 1,
  },
  floatingCartTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  floatingCartMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  floatingCartPrice: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
});

