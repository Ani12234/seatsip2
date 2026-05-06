const MAPTILER_KEY = '5qJr4cBxnkaZ1S4BU1Ua';
const API_BASE = '/api';

const state = {
  cities: [],
  restaurants: [],
  selectedCity: null,
  category: 'all',
  markers: [],
};

const elements = {
  citySelect: document.querySelector('#citySelect'),
  cityState: document.querySelector('#cityState'),
  cityName: document.querySelector('#cityName'),
  resultCount: document.querySelector('#resultCount'),
  restaurantList: document.querySelector('#restaurantList'),
  details: document.querySelector('#details'),
  segments: document.querySelectorAll('.segment'),
};

const map = new maplibregl.Map({
  container: 'map',
  style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
  center: [77.5946, 12.9716],
  zoom: 12.8,
  pitch: 54,
  bearing: -18,
  attributionControl: false,
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

map.on('load', () => {
  addBuildingsLayer();
});

function addBuildingsLayer() {
  if (map.getLayer('building-3d')) return;
  const style = map.getStyle();
  const buildingLayer = style.layers.find((layer) => {
    return layer.type === 'fill' && layer['source-layer'] === 'building' && style.sources[layer.source];
  });

  if (!buildingLayer) return;

  map.addLayer({
    id: 'building-3d',
    source: buildingLayer.source,
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 14,
    filter: ['==', ['get', 'extrude'], 'true'],
    paint: {
      'fill-extrusion-color': ['interpolate', ['linear'], ['zoom'], 14, '#c9d3cf', 16, '#d6a75a'],
      'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, ['get', 'render_height']],
      'fill-extrusion-base': ['get', 'render_min_height'],
      'fill-extrusion-opacity': 0.82,
    },
  });
}

async function getJSON(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function init() {
  state.cities = await getJSON('/cities');
  state.selectedCity = state.cities.find((city) => city.id === 'bengaluru') || state.cities[0];
  renderCities();
  bindEvents();
  await loadRestaurants();
}

function bindEvents() {
  elements.citySelect.addEventListener('change', async (event) => {
    state.selectedCity = state.cities.find((city) => city.id === event.target.value);
    await loadRestaurants();
  });

  elements.segments.forEach((button) => {
    button.addEventListener('click', async () => {
      state.category = button.dataset.category;
      elements.segments.forEach((item) => item.classList.toggle('active', item === button));
      await loadRestaurants();
    });
  });
}

function renderCities() {
  elements.citySelect.innerHTML = state.cities
    .map((city) => `<option value="${city.id}">${city.name}</option>`)
    .join('');
  elements.citySelect.value = state.selectedCity.id;
}

async function loadRestaurants() {
  const city = state.selectedCity;
  const params = new URLSearchParams({
    lat: city.lat,
    lng: city.lng,
    radius: 9000,
    city_id: city.id,
  });

  if (state.category !== 'all') params.set('category', state.category);

  elements.cityState.textContent = city.state;
  elements.cityName.textContent = city.name;
  elements.restaurantList.innerHTML = '<p class="restaurant">Loading places...</p>';
  elements.details.hidden = true;

  map.flyTo({
    center: [Number(city.lng), Number(city.lat)],
    zoom: city.zoom_level || 13,
    pitch: 54,
    bearing: -18,
    duration: 1100,
  });

  state.restaurants = await getJSON(`/restaurants?${params}`);
  elements.resultCount.textContent = state.restaurants.length;
  renderRestaurantList();
  renderMarkers();
}

function renderRestaurantList() {
  if (!state.restaurants.length) {
    elements.restaurantList.innerHTML = '<p class="restaurant">No places found nearby.</p>';
    return;
  }

  elements.restaurantList.innerHTML = state.restaurants
    .map((restaurant) => {
      const distance = restaurant.distance_km ? `${Number(restaurant.distance_km).toFixed(1)} km` : '';
      return `
        <button class="restaurant" type="button" data-id="${restaurant.id}">
          <strong>${escapeHTML(restaurant.name)}</strong>
          <span class="distance">${distance}</span>
          <span class="meta">${escapeHTML(restaurant.cuisine_type)} · ${Number(restaurant.rating).toFixed(1)} stars</span>
          <p>${escapeHTML(restaurant.description)}</p>
        </button>
      `;
    })
    .join('');

  elements.restaurantList.querySelectorAll('.restaurant').forEach((button) => {
    button.addEventListener('click', () => {
      const restaurant = state.restaurants.find((item) => item.id === button.dataset.id);
      selectRestaurant(restaurant);
    });
  });
}

function renderMarkers() {
  state.markers.forEach((marker) => marker.remove());
  state.markers = state.restaurants.map((restaurant) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = `pin ${restaurant.category}`;
    pin.setAttribute('aria-label', restaurant.name);
    pin.addEventListener('click', () => selectRestaurant(restaurant));

    const marker = new maplibregl.Marker({ element: pin, anchor: 'bottom' })
      .setLngLat([Number(restaurant.lng), Number(restaurant.lat)])
      .addTo(map);

    return marker;
  });
}

function selectRestaurant(restaurant) {
  if (!restaurant) return;

  map.flyTo({
    center: [Number(restaurant.lng), Number(restaurant.lat)],
    zoom: 15.6,
    pitch: 62,
    bearing: 8,
    duration: 900,
  });

  elements.details.innerHTML = `
    <button class="close" type="button" aria-label="Close">x</button>
    <h2>${escapeHTML(restaurant.name)}</h2>
    <p><strong>${escapeHTML(restaurant.cuisine_type)}</strong> · ${Number(restaurant.rating).toFixed(1)} stars · ${priceLabel(restaurant.price_range)}</p>
    <p>${escapeHTML(restaurant.address)}</p>
    <p>${escapeHTML(restaurant.description)}</p>
    <div class="tag-row">
      ${(restaurant.tags || []).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
    </div>
  `;
  elements.details.hidden = false;
  elements.details.querySelector('.close').addEventListener('click', () => {
    elements.details.hidden = true;
  });
}

function priceLabel(level) {
  return '₹'.repeat(Number(level) || 2);
}

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

init().catch((error) => {
  elements.restaurantList.innerHTML = `<p class="restaurant">${escapeHTML(error.message)}</p>`;
});
