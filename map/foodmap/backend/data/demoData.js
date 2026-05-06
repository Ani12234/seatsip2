const cities = [
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, zoom_level: 13 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, zoom_level: 12 },
  { id: 'delhi', name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209, zoom_level: 12 },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, zoom_level: 13 },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, zoom_level: 13 },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, zoom_level: 13 },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, zoom_level: 13 },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, zoom_level: 13 },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, zoom_level: 13 },
  { id: 'surat', name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, zoom_level: 13 },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, zoom_level: 13 },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, zoom_level: 13 },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794, zoom_level: 13 },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, zoom_level: 13 },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, zoom_level: 13 },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, zoom_level: 13 },
  { id: 'vadodara', name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, zoom_level: 13 },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, zoom_level: 13 },
  { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, zoom_level: 13 },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, zoom_level: 13 },
];

const concepts = [
  ['cafe', 'Third Wave Corner', 'Specialty Coffee', 'Single-origin brews, sourdough toast, and quiet work tables.', 2, ['coffee', 'breakfast', 'wifi']],
  ['restaurant', 'Copper Tiffin', 'South Indian', 'Crisp dosas, filter coffee, thalis, and family-style meals.', 2, ['veg', 'family', 'quick']],
  ['restaurant', 'Biryani Circuit', 'Biryani', 'Slow dum biryani with kebabs, salan, and late-night delivery.', 2, ['spicy', 'late night', 'popular']],
  ['cloud_kitchen', 'Box & Bowl Co.', 'Asian Bowls', 'Delivery-first bowls with noodles, rice, sauces, and add-ons.', 1, ['delivery only', 'fast', 'bowls']],
  ['cafe', 'Roast Lane', 'Cafe', 'Espresso, iced drinks, sandwiches, and a rotating dessert counter.', 2, ['desserts', 'coffee', 'casual']],
  ['restaurant', 'Tandoor Street', 'North Indian', 'Tandoori platters, dal, breads, curries, and weekday combos.', 2, ['tandoor', 'combos', 'dinner']],
];

const restaurants = cities.flatMap((city, cityIndex) => {
  return concepts.map(([category, name, cuisine_type, description, price_range, tags], index) => {
    const angle = ((index * 60 + cityIndex * 13) * Math.PI) / 180;
    const radius = 0.012 + (index % 3) * 0.006;
    const lat = city.lat + Math.sin(angle) * radius;
    const lng = city.lng + Math.cos(angle) * radius;
    const rating = (4.1 + ((cityIndex + index) % 8) / 10).toFixed(1);

    return {
      id: `${city.id}-${index + 1}`,
      city_id: city.id,
      name: `${name} ${city.name}`,
      description,
      cuisine_type,
      category,
      address: `${12 + index}, ${city.name} Central, ${city.state}`,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      phone: `+91 90000 ${String(cityIndex + 1).padStart(2, '0')}${String(index + 1).padStart(3, '0')}`,
      rating,
      total_ratings: 120 + cityIndex * 17 + index * 23,
      price_range,
      is_open: index !== 5 || cityIndex % 2 === 0,
      opening_time: '09:00',
      closing_time: '23:00',
      image_url: '',
      thumbnail_url: '',
      tags,
      is_active: true,
    };
  });
});

function distanceKm(aLat, aLng, bLat, bLng) {
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

function listRestaurants({ lat, lng, radius = 8000, category, cuisine_type, city_id } = {}) {
  const radiusKm = Number(radius) / 1000;
  let rows = restaurants.filter((restaurant) => restaurant.is_active);

  if (city_id) {
    rows = rows.filter((restaurant) => restaurant.city_id === city_id);
  }

  if (category && category !== 'all') {
    rows = rows.filter((restaurant) => restaurant.category === category);
  }

  if (cuisine_type) {
    rows = rows.filter((restaurant) => restaurant.cuisine_type === cuisine_type);
  }

  if (lat && lng) {
    rows = rows
      .map((restaurant) => ({
        ...restaurant,
        distance_km: Number(distanceKm(Number(lat), Number(lng), restaurant.lat, restaurant.lng).toFixed(2)),
      }))
      .filter((restaurant) => restaurant.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);
  }

  return rows.slice(0, 50);
}

function getRestaurant(id) {
  return restaurants.find((restaurant) => restaurant.id === id);
}

function getMenu(restaurantId) {
  const restaurant = getRestaurant(restaurantId);
  if (!restaurant) return [];

  return [
    { id: `${restaurantId}-m1`, restaurant_id: restaurantId, name: 'Signature Combo', category: 'mains', price: 249, is_veg: true, is_available: true },
    { id: `${restaurantId}-m2`, restaurant_id: restaurantId, name: 'House Special', category: 'mains', price: 329, is_veg: restaurant.category !== 'restaurant', is_available: true },
    { id: `${restaurantId}-m3`, restaurant_id: restaurantId, name: 'Classic Beverage', category: 'beverages', price: 119, is_veg: true, is_available: true },
  ];
}

module.exports = {
  cities,
  restaurants,
  listRestaurants,
  getRestaurant,
  getMenu,
};
