"use client";

import { EMGData, IMUData, DeviceStatus, GestureData } from '@/types/myo';

export class MyoDataSimulator {
  private isRunning = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callbacks: {
    onEMG?: (data: EMGData) => void;
    onIMU?: (data: IMUData) => void;
    onGesture?: (data: GestureData) => void;
    onDeviceStatus?: (status: DeviceStatus) => void;
  } = {};

  private gestureTemplates = [
    { name: 'Fist', pattern: [80, 85, 90, 75, 70, 60, 55, 65] },
    { name: 'Wave In', pattern: [20, 25, 80, 85, 30, 25, 20, 15] },
    { name: 'Wave Out', pattern: [15, 20, 25, 30, 85, 80, 25, 20] },
    { name: 'Fingers Spread', pattern: [45, 50, 55, 60, 55, 50, 45, 40] },
    { name: 'Double Tap', pattern: [90, 95, 90, 85, 90, 95, 90, 85] },
    { name: 'Rest', pattern: [5, 8, 6, 4, 7, 5, 6, 4] }
  ];

  private currentGesture = 'Rest';
  private gestureStartTime = 0;
  private batteryLevel = 85;
  private rssi = -45;

  constructor() {
    this.generateRandomGesture();
  }

  public start(interval: number = 50) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.generateData();
    }, interval);

    // محاكاة حالة الجهاز
    this.callbacks.onDeviceStatus?.({
      connected: true,
      batteryLevel: this.batteryLevel,
      rssi: this.rssi,
      deviceName: 'Myo Armband',
      firmwareVersion: '1.5.1970.2'
    });
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private generateData() {
    const timestamp = Date.now();
    
    // توليد بيانات EMG
    const emgData = this.generateEMGData(timestamp);
    this.callbacks.onEMG?.(emgData);

    // توليد بيانات IMU
    const imuData = this.generateIMUData(timestamp);
    this.callbacks.onIMU?.(imuData);

    // فحص تغيير الإيماءة
    this.checkGestureChange(timestamp);

    // تحديث حالة البطارية و RSSI بشكل عشوائي
    if (Math.random() < 0.01) {
      this.batteryLevel = Math.max(0, this.batteryLevel - Math.random() * 2);
      this.rssi = -30 + Math.random() * -40;
      
      this.callbacks.onDeviceStatus?.({
        connected: true,
        batteryLevel: Math.round(this.batteryLevel),
        rssi: Math.round(this.rssi),
        deviceName: 'Myo Armband',
        firmwareVersion: '1.5.1970.2'
      });
    }
  }

  private generateEMGData(timestamp: number): EMGData {
    const gesture = this.gestureTemplates.find(g => g.name === this.currentGesture);
    const basePattern = gesture?.pattern || [5, 5, 5, 5, 5, 5, 5, 5];
    
    const channels = basePattern.map(base => {
      // إضافة ضوضاء واقعية
      const noise = (Math.random() - 0.5) * 10;
      // إضافة تذبذب طبيعي
      const oscillation = Math.sin(timestamp * 0.01) * 5;
      // إضافة ارتفاعات عشوائية (spike)
      const spike = Math.random() < 0.05 ? (Math.random() - 0.5) * 30 : 0;
      
      const value = base + noise + oscillation + spike;
      return Math.max(-128, Math.min(127, Math.round(value)));
    });

    return { channels, timestamp };
  }

  private generateIMUData(timestamp: number): IMUData {
    // محاكاة حركة طبيعية للذراع
    const time = timestamp * 0.001;
    
    // تسارع مع الجاذبية وحركة خفيفة
    const acceleration = {
      x: Math.sin(time * 0.5) * 0.2 + (Math.random() - 0.5) * 0.1,
      y: Math.cos(time * 0.3) * 0.15 + (Math.random() - 0.5) * 0.1,
      z: 0.98 + Math.sin(time * 0.7) * 0.1 + (Math.random() - 0.5) * 0.05 // الجاذبية + تذبذب
    };

    // الجايروسكوب - دوران خفيف
    const gyroscope = {
      x: Math.sin(time * 0.4) * 15 + (Math.random() - 0.5) * 5,
      y: Math.cos(time * 0.6) * 10 + (Math.random() - 0.5) * 5,
      z: Math.sin(time * 0.2) * 8 + (Math.random() - 0.5) * 3
    };

    // الكواترنيون - اتجاه مع تغيير تدريجي
    const roll = Math.sin(time * 0.1) * 0.2;
    const pitch = Math.cos(time * 0.15) * 0.15;
    const yaw = time * 0.05;

    const orientation = this.eulerToQuaternion(roll, pitch, yaw);

    return {
      acceleration,
      gyroscope,
      orientation,
      timestamp
    };
  }

  private eulerToQuaternion(roll: number, pitch: number, yaw: number) {
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    return {
      w: cy * cp * cr + sy * sp * sr,
      x: cy * cp * sr - sy * sp * cr,
      y: sy * cp * sr + cy * sp * cr,
      z: sy * cp * cr - cy * sp * sr
    };
  }

  private generateRandomGesture() {
    if (Math.random() < 0.85) {
      this.currentGesture = 'Rest';
    } else {
      const activeGestures = this.gestureTemplates.filter(g => g.name !== 'Rest');
      this.currentGesture = activeGestures[Math.floor(Math.random() * activeGestures.length)].name;
    }
    this.gestureStartTime = Date.now();
  }

  private checkGestureChange(timestamp: number) {
    const gestureAge = timestamp - this.gestureStartTime;
    
    // تغيير الإيماءة كل 2-8 ثواني
    if (gestureAge > 2000 + Math.random() * 6000) {
      const previousGesture = this.currentGesture;
      this.generateRandomGesture();
      
      if (this.currentGesture !== previousGesture && this.currentGesture !== 'Rest') {
        this.callbacks.onGesture?.({
          name: this.currentGesture,
          confidence: 0.75 + Math.random() * 0.2,
          timestamp,
          duration: gestureAge
        });
      }
    }
  }

  public triggerVibration(type: 'short' | 'medium' | 'long') {
    console.log(`🔄 تم تفعيل الاهتزاز: ${type}`);
    // في التطبيق الحقيقي، سيتم إرسال أمر للجهاز
  }

  public getCurrentGesture(): string {
    return this.currentGesture;
  }

  public getDeviceStatus(): DeviceStatus {
    return {
      connected: this.isRunning,
      batteryLevel: Math.round(this.batteryLevel),
      rssi: Math.round(this.rssi),
      deviceName: 'Myo Armband',
      firmwareVersion: '1.5.1970.2'
    };
  }
}