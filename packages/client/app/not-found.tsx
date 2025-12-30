import Link from 'next/link';
import { headers } from 'next/headers';
import { Button, ButtonTypeEnum } from '@/app/components/shared';
import styles from './page.module.scss';

function getLocaleFromUrl() {
  const headersList = headers();

  const pathname =
    headersList.get('x-pathname') ||
    headersList.get('next-url') ||
    '';

  const match = pathname.match(/^\/(uk|en)(\/|$)/);
  return match?.[1] ?? 'uk';
}

export default function NotFound() {
  const locale = getLocaleFromUrl();

  return (
    <div
      className={styles.homePage}
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          Page Not Found
        </h2>
        <p style={{ marginBottom: '2rem' }}>
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href={`/${locale}`}>
          <Button
            label="Повернутись на головну"
            type={ButtonTypeEnum.Secondary}
          />
        </Link>
      </div>
    </div>
  );
}
