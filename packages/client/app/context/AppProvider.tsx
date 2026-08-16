'use client';

import { useState } from 'react';

import { ContactType } from '@/app/types';

import { AppContext } from './AppContext';

type Props = {
  children: React.ReactNode;
  links: any[];
  socials: any[];
  contacts: ContactType | null;
  locale: string;
};

export const AppContextProvider = ({ children, links, socials, contacts, locale }: Props) => {
  const [currentLocale, setCurrentLocale] = useState(locale);

  return (
    <AppContext.Provider
      value={{
        links,
        socials,
        contacts,
        locale: currentLocale,
        setLocale: setCurrentLocale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
