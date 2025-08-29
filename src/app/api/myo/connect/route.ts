import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// مرجع لعملية Python الخاصة بـ Myo
let myoProcess: ChildProcess | null = null;
let isConnected = false;
let connectionCallbacks: ((data: any) => void)[] = [];

// مسار السكريبت Python
const PYTHON_SCRIPT_PATH = path.join(process.cwd(), 'python', 'myo_bridge.py');

interface MyoData {
  emg: number[];
  acceleration: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  orientation: { w: number; x: number; y: number; z: number };
  battery: number;
  rssi: number;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'connect':
        return await connectToMyo();
      
      case 'disconnect':
        return await disconnectFromMyo();
      
      case 'vibrate':
        return await vibrateDevice(data.type);
      
      case 'getStatus':
        return NextResponse.json({ 
          connected: isConnected,
          process: myoProcess ? 'running' : 'stopped' 
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Myo API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function connectToMyo() {
  if (myoProcess && isConnected) {
    return NextResponse.json({ 
      success: true, 
      message: 'Already connected to Myo device' 
    });
  }

  try {
    // تشغيل السكريبت Python
    myoProcess = spawn('python', [PYTHON_SCRIPT_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let connectionTimeout: NodeJS.Timeout;
    
    return new Promise<NextResponse>((resolve) => {
      if (!myoProcess) {
        resolve(NextResponse.json({ 
          error: 'Failed to start Python process' 
        }, { status: 500 }));
        return;
      }

      // معالجة البيانات الواردة من Python
      myoProcess.stdout?.on('data', (data) => {
        try {
          const lines = data.toString().split('\n');
          lines.forEach((line: string) => {
            if (line.trim()) {
              try {
                const jsonData = JSON.parse(line.trim());
                handleMyoData(jsonData);
                
                if (jsonData.type === 'connection' && jsonData.status === 'connected') {
                  isConnected = true;
                  clearTimeout(connectionTimeout);
                  resolve(NextResponse.json({ 
                    success: true, 
                    message: 'Successfully connected to Myo device',
                    deviceInfo: jsonData.deviceInfo 
                  }));
                }
              } catch (parseError) {
                console.log('Non-JSON output:', line.trim());
              }
            }
          });
        } catch (error) {
          console.error('Error processing Myo data:', error);
        }
      });

      // معالجة الأخطاء
      myoProcess.stderr?.on('data', (data) => {
        console.error('Myo Python Error:', data.toString());
      });

      myoProcess.on('exit', (code) => {
        console.log(`Myo process exited with code ${code}`);
        isConnected = false;
        myoProcess = null;
      });

      // مهلة زمنية للاتصال
      connectionTimeout = setTimeout(() => {
        resolve(NextResponse.json({ 
          error: 'Connection timeout - Make sure Myo device is paired and available' 
        }, { status: 408 }));
      }, 10000);
    });

  } catch (error) {
    console.error('Error connecting to Myo:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to Myo device',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function disconnectFromMyo() {
  if (myoProcess) {
    myoProcess.kill('SIGTERM');
    myoProcess = null;
  }
  isConnected = false;
  
  return NextResponse.json({ 
    success: true, 
    message: 'Disconnected from Myo device' 
  });
}

async function vibrateDevice(type: 'short' | 'medium' | 'long') {
  if (!myoProcess || !isConnected) {
    return NextResponse.json({ 
      error: 'Not connected to Myo device' 
    }, { status: 400 });
  }

  try {
    const command = JSON.stringify({ 
      action: 'vibrate', 
      type: type 
    }) + '\n';
    
    myoProcess.stdin?.write(command);
    
    return NextResponse.json({ 
      success: true, 
      message: `Vibration ${type} sent to device` 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to send vibration command',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function handleMyoData(data: any) {
  // إرسال البيانات للعملاء المتصلين
  connectionCallbacks.forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error('Error in connection callback:', error);
    }
  });
}

// WebSocket للبيانات المباشرة
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'stream') {
    // إعداد Server-Sent Events للبيانات المباشرة
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        const callback = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };
        
        connectionCallbacks.push(callback);
        
        // إرسال معلومات الاتصال الأولية
        const initialMessage = `data: ${JSON.stringify({
          type: 'status',
          connected: isConnected,
          timestamp: Date.now()
        })}\n\n`;
        controller.enqueue(encoder.encode(initialMessage));
      },
      
      cancel() {
        // إزالة الـ callback عند انقطاع الاتصال
        connectionCallbacks = connectionCallbacks.filter(cb => cb !== callback);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
  }

  return NextResponse.json({ 
    connected: isConnected,
    process: myoProcess ? 'running' : 'stopped' 
  });
}