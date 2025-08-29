"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMyoDevice } from '@/hooks/useMyoDevice';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const {
    isConnected,
    deviceStatus,
    currentGesture,
    gestureHistory,
    connect,
    disconnect,
    vibrate,
    getSignalStats
  } = useMyoDevice();

  const [isConnecting, setIsConnecting] = useState(false);
  const stats = getSignalStats();

  const handleConnect = async () => {
    setIsConnecting(true);
    await connect();
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen p-6">
      {/* الرأس */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
            Myo Stream Dashboard
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25"></div>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          واجهة تفاعلية متقدمة لمراقبة والتحكم في Myo Gesture Armband
        </p>
      </div>

      {/* بطاقات المعلومات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* حالة الاتصال */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              حالة الجهاز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isConnected ? "default" : "destructive"} className="mb-2">
              {isConnected ? 'متصل' : 'غير متصل'}
            </Badge>
            <p className="text-sm text-slate-400">{deviceStatus.deviceName}</p>
            {deviceStatus.firmwareVersion && (
              <p className="text-xs text-slate-500">v{deviceStatus.firmwareVersion}</p>
            )}
          </CardContent>
        </Card>

        {/* البطارية */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-200">البطارية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-white">{deviceStatus.batteryLevel}%</span>
                <Badge variant={deviceStatus.batteryLevel > 50 ? "default" : deviceStatus.batteryLevel > 20 ? "secondary" : "destructive"}>
                  {deviceStatus.batteryLevel > 50 ? 'ممتاز' : deviceStatus.batteryLevel > 20 ? 'متوسط' : 'منخفض'}
                </Badge>
              </div>
              <Progress 
                value={deviceStatus.batteryLevel} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* قوة الإشارة */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-200">قوة الإشارة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-white">{deviceStatus.rssi} dBm</span>
                <Badge variant={deviceStatus.rssi > -50 ? "default" : deviceStatus.rssi > -70 ? "secondary" : "destructive"}>
                  {deviceStatus.rssi > -50 ? 'ممتاز' : deviceStatus.rssi > -70 ? 'جيد' : 'ضعيف'}
                </Badge>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`h-4 flex-1 rounded ${
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

        {/* الإيماءة الحالية */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-200">الإيماءة الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {currentGesture?.name || 'راحة'}
              </div>
              {currentGesture && (
                <Badge variant="outline" className="text-xs">
                  دقة: {(currentGesture.confidence * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">التحكم في الجهاز</CardTitle>
          <CardDescription className="text-slate-400">
            اتصل بالجهاز واختبر الاهتزاز
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {!isConnected ? (
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnecting ? 'جاري الاتصال...' : 'اتصال'}
              </Button>
            ) : (
              <Button 
                onClick={disconnect}
                variant="destructive"
              >
                قطع الاتصال
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-10" />
            
            <div className="flex gap-2">
              <Button 
                onClick={() => vibrate('short')}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                اهتزاز قصير
              </Button>
              <Button 
                onClick={() => vibrate('medium')}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                اهتزاز متوسط
              </Button>
              <Button 
                onClick={() => vibrate('long')}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                اهتزاز طويل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تاريخ الإيماءات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-200">تاريخ الإيماءات</CardTitle>
            <CardDescription className="text-slate-400">
              آخر {gestureHistory.length} إيماءات تم اكتشافها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {gestureHistory.length > 0 ? (
                gestureHistory.slice(-5).reverse().map((gesture, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 bg-slate-700/50 rounded"
                  >
                    <span className="font-medium text-white">{gesture.name}</span>
                    <div className="flex gap-2 text-sm text-slate-400">
                      <Badge variant="outline" className="text-xs">
                        {(gesture.confidence * 100).toFixed(1)}%
                      </Badge>
                      <span>{new Date(gesture.timestamp).toLocaleTimeString('ar-SA')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">لا توجد إيماءات مسجلة</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات سريعة */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-200">إحصائيات الإشارات</CardTitle>
            <CardDescription className="text-slate-400">
              معلومات سريعة عن الإشارات الحالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">EMG المتوسط (أول 4 قنوات):</h4>
                <div className="grid grid-cols-4 gap-2">
                  {stats.emg.slice(0, 4).map((stat, index) => (
                    <div key={index} className="text-center p-2 bg-slate-700/50 rounded">
                      <div className="text-sm font-medium text-purple-400">Ch{index + 1}</div>
                      <div className="text-xs text-slate-300">{stat.avg}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">التسارع (g):</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['X', 'Y', 'Z'].map((axis, index) => (
                    <div key={index} className="text-center p-2 bg-slate-700/50 rounded">
                      <div className="text-sm font-medium text-green-400">{axis}</div>
                      <div className="text-xs text-slate-300">{stats.acceleration[index]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الروابط السريعة */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">الوصول السريع</CardTitle>
          <CardDescription className="text-slate-400">
            انتقل إلى الأقسام المختلفة للتطبيق
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full h-20 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
            >
              <div className="text-center">
                <div className="font-bold">لوحة التحكم</div>
                <div className="text-sm opacity-90">مراقبة شاملة للإشارات</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/monitoring'}
              className="w-full h-20 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            >
              <div className="text-center">
                <div className="font-bold">المراقبة المباشرة</div>
                <div className="text-sm opacity-90">رسوم بيانية حية</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/training'}
              className="w-full h-20 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
            >
              <div className="text-center">
                <div className="font-bold">التدريب</div>
                <div className="text-sm opacity-90">تعلم إيماءات جديدة</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التذييل */}
      <div className="text-center mt-12 text-slate-500">
        <p>© 2024 Myo Stream Dashboard - واجهة تفاعلية متطورة</p>
      </div>
    </div>
  );
}