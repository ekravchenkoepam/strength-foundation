import type { Metadata } from "next";
import localFont from "next/font/local";

import { Header } from '@/app/layout/header';
import { Footer } from '@/app/layout/footer';

import { fetchAPI } from '@/app/utils/fetch-api';
import { extractAttributes } from '@/app/utils/api-helpers';

import { AppContextProvider } from '@/app/context/AppProvider';

import "./globals.css";

const font = localFont({
  src: "./fonts/Unbounded.ttf",
  variable: "--font-unbounded",
  weight: "400 500 600 700 900",
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
  // const { data: navigations }: any = await fetchAPI({ path: "/navigations" });
  const { data: navigations }: any = await fetchAPI({ path: "/navigations" });
  const { data: socialLinks }: any = await fetchAPI({ path: "/socials" });

  const links = extractAttributes(navigations);
  const socials = extractAttributes(socialLinks);

  return (
    <html lang="uk">
      <body className={font.variable}>
        <AppContextProvider links={links} socials={socials} locale="uk">
          <Header/>
          {children}
          <Footer/>
        </AppContextProvider>
      </body>
    </html>
  );
}
