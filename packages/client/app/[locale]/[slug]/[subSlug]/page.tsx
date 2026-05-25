'use client';

import { useParams, notFound } from 'next/navigation';
import React, { FC } from 'react';

import {
  ReportsPage,
  DocumentsPage,
  TeamPage,
  MissionPage,
  PartnerPage,
  VolunteerPage,
  ProjectPage,
} from './components';
import { isBlockedSubSlugRoute } from '../../not-found-blacklist';
import { PageProps } from '../types';

export default function SubPage() {
  const { subSlug, locale, slug } = useParams() as PageProps;

  if (isBlockedSubSlugRoute(locale as string, slug as string, subSlug as string)) {
    notFound();
  }

  if (slug === 'projects') {
    return (
      <div className="w-full">
        <ProjectPage locale={locale} slug={slug} subSlug={subSlug} />
      </div>
    );
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
