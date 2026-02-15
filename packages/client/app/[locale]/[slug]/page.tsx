'use client';

import React, { FC } from 'react';
import { notFound, useParams, redirect } from 'next/navigation';

import {
  AboutPage,
  DocumentsAndReportsPage,
  NewsPage,
  PartnershipPage,
  ProjectsPage,
  FaqPage,
} from './components';

import { PageProps } from './types';

const redirectMap: Record<string, string> = {
  about: 'mission',
  partnership: 'become-partner',
  'documents-and-reports': 'documents',
};

const pageMap: Record<string, FC<PageProps>> = {
  about: AboutPage,
  projects: ProjectsPage,
  partnership: PartnershipPage,
  news: NewsPage,
  'documents-and-reports': DocumentsAndReportsPage,
  faq: FaqPage,
}

export default function Page() {
  const { locale, slug } = useParams() as PageProps;

  const subSlug = redirectMap[slug];

  if (subSlug) {
    redirect(`/${locale}/${slug}/${subSlug}`);
  }

  const PageComponent = pageMap[slug];

  if (!PageComponent) {
    notFound();
  }

  if (slug === 'faq') {
    return <PageComponent locale={locale} slug={slug} />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <PageComponent locale={locale} slug={slug} />
    </div>
  );
}
