'use client';

import { useState } from 'react';

import { AppContext } from "./AppContext";

type Props = {
  children: React.ReactNode;
  links: any[];
  socials: any[];
  locale: string;
};

export const AppContextProvider =  ({ children, links, socials, locale }: Props) => {
  const [currentLocale, setCurrentLocale] = useState(locale);

  return (
    <AppContext.Provider value={{
      links,
      socials,
      locale: currentLocale,
      setLocale: setCurrentLocale
    }}>
      {children}
    </AppContext.Provider>
  );
}
