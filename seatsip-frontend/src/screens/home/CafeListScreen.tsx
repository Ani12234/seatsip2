import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Image,
  ImageBackground
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { cafesApi } from '../../services/api';
import { Svg, Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BROWN = '#6B3F1A';
const CREAM = '#FAF6F1';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#555';
const TEXT_LIGHT = '#999';

const AppIcon = ({ name, size = 20, color = '#fff', fill = 'none' }: any) => {
  if (name === 'back') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M15 18l-6-6 6-6" />
      </Svg>
    );
  }
  if (name === 'popular') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2}>
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </Svg>
    );
  }
  return null;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CafeList'>;

export default function CafeListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { title, filter } = route.params;

  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCafes = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20 };
      if (filter === 'trending') params.sort = 'trending';
      else if (filter) params.mood = filter;
      
      const res = await cafesApi.list(params);
      setCafes(res.data.data || []);
    } catch (err) {
      console.log('Error fetching cafes:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  const renderCafeItem = ({ item, index }: { item: any, index: number }) => {
    const tags = Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]');
    const images = Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]');
    const distance = `${(1.5 + index * 0.5).toFixed(1)} km`;
    const eta = item.prep_time_minutes ? `${item.prep_time_minutes} min` : `${15 + index * 5} min`;
    const image = images[0] || item.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400';

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CafeDetail', { cafeId: item.id })}
      >
        <Image source={{ uri: image }} style={styles.cardImg} />
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.ratingBox}>
              <AppIcon name="popular" size={12} color="#F4A300" fill="#F4A300" />
              <Text style={styles.ratingTxt}>{item.rating || '4.5'}</Text>
            </View>
          </View>
          <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailVal}>{eta}</Text>
              <Text style={styles.detailLbl}>Wait Time</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.detailItem}>
              <Text style={styles.detailVal}>₹{item.price_level * 150}</Text>
              <Text style={styles.detailLbl}>Avg. Cost</Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((tag: string) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagTxt}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/app_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={cafes}
          renderItem={renderCafeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTxt}>No cafés found in this category.</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FAF3E8',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImg: { width: '100%', height: 180 },
  cardBody: { padding: 16 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 20, fontFamily: 'Courgette_400Regular', color: TEXT_DARK },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF9F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingTxt: { fontSize: 13, fontWeight: '700', color: '#F4A300' },
  address: { fontSize: 13, color: TEXT_MID, marginBottom: 12 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  detailItem: { alignItems: 'flex-start' },
  detailVal: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  detailLbl: { fontSize: 10, color: TEXT_LIGHT, textTransform: 'uppercase' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#DDD' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: { backgroundColor: '#F0EBE3', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagTxt: { fontSize: 11, color: BROWN, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTxt: { fontSize: 16, color: TEXT_MID },
});
