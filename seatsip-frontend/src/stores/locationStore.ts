/**
 * LocationStore — Session-only, in-memory.
 * No AsyncStorage, no backend calls, no coordinates exposed to UI.
 * Lives only while the app process is running.
 */

export type TemporaryLocation = {
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  label: string;
  isTemporary: true;
  timestamp: number;
};

type Subscriber = (location: TemporaryLocation | null) => void;

class LocationStore {
  private location: TemporaryLocation | null = null;
  private permissionGranted = false;
  private subscribers = new Set<Subscriber>();

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach(cb => cb(this.location));
  }

  setLocation(data: TemporaryLocation) {
    this.location = data;
    this.notify();
  }

  getLocation(): TemporaryLocation | null {
    return this.location;
  }

  clear() {
    this.location = null;
    this.permissionGranted = false;
    this.notify();
  }

  hasPermission(): boolean {
    return this.permissionGranted;
  }

  setPermissionGranted(granted: boolean) {
    this.permissionGranted = granted;
  }
}

// Singleton — one instance for the entire app session
export const locationStore = new LocationStore();
