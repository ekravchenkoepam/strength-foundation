'use client';

import { createContext, useContext } from "react";

type SiteContextType = {
  links: any[];
  socials: any[];
  locale: string;
  setLocale: (locale: string) => void;
};

export const AppContext = createContext<SiteContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
