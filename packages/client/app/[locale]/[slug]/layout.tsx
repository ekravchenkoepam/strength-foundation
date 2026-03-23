'use client';

import clsx from 'clsx';
import { useParams } from 'next/navigation';
import React from 'react';

import styles from '../page.module.scss';

import { Breadcrumbs } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';
import { LinkType } from '@/app/types';

const HOME_BREADCRUMB_BY_LOCALE: Record<string, string> = {
  uk: 'Головна',
  en: 'Home',
};
const BREADCRUMB_HIDDEN_SLUGS = new Set(['faq']);

const buildBreadcrumbs = (links: LinkType[], locale: string, slug?: string, subSlug?: string) => {
  const slugLink = links.find(item => item.href === slug);
  const subSlugLink = slugLink?.sublinks?.find((subLink: LinkType) => subLink.href === subSlug);

  return [
    { title: HOME_BREADCRUMB_BY_LOCALE[locale] || HOME_BREADCRUMB_BY_LOCALE.uk, href: '/' },
    ...(slugLink ? [{ title: slugLink.title, href: `${slugLink.href}` }] : []),
    ...(subSlugLink ? [{ title: subSlugLink.title, href: `${slugLink!.href}/${subSlugLink.href}` }] : []),
  ];
};

type SlugLayoutProps = {
  children: React.ReactNode;
};

export default function SlugLayout({ children }: Readonly<SlugLayoutProps>) {
  const { links } = useApp();
  const { subSlug, locale, slug } = useParams();

  const slugValue = slug as string;
  const breadcrumbs = buildBreadcrumbs(links, locale as string, slugValue, subSlug as string);
  const shouldShowBreadcrumbs = !BREADCRUMB_HIDDEN_SLUGS.has(slugValue);

  const isDocumentsAndReportsPage = subSlug === 'reports' || subSlug === 'documents';

  return (
    <div className={clsx(styles.layout, isDocumentsAndReportsPage && styles.reportPage)}>
      {shouldShowBreadcrumbs && !!breadcrumbs.length && (
        <Breadcrumbs breadcrumbs={breadcrumbs} locale={locale as string} />
      )}

      <main>{children}</main>
    </div>
  );
}
