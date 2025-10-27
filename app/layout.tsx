import { auth } from '@/auth';
import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata, Viewport } from 'next';
import { Open_Sans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Desarrollando Agentes',
  description: 'Plataforma de gestión de campañas y llamadas con agentes IA',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dev Agentes'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap'
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className={`${openSans.className}`} suppressHydrationWarning={true}>
      <body>
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
