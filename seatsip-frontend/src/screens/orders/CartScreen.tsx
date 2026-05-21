import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../context/CartContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Divider, EmptyState, VegIndicator } from '../../components/ui';
import AppIcon from '../../components/ui/AppIcon';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

const OFFER_CARDS = [
  {
    id: 'brew10',
    title: 'Brew bundle',
    description: 'Add one more drink and unlock 10% off beverages.',
    icon: 'coffee',
    color: '#6B3F1A',
    bg: '#FFF3E8',
  },
  {
    id: 'freebite',
    title: 'Snack pairing',
    description: 'Pastry picks go best with hot coffee today.',
    icon: 'bakery',
    color: '#8A5A22',
    bg: '#F8EFE2',
  },
];

const RECOMMENDED_PRODUCTS = [
  {
    id: 'aff18833-3c54-4aff-82a8-dc68593c876e',
    name: 'Espresso',
    description: 'Bold single shot for a quick lift.',
    price: 80,
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
    is_veg: 1,
    is_popular: 1,
    prep_time_minutes: 10,
  },
  {
    id: 'c237c9d0-a62e-4b2c-bc56-343d8d2fe4b0',
    name: 'Flat White',
    description: 'Smooth ristretto with steamed milk.',
    price: 160,
    image_url: 'https://images.unsplash.com/photo-1577968897866-be520b29d9d1?w=400',
    is_veg: 1,
    is_popular: 0,
    prep_time_minutes: 10,
  },
  {
    id: '1aaceb4a-5b60-40ec-ba29-6420813f2163',
    name: 'Tiramisu',
    description: 'Mascarpone, cocoa, and espresso layers.',
    price: 220,
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    is_veg: 1,
    is_popular: 1,
    prep_time_minutes: 5,
  },
];

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { cart, isLoading, fetchCart, updateQuantity, clearCart, removeFromCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const handleDelete = (itemId: string) => {
    Alert.alert('Remove Item', 'Remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) },
    ]);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={20} color="#3D2010" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          subtitle="Add items from a café menu to get started"
          action={{ label: 'Explore Cafés', onPress: () => navigation.navigate('MainTabs') }}
        />
      </View>
    );
  }

  const cafeName = cart.items[0]?.cafe_name;
  const cafeId = cart.items[0]?.cafe_id;
  const cartItemNames = new Set(cart.items.map((item: any) => item.name?.toLowerCase()));
  const recommendedProducts = RECOMMENDED_PRODUCTS.filter(item => !cartItemNames.has(item.name.toLowerCase()));

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <View style={styles.imgWrapper}>
        <Image source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' }} style={styles.img} />
        <View style={styles.vegIndicatorPos}>
          <VegIndicator isVeg={!!item.is_veg} size={10} />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.itemMeta} numberOfLines={1}>
          {item.category || 'Specialty Brew'} • Standard
        </Text>
        <Text style={styles.price}>₹{item.price}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnTxt}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
      >
        <AppIcon name="trash" size={18} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.cartFooter}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Complete your order</Text>
          <Text style={styles.sectionSubtitle}>Popular pairings from this cafe</Text>
        </View>
        <AppIcon name="popular" size={18} color="#F4A300" fill="#F4A300" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationRow}
      >
        {recommendedProducts.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.recommendCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProductDetail', {
              cafeId: cafeId || cart.items[0]?.cafe_id || 'cafe',
              item: {
                ...product,
                category: 'drinks',
                tags: ['Recommended'],
                calories: product.name === 'Tiramisu' ? '290' : '120',
              },
            })}
          >
            <Image source={{ uri: product.image_url }} style={styles.recommendImage} />
            <View style={styles.recommendBody}>
              <Text style={styles.recommendName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.recommendDesc} numberOfLines={2}>{product.description}</Text>
              <View style={styles.recommendBottom}>
                <Text style={styles.recommendPrice}>₹{product.price}</Text>
                <View style={styles.recommendAdd}>
                  <Text style={styles.recommendAddText}>+</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.offersSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Offers for this cart</Text>
            <Text style={styles.sectionSubtitle}>Small nudges before checkout</Text>
          </View>
        </View>
        {OFFER_CARDS.map(offer => (
          <View key={offer.id} style={[styles.offerCard, { backgroundColor: offer.bg }]}>
            <View style={[styles.offerIcon, { backgroundColor: offer.color }]}>
              <AppIcon name={offer.icon} size={16} color="#fff" />
            </View>
            <View style={styles.offerCopy}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerDesc}>{offer.description}</Text>
            </View>
            <Text style={styles.offerApply}>Apply</Text>
          </View>
        ))}
      </View>

      <View style={styles.checkoutHelper}>
        <View style={styles.helperIcon}>
          <AppIcon name="time" size={16} color="#3D2010" />
        </View>
        <View style={styles.helperCopy}>
          <Text style={styles.helperTitle}>Ready in about 15-20 minutes</Text>
          <Text style={styles.helperText}>You can review delivery or pickup details on the next step.</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={20} color="#3D2010" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Cart</Text>
          <Text style={styles.cafeSubtitle} numberOfLines={1}>{cafeName}</Text>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* BILL SUMMARY */}
      <View style={styles.billContainer}>
        <View style={styles.billCard}>
          <SummaryRow label="Sub total" value={`₹${cart.subtotal.toFixed(0)}`} />
          <SummaryRow label="Taxes & Fees" value={`₹${cart.tax.toFixed(0)}`} />
          <View style={styles.divider} />
          <SummaryRow label="Total Amount" value={`₹${cart.total.toFixed(0)}`} bold />
        </View>

        {/* CHECKOUT CTA */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Checkout')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3D2010', '#8B5E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutBtn}
          >
            <View style={styles.checkoutBtnContent}>
              <View>
                <Text style={styles.checkoutText}>Checkout Now</Text>
                <Text style={styles.checkoutSubtext}>{cart.items.length} items</Text>
              </View>
              <Text style={styles.checkoutPrice}>₹{cart.total.toFixed(0)}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SummaryRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.boldText]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.boldText]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F5F2',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  backIcon: {
    fontSize: 20,
    color: '#3D2010',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A0F05',
  },
  cafeSubtitle: {
    fontSize: 12,
    color: '#8C7060',
    marginTop: 2,
  },
  clearBtn: {
    padding: 8,
  },
  clearText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
    paddingBottom: 220,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    ...Shadow.sm,
  },
  imgWrapper: {
    position: 'relative',
  },
  img: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  vegIndicatorPos: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 2,
    ...Shadow.sm,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A0F05',
  },
  itemMeta: {
    fontSize: 11,
    color: '#8C7060',
    marginVertical: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2010',
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5F2',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    padding: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnTxt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3D2010',
  },
  qty: {
    marginHorizontal: 12,
    fontWeight: '800',
    color: '#1A0F05',
    fontSize: 14,
  },
  deleteBtn: {
    padding: 10,
  },
  deleteText: {
    fontSize: 18,
  },
  cartFooter: {
    marginTop: 4,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A0F05',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8C7060',
    marginTop: 2,
  },
  recommendationRow: {
    gap: 12,
    paddingRight: 4,
  },
  recommendCard: {
    width: Math.min(190, width * 0.48),
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  recommendImage: {
    width: '100%',
    height: 92,
  },
  recommendBody: {
    padding: 10,
  },
  recommendName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A0F05',
  },
  recommendDesc: {
    fontSize: 11,
    color: '#8C7060',
    lineHeight: 15,
    marginTop: 3,
    minHeight: 30,
  },
  recommendBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  recommendPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3D2010',
  },
  recommendAdd: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3D2010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendAddText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  offersSection: {
    gap: 10,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE0D0',
  },
  offerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  offerCopy: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A0F05',
  },
  offerDesc: {
    fontSize: 11,
    color: '#8C7060',
    marginTop: 2,
    lineHeight: 15,
  },
  offerApply: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3D2010',
    marginLeft: 8,
  },
  checkoutHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFE7DE',
    borderRadius: 18,
    padding: 14,
  },
  helperIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  helperCopy: {
    flex: 1,
  },
  helperTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A0F05',
  },
  helperText: {
    fontSize: 11,
    color: '#8C7060',
    marginTop: 2,
    lineHeight: 15,
  },
  billContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8F5F2',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...Shadow.md,
  },
  billCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  rowLabel: {
    color: '#8C7060',
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    color: '#1A0F05',
    fontSize: 14,
    fontWeight: '700',
  },
  boldText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A0F05',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E8D8',
    marginVertical: 12,
  },
  checkoutBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.md,
  },
  checkoutBtnContent: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  checkoutSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutPrice: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
  },
});
