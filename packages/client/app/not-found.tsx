'use client';

import Link from 'next/link';
import { Button, ButtonTypeEnum } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';

import styles from './page.module.scss';

export default function NotFound() {
  const { locale } = useApp()

  const href = `/${locale || 'uk'}`;

  return (
    <div className={styles.homePage} style={{ height: '100vh', display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Page Not Found</h2>
        <p style={{ marginBottom: '2rem' }}>
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href={href}>
          <Button label="Повернутись на головну" type={ButtonTypeEnum.Secondary} />
        </Link>
      </div>
    </div>
  );
}
