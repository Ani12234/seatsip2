# FoodMap

A real-time food delivery tracking application with 3D maps, built with React Native, Express, Socket.IO, and PostgreSQL/PostGIS.

## Features

- **3D City Maps**: Interactive maps with 3D buildings using MapLibre GL
- **20 Indian Cities**: Pre-loaded with major cities across India
- **Geo-search**: Find restaurants by location with radius-based filtering
- **Live Delivery Tracking**: Real-time agent location via WebSocket
- **Order Management**: Full order lifecycle from placement to delivery
- **Nearest Agent Finder**: PostGIS-powered spatial queries

## Project Structure

```
foodmap/
├── backend/               # Express + Socket.IO server
│   ├── server.js         # Main server file
│   ├── db/
│   │   ├── schema.sql    # PostgreSQL + PostGIS schema
│   │   └── pool.js       # Database connection
│   └── routes/
│       ├── cities.js     # 20 Indian cities API
│       ├── restaurants.js # Geo-search by lat/lng + radius
│       ├── orders.js     # Place order, transaction, ETA
│       ├── tracking.js   # Agent pings, trail polyline
│       ├── agents.js     # Nearest agent finder
│       └── auth.js       # JWT login/register
└── mobile/               # React Native app
    ├── screens/
    │   ├── MapScreen.js      # 3D city map with cafe pins
    │   └── TrackingScreen.js # Live delivery tracking
    └── components/
        ├── CitySelector.js   # All-India city picker
        ├── RestaurantCard.js  # Restaurant display card
        └── CategoryFilter.js  # Category filter chips
```

## Prerequisites

- Node.js 16+
- PostgreSQL 13+ with PostGIS extension
- React Native development environment (Xcode/Android Studio)

## Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create PostgreSQL database**:
   ```sql
   CREATE DATABASE foodmap;
   CREATE EXTENSION postgis;
   ```

4. **Run the schema**:
   ```bash
   psql -d foodmap -f db/schema.sql
   ```

5. **Start the server**:
   ```bash
   npm run dev
   # or
   npm start
   ```

Server runs on http://localhost:4000

## Mobile App Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   # or
   npx expo install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API base URL
   ```

3. **Start the app**:
   ```bash
   npx expo start
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cities` | GET | List all cities |
| `/api/restaurants?lat=...&lng=...&radius=5000` | GET | Geo-search restaurants |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/orders` | POST | Place order |
| `/api/orders/:id` | GET | Get order details |
| `/api/tracking/:orderId` | GET | Get tracking snapshot |
| `/api/agents/nearby?lat=...&lng=...` | GET | Find nearest agents |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `track:order` | Client → Server | Join order room |
| `agent:location` | Client → Server | Agent location ping |
| `order:status` | Client → Server | Update order status |
| `location:update` | Server → Client | Live location broadcast |
| `status:update` | Server → Client | Status change broadcast |

## Database Schema

The schema includes:
- **cities**: 20 major Indian cities with coordinates
- **restaurants**: Geo-located eateries with PostGIS points
- **menu_items**: Restaurant menus
- **users**: Customer accounts
- **delivery_addresses**: Saved addresses
- **delivery_agents**: Delivery personnel with live location
- **orders**: Order lifecycle management
- **delivery_tracking**: Time-series location data

## Technologies

- **Backend**: Express.js, Socket.IO, PostgreSQL, PostGIS
- **Mobile**: React Native, MapLibre GL, Socket.IO Client
- **Maps**: MapTiler (100k free loads/month)
- **Auth**: JWT tokens

## License

MIT
