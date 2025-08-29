// أنواع البيانات لجهاز Myo Gesture Armband

export interface EMGData {
  channels: number[]; // 8 قنوات EMG
  timestamp: number;
}

export interface IMUData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  orientation: {
    w: number;
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

export interface DeviceStatus {
  connected: boolean;
  batteryLevel: number; // 0-100
  rssi: number; // قوة الإشارة
  deviceName: string;
  firmwareVersion?: string;
}

export interface MyoDevice {
  id: string;
  name: string;
  status: DeviceStatus;
  emgData: EMGData[];
  imuData: IMUData[];
}

export interface SignalBuffer {
  emg: number[][];
  acceleration: number[][];
  gyroscope: number[][];
  orientation: number[][];
  maxLength: number;
}

export interface GestureData {
  name: string;
  confidence: number;
  timestamp: number;
  duration: number;
}

export interface VibrationType {
  short: 'short';
  medium: 'medium';
  long: 'long';
}

export interface ChartConfig {
  emg: {
    colors: string[];
    range: [number, number];
    enabled: boolean[];
  };
  imu: {
    acceleration: {
      colors: string[];
      range: [number, number];
    };
    gyroscope: {
      colors: string[];
      range: [number, number];
    };
    orientation: {
      colors: string[];
      range: [number, number];
    };
  };
  updateInterval: number;
  bufferSize: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  chartConfig: ChartConfig;
  notifications: {
    gestures: boolean;
    deviceStatus: boolean;
    lowBattery: boolean;
  };
  vibrationSettings: {
    intensity: number;
    patterns: Record<string, number[]>;
  };
}