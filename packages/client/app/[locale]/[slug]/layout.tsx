'use client';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import React from 'react';

import styles from '../page.module.scss';

import { Breadcrumbs } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';
import { LinkType } from '@/app/types';
import { fetchAPI } from '@/app/utils/fetch-api';

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
  const subSlugValue = subSlug as string | undefined;
  const { data: projectBreadcrumbTitle } = useQuery<string | null>({
    queryKey: ['project-breadcrumb', locale, subSlugValue],
    enabled: slugValue === 'projects' && Boolean(subSlugValue),
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/projects',
        urlParams: {
          locale,
          filters: {
            slug: {
              $eq: subSlugValue,
            },
          },
          fields: ['title'],
        },
      });

      return response?.data?.[0]?.attributes?.title || null;
    },
  });

  let breadcrumbs = buildBreadcrumbs(links, locale as string, slugValue, subSlugValue);

  // Only append the project title crumb once we have the real localized title
  // from the API. Previously we fell back to a Title-Cased version of the slug
  // ("Home Was Waiting") while the query was in flight, which flashed the
  // wrong language on the UK page. Briefly showing two crumbs instead of three
  // is preferable to flashing the wrong language.
  if (slugValue === 'projects' && subSlugValue && projectBreadcrumbTitle) {
    breadcrumbs = [
      ...breadcrumbs,
      {
        title: projectBreadcrumbTitle,
        href: `${slugValue}/${subSlugValue}`,
      },
    ];
  }

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
