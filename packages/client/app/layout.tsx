import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { AppContextProvider } from '@/app/context/AppProvider';
import { Footer } from '@/app/layout/footer';
import { Header } from '@/app/layout/header';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { extractAttributes } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

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
  const { data: navigations }: any = await fetchAPI({ path: '/navigations' });
  const { data: socialLinks }: any = await fetchAPI({ path: '/socials?=*' });
  const { data: contact }: any = await fetchAPI({ path: '/contact' });

  const links = extractAttributes(navigations);
  const socials = extractAttributes(socialLinks);
  const contacts = extractAttributes(contact);

  return (
    <html lang="uk">
      <body className={`${eUkraine.variable} ${eUkraineHead.variable}`}>
        <QueryProvider>
          <AppContextProvider links={links} socials={socials} locale="uk">
            <Header />
            {children}
            <Footer contacts={contacts} />
          </AppContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
