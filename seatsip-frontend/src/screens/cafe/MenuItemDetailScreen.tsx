import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../context/CartContext';
import AppIcon from '../../components/ui/AppIcon';

const { width } = Dimensions.get('window');

const SIZES = [
  { id: 'small',   label: 'Small',   ml: 237,  priceOffset: -30, caffeine: 75,  scale: 0.72 },
  { id: 'regular', label: 'Regular', ml: 355,  priceOffset: 0,   caffeine: 150, scale: 0.88 },
  { id: 'large',   label: 'Large',   ml: 473,  priceOffset: 50,  caffeine: 225, scale: 1.0  },
];

const MILKS = [
  { id: 'whole',  label: 'Whole\nMilk',  icon: '🥛' },
  { id: 'oat',    label: 'Oat\nMilk',    icon: '🌾' },
  { id: 'almond', label: 'Almond\nMilk', icon: '🌰' },
  { id: 'soy',    label: 'Soy\nMilk',    icon: '🫘' },
];

type Route = RouteProp<RootStackParamList, 'ProductDetail'>;

// Animated coffee cup SVG-style drawn with Views
const CoffeeCup = ({ scale, quantity }: { scale: number; quantity: number }) => {
  const scaleAnim = useRef(new Animated.Value(scale)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [quantity]);

  const cups = Array.from({ length: Math.min(quantity, 4) });

  return (
    <Animated.View style={[styles.cupArea, { transform: [{ scale: bounceAnim }] }]}>
      <View style={styles.cupsRow}>
        {cups.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.cupWrapper,
              {
                transform: [{ scale: scaleAnim }],
                marginLeft: i > 0 ? -18 * scale : 0,
                zIndex: i,
              },
            ]}
          >
            <SingleCup />
          </Animated.View>
        ))}
        {quantity > 4 && (
          <View style={styles.extraBadge}>
            <Text style={styles.extraBadgeText}>+{quantity - 4}</Text>
          </View>
        )}
      </View>
      {/* Steam lines */}
      <View style={styles.steamRow}>
        {[0, 1, 2].map((i) => (
          <SteamLine key={i} delay={i * 200} />
        ))}
      </View>
    </Animated.View>
  );
};

const SteamLine = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.8, 1], outputRange: [0, 0.6, 0.3, 0] });

  return (
    <Animated.View style={[styles.steamLine, { transform: [{ translateY }], opacity }]} />
  );
};

const SingleCup = () => (
  <View style={styles.cup}>
    {/* Cup body */}
    <View style={styles.cupBody}>
      {/* Coffee inside */}
      <View style={styles.coffeeInside} />
      {/* Shine */}
      <View style={styles.cupShine} />
    </View>
    {/* Handle */}
    <View style={styles.cupHandle} />
    {/* Saucer */}
    <View style={styles.saucer} />
  </View>
);

export default function MenuItemDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { item, cafeId } = route.params;
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMilk, setSelectedMilk] = useState('whole');
  const [adding, setAdding] = useState(false);

  const basePrice = item.price || 150;
  const currentPrice = basePrice + selectedSize.priceOffset;
  const totalPrice = currentPrice * quantity;
  const totalCaffeine = selectedSize.caffeine * quantity;

  const handleSizeChange = (size: any) => setSelectedSize(size);
  const handleQtyInc = () => setQuantity(q => Math.min(q + 1, 9));
  const handleQtyDec = () => setQuantity(q => Math.max(q - 1, 1));

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(cafeId, item.id, quantity);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2EDE8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={20} color="#3A2A20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.name}</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <AppIcon name="vegan" size={20} color="#3A2A20" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero image area */}
        <View style={styles.heroArea}>
          <CoffeeCup scale={selectedSize.scale} quantity={quantity} />
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Best seller + price */}
          <View style={styles.row}>
            <View style={styles.bestSellerBadge}>
              <AppIcon name="popular" size={11} color="#fff" fill="#fff" />
              <Text style={styles.badgeText}>{item.is_popular ? 'Best Seller' : 'Popular'}</Text>
            </View>
            <Text style={styles.priceText}>₹{totalPrice}</Text>
          </View>

          {/* Name */}
          <Text style={styles.itemName}>{item.name}</Text>

          {/* Description */}
          <Text style={styles.itemDesc}>
            {item.description || "Experience the perfect blend of tradition and craftsmanship. Smooth, bold, and endlessly satisfying."}
          </Text>

          {/* Caffeine badge */}
          <View style={styles.caffeineBadge}>
            <AppIcon name="zap" size={15} color="#C17D2E" />
            <Text style={styles.caffeineText}>
              <Text style={styles.caffeineBold}>{totalCaffeine} mg</Text> caffeine
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Size selector */}
          <Text style={styles.sectionLabel}>Size</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sizeBtn, selectedSize.id === s.id && styles.sizeBtnActive]}
                onPress={() => handleSizeChange(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sizeBtnLabel, selectedSize.id === s.id && styles.sizeBtnLabelActive]}>
                  {s.label}
                </Text>
                <Text style={[styles.sizeBtnMl, selectedSize.id === s.id && styles.sizeBtnMlActive]}>
                  {s.ml} ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quantity */}
          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleQtyDec} activeOpacity={0.7}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleQtyInc} activeOpacity={0.7}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Milk type */}
          <Text style={styles.sectionLabel}>Milk Type</Text>
          <View style={styles.milkRow}>
            {MILKS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.milkBtn, selectedMilk === m.id && styles.milkBtnActive]}
                onPress={() => setSelectedMilk(m.id)}
                activeOpacity={0.8}
              >
                <AppIcon name={m.icon} size={20} color={selectedMilk === m.id ? '#3D2010' : '#8B6F5A'} />
                <Text style={[styles.milkLabel, selectedMilk === m.id && styles.milkLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Add to cart button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.88}
          onPress={handleAddToCart}
          disabled={adding}
        >
          <AppIcon name="cart" size={18} color="#fff" />
          <Text style={styles.addToCartText}>
            {adding ? 'Adding...' : `Add to Cart  —  ₹${totalPrice}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2EDE8' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#EAE4DC',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, color: '#3A2A1A' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: '700', color: '#1A0F05',
  },

  scroll: { paddingBottom: 110 },

  // Hero
  heroArea: {
    height: 230,
    backgroundColor: '#EDE7DF',
    marginHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 0,
  },
  cupArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  cupsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cupWrapper: { alignItems: 'center' },
  extraBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#5C3A1E',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 6, marginBottom: 20,
  },
  extraBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Cup drawing
  cup: { alignItems: 'center', width: 100 },
  cupBody: {
    width: 80, height: 60,
    borderRadius: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#F5F0EC',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#DDD5C8',
  },
  coffeeInside: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 42,
    backgroundColor: '#4A2C14',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  cupShine: {
    position: 'absolute',
    top: 4, left: 8,
    width: 14, height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ rotate: '-20deg' }],
  },
  cupHandle: {
    position: 'absolute',
    right: 8,
    marginTop: -48,
    width: 18, height: 28,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#DDD5C8',
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
  },
  saucer: {
    width: 96, height: 10,
    borderRadius: 50,
    backgroundColor: '#EDE6DC',
    borderWidth: 1,
    borderColor: '#D5CCBF',
    marginTop: -2,
  },
  steamRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    height: 24,
    marginBottom: 4,
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
  },
  steamLine: {
    width: 3, height: 16,
    borderRadius: 2,
    backgroundColor: '#9C8878',
    opacity: 0.5,
  },

  // Card
  card: {
    backgroundColor: '#FDFAF6',
    marginHorizontal: 16,
    borderRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: -8,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },

  bestSellerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F5EAD8',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 50,
  },
  badgeStar: { color: '#C17D2E', fontSize: 12 },
  badgeText: { color: '#8B5E20', fontSize: 12, fontWeight: '600' },

  priceText: { fontSize: 26, fontWeight: '800', color: '#1A0F05' },

  itemName: { fontSize: 28, fontWeight: '800', color: '#1A0F05', letterSpacing: -0.5, marginBottom: 8 },
  itemDesc: { fontSize: 14, color: '#7A5C3A', lineHeight: 21, marginBottom: 12 },

  caffeineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FDF0DC',
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 16,
  },
  caffeineIcon: { fontSize: 13, color: '#C17D2E' },
  caffeineText: { fontSize: 13, color: '#8B5E20' },
  caffeineBold: { fontWeight: '800', color: '#7A4A10' },

  divider: { height: 1, backgroundColor: '#EDE6DC', marginVertical: 16 },

  sectionLabel: { fontSize: 17, fontWeight: '700', color: '#1A0F05', marginBottom: 12 },

  // Size
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDD5C8',
    backgroundColor: '#FAF5EE',
  },
  sizeBtnActive: { backgroundColor: '#3D2010', borderColor: '#3D2010' },
  sizeBtnLabel: { fontSize: 14, fontWeight: '700', color: '#4A3520', marginBottom: 2 },
  sizeBtnLabelActive: { color: '#fff' },
  sizeBtnMl: { fontSize: 11, color: '#8C7060' },
  sizeBtnMlActive: { color: '#C8A882' },

  // Quantity
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2EDE8',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  qtyBtn: {
    flex: 1, height: 48, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 22, color: '#5C3A1E', fontWeight: '400' },
  qtyValue: {
    flex: 2, textAlign: 'center',
    fontSize: 22, fontWeight: '700', color: '#1A0F05',
  },

  // Milk
  milkRow: { flexDirection: 'row', gap: 10 },
  milkBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDD5C8',
    backgroundColor: '#FAF5EE',
    gap: 5,
  },
  milkBtnActive: { backgroundColor: '#3D2010', borderColor: '#3D2010' },
  milkIcon: { fontSize: 22 },
  milkLabel: {
    fontSize: 10.5, fontWeight: '600',
    color: '#5A4025', textAlign: 'center', lineHeight: 14,
  },
  milkLabelActive: { color: '#C8A882' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 10,
    backgroundColor: '#F2EDE8',
  },
  addToCartBtn: {
    backgroundColor: '#3D2010',
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cartIcon: { fontSize: 18 },
  addToCartText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
});
