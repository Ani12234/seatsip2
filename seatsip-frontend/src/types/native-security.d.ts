declare module 'react-native-ssl-pinning' {
  export function fetch(url: string, options: any): Promise<{ status: number; headers: Record<string, string>; bodyString?: string }>;
}

declare module 'jail-monkey' {
  const JailMonkey: {
    isJailBroken(): boolean;
    isDebuggedMode(): boolean;
  };
  export default JailMonkey;
}

declare module 'expo-blur' {
  import React from 'react';
  import { ViewProps } from 'react-native';
  export class BlurView extends React.Component<ViewProps & { intensity?: number; tint?: 'light' | 'dark' | 'default' }> {}
}

declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: { email?: string; contact?: string; name?: string };
    method?: { upi?: boolean; card?: boolean; netbanking?: boolean; wallet?: boolean };
    theme?: { color?: string };
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<{
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }>;
  };

  export default RazorpayCheckout;
}
