export type UserRole = 'consumer' | 'merchant';
export type AppTab = 'onboarding' | 'pay' | 'merchant';

export interface UserProfile {
  name: string;
  avatarUrl: string;
  fluxId: string;
  phone: string;
  role: UserRole;
  merchantId?: string;
}

export interface Transaction {
  id: string;
  name: string;
  device: string;
  type: 'NFC Tap Completed' | 'BLE Beam Completed' | 'P2P Instant Beam';
  amount: number;
  timestamp: string;
  timeAgo: string;
  tokenHash: string;
  status: 'settled' | 'pending';
  iconType: 'nfc' | 'ble' | 'peer';
  direction?: 'credit' | 'debit';
  category?: string;
}

export interface NearbyBeacon {
  id: string;
  name: string;
  distance: number; // in meters
  rssi: number; // in dBm
  deviceType: 'terminal' | 'phone' | 'turnstile';
  broadcastAmount?: number;
  status: 'ready' | 'idle' | 'transmitting';
}

export interface VirtualCard {
  id: string;
  cardName: string;
  last4: string;
  network: 'Flux Token' | 'RuPay Contactless' | 'Visa Contactless' | 'Mastercard Beam';
  balance: number;
  colorGradient: string;
  expiry: string;
}

