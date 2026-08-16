'use client';

import { Logo, LogoVariant } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';
import { ContactType } from '@/app/types';

import styles from './footer.module.scss';

const FOOTER_TRANSLATIONS = {
  uk: {
    registrationAddress: 'Адреса реєстрації',
    contacts: 'Контакти',
    publicOffer: 'Договір публічної оферти',
  },
  en: {
    registrationAddress: 'Registration address',
    contacts: 'Contacts',
    publicOffer: 'Public offer agreement',
  },
} as const;

type FooterProps = {
  contacts: ContactType | null;
};

export const Footer = ({ contacts }: FooterProps) => {
  const { locale } = useApp();

  if (!contacts) {
    return null;
  }

  const translations = FOOTER_TRANSLATIONS[locale === 'en' ? 'en' : 'uk'];
  const { phones, email, copyright } = contacts;
  const address = contacts.address?.trim();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerWrapper}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <Logo type={LogoVariant.Extended} />
          </div>
        </div>

        {address && (
          <div className={styles.contactsContainer}>
            <div className="h5">{translations.registrationAddress}</div>
            <ul className={styles.contacts}>
              <li>
                <img src="/images/marker.svg" alt="location" />
                <div className={styles.address}>{address}</div>
              </li>
            </ul>
          </div>
        )}

        <div className={styles.contactsContainer}>
          <div className="h5">{translations.contacts}</div>
          <ul className={styles.contacts}>
            {email && (
              <li>
                <img src="/images/mail.svg" alt="mail" />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            {!!phones.length && (
              <li>
                <img src="/images/phone.svg" alt="phone" />
                <div className={styles.phones}>
                  {phones.map((phone, index) => (
                    <a key={phone.id} href={`tel:${phone.number.replace(/\s+/g, '')}`}>
                      {phone.number}
                      {index < phones.length - 1 ? ', ' : ''}
                    </a>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.copyrightContainer}>
        <div className={styles.copyrightText}>
          © {copyright} {currentYear}
        </div>
        <a className={styles.publicOffer}>{translations.publicOffer}</a>
      </div>
    </footer>
  );
};
