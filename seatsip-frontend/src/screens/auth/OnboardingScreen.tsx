import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
  {
    id: '1',
    title: 'Disconnect to Reconnect',
    description: 'A café experience designed for real conversations and mindful moments.',
    image: require('../../../assets/images/onboard_1.jpeg'),
  },
  {
    id: '2',
    title: 'Phone-Free Atmosphere',
    description: 'Enjoy coffee, community, and presence without digital distractions.',
    image: require('../../../assets/images/onboard_2.jpeg'),
  },
  {
    id: '3',
    title: 'Find Your Seat',
    description: 'Reserve your place and experience a calmer way to connect.',
    image: require('../../../assets/images/onboard_3.png'),
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        getItemLayout={getItemLayout}
        keyExtractor={(item) => item.id}
      />

      <View style={[styles.cardContainer, { bottom: insets.bottom + 40 }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
            <Text style={styles.description}>{SLIDES[currentIndex].description}</Text>
            
            <View style={styles.footer}>
              {/* Pagination Dots */}
              <View style={styles.dotsContainer}>
                {SLIDES.map((_, i) => {
                  const widthAnim = scrollX.interpolate({
                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                    outputRange: [8, 20, 8],
                    extrapolate: 'clamp',
                  });
                  const opacity = scrollX.interpolate({
                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View 
                      key={i} 
                      style={[styles.dot, { width: widthAnim, opacity }]} 
                    />
                  );
                })}
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[
                  styles.button, 
                  currentIndex === SLIDES.length - 1 && styles.getStartedButton
                ]} 
                onPress={handleNext}
              >
                <Text style={[
                  styles.buttonText,
                  currentIndex === SLIDES.length - 1 && styles.getStartedButtonText
                ]}>
                  {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                {currentIndex !== SLIDES.length - 1 && (
                  <ArrowRight size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
  },
  image: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  getStartedButton: {
    backgroundColor: '#8B9D5E', // Warm sage green brand color
    borderColor: '#8B9D5E',
    paddingHorizontal: 24,
  },
  getStartedButtonText: {
    color: '#fff',
  },
});
