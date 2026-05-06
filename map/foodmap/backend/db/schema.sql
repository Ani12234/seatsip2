-- ============================================
-- FOODMAP - PostgreSQL Schema
-- ============================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CITIES
-- ============================================
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  zoom_level INTEGER DEFAULT 13,
  geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed all major Indian cities
INSERT INTO cities (name, state, lat, lng, zoom_level) VALUES
  ('Bengaluru',     'Karnataka',       12.9716,  77.5946, 13),
  ('Mumbai',        'Maharashtra',     19.0760,  72.8777, 13),
  ('Delhi',         'Delhi',           28.6139,  77.2090, 12),
  ('Chennai',       'Tamil Nadu',      13.0827,  80.2707, 13),
  ('Hyderabad',     'Telangana',       17.3850,  78.4867, 13),
  ('Pune',          'Maharashtra',     18.5204,  73.8567, 13),
  ('Kolkata',       'West Bengal',     22.5726,  88.3639, 13),
  ('Ahmedabad',     'Gujarat',         23.0225,  72.5714, 13),
  ('Jaipur',        'Rajasthan',       26.9124,  75.7873, 13),
  ('Surat',         'Gujarat',         21.1702,  72.8311, 13),
  ('Lucknow',       'Uttar Pradesh',   26.8467,  80.9462, 13),
  ('Kochi',         'Kerala',           9.9312,  76.2673, 13),
  ('Chandigarh',    'Punjab',          30.7333,  76.7794, 14),
  ('Bhopal',        'Madhya Pradesh',  23.2599,  77.4126, 13),
  ('Indore',        'Madhya Pradesh',  22.7196,  75.8577, 13),
  ('Nagpur',        'Maharashtra',     21.1458,  79.0882, 13),
  ('Vadodara',      'Gujarat',         22.3072,  73.1812, 13),
  ('Coimbatore',    'Tamil Nadu',      11.0168,  76.9558, 13),
  ('Visakhapatnam', 'Andhra Pradesh',  17.6868,  83.2185, 13),
  ('Guwahati',      'Assam',           26.1445,  91.7362, 13);

-- ============================================
-- RESTAURANTS / CAFES
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  cuisine_type VARCHAR(100),         -- 'cafe', 'biryani', 'south_indian', 'pizza', etc.
  category VARCHAR(50) DEFAULT 'restaurant', -- 'restaurant' | 'cafe' | 'cloud_kitchen'
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,
  phone VARCHAR(20),
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  price_range SMALLINT CHECK (price_range BETWEEN 1 AND 4), -- 1=cheap, 4=luxury
  is_open BOOLEAN DEFAULT true,
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '22:00',
  image_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],                        -- ['vegan', 'rooftop', '24h', 'delivery_only']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_city ON restaurants(city_id);
CREATE INDEX idx_restaurants_geom ON restaurants USING GIST(geom);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_category ON restaurants(category);

-- ============================================
-- MENU ITEMS
-- ============================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),             -- 'starters', 'mains', 'desserts', 'beverages'
  price DECIMAL(10, 2) NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  calories INTEGER,
  prep_time_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_restaurant ON menu_items(restaurant_id);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  default_city_id UUID REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY ADDRESSES
-- ============================================
CREATE TABLE delivery_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',  -- 'Home', 'Work', 'Other'
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100),
  pincode VARCHAR(10),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON delivery_addresses(user_id);

-- ============================================
-- DELIVERY AGENTS
-- ============================================
CREATE TABLE delivery_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  vehicle_type VARCHAR(50) DEFAULT 'bike',  -- 'bike', 'cycle', 'car'
  vehicle_number VARCHAR(20),
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  current_geom GEOGRAPHY(Point, 4326),
  city_id UUID REFERENCES cities(id),
  is_online BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_geom ON delivery_agents USING GIST(current_geom);
CREATE INDEX idx_agents_city ON delivery_agents(city_id);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  agent_id UUID REFERENCES delivery_agents(id),
  status VARCHAR(50) DEFAULT 'pending',
  -- Status flow: pending → confirmed → preparing → ready → picked_up → on_the_way → delivered | cancelled
  
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  delivery_address_id UUID REFERENCES delivery_addresses(id),
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  
  estimated_prep_time INTEGER,        -- minutes
  estimated_delivery_time INTEGER,    -- minutes
  actual_delivery_time TIMESTAMPTZ,
  
  payment_method VARCHAR(50),         -- 'upi', 'card', 'cod', 'wallet'
  payment_status VARCHAR(50) DEFAULT 'pending',
  
  special_instructions TEXT,
  cancellation_reason TEXT,
  
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_agent ON orders(agent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_placed_at ON orders(placed_at DESC);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  customization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- LIVE DELIVERY TRACKING (time-series)
-- ============================================
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES delivery_agents(id),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,
  speed DECIMAL(5, 2),               -- km/h
  heading DECIMAL(5, 2),             -- degrees 0-360
  accuracy DECIMAL(8, 2),            -- meters
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_order ON delivery_tracking(order_id);
CREATE INDEX idx_tracking_agent ON delivery_tracking(agent_id);
CREATE INDEX idx_tracking_time ON delivery_tracking(recorded_at DESC);
CREATE INDEX idx_tracking_geom ON delivery_tracking USING GIST(geom);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  order_id UUID REFERENCES orders(id),
  food_rating SMALLINT CHECK (food_rating BETWEEN 1 AND 5),
  delivery_rating SMALLINT CHECK (delivery_rating BETWEEN 1 AND 5),
  overall_rating SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Active orders with restaurant + agent location
CREATE VIEW active_orders_view AS
SELECT
  o.id,
  o.status,
  o.total_amount,
  o.placed_at,
  o.estimated_delivery_time,
  r.name AS restaurant_name,
  r.lat AS restaurant_lat,
  r.lng AS restaurant_lng,
  da.delivery_lat,
  da.delivery_lng,
  ag.current_lat AS agent_lat,
  ag.current_lng AS agent_lng,
  ag.name AS agent_name,
  ag.phone AS agent_phone,
  ag.vehicle_type
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
JOIN delivery_addresses da ON da.id = o.delivery_address_id
LEFT JOIN delivery_agents ag ON ag.id = o.agent_id
WHERE o.status NOT IN ('delivered', 'cancelled');

-- Nearby restaurants (used by the geospatial query in API)
-- Usage: SELECT * FROM restaurants WHERE ST_DWithin(geom, ST_MakePoint($lng,$lat)::geography, $radius_meters)

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurants_updated BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON delivery_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Keep agent geom in sync when lat/lng updated
CREATE OR REPLACE FUNCTION sync_agent_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_geom = ST_SetSRID(ST_MakePoint(NEW.current_lng, NEW.current_lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agent_geom BEFORE INSERT OR UPDATE OF current_lat, current_lng
  ON delivery_agents FOR EACH ROW EXECUTE FUNCTION sync_agent_geom();
