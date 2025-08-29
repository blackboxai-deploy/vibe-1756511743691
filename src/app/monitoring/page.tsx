"use client";

import { useState } from 'react';
import { useMyoDevice } from '@/hooks/useMyoDevice';
import { SignalChart } from '@/components/dashboard/SignalChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function MonitoringPage() {
  const {
    isConnected,
    deviceStatus,
    currentGesture,
    signalBuffer,
    connect,

  } = useMyoDevice();

  // إعدادات العرض
  const [showEMG, setShowEMG] = useState(true);
  const [showAccel, setShowAccel] = useState(true);
  const [showGyro, setShowGyro] = useState(true);
  const [showOrientation, setShowOrientation] = useState(true);
  const [updateSpeed, setUpdateSpeed] = useState([50]);
  const [yAxisScale, setYAxisScale] = useState([100]);

  // ألوان المخططات
  const emgColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];
  
  const imuColors = {
    acceleration: ['#FF4757', '#2ED573', '#3742FA'],
    gyroscope: ['#FF6348', '#7BED9F', '#70A1FF'],
    orientation: ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0']
  };

  return (
    <div className="min-h-screen p-6">
      {/* الرأس */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">المراقبة المباشرة</h1>
            <p className="text-slate-400">مراقبة الإشارات في الوقت الفعلي مع إعدادات متقدمة</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className="h-8 px-4"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {isConnected ? 'مراقبة نشطة' : 'غير متصل'}
            </Badge>
            
            {!isConnected && (
              <Button onClick={connect} className="bg-gradient-to-r from-purple-600 to-blue-600">
                بدء المراقبة
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* إعدادات سريعة */}
      <Card className="mb-8 bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">إعدادات العرض</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* تبديل المخططات */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">المخططات المرئية</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emg" 
                    checked={showEMG} 
                    onCheckedChange={setShowEMG}
                  />
                  <Label htmlFor="emg" className="text-slate-300">إشارات EMG</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="accel" 
                    checked={showAccel} 
                    onCheckedChange={setShowAccel}
                  />
                  <Label htmlFor="accel" className="text-slate-300">التسارع</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="gyro" 
                    checked={showGyro} 
                    onCheckedChange={setShowGyro}
                  />
                  <Label htmlFor="gyro" className="text-slate-300">الجايروسكوب</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="orientation" 
                    checked={showOrientation} 
                    onCheckedChange={setShowOrientation}
                  />
                  <Label htmlFor="orientation" className="text-slate-300">الاتجاه</Label>
                </div>
              </div>
            </div>

            {/* سرعة التحديث */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">سرعة التحديث</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">بطيء</span>
                  <span className="text-sm text-slate-400">سريع</span>
                </div>
                <Slider
                  value={updateSpeed}
                  onValueChange={setUpdateSpeed}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="text-center text-sm text-slate-300">
                  {updateSpeed[0]}ms
                </div>
              </div>
            </div>

            {/* مقياس المحور Y */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">مقياس EMG</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">±50</span>
                  <span className="text-sm text-slate-400">±200</span>
                </div>
                <Slider
                  value={yAxisScale}
                  onValueChange={setYAxisScale}
                  max={200}
                  min={50}
                  step={25}
                  className="w-full"
                />
                <div className="text-center text-sm text-slate-300">
                  ±{yAxisScale[0]}µV
                </div>
              </div>
            </div>

            {/* معلومات الجلسة */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">معلومات الجلسة</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>البطارية:</span>
                  <span className="text-white">{deviceStatus.batteryLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>RSSI:</span>
                  <span className="text-white">{deviceStatus.rssi} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span>الإيماءة:</span>
                  <span className="text-purple-400">{currentGesture?.name || 'راحة'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Buffer:</span>
                  <span className="text-white">{signalBuffer.maxLength}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الرسوم البيانية الرئيسية */}
      <div className="space-y-8">
        {/* EMG مفصل */}
        {showEMG && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">إشارات EMG - 8 قنوات</h2>
            
            {/* عرض شامل */}
            <SignalChart
              title="جميع قنوات EMG"
              data={signalBuffer.emg}
              labels={Array.from({length: 8}, (_, i) => `القناة ${i + 1}`)}
              colors={emgColors}
              yAxisRange={[-yAxisScale[0], yAxisScale[0]]}
              unit="µV"
              height={400}
            />

            {/* قنوات منفصلة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((startIndex) => (
                <SignalChart
                  key={startIndex}
                  title={`قنوات EMG ${startIndex * 2 + 1}-${startIndex * 2 + 2}`}
                  data={signalBuffer.emg.slice(startIndex * 2, startIndex * 2 + 2)}
                  labels={[`Ch${startIndex * 2 + 1}`, `Ch${startIndex * 2 + 2}`]}
                  colors={emgColors.slice(startIndex * 2, startIndex * 2 + 2)}
                  yAxisRange={[-yAxisScale[0], yAxisScale[0]]}
                  unit="µV"
                  height={250}
                />
              ))}
            </div>
          </div>
        )}

        {/* IMU مفصل */}
        {(showAccel || showGyro || showOrientation) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">بيانات IMU</h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {showAccel && (
                <SignalChart
                  title="مقياس التسارع (3 محاور)"
                  data={signalBuffer.acceleration}
                  labels={['التسارع X', 'التسارع Y', 'التسارع Z']}
                  colors={imuColors.acceleration}
                  yAxisRange={[-2.5, 2.5]}
                  unit="g"
                  height={320}
                />
              )}

              {showGyro && (
                <SignalChart
                  title="الجايروسكوب (3 محاور)"
                  data={signalBuffer.gyroscope}
                  labels={['دوران X', 'دوران Y', 'دوران Z']}
                  colors={imuColors.gyroscope}
                  yAxisRange={[-600, 600]}
                  unit="°/s"
                  height={320}
                />
              )}
            </div>

            {showOrientation && (
              <SignalChart
                title="الاتجاه (Quaternion)"
                data={signalBuffer.orientation}
                labels={['W (scalar)', 'X', 'Y', 'Z']}
                colors={imuColors.orientation}
                yAxisRange={[-1.2, 1.2]}
                unit="quat"
                height={320}
              />
            )}
          </div>
        )}
      </div>

      {/* معلومات متقدمة */}
      <Card className="mt-8 bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">تحليل متقدم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* إحصائيات EMG */}
            <div>
              <h4 className="font-medium text-white mb-3">إحصائيات EMG</h4>
              <div className="space-y-2">
                {signalBuffer.emg.slice(0, 4).map((channel, index) => {
                  const recentValues = channel.slice(-20).filter(v => v !== 0);
                  const avg = recentValues.length > 0 
                    ? recentValues.reduce((a, b) => a + b, 0) / recentValues.length 
                    : 0;
                  const std = recentValues.length > 0 
                    ? Math.sqrt(recentValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / recentValues.length)
                    : 0;
                  
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-400">Ch{index + 1}:</span>
                      <div className="text-right">
                        <div style={{ color: emgColors[index] }}>
                          μ={avg.toFixed(1)}, σ={std.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* إحصائيات التسارع */}
            <div>
              <h4 className="font-medium text-white mb-3">التسارع الحالي</h4>
              <div className="space-y-2">
                {['X', 'Y', 'Z'].map((axis, index) => {
                  const currentValue = signalBuffer.acceleration[index]?.slice(-1)[0] || 0;
                  return (
                    <div key={axis} className="flex justify-between text-sm">
                      <span className="text-slate-400">{axis}:</span>
                      <span 
                        className="font-mono"
                        style={{ color: imuColors.acceleration[index] }}
                      >
                        {currentValue.toFixed(3)} g
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* إحصائيات الدوران */}
            <div>
              <h4 className="font-medium text-white mb-3">الدوران الحالي</h4>
              <div className="space-y-2">
                {['X', 'Y', 'Z'].map((axis, index) => {
                  const currentValue = signalBuffer.gyroscope[index]?.slice(-1)[0] || 0;
                  return (
                    <div key={axis} className="flex justify-between text-sm">
                      <span className="text-slate-400">{axis}:</span>
                      <span 
                        className="font-mono"
                        style={{ color: imuColors.gyroscope[index] }}
                      >
                        {currentValue.toFixed(1)} °/s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أزرار التنقل */}
      <div className="mt-8 flex justify-center gap-4">
        <Button 
          onClick={() => window.location.href = '/'}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          الصفحة الرئيسية
        </Button>
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          لوحة التحكم
        </Button>
      </div>
    </div>
  );
}