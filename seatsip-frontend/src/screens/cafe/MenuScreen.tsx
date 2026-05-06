import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { cafesApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import AppIcon from '../../components/ui/AppIcon';
import ProductDetailSheet from '../../components/ui/ProductDetailSheet';

const { width } = Dimensions.get('window');

type Route = RouteProp<RootStackParamList, 'Menu'>;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'drinks', label: 'Drinks', icon: '☕' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'desserts', label: 'Desserts', icon: '🧁' },
];

const CATEGORY_IMAGES: Record<string, string> = {
  drinks: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop',
  food: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&auto=format&fit=crop',
  desserts: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop',
};

// High-quality sample image component
const ItemImage = ({ item }: { item: any }) => {
  const category = item.category?.toLowerCase() || 'drinks';
  const fallbackImage = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.drinks;

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item.image_url || fallbackImage }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.freshLabel}>
        <View style={styles.freshLabelRow}><AppIcon name="vegan" size={9} color="#fff" /><Text style={styles.freshLabelText}>Prepared fresh for you</Text></View>
      </View>
    </View>
  );
};

const MenuCard = ({ item, onPreorder }: { item: any; onPreorder: (item: any) => void }) => {
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
    onPreorder(item);
  };

  return (
    <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Left: image */}
      <ItemImage item={item} />

      {/* Right: details */}
      <View style={styles.cardContent}>
        {/* Popular badge + price */}
        <View style={styles.cardTopRow}>
          {item.is_popular ? (
            <View style={styles.popularBadge}>
              <AppIcon name="popular" size={12} color="#C17D2E" fill="#C17D2E" />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          ) : (
            <View />
          )}
          <View style={styles.priceBox}>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>

        {/* Description */}
        <Text style={styles.itemDesc} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {(item.tags || []).slice(0, 2).map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Time, Calories, Button */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><AppIcon name="time" size={10} color="#7A5C3A" /><Text style={styles.metaText}>{item.prep_time || '10 min'}</Text></View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}><AppIcon name="zap" size={10} color="#7A5C3A" /><Text style={styles.metaText}>{item.calories || '120'} cal</Text></View>
        </View>

        <TouchableOpacity style={styles.preorderBtn} onPress={handlePress} activeOpacity={0.85}>
          <View style={styles.preorderBtnContent}><Text style={styles.preorderBtnText}>Order</Text><AppIcon name="→" size={12} color="#fff" /></View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const FALLBACK_MENU_ITEMS = [
  {
    id: 'c41e866b-a44f-433b-a4a7-6a38daf8a9a1',
    name: 'Cappuccino',
    description: 'Smooth espresso with steamed milk & velvety foam.',
    price: 180,
    tags: ['Espresso', 'Velvety'],
    prep_time: '10 min',
    calories: '120',
    is_popular: true,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'aff18833-3c54-4aff-82a8-dc68593c876e',
    name: 'Espresso',
    description: 'Strong, bold and pure espresso shot.',
    price: 80,
    tags: ['Rich', 'Concentrated', 'Single'],
    prep_time: '10 min',
    calories: '5',
    is_popular: true,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'c237c9d0-a62e-4b2c-bc56-343d8d2fe4b0',
    name: 'Flat White',
    description: 'Smooth ristretto shots with steamed milk.',
    price: 160,
    tags: ['Smooth', 'Creamy'],
    prep_time: '10 min',
    calories: '110',
    is_popular: false,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1577968897866-be520b29d9d1?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'd2e41932-e952-4f01-a906-fe1e1ef6f938',
    name: 'Chai Latte',
    description: 'Spiced tea with steamed milk.',
    price: 150,
    tags: ['Spiced', 'Warm'],
    prep_time: '12 min',
    calories: '140',
    is_popular: false,
    category: 'drinks',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'e7715873-a1e7-44e0-98b6-379941f85c11',
    name: 'Avocado Toast',
    description: 'Sourdough with smashed avocado & poached egg.',
    price: 280,
    tags: ['Healthy', 'Filling'],
    prep_time: '15 min',
    calories: '320',
    is_popular: true,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '1aaceb4a-5b60-40ec-ba29-6420813f2163',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with mascarpone & espresso.',
    price: 220,
    tags: ['Sweet', 'Classic'],
    prep_time: '5 min',
    calories: '290',
    is_popular: true,
    category: 'desserts',
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop',
  },
];

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { cafeId, cafeName } = route.params;
  const { cart } = useCart();

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
          tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : []
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EFE7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="back" size={18} color="#2C1A0E" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MENU</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{cafeName} · Freshly Prepared</Text>
        </View>

        <View style={styles.cartWrapper}>
          <TouchableOpacity
            style={styles.cartBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Cart')}
          >
            <AppIcon name="cart" size={20} color="#fff" />
          </TouchableOpacity>
          {cart?.items && cart.items.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Category filter */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.8}
            >
              {cat.icon && <AppIcon name={cat.icon} size={14} color={activeCategory === cat.id ? '#fff' : '#4A3520'} />}
              <Text
                style={[styles.filterLabel, activeCategory === cat.id && styles.filterLabelActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C17D2E" />
          <Text style={styles.loadingText}>Brewing your menu...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found in this category.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MenuCard item={item} onPreorder={handleOrder} />
          )}
        />
      )}

      {cartCount > 0 && (
        <TouchableOpacity
          style={[styles.floatingCart, { bottom: Math.max(insets.bottom, 14) }]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={styles.floatingCartIcon}>
            <AppIcon name="cart" size={19} color="#fff" />
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
    </SafeAreaView>
  );
}

const CARD_IMG_WIDTH = (width - 32) * 0.38;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5EFE7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5EFE7',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EDE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#2C1A0E',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A0F05',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A5C3A',
    marginTop: 1,
  },
  cartWrapper: {
    position: 'relative',
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C17D2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C17D2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5EFE7',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  filterScroll: {
    maxHeight: 56,
    marginBottom: 4,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#D4C4B0',
    backgroundColor: '#FAF5EE',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#C17D2E',
    borderColor: '#C17D2E',
  },
  filterIcon: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3520',
  },
  filterLabelActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FDFAF6',
    borderRadius: 24,
    padding: 10,
    marginBottom: 4,
    shadowColor: '#3A2010',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 170,
  },
  imageContainer: {
    width: CARD_IMG_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  freshLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(61, 107, 42, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  freshLabelText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  freshLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  popularStar: {
    color: '#C17D2E',
    fontSize: 12,
  },
  popularText: {
    color: '#C17D2E',
    fontSize: 10,
    fontWeight: '800',
  },
  priceBox: {
    backgroundColor: '#F2EAE0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A0F05',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A0F05',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: '#7A5C3A',
    lineHeight: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 6,
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
    color: '#5A4025',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  metaText: {
    fontSize: 10,
    color: '#7A5C3A',
    fontWeight: '600',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#D4C4B0',
  },
  preorderBtn: {
    backgroundColor: '#3D6B2A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#3D6B2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  preorderBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  preorderBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#C17D2E',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7A5C3A',
    fontWeight: '600',
  },
  floatingCart: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 62,
    borderRadius: 22,
    backgroundColor: '#2C1A0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#2C1A0E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingCartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C17D2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  floatingCartCopy: {
    flex: 1,
  },
  floatingCartTitle: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
});
