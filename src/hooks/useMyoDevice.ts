"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { EMGData, IMUData, DeviceStatus, GestureData, SignalBuffer } from '@/types/myo';
import { MyoDataSimulator } from '@/lib/dataSimulator';

const BUFFER_SIZE = 200;

export function useMyoDevice() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    connected: false,
    batteryLevel: 0,
    rssi: 0,
    deviceName: 'Myo Armband'
  });
  
  const [currentGesture, setCurrentGesture] = useState<GestureData | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureData[]>([]);
  
  const simulatorRef = useRef<MyoDataSimulator | null>(null);
  
  // Signal buffers
  const [signalBuffer, setSignalBuffer] = useState<SignalBuffer>({
    emg: Array(8).fill(null).map(() => Array(BUFFER_SIZE).fill(0)),
    acceleration: Array(3).fill(null).map(() => Array(BUFFER_SIZE).fill(0)),
    gyroscope: Array(3).fill(null).map(() => Array(BUFFER_SIZE).fill(0)),
    orientation: Array(4).fill(null).map(() => Array(BUFFER_SIZE).fill(0)),
    maxLength: BUFFER_SIZE
  });

  // إضافة البيانات إلى الـ buffer
  const addToBuffer = useCallback((buffer: number[], newValue: number) => {
    const newBuffer = [...buffer];
    newBuffer.shift(); // إزالة القيمة الأولى
    newBuffer.push(newValue); // إضافة القيمة الجديدة
    return newBuffer;
  }, []);

  // معالج بيانات EMG
  const handleEMGData = useCallback((data: EMGData) => {
    setSignalBuffer(prev => ({
      ...prev,
      emg: prev.emg.map((channel, index) => 
        addToBuffer(channel, data.channels[index] || 0)
      )
    }));
  }, [addToBuffer]);

  // معالج بيانات IMU
  const handleIMUData = useCallback((data: IMUData) => {
    setSignalBuffer(prev => ({
      ...prev,
      acceleration: [
        addToBuffer(prev.acceleration[0], data.acceleration.x),
        addToBuffer(prev.acceleration[1], data.acceleration.y),
        addToBuffer(prev.acceleration[2], data.acceleration.z)
      ],
      gyroscope: [
        addToBuffer(prev.gyroscope[0], data.gyroscope.x),
        addToBuffer(prev.gyroscope[1], data.gyroscope.y),
        addToBuffer(prev.gyroscope[2], data.gyroscope.z)
      ],
      orientation: [
        addToBuffer(prev.orientation[0], data.orientation.w),
        addToBuffer(prev.orientation[1], data.orientation.x),
        addToBuffer(prev.orientation[2], data.orientation.y),
        addToBuffer(prev.orientation[3], data.orientation.z)
      ]
    }));
  }, [addToBuffer]);

  // معالج الإيماءات
  const handleGesture = useCallback((gesture: GestureData) => {
    setCurrentGesture(gesture);
    setGestureHistory(prev => [...prev.slice(-9), gesture]); // الاحتفاظ بآخر 10 إيماءات
  }, []);

  // معالج حالة الجهاز
  const handleDeviceStatus = useCallback((status: DeviceStatus) => {
    setDeviceStatus(status);
    setIsConnected(status.connected);
  }, []);

  // الاتصال بالجهاز
  const connect = useCallback(async () => {
    try {
      if (!simulatorRef.current) {
        simulatorRef.current = new MyoDataSimulator();
      }

      simulatorRef.current.setCallbacks({
        onEMG: handleEMGData,
        onIMU: handleIMUData,
        onGesture: handleGesture,
        onDeviceStatus: handleDeviceStatus
      });

      simulatorRef.current.start(50); // تحديث كل 50ms
      
      return true;
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      return false;
    }
  }, [handleEMGData, handleIMUData, handleGesture, handleDeviceStatus]);

  // قطع الاتصال
  const disconnect = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.stop();
    }
    setIsConnected(false);
    setDeviceStatus(prev => ({ ...prev, connected: false }));
  }, []);

  // تفعيل الاهتزاز
  const vibrate = useCallback((type: 'short' | 'medium' | 'long') => {
    if (simulatorRef.current && isConnected) {
      simulatorRef.current.triggerVibration(type);
    }
  }, [isConnected]);

  // تنظيف الموارد عند انتهاء المكون
  useEffect(() => {
    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
    };
  }, []);

  // إحصائيات البيانات
  const getSignalStats = useCallback(() => {
    const emgStats = signalBuffer.emg.map(channel => {
      const values = channel.filter(v => v !== 0);
      const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;
      const max = Math.max(...values);
      const min = Math.min(...values);
      return { avg: avg.toFixed(2), max, min };
    });

    const accStats = signalBuffer.acceleration.map(axis => {
      const values = axis.filter(v => v !== 0);
      const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;
      return avg.toFixed(3);
    });

    return { emg: emgStats, acceleration: accStats };
  }, [signalBuffer]);

  return {
    // الحالة
    isConnected,
    deviceStatus,
    currentGesture,
    gestureHistory,
    signalBuffer,
    
    // الوظائف
    connect,
    disconnect,
    vibrate,
    getSignalStats,
    
    // معلومات إضافية
    bufferSize: BUFFER_SIZE
  };
}