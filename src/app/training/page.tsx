"use client";

import { useState } from 'react';
import { useMyoDevice } from '@/hooks/useMyoDevice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrainingSession {
  gesture: string;
  samples: number;
  accuracy: number;
  completed: boolean;
}

export default function TrainingPage() {
  const {
    isConnected,
    deviceStatus,
    currentGesture,

    connect,
    vibrate
  } = useMyoDevice();

  const [isTraining, setIsTraining] = useState(false);
  const [currentTrainingGesture, setCurrentTrainingGesture] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [trainingPhase, setTrainingPhase] = useState<'ready' | 'countdown' | 'recording' | 'complete'>('ready');

  const gestures = [
    { name: 'Fist', icon: '✊', description: 'اقبض يدك بقوة' },
    { name: 'Wave In', icon: '👋', description: 'حرك معصمك للداخل' },
    { name: 'Wave Out', icon: '🤚', description: 'حرك معصمك للخارج' },
    { name: 'Fingers Spread', icon: '🖐️', description: 'افرد أصابعك' },
    { name: 'Double Tap', icon: '👆', description: 'اضغط بإصبعين' },
  ];

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(
    gestures.map(g => ({
      gesture: g.name,
      samples: 0,
      accuracy: 0,
      completed: false
    }))
  );

  const startTraining = async (gestureName: string) => {
    if (!isConnected) {
      await connect();
      return;
    }

    setCurrentTrainingGesture(gestureName);
    setIsTraining(true);
    setTrainingPhase('countdown');
    setCountdown(3);

    // العد التنازلي
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        vibrate('short'); // إشارة صوتية للعد التنازلي
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setTrainingPhase('recording');
    setTrainingProgress(0);
    vibrate('medium'); // إشارة بداية التسجيل

    let progress = 0;
    const recordingInterval = setInterval(() => {
      progress += 2;
      setTrainingProgress(progress);

      if (progress >= 100) {
        clearInterval(recordingInterval);
        completeTraining();
      }
    }, 100); // تسجيل لمدة 5 ثواني

    // محاكاة جمع البيانات
    setTimeout(() => {
      vibrate('long'); // إشارة انتهاء التسجيل
    }, 5000);
  };

  const completeTraining = () => {
    setTrainingPhase('complete');
    
    // تحديث إحصائيات التدريب
    setTrainingSessions(prev => prev.map(session => {
      if (session.gesture === currentTrainingGesture) {
        return {
          ...session,
          samples: session.samples + 1,
          accuracy: Math.min(100, session.accuracy + Math.random() * 20 + 10),
          completed: session.samples >= 2 // يحتاج 3 عينات للاكتمال
        };
      }
      return session;
    }));

    setTimeout(() => {
      setIsTraining(false);
      setTrainingPhase('ready');
      setCurrentTrainingGesture('');
    }, 2000);
  };

  const resetTraining = () => {
    setTrainingSessions(gestures.map(g => ({
      gesture: g.name,
      samples: 0,
      accuracy: 0,
      completed: false
    })));
  };

  const overallProgress = trainingSessions.reduce((acc, session) => 
    acc + (session.completed ? 1 : 0), 0
  ) / gestures.length * 100;

  return (
    <div className="min-h-screen p-6">
      {/* الرأس */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">مركز التدريب</h1>
          <p className="text-slate-400">درب الذكاء الاصطناعي على التعرف على إيماءاتك الخاصة</p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className="h-8 px-4"
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            {isConnected ? 'جاهز للتدريب' : 'غير متصل'}
          </Badge>
          
          {!isConnected && (
            <Button onClick={connect} className="bg-gradient-to-r from-green-600 to-green-800">
              اتصال للتدريب
            </Button>
          )}
        </div>

        {/* التقدم العام */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center justify-between">
              <span>التقدم العام</span>
              <span className="text-lg">{overallProgress.toFixed(0)}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <p className="text-sm text-slate-400">
              {trainingSessions.filter(s => s.completed).length} من {gestures.length} إيماءات مكتملة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* حالة التدريب الحالية */}
      {isTraining && (
        <Card className="mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {trainingPhase === 'countdown' && `استعد... ${countdown}`}
              {trainingPhase === 'recording' && `تسجيل ${currentTrainingGesture}...`}
              {trainingPhase === 'complete' && 'تم التسجيل بنجاح!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainingPhase === 'countdown' && (
              <div className="text-center">
                <div className="text-6xl mb-4">⏱️</div>
                <p className="text-slate-300">تحضر لتسجيل إيماءة {currentTrainingGesture}</p>
              </div>
            )}
            
            {trainingPhase === 'recording' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {gestures.find(g => g.name === currentTrainingGesture)?.icon}
                  </div>
                  <p className="text-lg text-white mb-2">
                    {gestures.find(g => g.name === currentTrainingGesture)?.description}
                  </p>
                  <p className="text-slate-300">احتفظ بالوضعية...</p>
                </div>
                <Progress value={trainingProgress} className="h-4" />
                <p className="text-center text-sm text-slate-400">
                  {(trainingProgress / 20).toFixed(1)} من 5 ثواني
                </p>
              </div>
            )}
            
            {trainingPhase === 'complete' && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-green-400 text-lg">تم حفظ البيانات بنجاح!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* قائمة الإيماءات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {gestures.map((gesture) => {
          const session = trainingSessions.find(s => s.gesture === gesture.name);
          return (
            <Card 
              key={gesture.name} 
              className={`bg-slate-800/50 border-slate-700 transition-all hover:bg-slate-700/50 ${
                session?.completed ? 'ring-2 ring-green-500/50' : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gesture.icon}</span>
                    <span>{gesture.name}</span>
                  </div>
                  {session?.completed && (
                    <Badge variant="default" className="bg-green-600">
                      مكتمل
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">{gesture.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">العينات:</span>
                    <span className="text-white">{session?.samples || 0}/3</span>
                  </div>
                  <Progress value={(session?.samples || 0) / 3 * 100} className="h-2" />
                  
                  {session && session.samples > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">الدقة:</span>
                      <span className="text-green-400">{session.accuracy.toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => startTraining(gesture.name)}
                  disabled={!isConnected || isTraining}
                  className="w-full"
                  variant={session?.completed ? "outline" : "default"}
                >
                  {session?.completed ? 'إعادة التدريب' : 'تدريب'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* معلومات ونصائح */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">نصائح للتدريب الفعال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertDescription>
                <strong>👍 نصائح مهمة:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• احتفظ بالإيماءة ثابتة أثناء التسجيل</li>
                  <li>• تأكد من وضع الجهاز بشكل صحيح على الذراع</li>
                  <li>• اتبع التعليمات الصوتية (الاهتزاز)</li>
                  <li>• دَرب كل إيماءة 3 مرات على الأقل</li>
                  <li>• تجنب الحركة المفرطة أثناء التسجيل</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">معلومات الجلسة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700/50 rounded">
                <div className="text-2xl font-bold text-purple-400">{deviceStatus.batteryLevel}%</div>
                <div className="text-sm text-slate-400">البطارية</div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded">
                <div className="text-2xl font-bold text-green-400">{deviceStatus.rssi}</div>
                <div className="text-sm text-slate-400">RSSI</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">الإيماءة الحالية:</span>
                <span className="text-purple-400">{currentGesture?.name || 'راحة'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">جودة الإشارة:</span>
                <Badge variant={deviceStatus.rssi > -60 ? "default" : "destructive"}>
                  {deviceStatus.rssi > -60 ? 'ممتاز' : 'ضعيف'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={resetTraining}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              إعادة تعيين التدريب
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              لوحة التحكم
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              الصفحة الرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}