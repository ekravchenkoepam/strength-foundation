'use client';

import React from 'react';
import clsx from 'clsx';

import { useApp } from '@/app/context/AppContext';
import { useParams } from 'next/navigation';

import { Breadcrumbs } from '@/app/components/shared';

import { LinkType } from '@/app/types';

import styles from '../page.module.scss'

const buildBreadcrumbs = (links: LinkType[], slug?: string, subSlug?: string) => {
  const slugLink = links.find(item => item.href === slug)
  const subSlugLink = slugLink?.sublinks?.find((subLink: LinkType) => subLink.href === subSlug)

  return [
    { title: 'Головна', href: '/' },
    ...(slugLink ? [{ title: slugLink.title, href: `${slugLink.href}` }] : []),
    ...(subSlugLink ? [{ title: subSlugLink.title, href: `${slugLink!.href}/${subSlugLink.href}` }] : []),
  ]
}

type SlugLayoutProps = {
  children: React.ReactNode;
}

export default function SlugLayout({ children }: SlugLayoutProps) {
  const { links } = useApp();
  const { subSlug, locale, slug } = useParams();

  const breadcrumbs = buildBreadcrumbs(links, slug as string, subSlug as string)

  const isReportPage = subSlug === 'reports';

  return (
    <div
      className={clsx(
        styles.layout,
        isReportPage && styles.reportPage
      )}
    >
      {!!breadcrumbs.length && (
        <Breadcrumbs breadcrumbs={breadcrumbs} locale={locale as string} />
      )}

      <main>{children}</main>
    </div>
  );
}
