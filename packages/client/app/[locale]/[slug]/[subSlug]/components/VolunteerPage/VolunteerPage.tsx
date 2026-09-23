import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';

import { PageProps } from '../../../types';
import { useVolunteerPageContent } from '../usePartnershipPageContent';

import { Button, ButtonTypeEnum, Cards, Loading } from '@/app/components/shared';
import { getStrapiMedia } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

type Testimonial = {
  id: string | number;
  name: string;
  role: string;
  text: string;
};

type Questionnaire = {
  id: string;
  title: string;
  href: string;
  isExternal: boolean;
};

const TESTIMONIALS_PER_PAGE = 2;

export const VolunteerPage = ({ locale }: PageProps) => {
  const [activeReviewPage, setActiveReviewPage] = useState(0);
  const { data: content, isLoading } = useVolunteerPageContent(locale);
  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ['testimonials', locale],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/testimonials',
        urlParams: {
          locale,
          sort: ['position:asc'],
          fields: ['name', 'role', 'text'],
        },
      });

      return response?.data
        .map((item: any) => ({
          id: item.id,
          name: item?.attributes?.name || '',
          role: item?.attributes?.role || '',
          text: item?.attributes?.text || '',
        }))
        .filter((item: Testimonial) => Boolean(item.name && item.role && item.text));
    },
  });
  const { data: questionnaires = [] } = useQuery<Questionnaire[]>({
    queryKey: ['questionnaires', locale],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/questionnaires',
        urlParams: {
          locale,
          sort: ['position:asc'],
          fields: ['title', 'url', 'isExternal'],
        },
      });

      return response?.data
        .map((item: any) => ({
          id: String(item.id),
          title: item?.attributes?.title || '',
          href: item?.attributes?.url || '',
          isExternal: item?.attributes?.isExternal !== false,
        }))
        .filter((item: Questionnaire) => Boolean(item.title && item.href));
    },
  });
  const testimonialPageCount = Math.ceil(testimonials.length / TESTIMONIALS_PER_PAGE);
  const safeActiveReviewPage = testimonialPageCount ? Math.min(activeReviewPage, testimonialPageCount - 1) : 0;
  const visibleTestimonials = testimonials.slice(
    safeActiveReviewPage * TESTIMONIALS_PER_PAGE,
    (safeActiveReviewPage + 1) * TESTIMONIALS_PER_PAGE
  );
  const ctaParagraphs =
    content?.ctaDescription
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean) ?? [];

  if (isLoading) return <Loading />;
  if (!content) return null;

  const background = content.background?.data?.attributes;
  const backgroundUrl = getStrapiMedia(background?.url ?? null);
  const backgroundAlt = background?.alternativeText || background?.name || content.title;

  return (
    <div className="w-full">
      <section className="bg-[var(--white-80)] pb-[52px] md:pb-[72px]">
        <div className="content-frame px-6 lg:px-[52px]">
          <h1 className="h1 pb-[30px] pt-6 text-center md:pb-12 md:pt-8">{content.title}</h1>

          <div className="aspect-[1336/638] min-h-[260px] max-h-[638px] w-full overflow-hidden rounded-[24px] bg-[#c4c4c4]">
            {backgroundUrl ? (
              <img src={backgroundUrl} alt={backgroundAlt} className="h-full w-full object-cover object-center" />
            ) : null}
          </div>

          <p className="mx-auto mt-6 max-w-[760px] whitespace-pre-line text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-12">
            {content.description}
          </p>
        </div>
      </section>

      <section
        className="
          relative isolate overflow-hidden bg-[var(--green-100)]
          pb-[70px] pt-16 text-[color:var(--white-100)] md:pb-[96px] md:pt-[86px]
        "
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/asphalt-bg-alt.png')] bg-cover bg-center"
        />

        <div className="content-frame relative z-10 px-6 lg:px-[52px]">
          <h2 className="h2 text-center">{content.benefitsTitle}</h2>

          <Cards
            items={content.benefits}
            className="mt-7 md:mt-[46px]"
            cardClassName="min-h-[210px] bg-white/[0.02]"
            iconClassName="h-[60px] w-[60px]"
            titleClassName="max-w-[372px] font-[var(--h4-weight)] leading-[var(--h4-line)]"
          />

          <h2 className="h2 mt-16 text-center md:mt-[98px]">{content.testimonialsTitle}</h2>

          {visibleTestimonials.length ? (
            <>
              <div className="mt-7 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-2 md:gap-8">
                {visibleTestimonials.map(review => (
                  <article
                    key={review.id}
                    className={clsx(
                      'flex min-h-[353px] flex-col rounded-[18px] border border-white/30',
                      'bg-[rgba(72,72,56,0.4)] p-5 md:p-7',
                      visibleTestimonials.length === 1 && 'md:col-span-2'
                    )}
                  >
                    <div className="flex items-start gap-[18px] md:items-center">
                      <div className="h-[66px] w-[66px] shrink-0 rounded-full bg-[#d9d9d9] md:h-[86px] md:w-[86px]" />
                      <div>
                        <div className="h3 m-0">{review.name}</div>
                        <div className="mt-2 text-[length:var(--h7-size)] leading-[var(--h7-line)]">{review.role}</div>
                      </div>
                    </div>

                    <p className="mt-8 whitespace-pre-line text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-12">
                      {review.text}
                    </p>
                  </article>
                ))}
              </div>

              {testimonialPageCount > 1 ? (
                <nav className="mt-6 flex justify-end gap-2" aria-label="Testimonials pagination">
                  {Array.from({ length: testimonialPageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveReviewPage(index)}
                      className={clsx(
                        'h-[52px] w-[52px] rounded-full transition-colors md:h-[60px] md:w-[60px]',
                        'text-[length:var(--h6-size)] leading-[1]',
                        safeActiveReviewPage === index
                          ? 'border border-[var(--white-80)] bg-[var(--white-80)] text-[color:var(--green-100)]'
                          : 'border border-white/65 bg-transparent text-[color:var(--white-100)] hover:bg-white/10'
                      )}
                      aria-current={safeActiveReviewPage === index ? 'page' : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <div className="bg-[var(--white-80)] px-6 pb-[80px] pt-[110px] lg:px-[50px]">
        <div className="content-grid flex flex-col items-center">
          <h2 className="h1 mb-[32px] mt-0 text-center">{content.ctaTitle}</h2>
          <div className="mx-auto max-w-[820px] text-left text-[length:var(--h8-size)] leading-[var(--h8-line)]">
            {ctaParagraphs.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} className="mt-4 first:mt-0">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="my-[54px] grid w-full grid-cols-1 gap-[20px] md:grid-cols-3 md:gap-[33px]">
            {questionnaires.map(questionnaire => (
              <a
                key={questionnaire.id}
                target={questionnaire.isExternal ? '_blank' : undefined}
                rel={questionnaire.isExternal ? 'noreferrer' : undefined}
                href={questionnaire.href}
                className="
                  flex min-h-[88px] items-center justify-between gap-4 rounded-2xl
                  border border-[#f2c94c] bg-transparent px-5 py-4 text-[color:var(--black-100)]
                  no-underline shadow-[0_8px_22px_rgba(34,33,29,0.1)]
                  md:min-h-[132px] md:rounded-[24px]
                "
              >
                <span className="m-0 min-w-0 flex-1 text-left text-[20px] leading-[var(--h4-line)] font-[var(--h4-weight)]">
                  {questionnaire.title}
                </span>
                <div className="flex shrink-0 justify-end">
                  <img src="/images/pointer-right.svg" alt="arrow" className="h-[32px] w-[24px]" />
                </div>
              </a>
            ))}
          </div>
          {content.vacanciesButtonLabel && (
            <div className="flex justify-center">
              <Button label={content.vacanciesButtonLabel} type={ButtonTypeEnum.Secondary} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
