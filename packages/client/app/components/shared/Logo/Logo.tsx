import Link from 'next/link';
import { useApp } from '@/app/context/AppContext';

export enum LogoVariant {
  Main = 'main',
  Alt = 'alt',
}

type LogoProps = {
  type?: LogoVariant;
};

const LOGO_SRC: Record<LogoVariant, string> = {
  [LogoVariant.Main]: '/images/logo.svg',
  [LogoVariant.Alt]: '/images/logo-alt.svg',
};

export const Logo = ({ type = LogoVariant.Main }: LogoProps) => {
  const { locale } = useApp()

  const href = `/${locale || 'uk'}`;

  return (
    <Link href={href}>
      <img src={LOGO_SRC[type]} alt="logo" />
    </Link>
  );
};
