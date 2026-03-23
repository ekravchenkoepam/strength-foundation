type HeaderTranslations = {
  helpButton: string;
  supportButton: string;
  openMenuLabel: string;
  closeMenuLabel: string;
};

const TRANSLATIONS: Record<string, HeaderTranslations> = {
  uk: {
    helpButton: 'Звернутись по допомогу',
    supportButton: 'Підтримати нас',
    openMenuLabel: 'Відкрити меню',
    closeMenuLabel: 'Закрити меню',
  },
  en: {
    helpButton: 'Get help',
    supportButton: 'Support us',
    openMenuLabel: 'Open menu',
    closeMenuLabel: 'Close menu',
  },
};

export const getHeaderTranslations = (locale: string): HeaderTranslations => TRANSLATIONS[locale] || TRANSLATIONS.uk;
