import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';
import { cafesApi } from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

type CafeGalleryRouteProp = RouteProp<RootStackParamList, 'CafeGallery'>;

export default function CafeGalleryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CafeGalleryRouteProp>();
  const { cafeId, cafeName } = route.params;

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadGallery();
  }, [cafeId]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const { data } = await cafesApi.getById(cafeId);
      if (data.success && data.data) {
        const cafeData = data.data;
        let imgList: string[] = [];
        try {
          imgList = Array.isArray(cafeData.images) ? cafeData.images : JSON.parse(cafeData.images || '[]');
        } catch {
          imgList = [];
        }
        if (imgList.length === 0 && cafeData.image_url) {
          imgList = [cafeData.image_url];
        }
        setImages(imgList);
      }
    } catch (err) {
      console.error('Gallery load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="back" size={20} color="#1A0E0A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>{cafeName || 'Gallery'}</Text>
        
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <AppIcon 
            name="popular" 
            size={20} 
            color="#E23744" 
            fill={isFavorite ? "#E23744" : "none"} 
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B3F1A" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {images.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AppIcon name="camera" size={48} color="#D2C8C1" />
              <Text style={styles.emptyText}>No photos yet</Text>
            </View>
          ) : (
            <View style={styles.masonryGrid}>
              {/* Left Column */}
              <View style={styles.column}>
                {images.filter((_, i) => i % 2 === 0).map((uri, index) => (
                  <View key={`left-${index}`} style={[styles.imageCard, { aspectRatio: index % 3 === 0 ? 3/4 : 1 }]}>
                    <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                  </View>
                ))}
              </View>
              
              {/* Right Column */}
              <View style={styles.column}>
                {images.filter((_, i) => i % 2 !== 0).map((uri, index) => (
                  <View key={`right-${index}`} style={[styles.imageCard, { aspectRatio: index % 2 === 0 ? 1 : 3/4 }]}>
                    <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 248, 245, 0.92)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DDD5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#1A0E0A',
    marginHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 12,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9E928A',
    fontWeight: '600',
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  imageCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#E8DDD5',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
