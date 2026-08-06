'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { BlockRenderer } from './BlockRenderer';
import { projectBlocksPopulate } from './populate';
import { ProjectResponse } from './types';

import { PageProps } from '../../../types';

import { Loading } from '@/app/components/shared';
import { fetchAPI } from '@/app/utils/fetch-api';

const PAGE_COPY = {
  uk: { loadingTitle: 'Проєкт' },
  en: { loadingTitle: 'Project' },
} as const;

export const ProjectPage = ({ locale, subSlug }: PageProps) => {
  const copy = PAGE_COPY[locale as keyof typeof PAGE_COPY] || PAGE_COPY.uk;

  const { data: project, isLoading } = useQuery<ProjectResponse | null>({
    queryKey: ['project', locale, subSlug],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/projects',
        urlParams: {
          locale,
          filters: { slug: { $eq: subSlug } },
          populate: projectBlocksPopulate,
        },
      });

      return response?.data?.[0] || null;
    },
  });

  if (isLoading) {
    return <Loading headerText={copy.loadingTitle} />;
  }

  if (!project?.attributes) {
    notFound();
  }

  const blocks = project.attributes.blocks;

  return (
    <section className="w-full bg-[var(--white-80)]">
      <div className="flex w-full flex-col px-6 lg:px-[52px]">
        <BlockRenderer blocks={blocks} locale={locale} />
      </div>
    </section>
  );
};
