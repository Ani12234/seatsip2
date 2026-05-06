// Re-export the polished CafeSpot Home UI
export { default } from './CafeSpotHome';

// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, FlatList,
//   TouchableOpacity, RefreshControl, StatusBar, Platform, Image,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Bell } from 'lucide-react-native';
// import { useAuth } from '../../context/AuthContext';
// import { cafesApi } from '../../services/api';
// import { Cafe, MenuItem } from '../../types';
// import { RootStackParamList } from '../../navigation/types';
// import { SpecialMenuBanner, OpenTodayBanner, BuyOneGetOneBanner } from './PromoBanners';
// import { cafesApi as cafesMenuApi } from '../../services/api';

// type Nav = NativeStackNavigationProp<RootStackParamList>;

// // ─── Theme ────────────────────────────────────────────────────────────────────

// const LIGHT = {
//   bg: '#F5F0EB',
//   surface: '#FFFFFF',
//   surfaceAlt: '#EDEAE4',
//   catStrip: '#F0E8DC',
//   catCircle: '#FFFFFF',
//   catCircleBorder: '#E0D8CC',
//   filterActive: '#1A1A1A',
//   filterActiveTxt: '#FFFFFF',
//   filterInactive: '#FFFFFF',
//   filterInactiveTxt: '#333333',
//   filterBorder: '#DDDDDD',
//   promo: '#2D1206',
//   tabBar: '#FFFFFF',
//   tabBorder: '#ECE6DF',
//   accent: '#C8382A',
//   green: '#22863A',
//   gold: '#F5A623',
//   textPrimary: '#1A1A1A',
//   textSecondary: '#555555',
//   textMuted: '#999999',
//   cardBorder: '#E8E0D8',
//   sectionBar: '#C8382A',
//   distanceBadgeBg: 'rgba(255,255,255,0.95)',
//   distanceBadgeTxt: '#1A1A1A',
// };

// const DARK = {
//   bg: '#141414',
//   surface: '#222222',
//   surfaceAlt: '#222222',
//   catStrip: '#1A1A1A',
//   catCircle: '#2A2A2A',
//   catCircleBorder: '#3A3A3A',
//   filterActive: '#FFFFFF',
//   filterActiveTxt: '#141414',
//   filterInactive: '#2A2A2A',
//   filterInactiveTxt: '#CCCCCC',
//   filterBorder: '#3A3A3A',
//   promo: '#1C0D08',
//   tabBar: '#1C1C1C',
//   tabBorder: '#2A2A2A',
//   accent: '#C8382A',
//   green: '#3CA85A',
//   gold: '#F5A623',
//   textPrimary: '#FFFFFF',
//   textSecondary: '#AAAAAA',
//   textMuted: '#666666',
//   cardBorder: '#333333',
//   sectionBar: '#C8382A',
//   distanceBadgeBg: 'rgba(30,30,30,0.90)',
//   distanceBadgeTxt: '#FFFFFF',
// };

// type Theme = typeof LIGHT;

// // ─── Data ─────────────────────────────────────────────────────────────────────

// const CATEGORIES = [
//   { id: 'all', label: 'All', emoji: '☕' },
//   { id: 'bubbletea', label: 'Bubble Tea', emoji: '🧋' },
//   { id: 'bakery', label: 'Bakery', emoji: '🥐' },
//   { id: 'desserts', label: 'Desserts', emoji: '🍰' },
//   { id: 'tea', label: 'Tea', emoji: '🫖' },
//   { id: 'work', label: 'Work', emoji: '💻' },
//   { id: 'date', label: 'Date', emoji: '💕' },
// ];

// const FILTERS = ['Filters', 'Under ₹150', 'Great offers', 'Top rated'];

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function SectionHeader({ title, t, onSeeAll }: { title: string; t: Theme; onSeeAll?: () => void }) {
//   return (
//     <View style={styles.sectionHeader}>
//       <View style={styles.sectionTitleRow}>
//         <View style={[styles.sectionBar, { backgroundColor: t.sectionBar }]} />
//         <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>{title}</Text>
//       </View>
//       {onSeeAll && (
//         <TouchableOpacity onPress={onSeeAll}>
//           <Text style={[styles.seeAll, { color: t.green }]}>See all →</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// // ─── Image Helpers ──────────────────────────────────────────────────────────

// const CAFE_IMAGES = [
//   'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
//   'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600',
//   'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
//   'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=600',
//   'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600',
//   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
// ];

// function getCafeImage(name: string): string {
//   // Simple hash from name to deterministically pick an image
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
//   return CAFE_IMAGES[Math.abs(hash) % CAFE_IMAGES.length];
// }

// const ITEM_IMAGES: Record<string, string> = {
//   cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
//   espresso: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600',
//   latte: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
//   mocha: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600',
//   coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
//   chai: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600',
//   tea: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600',
//   cold: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
//   iced: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
//   brew: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600',
//   smoothie: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=600',
//   mango: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600',
//   toast: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600',
//   avocado: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600',
//   sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600',
//   brownie: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600',
//   cake: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
//   cookie: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600',
//   croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
//   pancake: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
//   waffle: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600',
//   flat: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
// };
// const ITEM_FALLBACK = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600';

// function getItemImage(name: string, imageUrl?: string): string {
//   if (imageUrl) return imageUrl;
//   const lower = name.toLowerCase();
//   for (const [key, url] of Object.entries(ITEM_IMAGES)) {
//     if (lower.includes(key)) return url;
//   }
//   return ITEM_FALLBACK;
// }

// function CafeCard({ cafe, t, isDark, onPress }: { cafe: Cafe; t: Theme; isDark: boolean; onPress: () => void }) {
//   const tagsArray = Array.isArray(cafe.tags) ? cafe.tags : (typeof cafe.tags === 'string' ? JSON.parse(cafe.tags) : []);
//   const category = tagsArray[0] ?? 'south-indian';

//   return (
//     <TouchableOpacity
//       style={[styles.newCard, {
//         backgroundColor: t.surface,
//         ...Platform.select({
//           ios: {
//             shadowColor: isDark ? '#F5EDD6' : '#000',
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: isDark ? 0.15 : 0.2,
//             shadowRadius: 8,
//           },
//           android: {
//             elevation: isDark ? 4 : 6,
//           },
//         }),
//       }]}
//       onPress={onPress}
//       activeOpacity={0.9}
//     >
//       {/* Hero Section */}
//       <View style={[styles.cardHero, { backgroundColor: cafe.coverColor ?? '#5C3320' }]}>
//         <Image source={{ uri: getCafeImage(cafe.name) }} style={styles.cardHeroImg} />
//         <View style={styles.heroOverlay} />

//         {/* Heart Button - Top Left */}
//         <TouchableOpacity style={[styles.heartBtn, { borderColor: 'rgba(232, 224, 216, 1)' }]} activeOpacity={0.8}>
//           <Text style={[styles.heartIcon, { color: '#C8382A' }]}>♡</Text>
//         </TouchableOpacity>

//         {/* Distance Badge */}
//         <View style={styles.distBadge}>
//           <Text style={styles.distBadgeTxt}>{cafe.distance ?? '2.4 km'}</Text>
//         </View>

//         {/* Category Chip at bottom */}
//         <View style={styles.heroBottom}>
//           <View style={styles.catChip}>
//             <Text style={styles.catChipTxt}>{category}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Body Section */}
//       <View style={styles.cardBodyNew}>
//         {/* Top Row: Name + Open pill */}
//         <View style={styles.topRow}>
//           <Text style={[styles.cafeName, { color: t.textPrimary }]} numberOfLines={1}>{cafe.name}</Text>
//           <View style={styles.openPill}>
//             <Text style={styles.openPillTxt}>Open now</Text>
//           </View>
//         </View>

//         {/* Rating Row */}
//         <View style={styles.metaRow}>
//           <Text style={styles.stars}>★★★★★</Text>
//           <Text style={[styles.ratingNum, { color: t.gold }]}>{cafe.rating ?? '4.7'}</Text>
//           <Text style={[styles.reviews, { color: t.textMuted }]}>({cafe.review_count || cafe.reviewCount || 634} reviews)</Text>
//         </View>

//         {/* Stats Row */}
//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <Text style={[styles.statVal, { color: t.textPrimary }]}>{cafe.walkTime ?? '15 min'}</Text>
//             <Text style={[styles.statLbl, { color: t.textMuted }]}>Delivery</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={[styles.statVal, { color: t.textPrimary }]}>{cafe.distance ?? '2.4 km'}</Text>
//             <Text style={[styles.statLbl, { color: t.textMuted }]}>Distance</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={[styles.statVal, { color: t.textPrimary }]}>{cafe.review_count || cafe.reviewCount || 634}</Text>
//             <Text style={[styles.statLbl, { color: t.textMuted }]}>Reviews</Text>
//           </View>
//         </View>

//         {/* Divider */}
//         <View style={[styles.divider, { backgroundColor: t.cardBorder }]} />

//         {/* Bottom Row: Tag + ETA */}
//         <View style={styles.bottomRow}>
//           <View style={[styles.tagPill, { backgroundColor: isDark ? '#2A2A2A' : '#F5F0EB' }]}>
//             <Text style={[styles.tagPillTxt, { color: t.textSecondary }]}>{category}</Text>
//           </View>
//           <View style={styles.etaBlock}>
//             <Text style={[styles.clockIcon, { color: t.accent }]}>⏱</Text>
//             <Text style={[styles.etaLabel, { color: t.textSecondary }]}>{cafe.walkTime ?? '15 min'} away</Text>
//           </View>
//         </View>

//       </View>
//     </TouchableOpacity>
//   );
// }

// // Extended type for popular items displayed on home
// interface PopularItem extends MenuItem {
//   cafeName: string;
//   cafeId: string;
//   emoji: string;
//   coverColor: string;
//   categoryTag: string;
//   rating: number;
//   reviewCount: number;
// }

// const ITEM_EMOJIS: Record<string, string> = {
//   cappuccino: '☕', espresso: '☕', latte: '☕', coffee: '☕', mocha: '☕',
//   chai: '🍵', tea: '🍵',
//   cold: '🧊', iced: '🧊', brew: '🧊',
//   smoothie: '🥤', juice: '🍋', mango: '🥭',
//   toast: '🍞', avocado: '🥑', sandwich: '🥪',
//   brownie: '🍫', cake: '🍰', cookie: '🍪',
//   croissant: '🥐', pancake: '🥞', waffle: '🧇',
//   egg: '🍳', omelette: '🍳',
// };
// const ITEM_COLORS = ['#3D2B1F', '#4A3020', '#2D4A3E', '#4A2040', '#1E3D5C', '#5C3D1E'];

// function getItemEmoji(name: string): string {
//   const lower = name.toLowerCase();
//   for (const [key, emoji] of Object.entries(ITEM_EMOJIS)) {
//     if (lower.includes(key)) return emoji;
//   }
//   return '🍽';
// }

// function PopularItemCard({ item, t, onPress }: { item: PopularItem; t: Theme; onPress: () => void }) {

//   return (
//     <TouchableOpacity style={[styles.popularCard, { backgroundColor: '#FFFFFF' }]} onPress={onPress} activeOpacity={0.9}>
//       {/* Image Section */}
//       <View style={[styles.popularImageWrap, { backgroundColor: item.coverColor }]}>
//         {/* Price Tag - Slanted */}
//         <View style={styles.priceTag}>
//           <Text style={styles.priceTagTxt}>₹{item.price}</Text>
//         </View>

//         <Image source={{ uri: getItemImage(item.name, item.image_url) }} style={styles.popularImg} />

//         {/* Ready Time Overlay */}
//         <View style={styles.readyOverlay}>
//           <Text style={styles.readyTxt}>Ready in ~{item.prep_time_minutes} min</Text>
//         </View>
//       </View>

//       {/* Content Section */}
//       <View style={styles.popularContent}>
//         {/* Title Row */}
//         <View style={styles.popularTitleRow}>
//           <View style={styles.popularTitleLeft}>
//             <Text style={styles.popularLabel}>★ Popular</Text>
//             <Text style={styles.popularItemName}>{item.name}</Text>
//           </View>
//         </View>

//         {/* Tags Row */}
//         <View style={styles.popularTagsRow}>
//           <View style={[styles.popularTag, { backgroundColor: '#F5F5F5' }]}>
//             <Text style={styles.popularTagTxt}>Espresso</Text>
//           </View>
//           <View style={[styles.popularTag, { backgroundColor: '#F5F5F5' }]}>
//             <Text style={styles.popularTagTxt}>with</Text>
//           </View>
//           <View style={[styles.popularTag, { backgroundColor: '#F5F5F5' }]}>
//             <Text style={styles.popularTagTxt}>velvety</Text>
//           </View>
//           <View style={[styles.popularTag, { backgroundColor: '#D1FAE5' }]}>
//             <Text style={[styles.popularTagTxt, { color: '#065F46' }]}>120 cal</Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// function TrendingCard({ cafe, t, onPress, isDark }: { cafe: Cafe; t: Theme; onPress: () => void; isDark: boolean }) {
//   const tagsArray = Array.isArray(cafe.tags) ? cafe.tags : (typeof cafe.tags === 'string' ? JSON.parse(cafe.tags) : []);
//   const category = tagsArray[0] ?? 'south-indian';

//   return (
//     <TouchableOpacity
//       style={[styles.newCard, {
//         backgroundColor: t.surface,
//         ...Platform.select({
//           ios: {
//             shadowColor: isDark ? '#F5EDD6' : '#000',
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: isDark ? 0.15 : 0.2,
//             shadowRadius: 8,
//           },
//           android: {
//             elevation: isDark ? 4 : 6,
//           },
//         }),
//       }]}
//       onPress={onPress}
//       activeOpacity={0.9}
//     >
//       {/* Hero Section */}
//       <View style={[styles.cardHero, { backgroundColor: cafe.coverColor ?? '#5C3320' }]}>
//         <Image source={{ uri: getCafeImage(cafe.name) }} style={styles.cardHeroImg} />
//         <View style={styles.heroOverlay} />

//         {/* Heart Button - Top Left */}
//         <TouchableOpacity style={[styles.heartBtn, { borderColor: 'rgba(232, 224, 216, 1)' }]} activeOpacity={0.8}>
//           <Text style={[styles.heartIcon, { color: '#C8382A' }]}>♡</Text>
//         </TouchableOpacity>

//         {/* Distance Badge */}
//         <View style={styles.distBadge}>
//           <Text style={styles.distBadgeTxt}>{cafe.distance ?? '2.4 km'}</Text>
//         </View>

//         {/* Category Chip at bottom */}
//         <View style={styles.heroBottom}>
//           <View style={styles.catChip}>
//             <Text style={styles.catChipTxt}>{category}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Body Section */}
//       <View style={styles.cardBodyNew}>
//         {/* Top Row: Name + Open pill */}
//         <View style={styles.topRow}>
//           <Text style={[styles.cafeName, { color: t.textPrimary }]} numberOfLines={1}>{cafe.name}</Text>
//           <View style={styles.openPill}>
//             <Text style={styles.openPillTxt}>Open now</Text>
//           </View>
//         </View>

//         {/* Rating Row */}
//         <View style={styles.metaRow}>
//           <Text style={styles.stars}>★★★★★</Text>
//           <Text style={[styles.ratingNum, { color: t.gold }]}>{cafe.rating ?? '4.7'}</Text>
//           <Text style={[styles.reviews, { color: t.textMuted }]}>({cafe.review_count || cafe.reviewCount || 634} reviews)</Text>
//         </View>

//         {/* Stats Row */}
//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <Text style={[styles.statVal, { color: t.textPrimary }]}>{cafe.walkTime ?? '15 min'}</Text>
//             <Text style={[styles.statLbl, { color: t.textMuted }]}>Delivery</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={[styles.statVal, { color: t.textPrimary }]}>{cafe.distance ?? '2.4 km'}</Text>
//             <Text style={[styles.statLbl, { color: t.textMuted }]}>Distance</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={[styles.statVal, { color: t.textPrimary }]}>{cafe.review_count || cafe.reviewCount || 634}</Text>
//             <Text style={[styles.statLbl, { color: t.textMuted }]}>Reviews</Text>
//           </View>
//         </View>

//         {/* Divider */}
//         <View style={[styles.divider, { backgroundColor: t.cardBorder }]} />

//         {/* Bottom Row: Tag + ETA */}
//         <View style={styles.bottomRow}>
//           <View style={[styles.tagPill, { backgroundColor: isDark ? '#2A2A2A' : '#F5F0EB' }]}>
//             <Text style={[styles.tagPillTxt, { color: t.textSecondary }]}>{category}</Text>
//           </View>
//           <View style={styles.etaBlock}>
//             <Text style={[styles.clockIcon, { color: t.accent }]}>⏱</Text>
//             <Text style={[styles.etaLabel, { color: t.textSecondary }]}>{cafe.walkTime ?? '15 min'} away</Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// // ─── Main Screen ──────────────────────────────────────────────────────────────

// export default function HomeScreen() {
//   const navigation = useNavigation<Nav>();
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();
//   const [isDark, setIsDark] = useState(false);
//   const t = LIGHT;

//   const [cafes, setCafes] = useState<Cafe[]>([]);
//   const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
//   const [trending, setTrending] = useState<Cafe[]>([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedCat, setSelectedCat] = useState('all');
//   const [selectedFilter, setSelectedFilter] = useState('Filters');

//   const loadCafes = useCallback(async () => {
//     try {
//       const params: any = { limit: 6 };
//       if (selectedCat !== 'all') params.mood = selectedCat;
//       const [nearRes, trendRes] = await Promise.all([
//         cafesApi.list(params),
//         cafesApi.list({ sort: 'trending', limit: 6 }),
//       ]);
//       const nearbyCafes: Cafe[] = nearRes.data.data;
//       setCafes(nearbyCafes);
//       setTrending(trendRes.data.data);

//       // Fetch menus from the first 3 nearby cafes and extract popular items
//       try {
//         const menuPromises = nearbyCafes.slice(0, 3).map(c => cafesMenuApi.getMenu(c.id).then(r => ({ cafe: c, cats: r.data.data })));
//         const menus = await Promise.all(menuPromises);
//         const items: PopularItem[] = [];
//         menus.forEach(({ cafe, cats }) => {
//           cats.forEach((cat: any) => {
//             (cat.items || []).forEach((mi: MenuItem, idx: number) => {
//               items.push({
//                 ...mi,
//                 cafeName: cafe.name,
//                 cafeId: cafe.id,
//                 emoji: getItemEmoji(mi.name),
//                 coverColor: ITEM_COLORS[idx % ITEM_COLORS.length],
//                 categoryTag: mi.is_popular ? 'Bestseller' : 'New',
//                 rating: cafe.rating,
//                 reviewCount: cafe.review_count || (cafe as any).reviewCount || 0,
//               });
//             });
//           });
//         });
//         // Sort popular first, then shuffle slightly for variety
//         items.sort((a, b) => (b.is_popular || 0) - (a.is_popular || 0));
//         setPopularItems(items.slice(0, 12));
//       } catch (menuErr) {
//         console.warn('Could not load popular items', menuErr);
//       }
//     } catch (e) {
//       console.error('loadCafes error', e);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [selectedCat]);

//   useEffect(() => { loadCafes(); }, [loadCafes]);
//   const onRefresh = () => { setRefreshing(true); loadCafes(); };
//   const goToCafe = (id: string) => navigation.navigate('CafeDetail', { cafeId: id });

//   return (
//     <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
//       <StatusBar
//         barStyle={isDark ? 'light-content' : 'dark-content'}
//         backgroundColor={t.bg}
//       />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
//       >

//         {/* HEADER */}
//         <View style={styles.header}>
//           <View>
//             <View style={styles.locationRow}>
//               <Text style={[styles.locationPin, { color: t.accent }]}>📍</Text>
//               <Text style={[styles.locationLabel, { color: t.textPrimary }]}>Home</Text>
//               <Text style={[styles.locationChevron, { color: t.textSecondary }]}>▾</Text>
//             </View>
//             <Text style={[styles.locationSub, { color: t.textSecondary }]}>Hubballi, Karnataka</Text>
//           </View>
//           <View style={styles.headerIcons}>
//             <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('NotificationsScreen')}>
//               <Bell size={18} color="#1A1A1A" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* SEARCH (Neumorphic Style) */}
//         <TouchableOpacity
//           style={[
//             styles.searchBar,
//             {
//               backgroundColor: isDark ? '#1A1A1A' : '#e8e8e8',
//               // @ts-ignore
//               boxShadow: Platform.OS === 'web'
//                 ? (isDark ? '10px 10px 30px #0a0a0a, -10px -10px 30px #1e1e1e' : '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff')
//                 : undefined
//             }
//           ]}
//           onPress={() => navigation.navigate('ExploreTab' as any)}
//           activeOpacity={0.9}
//         >
//           <Text style={{ fontSize: 16 }}>🔍</Text>
//           <Text style={[styles.searchPlaceholder, { color: isDark ? '#888' : '#999999' }]}>Search cafes, moods, vibes...</Text>
//         </TouchableOpacity>

//         {/* CATEGORY CIRCLES */}
//         <View style={[styles.catStrip, { backgroundColor: t.catStrip }]}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
//             {CATEGORIES.map(cat => {
//               const active = selectedCat === cat.id;
//               return (
//                 <TouchableOpacity key={cat.id} style={styles.catItem} onPress={() => setSelectedCat(cat.id)} activeOpacity={0.75}>
//                   <View style={[styles.catCircle, { backgroundColor: active ? t.accent : t.catCircle, borderColor: active ? t.accent : t.catCircleBorder }]}>
//                     <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
//                   </View>
//                   <Text style={[styles.catLabel, { color: active ? t.accent : t.textSecondary }, active && { fontWeight: '700' }]}>
//                     {cat.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>

//         {/* FILTER CHIPS */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
//           {FILTERS.map(f => {
//             const active = selectedFilter === f;
//             return (
//               <TouchableOpacity key={f} onPress={() => setSelectedFilter(f)}
//                 style={[styles.filterChip, { backgroundColor: active ? t.filterActive : t.filterInactive, borderColor: active ? t.filterActive : t.filterBorder }]}>
//                 {f === 'Filters' && <Text style={{ fontSize: 12, marginRight: 4 }}>⚙️</Text>}
//                 <Text style={[styles.filterTxt, { color: active ? t.filterActiveTxt : t.filterInactiveTxt }]}>{f}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>

//         <SpecialMenuBanner onPress={() => navigation.navigate('SearchResults', {})} />

//         {/* CAFES NEAR YOU */}
//         <View style={styles.section}>
//           <SectionHeader title="Cafes Near You" t={t} onSeeAll={() => navigation.navigate('SearchResults', {})} />
//           <FlatList data={cafes} keyExtractor={c => c.id} horizontal showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.cardList}
//             renderItem={({ item }) => <CafeCard cafe={item} t={t} isDark={isDark} onPress={() => goToCafe(item.id)} />}
//           />
//         </View>

//         <BuyOneGetOneBanner onPress={() => navigation.navigate('SearchResults', {})} />

//         {/* POPULAR NEAR YOU */}
//         <View style={styles.section}>
//           <SectionHeader title="Popular Near You" t={t} onSeeAll={() => navigation.navigate('SearchResults', {})} />
//           <FlatList data={popularItems} keyExtractor={(c, i) => c.id + i} horizontal showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.cardList}
//             renderItem={({ item }) => (
//               <PopularItemCard
//                 item={item}
//                 t={t}
//                 onPress={() => navigation.navigate('ProductDetail', { item, cafeId: item.cafeId })}
//               />
//             )}
//           />
//         </View>

//         <OpenTodayBanner onPress={() => navigation.navigate('SearchResults', {})} />

//         {/* TRENDING */}
//         <View style={[styles.section, { paddingBottom: insets.bottom + 90 }]}>
//           <SectionHeader title="Trending" t={t} onSeeAll={() => navigation.navigate('SearchResults', {})} />
//           <FlatList data={trending} keyExtractor={c => c.id} horizontal showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.cardList}
//             renderItem={({ item }) => <TrendingCard cafe={item} t={t} isDark={isDark} onPress={() => goToCafe(item.id)} />}
//           />
//         </View>

//       </ScrollView>

//       {/* Note: Bottom tab bar is managed by App.tsx navigation */}
//     </View>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
//   locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   locationPin: { fontSize: 12 },
//   locationLabel: { fontSize: 18, fontWeight: '800' },
//   locationChevron: { fontSize: 12 },
//   locationSub: { fontSize: 12, marginTop: 2 },
//   headerIcons: { flexDirection: 'row', gap: 8 },
//   iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
//   notifBtn: {
//     width: 38,
//     height: 38,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//   },
//   badge: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
//   badgeTxt: { fontSize: 9, fontWeight: '700', color: '#fff' },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginHorizontal: 16,
//     marginVertical: 12,
//     borderRadius: 16,
//     paddingHorizontal: 16,
//     height: 56,
//     // Base Shadows for Mobile
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 4, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//       },
//       android: {
//         elevation: 4,
//       }
//     }),
//   },
//   searchPlaceholder: { fontSize: 14, fontWeight: '500' },
//   catStrip: { paddingVertical: 14 },
//   catList: { paddingHorizontal: 16, gap: 16 },
//   catItem: { alignItems: 'center', gap: 6 },
//   catCircle: { width: 58, height: 58, borderRadius: 29, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
//   catLabel: { fontSize: 11 },
//   filterList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
//   filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
//   filterTxt: { fontSize: 12, fontWeight: '600' },
//   section: { marginTop: 16 },
//   sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
//   sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   sectionBar: { width: 3, height: 20, borderRadius: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800' },
//   seeAll: { fontSize: 12, fontWeight: '600' },
//   cardList: { paddingHorizontal: 16, gap: 12 },
//   card: { width: 152, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5 },
//   cardImage: { height: 108, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
//   cardImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
//   distanceBadge: { position: 'absolute', top: 8, right: 8, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
//   distanceBadgeTxt: { fontSize: 11, fontWeight: '700' },
//   distanceBadgeTxt2: { fontSize: 11, fontWeight: '700' },
//   forYouBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#F5A623', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
//   forYouTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },
//   discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#C8382A', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
//   discountBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },
//   cardBody: { padding: 10 },
//   cardName: { fontSize: 14, fontWeight: '800' },
//   itemCafeName: { fontSize: 11, marginTop: 1 },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
//   star: { fontSize: 12 },
//   ratingVal: { fontSize: 12, fontWeight: '600' },
//   ratingCount: { fontSize: 11 },
//   cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
//   tag: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
//   tagTxt: { fontSize: 11, fontWeight: '700' },
//   walkTxt: { fontSize: 11 },

//   // ─── New CafeCard Styles ────────────────────────────────────────────────────
//   newCard: {
//     width: 280,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   cardHero: {
//     height: 140,
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   cardHeroImg: {
//     ...StyleSheet.absoluteFillObject,
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   heroOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.15)',
//   },
//   distBadge: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   distBadgeTxt: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   heroBottom: {
//     position: 'absolute',
//     bottom: 8,
//     left: 8,
//   },
//   catChip: {
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   catChipTxt: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     textTransform: 'lowercase',
//   },
//   cardBodyNew: {
//     padding: 14,
//   },
//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   cafeName: {
//     fontSize: 16,
//     fontWeight: '800',
//     flex: 1,
//   },
//   openPill: {
//     backgroundColor: '#22863A',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     marginLeft: 8,
//   },
//   openPillTxt: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   stars: {
//     fontSize: 12,
//     color: '#F5A623',
//     marginRight: 4,
//   },
//   ratingNum: {
//     fontSize: 12,
//     fontWeight: '700',
//     marginRight: 4,
//   },
//   reviews: {
//     fontSize: 11,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   statBox: {
//     alignItems: 'center',
//   },
//   statVal: {
//     fontSize: 13,
//     fontWeight: '700',
//   },
//   statLbl: {
//     fontSize: 10,
//     marginTop: 2,
//   },
//   divider: {
//     height: 1,
//     marginBottom: 10,
//   },
//   bottomRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   tagPill: {
//     borderRadius: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   tagPillTxt: {
//     fontSize: 11,
//     fontWeight: '600',
//     textTransform: 'lowercase',
//   },
//   etaBlock: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   clockIcon: {
//     fontSize: 12,
//   },
//   etaLabel: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   heartBtn: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     borderWidth: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     zIndex: 10,
//   },
//   heartIcon: {
//     fontSize: 20,
//   },

//   // ─── New PopularItemCard Styles ────────────────────────────────────────────
//   popularCard: {
//     width: 280,
//     borderRadius: 16,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 12,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   popularImageWrap: {
//     height: 140,
//     position: 'relative',
//     overflow: 'hidden',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   popularImg: {
//     ...StyleSheet.absoluteFillObject,
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   priceTag: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     backgroundColor: '#F5F5F5',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderBottomLeftRadius: 12,
//     zIndex: 10,
//   },
//   priceTagTxt: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   readyOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   readyTxt: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   popularContent: {
//     padding: 16,
//   },
//   popularTitleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   popularTitleLeft: {
//     flex: 1,
//   },
//   popularLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#C8382A',
//     marginBottom: 4,
//   },
//   popularItemName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   popularTagsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   popularTag: {
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   popularTagTxt: {
//     fontSize: 11,
//     fontWeight: '500',
//     color: '#555',
//   },
// });
