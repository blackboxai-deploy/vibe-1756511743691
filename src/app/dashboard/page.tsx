"use client";

import { useMyoDevice } from '@/hooks/useMyoDevice';
import { SignalChart } from '@/components/dashboard/SignalChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';


export default function DashboardPage() {
  const {
    isConnected,
    deviceStatus,
    currentGesture,
    signalBuffer,
    connect,
    disconnect,
    vibrate
  } = useMyoDevice();

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم الرئيسية</h1>
            <p className="text-slate-400">مراقبة شاملة لجميع إشارات Myo Armband</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className="h-8 px-4"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {isConnected ? 'متصل' : 'غير متصل'}
            </Badge>
            
            {!isConnected ? (
              <Button onClick={connect} className="bg-gradient-to-r from-purple-600 to-blue-600">
                اتصال
              </Button>
            ) : (
              <Button onClick={disconnect} variant="destructive">
                قطع الاتصال
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* معلومات الجهاز */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">البطارية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{deviceStatus.batteryLevel}%</div>
              <Progress value={deviceStatus.batteryLevel} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">قوة الإشارة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{deviceStatus.rssi} dBm</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`h-3 flex-1 rounded ${
                      deviceStatus.rssi > -40 - (bar * 10) 
                        ? 'bg-green-500' 
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">الإيماءة الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-400">
              {currentGesture?.name || 'راحة'}
            </div>
            {currentGesture && (
              <div className="text-sm text-slate-400">
                دقة: {(currentGesture.confidence * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">التحكم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              <Button 
                onClick={() => vibrate('short')}
                disabled={!isConnected}
                size="sm"
                className="flex-1 text-xs"
              >
                قصير
              </Button>
              <Button 
                onClick={() => vibrate('medium')}
                disabled={!isConnected}
                size="sm"
                className="flex-1 text-xs"
              >
                متوسط
              </Button>
              <Button 
                onClick={() => vibrate('long')}
                disabled={!isConnected}
                size="sm"
                className="flex-1 text-xs"
              >
                طويل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="space-y-8">
        {/* مخطط EMG */}
        <SignalChart
          title="إشارات EMG (8 قنوات)"
          data={signalBuffer.emg}
          labels={Array.from({length: 8}, (_, i) => `Ch${i + 1}`)}
          colors={emgColors}
          yAxisRange={[-100, 100]}
          unit="µV"
          height={350}
        />

        {/* مخططات IMU */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SignalChart
            title="مقياس التسارع"
            data={signalBuffer.acceleration}
            labels={['X', 'Y', 'Z']}
            colors={imuColors.acceleration}
            yAxisRange={[-2, 2]}
            unit="g"
            height={280}
          />

          <SignalChart
            title="الجايروسكوب"
            data={signalBuffer.gyroscope}
            labels={['X', 'Y', 'Z']}
            colors={imuColors.gyroscope}
            yAxisRange={[-500, 500]}
            unit="°/s"
            height={280}
          />
        </div>

        <SignalChart
          title="الاتجاه (Quaternion)"
          data={signalBuffer.orientation}
          labels={['W', 'X', 'Y', 'Z']}
          colors={imuColors.orientation}
          yAxisRange={[-1, 1]}
          unit="quat"
          height={280}
        />
      </div>

      {/* معلومات إضافية */}
      <Card className="mt-8 bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">معلومات إضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">الجهاز</h4>
              <div className="space-y-1 text-sm text-slate-400">
                <p>الاسم: {deviceStatus.deviceName}</p>
                {deviceStatus.firmwareVersion && (
                  <p>الإصدار: {deviceStatus.firmwareVersion}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">البيانات</h4>
              <div className="space-y-1 text-sm text-slate-400">
                <p>حجم Buffer: {signalBuffer.maxLength} عينة</p>
                <p>تردد التحديث: ~20 Hz</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">الحالة</h4>
              <div className="space-y-1 text-sm text-slate-400">
                <p>الاتصال: {isConnected ? 'نشط' : 'معطل'}</p>
                <p>الإيماءات: {currentGesture ? 'مفعل' : 'معطل'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* زر العودة */}
      <div className="mt-8 text-center">
        <Button 
          onClick={() => window.location.href = '/'}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}