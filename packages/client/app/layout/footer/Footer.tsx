"use client";

import Link from 'next/link';

import { Logo, Socials } from '@/app/components/shared';

import { LinkType } from '@/app/types';
import { useApp } from '@/app/context/AppContext';

import styles from './footer.module.scss';

export const Footer = () => {
  const { links, socials } = useApp()

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.logo}>
            <Logo />
          </div>
          <p className={styles.description}>
            Надаємо підтримку сім'ям військовополонених, звільненим з полону та їх родинам. Наша місія — повернути
            героїв додому та підтримати їх на шляху до відновлення.
          </p>

          <Socials socials={socials} />
        </div>

        {links?.map(({ href, title, sublinks }) => (
          <div className={styles.column} key={title}>
            <Link className={styles.heading} href={href}>{title}</Link>
            {Array.isArray(sublinks) && sublinks.length > 0 && (
              <ul className={styles.links}>
                {sublinks.map((sublink: LinkType) => (
                  <li key={sublink.title}>
                    <Link href={sublink.href}>{sublink.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>


      <div className={styles.bottom}>
        <span>© {currentYear} Сила для сильних. Всі права захищені.</span>
        <div className={styles.bottomLinks}>
          <Link href="/privacy-policy">Політика конфіденційності</Link>
          <Link href="/terms">Умови використання</Link>
        </div>
      </div>
    </footer>
  );
}
