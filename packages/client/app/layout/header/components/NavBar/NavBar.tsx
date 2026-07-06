import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { type Dispatch, type SetStateAction } from 'react';

import { ArrowDown } from '@/app/components/icons';
import { LiquidGlass, Logo } from '@/app/components/shared';
import styles from '@/app/layout/header/header.module.scss';
import { getHeaderTranslations } from '@/app/layout/header/i18n';
import { LanguageSwitch } from '@/app/layout/header/LanguageSwitch';
import { type LinkType } from '@/app/types';

type NavBarLink = Omit<LinkType, 'sublinks'> & {
  sublinks: LinkType[];
};

type NavBarProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  scrolled: boolean;
  locale: string;
  visibleLinks: NavBarLink[];
  hasSublinks: (sublinks: LinkType[]) => boolean;
};

type NavBarDropdownProps = {
  sublinks: LinkType[];
  locale: string;
  href: string;
};

const NavBarDropdown = ({ sublinks, locale, href }: NavBarDropdownProps) => (
  <LiquidGlass
    tint="light"
    intensity="subtle"
    className={clsx(
      styles.sublinks,
      'bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.04),0_10px_28px_rgba(0,0,0,0.12)]'
    )}
  >
    <ul>
      {sublinks.map(sublink => (
        <li key={sublink.title}>
          <Link href={`/${locale}/${href}/${sublink.href}`}>{sublink.title}</Link>
        </li>
      ))}
    </ul>
  </LiquidGlass>
);

export const NavBar = ({ isMenuOpen, setIsMenuOpen, scrolled, locale, visibleLinks, hasSublinks }: NavBarProps) => {
  const t = getHeaderTranslations(locale);

  return (
    <LiquidGlass tint="light" intensity="strong">
      <div
        className={clsx(
          'grid w-full grid-cols-[1fr_auto_auto] items-center border-b-2 border-[var(--yellow-100)]',
          'px-4 py-3 md:px-6 md:py-4 lg:grid-cols-[auto_1fr_auto] lg:px-[70px] lg:py-[22px]',
          'transition-all duration-300',
          scrolled ? 'backdrop-blur-md' : ''
        )}
      >
        <div className="justify-self-start">
          <Logo />
        </div>

        <nav className="hidden items-center justify-center lg:flex lg:px-16">
          <ul className={styles.desktopLinksContainer}>
            {visibleLinks.map(({ href, title, sublinks }) => (
              <li key={title}>
                <Link href={`/${locale}/${href}`} className="h6 flex items-center text-[var(--black-100)]">
                  {title}
                  {hasSublinks(sublinks) && <ArrowDown />}
                </Link>

                {hasSublinks(sublinks) && <NavBarDropdown sublinks={sublinks} locale={locale} href={href} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden justify-self-end lg:block">
          <LanguageSwitch />
        </div>

        <div className="ml-2 flex items-center gap-3 justify-self-end lg:hidden">
          <LanguageSwitch />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--green-100)]"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? t.closeMenuLabel : t.openMenuLabel}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </LiquidGlass>
  );
};
