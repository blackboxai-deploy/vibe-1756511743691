import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'Myo Stream Dashboard - لوحة تحكم Myo الذكية',
  description: 'واجهة تفاعلية متقدمة لمراقبة والتحكم في Myo Gesture Armband',
  keywords: ['Myo', 'EMG', 'Gesture Recognition', 'Biometric', 'Wearable'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://placehold.co/32x32?text=M" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Cairo:wght@200..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${cairo.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />
            <div className="relative">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}