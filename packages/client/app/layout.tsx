import type { Metadata } from "next";
import localFont from "next/font/local";

import { Header } from '@/app/layout/header';
import { Footer } from '@/app/layout/footer';

import { fetchAPI } from '@/app/utils/fetch-api';
import { extractAttributes } from '@/app/utils/api-helpers';

import { AppContextProvider } from '@/app/context/AppProvider';

import "./globals.css";

const eUkraine = localFont({
  src: "./fonts/e-Ukraine-Regular.otf",
  variable: "--font-e-ukraine",
  weight: "300 900",
});

const eUkraineHead = localFont({
  src: "./fonts/e-UkraineHead-Regular.otf",
  variable: "--font-e-ukraine-head",
  weight: "100 700 900",
});

export const metadata: Metadata = {
  title: "Сила для сильних",
  description: "Сила для сильних",
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: navigations }: any = await fetchAPI({ path: "/navigations" });
  const { data: socialLinks }: any = await fetchAPI({ path: "/socials" });
  const { data: contact }: any = await fetchAPI({ path: "/contact" });

  const links = extractAttributes(navigations);
  const socials = extractAttributes(socialLinks);
  const contacts = extractAttributes(contact);

  return (
    <html lang="uk">
    <body className={`${eUkraine.variable} ${eUkraineHead.variable}`}>
        <AppContextProvider links={links} socials={socials} locale="uk">
          <Header />
          {children}
          <Footer contacts={contacts} />
        </AppContextProvider>
      </body>
    </html>
  );
}
