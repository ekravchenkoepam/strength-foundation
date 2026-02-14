'use client';

import React, { FC } from 'react';
import { useParams, notFound } from 'next/navigation';

import {
  ReportsPage,
  DocumentsPage,
  TeamPage,
  MissionPage,
  PartnerPage
} from './components';

import { PageProps } from '../types';

export default function SubPage() {
  const { subSlug, locale, slug } = useParams() as PageProps;

  const pageMap: Record<string, FC<PageProps>> = {
    reports: ReportsPage,
    documents: DocumentsPage,
    team: TeamPage,
    mission: MissionPage,
    'become-partner': PartnerPage,
  };

  const PageComponent = pageMap[subSlug as string];

  if (!PageComponent) {
    notFound();
  }

  return (
    <div className="w-full">
      <PageComponent locale={locale} slug={slug} subSlug={subSlug} />
    </div>
  )
}
