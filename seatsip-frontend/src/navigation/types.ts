export type RootStackParamList = {
  // Auth
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;

  // Main tabs
  MainTabs: undefined;

  // Discovery
  CafeDetail: { cafeId: string };
  CafeMenu: { cafeId: string; cafeName: string };
  CafeGallery: { cafeId: string; cafeName: string; images: string[] };

  // Reservation flow
  TableSelect: { cafeId: string; cafeName: string };
  ReservationDetails: { cafeId: string; cafeName: string; tableId?: string };
  PreOrderMenu: { cafeId: string; cafeName: string; reservationData: any };
  BookingConfirmed: { reservation: any };

  // Order flow
  ProductDetail: { item: any; cafeId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmed: { orderId: string };
  OrderTracking: { orderId: string };

  // Profile
  EditProfile: undefined;
  WalletScreen: undefined;
  TransactionHistory: undefined;
  OrderHistory: undefined;
  ReservationHistory: undefined;
  WriteReview: { cafeId: string; cafeName: string; orderId?: string };
  Settings: undefined;
  NotificationsScreen: undefined;
  SearchTab: undefined;
  SearchResults: { query?: string; mood?: string };
  HelpCenter: undefined;
  Terms: undefined;
};

export type TabParamList = {
  Home: undefined;
  MapScreen: undefined;
  SearchTab: undefined;
  Profile: undefined;
  Rewards: undefined;
};
