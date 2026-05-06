import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 320;

const IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497933322477-911b33364917?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=800&auto=format&fit=crop',
];

type CafeDetailRouteProp = RouteProp<RootStackParamList, 'CafeDetail'>;

const DyuArtCafeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CafeDetailRouteProp>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const cafeId = route.params?.cafeId || 'dyu-art-cafe';
  const cafeName = 'Dyu Art Café';

  const handleReserve = () => {
    navigation.navigate('TableSelect', { cafeId, cafeName });
  };

  const handleOrder = () => {
    navigation.navigate('Menu', { cafeId, cafeName });
  };

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeImageIndex + 1) % IMAGES.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      // setActiveImageIndex is handled by onScroll
    }, 4000);
    return () => clearInterval(timer);
  }, [activeImageIndex]);

  // Parallax Effect for the Carousel
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, HEADER_HEIGHT * 0.5], // Moves slower than scroll to create overlap
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* 1. Fixed Top Bar (Back & Camera buttons) */}
      <View style={styles.staticOverlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.goBack()}
          >
            <AppIcon name="back" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconButtonRow}><AppIcon name="photo" size={16} color="#111" /><Text style={styles.iconText}>{IMAGES.length}</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Scrollable Content */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carousel with Parallax */}
        <Animated.View 
          style={{ 
            height: HEADER_HEIGHT,
            transform: [{ translateY: headerTranslate }, { scale: headerScale }] 
          }}
        >
          <ScrollView 
            ref={scrollRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / width);
              if (index !== activeImageIndex) setActiveImageIndex(index);
            }}
          >
            {IMAGES.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: width, height: HEADER_HEIGHT }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Badges and Pagination - Inside the carousel layer so they go behind content */}
          <View style={styles.carouselOverlay} pointerEvents="none">
            <View style={styles.badgesContainer}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Open now</Text>
              </View>
              <View style={styles.timeBadge}>
                <View style={styles.timeBadgeRow}><AppIcon name="time" size={12} color="#fff" /><Text style={styles.timeText}>09:00 AM - 11:00 PM</Text></View>
              </View>
            </View>
            <View style={styles.pagination}>
              {IMAGES.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    activeImageIndex === i && styles.activeDot
                  ]} 
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Details Container - Overlaps Carousel on Scroll */}
        <View style={styles.detailsContainer}>
          {/* Title & Heart */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Dyu Art Café</Text>
            <TouchableOpacity>
              <AppIcon name="date" size={28} color="#C8382A" />
            </TouchableOpacity>
          </View>


          {/* Rating & Price */}
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>{[0, 1, 2, 3, 4].map(i => <AppIcon key={i} name="popular" size={13} color="#F4A300" fill="#F4A300" />)}</View>
            <Text style={styles.ratingText}>4.8 <Text style={styles.reviewCount}>(521 reviews)</Text></Text>
            <Text style={styles.price}>₹₹<Text style={styles.priceLight}>₹₹</Text></Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <AppIcon name="location" size={16} color="#999" />
            <Text style={styles.address}>23, 1st Cross Rd, KHB Colony, 5th Block, Koramangala, Bengaluru</Text>
          </View>
          <TouchableOpacity>
             <View style={styles.mapLinkRow}><Text style={styles.mapLink}>View on map</Text><AppIcon name="→" size={13} color="#8B5E3C" /></View>
          </TouchableOpacity>

          {/* Amenities */}
          <View style={styles.amenitiesRow}>
            <View style={styles.amenityItem}><AppIcon name="wifi" size={13} color="#555" /><Text style={styles.amenityText}>Free Wi-Fi</Text></View>
            <View style={styles.verticalDivider} />
            <View style={styles.amenityItem}><AppIcon name="time" size={13} color="#555" /><Text style={styles.amenityText}>12 min</Text></View>
          </View>

          <View style={styles.horizontalDivider} />

          {/* About Section */}
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutText}>
              A bohemian art café with rotating art exhibitions, board games, and exceptional pour-overs.
            </Text>
            <View style={styles.aboutImages}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=400&auto=format&fit=crop' }} style={styles.aboutImageLarge} />
              <View style={styles.aboutImageSmallContainer}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop' }} style={styles.aboutImageSmall} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.overlayText}>+12</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          {/* Perfect For Section */}
          <Text style={styles.sectionTitle}>Perfect for</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={[styles.tag, { backgroundColor: '#FFF0E5' }]}>
              <Text style={[styles.tagText, { color: '#E88B4A' }]}>Art</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#FFF0E5' }]}>
              <Text style={[styles.tagText, { color: '#E88B4A' }]}>Creative</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#F0EEFF' }]}>
              <Text style={[styles.tagText, { color: '#907CFF' }]}>Chill</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#FBEBFA' }]}>
              <Text style={[styles.tagText, { color: '#D973C5' }]}>Date</Text>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chip}><AppIcon name="🎨" size={13} color="#555" /><Text style={styles.chipText}>Art space</Text></View>
            <View style={styles.chip}><AppIcon name="🎲" size={13} color="#555" /><Text style={styles.chipText}>Board games</Text></View>
            <View style={styles.chip}><AppIcon name="vegan" size={13} color="#555" /><Text style={styles.chipText}>Vegan options</Text></View>
            <View style={styles.chip}><AppIcon name="photo" size={13} color="#555" /><Text style={styles.chipText}>Instagrammable</Text></View>
          </ScrollView>

          <View style={styles.horizontalDivider} />

          {/* Reviews Section */}
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <View style={styles.seeAllRow}><Text style={styles.seeAll}>See all</Text><AppIcon name="→" size={13} color="#8B5E3C" /></View>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <View style={styles.avatar}><Text style={styles.avatarText}>P</Text></View>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>Priya Nair</Text>
                <Text style={styles.reviewDate}>2 weeks ago</Text>
              </View>
              <View style={styles.reviewRatingBox}>
                <View style={styles.starsRow}>{[0, 1, 2, 3, 4].map(i => <AppIcon key={i} name="popular" size={10} color="#F4A300" fill="#F4A300" />)}</View>
                <Text style={styles.reviewScore}>5.0</Text>
              </View>
            </View>
            <Text style={styles.reviewBody}>
              Amazing ambience, super friendly staff and the pour-over was one of the best I've had in Bangalore!
            </Text>
          </View>
          
          <View style={{ height: 120 }} />

        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnOutline} onPress={handleReserve}>
          <View style={styles.actionBtnContent}><AppIcon name="reservation" size={16} color="#1A1A1A" /><Text style={styles.btnOutlineText}>Reserve Table</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSolid} onPress={handleOrder}>
          <View style={styles.actionBtnContent}><AppIcon name="coffee" size={16} color="#fff" /><Text style={styles.btnSolidText}>Order Now</Text></View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  staticOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 10,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'flex-end', // Position dots at bottom
    paddingBottom: 20,
  },
  iconButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgesContainer: {
    alignItems: 'flex-start',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 13,
  },
  timeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  timeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSpacer: {
    height: HEADER_HEIGHT - 30, // 30px overlap from detailsContainer
    backgroundColor: 'transparent',
  },
  detailsContainer: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: height,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginRight: 8 },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontWeight: '400',
    color: '#666',
  },
  price: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: '600',
    color: '#7A5240',
  },
  priceLight: {
    color: '#D3C4BE',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  mapLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 26, marginBottom: 16 },
  address: {
    flex: 1,
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 22,
  },
  mapLink: {
    color: '#7A5240',
    fontWeight: '600',
    fontSize: 14,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  amenityText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  verticalDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#DDD',
    marginHorizontal: 12,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  aboutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    paddingRight: 16,
  },
  aboutImages: {
    flexDirection: 'row',
    gap: 8,
  },
  aboutImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  aboutImageSmallContainer: {
    width: 40,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aboutImageSmall: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tagsScroll: {
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  tagText: {
    fontWeight: '600',
    fontSize: 14,
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  chipText: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: '#7A5240',
    fontWeight: '600',
  },
  seeAllRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewCard: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C59A7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reviewDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  reviewRatingBox: {
    alignItems: 'flex-end',
  },
  reviewScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  reviewBody: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#7A5240',
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: '#7A5240',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSolid: {
    flex: 1,
    backgroundColor: '#7A5240',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSolidText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});

export default DyuArtCafeScreen;
