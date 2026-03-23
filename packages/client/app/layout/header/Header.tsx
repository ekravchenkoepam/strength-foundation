'use client';

import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './header.module.scss';

import { ArrowDown } from '@/app/components/icons';
import { Button, ButtonTypeEnum, Logo, Socials } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';
import { sortByPosition } from '@/app/helpers';
import { SOCIALS_STYLES } from '@/app/layout/header/constants';
import { getHeaderTranslations } from '@/app/layout/header/i18n';
import { LanguageSwitch } from '@/app/layout/header/LanguageSwitch';
import { LinkType } from '@/app/types';

export const Header = () => {
  const { links, socials, locale } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = getHeaderTranslations(locale);

  const sortedLinks = sortByPosition(links);
  const sortedSocials = sortByPosition(socials);

  const hasSublinks = (sublinks: LinkType[]) => sublinks && sublinks.length > 0;
  const visibleLinks = sortedLinks?.filter(({ isHidden }: LinkType) => !isHidden) || [];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="w-full">
      <div className="flex w-full flex-col font-medium">
        <div
          className="
            hidden w-full items-center justify-between gap-4 bg-[var(--green-100)]
            px-4 py-3 md:px-6 md:py-4 lg:flex lg:px-[52px] lg:py-[15px]
          "
        >
          <div className="hidden lg:block">
            <Socials
              socials={sortedSocials}
              backgroundColor={SOCIALS_STYLES.BACKGROUND_COLOR}
              color={SOCIALS_STYLES.COLOR}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
            <Button
              label={t.helpButton}
              type={ButtonTypeEnum.Secondary}
              className="px-4 py-2 text-sm leading-5 sm:px-5 sm:py-3 lg:px-[30px] lg:py-[14px] lg:text-base"
              onClick={() => router.push(`/${locale}/faq`)}
            />
            <Button
              label={t.supportButton}
              type={ButtonTypeEnum.Primary}
              className="
                border-2 border-[var(--green-100)] px-4 py-2 text-sm leading-5 transition-colors
                hover:!bg-[var(--green-100)] hover:!text-[var(--white-100)]
                sm:px-5 sm:py-3 lg:px-[30px] lg:py-[14px] lg:text-base
              "
              onClick={() => router.push(`/${locale}/donate`)}
            />
          </div>
        </div>

        <div
          className="
            grid w-full grid-cols-[1fr_auto_auto] items-center border-b-2 border-[var(--yellow-100)]
            bg-[var(--white-100)] px-4 py-3 md:px-6 md:py-4
            lg:grid-cols-[auto_1fr_auto] lg:px-[70px] lg:py-[22px]
          "
        >
          <div className="justify-self-start">
            <Logo />
          </div>

          <nav className="hidden items-center justify-center lg:flex lg:px-16">
            <ul className={styles.desktopLinksContainer}>
              {visibleLinks?.map(({ href, title, sublinks }: LinkType) => (
                <li key={title}>
                  <Link href={`/${locale}/${href}`} className="h6 flex items-center text-[var(--black-100)]">
                    {title}
                    {hasSublinks(sublinks) && <ArrowDown />}
                  </Link>

                  {hasSublinks(sublinks) && (
                    <ul className={styles.sublinks}>
                      {sublinks.map((sublink: LinkType) => (
                        <li key={sublink.title}>
                          <Link href={`/${locale}/${href}/${sublink.href}`}>{sublink.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
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

        <div
          id="mobile-menu"
          className={clsx(
            'overflow-hidden border-b border-[var(--yellow-100)] bg-[var(--white-100)] transition-all duration-300 ease-out lg:hidden',
            isMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <nav className="px-4 py-4 md:px-6">
            <ul className="flex flex-col gap-4">
              {visibleLinks.map(({ href, title, sublinks }: LinkType) => (
                <li key={title} className="border-b border-[var(--green-20)] pb-3 last:border-b-0">
                  <Link
                    href={`/${locale}/${href}`}
                    className="
                      h6 flex items-center justify-between text-[var(--black-100)]
                      underline-offset-4 transition-all hover:underline
                      focus-visible:underline active:underline
                    "
                    onClick={closeMenu}
                  >
                    {title}
                    {hasSublinks(sublinks) && <ArrowDown />}
                  </Link>

                  {hasSublinks(sublinks) && (
                    <ul className="mt-2 flex flex-col gap-2 pl-3">
                      {sublinks.map((sublink: LinkType) => (
                        <li key={sublink.title}>
                          <Link
                            href={`/${locale}/${href}/${sublink.href}`}
                            className="
                              h8 text-[var(--black-80)] underline-offset-4 transition-all
                              hover:underline focus-visible:underline active:underline
                            "
                            onClick={closeMenu}
                          >
                            {sublink.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-3">
              <Button
                label={t.helpButton}
                type={ButtonTypeEnum.Secondary}
                className="w-full justify-center"
                onClick={() => {
                  closeMenu();
                  router.push(`/${locale}/faq`);
                }}
              />
              <Button
                label={t.supportButton}
                type={ButtonTypeEnum.Primary}
                className="
                  w-full justify-center border-2 border-[var(--green-100)] transition-colors
                  hover:!bg-[var(--green-100)] hover:!text-[var(--white-100)]
                "
                onClick={() => {
                  closeMenu();
                  router.push(`/${locale}/donate`);
                }}
              />
            </div>

            <div className="mt-5 border-t border-[var(--green-20)] pt-4">
              <Socials
                socials={sortedSocials}
                backgroundColor={SOCIALS_STYLES.BACKGROUND_COLOR}
                color={SOCIALS_STYLES.COLOR}
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
