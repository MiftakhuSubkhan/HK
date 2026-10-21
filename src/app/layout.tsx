import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catatan Tempo Pakan - Kelola Piutang & Jatuh Tempo Pelanggan',
  description: 'Aplikasi manajemen piutang dan tempo pakan ternak sapi mobile-first yang mudah, cepat, dan reaktif.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09472a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-900 md:bg-[#d8e2dc] text-slate-800 flex justify-center items-center md:py-8 select-none">
        {children}
      </body>
    </html>
  );
}
