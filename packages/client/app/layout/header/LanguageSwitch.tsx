'use client';

import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

import styles from './header.module.scss';

const LOCALE_LABELS: Record<string, string> = {
  uk: 'УКР',
  en: 'EN',
};

export const LanguageSwitch = () => {
  const { locale, setLocale } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (lang: string) => {
    if (lang === locale) return;

    const segments = pathname.split('/');
    segments[1] = lang;
    const newPath = segments.join('/');

    router.replace(newPath);
    setLocale(lang);
  };

  return (
    <div className={styles.languages}>
      {Object.entries(LOCALE_LABELS).map(([lang, label]) => (
        <div
          key={lang}
          className={clsx(
            styles.language,
            lang === locale && styles.currentLang
          )}
          onClick={() => handleLocaleChange(lang)}
        >
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
