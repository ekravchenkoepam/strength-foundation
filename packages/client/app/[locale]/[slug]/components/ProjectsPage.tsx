import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { LiquidGlass, Loading } from '@/app/components/shared';
import { getStrapiMedia } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

import { PageProps } from '../types';

type ProjectRelationItem = {
  id: number;
  attributes?: {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    buttonText?: string | null;
    image?: {
      data?: {
        attributes?: {
          url?: string | null;
          name?: string | null;
        };
      } | null;
    } | null;
  };
};

type ProjectsPageResponse = {
  data?: {
    attributes?: {
      title?: string | null;
      projects?: {
        data?: ProjectRelationItem[] | null;
      } | null;
    };
  } | null;
};

type ProjectCard = {
  id: number;
  title: string;
  slug: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  imageAlt: string;
};

const PAGE_COPY = {
  uk: {
    defaultTitle: 'Наші проєкти',
    emptyState: 'Наразі проєкти ще не додані.',
    defaultButtonLabel: 'Переглянути',
  },
  en: {
    defaultTitle: 'Our projects',
    emptyState: 'Projects have not been added yet.',
    defaultButtonLabel: 'View',
  },
} as const;

export const ProjectsPage = ({ locale }: PageProps) => {
  const copy = PAGE_COPY[locale as keyof typeof PAGE_COPY] || PAGE_COPY.uk;

  const { data: projectsPage, isLoading } = useQuery<ProjectsPageResponse['data']>({
    queryKey: ['projects-page', locale],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/projects-page',
        urlParams: {
          locale,
          populate: {
            projects: {
              populate: {
                image: '*',
              },
            },
          },
        },
      });

      return response?.data || null;
    },
  });

  if (isLoading) {
    return <Loading headerText={copy.defaultTitle} />;
  }

  const title = projectsPage?.attributes?.title || copy.defaultTitle;
  const projects: ProjectCard[] = (projectsPage?.attributes?.projects?.data || []).map(project => {
    const attributes = project.attributes;
    const imageUrl = attributes?.image?.data?.attributes?.url;
    const imageAlt = attributes?.image?.data?.attributes?.name || attributes?.title || '';

    return {
      id: project.id,
      title: attributes?.title || '',
      slug: attributes?.slug || '',
      description: attributes?.description || '',
      buttonText: attributes?.buttonText || copy.defaultButtonLabel,
      imageUrl: imageUrl ? getStrapiMedia(imageUrl) : '',
      imageAlt,
    };
  });

  return (
    <div className="w-full bg-[var(--white-80)] pb-14 md:pb-20 lg:pb-[96px]">
      <section className="w-full px-4 pt-6 md:px-8 md:pt-8 lg:px-[52px] lg:pt-[36px]">
        <h1 className="h1 mb-8 text-center text-[var(--black-100)] md:mb-12 lg:mb-[68px]">{title}</h1>

        {projects.length ? (
          <div className="grid gap-[32px] md:grid-cols-2 xl:grid-cols-3">
            {projects.map(project => (
              <article
                key={project.id}
                className="group relative isolate h-[420px] overflow-hidden rounded-[18px] bg-[var(--green-20)] shadow-[0_22px_48px_rgba(0,0,0,0.14)] md:h-[460px]"
              >
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,#8b8061_0%,#4d4d41_100%)]" />
                )}

                <LiquidGlass
                  tint="dark"
                  intensity="strong"
                  className="absolute inset-x-5 top-[38%] bottom-5 flex flex-col gap-3 rounded-[16px] p-6 md:inset-x-[22px] md:bottom-[22px]"
                >
                  <h2 className="m-0 line-clamp-2 text-[22px] leading-[1.2] font-bold tracking-[-0.01em] text-white md:text-[24px]">
                    {project.title}
                  </h2>
                  <p className="m-0 line-clamp-4 flex-1 text-[14px] leading-[1.45] whitespace-pre-line text-white md:text-[15px]">
                    {project.description}
                  </p>

                  <div className="mt-2 flex justify-end">
                    <Link
                      href={`/${locale}/projects/${project.slug}`}
                      className="inline-flex items-center justify-center rounded-[10px] border-2 border-[var(--green-100)] bg-white px-[30px] py-[14px] text-[16px] leading-6 font-medium text-[var(--black-100)] no-underline transition-opacity duration-150 ease-out hover:opacity-90"
                    >
                      {project.buttonText}
                    </Link>
                  </div>
                </LiquidGlass>
              </article>
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-[640px] text-center text-[16px] leading-7 text-[var(--black-80)]">
            {copy.emptyState}
          </p>
        )}
      </section>
    </div>
  );
};
