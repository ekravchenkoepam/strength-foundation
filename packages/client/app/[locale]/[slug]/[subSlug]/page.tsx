'use client';

import React, { FC } from 'react';
import { useParams, notFound } from 'next/navigation';

import { ReportsPage, DocumentsPage, TeamPage } from './components';

import { PageProps } from '../types';

export default function SubPage() {
  const { subSlug, locale, slug } = useParams() as PageProps;

  const pageMap: Record<string, FC<PageProps>> = {
    reports: ReportsPage,
    documents: DocumentsPage,
    team: TeamPage,
  };

  const PageComponent = pageMap[subSlug as string];

  if (!PageComponent) {
    notFound();
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <PageComponent locale={locale} slug={slug} subSlug={subSlug} />
    </div>
  )
}

