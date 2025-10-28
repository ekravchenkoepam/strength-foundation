'use client';

import { Logo, LogoVariant } from '@/app/components/shared';

import styles from './footer.module.scss';

type Phone = {
  id: number;
  number: string;
};

type Contact = {
  phones: Phone[];
  email: string;
  copyright: string;
};

type FooterProps = {
  contacts: Contact;
};

export const Footer = ({ contacts }: FooterProps) => {
  if (!contacts) {
    return null;
  }

  const { phones, email, copyright } = contacts;
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerWrapper}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <Logo type={LogoVariant.Extended} />
          </div>
        </div>

        <div className={styles.contactsContainer}>
          <div className="h5">Адреса реєстрації</div>
          <ul className={styles.contacts}>
            <li>
              <img src="/images/marker.svg" alt="mail" />
              <div className={styles.address}>
                <div className={styles.registration}>
                  <p>Україна, 14007,</p>
                  <p>Чернігівська обл., місто Чернігів,</p>
                  <p>пр. Миру, будинок 261, 12</p>
                </div>
                <div>ЄДРПОУ 45698398</div>
              </div>
            </li>
          </ul>
        </div>

        <div className={styles.contactsContainer}>
          <div className="h5">Контакти</div>
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
                    <a
                      key={phone.id}
                      href={`tel:${phone.number.replace(/\s+/g, '')}`}
                    >
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
        <a className={styles.publicOffer}>Договір публічної оферти</a>
      </div>
    </footer>
  );
};
