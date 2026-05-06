import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './AppIcon';
import { useCart } from '../../context/CartContext';

const SIZES = [
  { id: 'small', label: 'Small', ml: 237, priceOffset: -30, caffeine: 75, scale: 0.72 },
  { id: 'regular', label: 'Regular', ml: 355, priceOffset: 0, caffeine: 150, scale: 0.88 },
  { id: 'large', label: 'Large', ml: 473, priceOffset: 50, caffeine: 225, scale: 1 },
];

const MILKS = [
  { id: 'whole', label: 'Whole\nMilk', icon: '🥛' },
  { id: 'oat', label: 'Oat\nMilk', icon: '🌾' },
  { id: 'almond', label: 'Almond\nMilk', icon: '🌰' },
  { id: 'soy', label: 'Soy\nMilk', icon: '🫘' },
];

type ProductDetailSheetProps = {
  visible: boolean;
  item: any | null;
  cafeId: string;
  onClose: () => void;
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
  }, [anim, delay]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.8, 1], outputRange: [0, 0.6, 0.3, 0] });

  return <Animated.View style={[styles.steamLine, { opacity, transform: [{ translateY }] }]} />;
};

const SingleCup = () => (
  <View style={styles.cupWrap}>
    <View style={styles.cup}>
      <View style={styles.coffee} />
      <View style={styles.cupShine} />
    </View>
    <View style={styles.cupHandle} />
    <View style={styles.saucer} />
  </View>
);

const CupStack = ({ quantity, scale }: { quantity: number; scale: number }) => {
  const cupCount = Math.min(quantity, 3);

  return (
    <View style={styles.cupStage}>
      <View style={styles.steamRow}>
        {[0, 1, 2].map((i) => <SteamLine key={i} delay={i * 180} />)}
      </View>
      <View style={styles.cupsRow}>
        {Array.from({ length: cupCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.cupSlot,
              {
                marginLeft: index > 0 ? -18 : 0,
                transform: [{ scale: scale - index * 0.05 }],
                zIndex: index,
              },
            ]}
          >
            <SingleCup />
          </View>
        ))}
        {quantity > 3 && (
          <View style={styles.extraBadge}>
            <Text style={styles.extraBadgeText}>+{quantity - 3}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function ProductDetailSheet({ visible, item, cafeId, onClose }: ProductDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMilk, setSelectedMilk] = useState('whole');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedSize(SIZES[1]);
      setQuantity(1);
      setSelectedMilk('whole');
      setAdding(false);
    }
  }, [visible, item?.id]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 8,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70) onClose();
      },
    })
  ).current;

  if (!item) return null;

  const rawPrice = typeof item.price === 'string'
    ? Number.parseInt(item.price.replace(/[^\d]/g, ''), 10)
    : item.price;
  const basePrice = Number.isFinite(rawPrice) ? rawPrice : 150;
  const currentPrice = Math.max(50, basePrice + selectedSize.priceOffset);
  const totalPrice = currentPrice * quantity;
  const totalCaffeine = selectedSize.caffeine * quantity;

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(cafeId, item.id, quantity);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]} {...panResponder.panHandlers}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
            <View style={styles.hero}>
              <CupStack quantity={quantity} scale={selectedSize.scale} />
            </View>

            <View style={styles.content}>
              <View style={styles.topRow}>
                <View style={styles.popularPill}>
                  <AppIcon name="popular" size={11} color="#C17D2E" fill="#C17D2E" />
                  <Text style={styles.popularText}>{item.is_popular ? 'Popular' : 'Recommended'}</Text>
                </View>
                <Text style={styles.price}>₹{totalPrice}</Text>
              </View>

              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>
                {item.description || item.desc || 'Experience the perfect blend of tradition and craftsmanship. Smooth, bold, and endlessly satisfying.'}
              </Text>

              <View style={styles.caffeinePill}>
                <AppIcon name="zap" size={15} color="#C17D2E" />
                <Text style={styles.caffeineText}>
                  <Text style={styles.caffeineStrong}>{totalCaffeine} mg</Text> caffeine
                </Text>
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Size</Text>
              <View style={styles.sizeRow}>
                {SIZES.map((size) => {
                  const selected = selectedSize.id === size.id;

                  return (
                    <TouchableOpacity
                      key={size.id}
                      style={[styles.sizeCard, selected && styles.optionActive]}
                      onPress={() => setSelectedSize(size)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.sizeLabel, selected && styles.optionActiveText]}>{size.label}</Text>
                      <Text style={[styles.sizeMeta, selected && styles.optionActiveSubtext]}>{size.ml} ml</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity((value) => Math.max(1, value - 1))}>
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity((value) => Math.min(9, value + 1))}>
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Milk Type</Text>
              <View style={styles.milkRow}>
                {MILKS.map((milk) => {
                  const selected = selectedMilk === milk.id;

                  return (
                    <TouchableOpacity
                      key={milk.id}
                      style={[styles.milkCard, selected && styles.optionActive]}
                      onPress={() => setSelectedMilk(milk.id)}
                      activeOpacity={0.85}
                    >
                      <AppIcon name={milk.icon} size={19} color={selected ? '#fff' : '#8B6F5A'} />
                      <Text style={[styles.milkLabel, selected && styles.optionActiveText]}>{milk.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            disabled={adding}
            onPress={handleAddToCart}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <AppIcon name="cart" size={18} color="#fff" />
                <Text style={styles.ctaText}>Add to Cart - ₹{totalPrice}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  sheetScroll: {
    paddingBottom: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D8CDBF',
    marginTop: 10,
    marginBottom: 8,
  },
  hero: {
    height: 185,
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#EDE8E1',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cupStage: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  steamRow: {
    height: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 8,
  },
  steamLine: {
    width: 5,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#B8A492',
  },
  cupsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cupSlot: {
    alignItems: 'center',
  },
  cupWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cup: {
    width: 74,
    height: 70,
    borderWidth: 3,
    borderColor: '#3A2A20',
    borderRadius: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: '#F8F1E8',
    overflow: 'hidden',
  },
  coffee: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    backgroundColor: '#6B3F1A',
  },
  cupShine: {
    position: 'absolute',
    top: 14,
    left: 17,
    width: 10,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{ rotate: '12deg' }],
  },
  cupHandle: {
    position: 'absolute',
    right: 10,
    bottom: 28,
    width: 25,
    height: 31,
    borderWidth: 3,
    borderLeftWidth: 0,
    borderColor: '#3A2A20',
    borderRadius: 14,
  },
  saucer: {
    width: 88,
    height: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B9A38E',
    backgroundColor: '#E0D5C8',
    marginTop: 8,
  },
  extraBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2C1A0E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 22,
  },
  extraBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  popularPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF3E2',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  popularText: {
    color: '#8A5A22',
    fontSize: 12,
    fontWeight: '800',
  },
  price: {
    color: '#1A0F05',
    fontSize: 20,
    fontWeight: '900',
  },
  name: {
    color: '#1A0F05',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 5,
  },
  desc: {
    color: '#7C6757',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  caffeinePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3E2',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  caffeineText: {
    color: '#6B5140',
    fontSize: 12,
  },
  caffeineStrong: {
    color: '#C17D2E',
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE4D8',
    marginVertical: 13,
  },
  sectionLabel: {
    color: '#1A0F05',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D8CDBF',
    backgroundColor: '#FAF7F2',
    paddingVertical: 12,
  },
  optionActive: {
    backgroundColor: '#2C1A0E',
    borderColor: '#2C1A0E',
  },
  optionActiveText: {
    color: '#fff',
  },
  optionActiveSubtext: {
    color: 'rgba(255,255,255,0.75)',
  },
  sizeLabel: {
    color: '#3D2010',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },
  sizeMeta: {
    color: '#8B6F5A',
    fontSize: 11,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EBE3',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: '#6B3F1A',
    fontSize: 24,
    fontWeight: '800',
  },
  qtyValue: {
    flex: 0.8,
    color: '#1A0F05',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  milkRow: {
    flexDirection: 'row',
    gap: 8,
  },
  milkCard: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D8CDBF',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 6,
  },
  milkLabel: {
    color: '#8B6F5A',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 13,
  },
  cta: {
    marginHorizontal: 16,
    marginTop: 8,
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: '#2C1A0E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
