import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { QueryProvider } from '@/app/providers/QueryProvider';

import './globals.css';

const eUkraine = localFont({
  src: [
    { path: './fonts/e-Ukraine-Thin.otf', weight: '100', style: 'normal' },
    { path: './fonts/e-Ukraine-UltraLight.otf', weight: '200', style: 'normal' },
    { path: './fonts/e-Ukraine-Light.otf', weight: '300', style: 'normal' },
    { path: './fonts/e-Ukraine-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/e-Ukraine-Medium.otf', weight: '500', style: 'normal' },
    { path: './fonts/e-Ukraine-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-e-ukraine',
  display: 'swap',
});

const eUkraineHead = localFont({
  src: [{ path: './fonts/e-UkraineHead-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-e-ukraine-head',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Сила для сильних',
  description: 'Сила для сильних',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${eUkraine.variable} ${eUkraineHead.variable}`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
