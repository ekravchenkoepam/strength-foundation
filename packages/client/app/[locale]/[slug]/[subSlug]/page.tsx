'use client';

import { useParams, notFound } from 'next/navigation';
import React, { FC } from 'react';

import { ReportsPage, DocumentsPage, TeamPage, MissionPage, PartnerPage, VolunteerPage } from './components';
import { isBlockedSubSlugRoute } from '../../not-found-blacklist';
import { PageProps } from '../types';

export default function SubPage() {
  const { subSlug, locale, slug } = useParams() as PageProps;

  if (isBlockedSubSlugRoute(locale as string, slug as string, subSlug as string)) {
    notFound();
  }

  const pageMap: Record<string, FC<PageProps>> = {
    reports: ReportsPage,
    documents: DocumentsPage,
    team: TeamPage,
    mission: MissionPage,
    'become-partner': PartnerPage,
    'become-volunteer': VolunteerPage,
  };

  const PageComponent = pageMap[subSlug as string];

  if (!PageComponent) {
    notFound();
  }

  return (
    <div className="w-full">
      <PageComponent locale={locale} slug={slug} subSlug={subSlug} />
    </div>
  );
}
