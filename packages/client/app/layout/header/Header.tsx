"use client";

import Link from 'next/link';

import { Button, ButtonTypeEnum, Logo, Socials } from '@/app/components/shared';
import { ArrowDown } from '@/app/components/icons';
import { LanguageSwitch } from '@/app/layout/header/LanguageSwitch';

import { LinkType } from '@/app/types';

import { useApp } from '@/app/context/AppContext';
import { sortByPosition } from '@/app/helpers';

import { SOCIALS_STYLES } from '@/app/layout/header/constants';

import styles from './header.module.scss';

export const Header = () => {
  const { links, socials, locale } = useApp()

  const sortedLinks = sortByPosition(links)
  const sortedSocials = sortByPosition(socials)

  const hasSublinks = (sublinks: LinkType[]) => sublinks && sublinks.length > 0;

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div className={styles.utilityContainer}>
          <Socials
            socials={sortedSocials}
            backgroundColor={SOCIALS_STYLES.BACKGROUND_COLOR}
            color={SOCIALS_STYLES.COLOR}
          />
          <div className={styles.supportButtonsContainer}>
            <Button label="Звернутись по допомогу" type={ButtonTypeEnum.Secondary} />
            <Button label="Підтримати нас" type={ButtonTypeEnum.Primary} />
          </div>
        </div>
        <div className={styles.navigationContainer}>
          <Logo />

          <nav className={styles.nav}>
            <ul className={styles.linksContainer}>
              {sortedLinks?.map(({ href, title, sublinks, isHidden }: LinkType) => (
                !isHidden && (
                  <li key={title}>
                    <Link href={`/${locale}/${href}`} className="h6">
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
                )
              ))}
            </ul>
          </nav>

          <div className={styles.languageSwitch}>
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </header>
  );
};
