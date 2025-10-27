'use client';

import React, { FC } from 'react';
import { notFound, useParams } from 'next/navigation';

import {
  AboutPage,
  DocumentsAndReportsPage,
  NewsPage,
  PartnershipPage,
  ProjectsPage,
} from './components';

import { PageProps } from './types';

export default function Page() {
  const { locale, slug } = useParams() as PageProps;

  const pageMap: Record<string, FC<PageProps>> = {
    about: AboutPage,
    projects: ProjectsPage,
    partnership: PartnershipPage,
    news: NewsPage,
    'documents-and-reports': DocumentsAndReportsPage,
  }

  const PageComponent = pageMap[slug];

  if (!PageComponent) {
    notFound();
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <PageComponent locale={locale} slug={slug} />
    </div>
  );
}
