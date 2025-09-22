import Link from 'next/link';

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
  return (
    <Link href="/">
      <img src={LOGO_SRC[type]} alt="logo" />
    </Link>
  );
};
