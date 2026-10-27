import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catatan Tempo Pakan - Kelola Piutang & Jatuh Tempo Pelanggan',
  description: 'Aplikasi manajemen piutang dan tempo pakan ternak sapi mobile-first yang mudah, cepat, dan reaktif.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tempo Pakan',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a492d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#073621] md:bg-slate-900 text-slate-800 flex justify-center items-stretch md:items-center select-none">
        {children}
      </body>
    </html>
  );
}
