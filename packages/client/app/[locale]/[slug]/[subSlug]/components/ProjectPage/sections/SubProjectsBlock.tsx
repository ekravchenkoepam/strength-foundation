'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import styles from './SubProjectsBlock.module.scss';

import { SubProjectsBlock as SubProjectsBlockProps } from '../types';

const PAGE_SIZE = 3;

const COPY = {
  uk: { viewMore: 'Переглянути' },
  en: { viewMore: 'View' },
} as const;

export const SubProjectsBlock = ({ title, projects }: SubProjectsBlockProps) => {
  const { locale } = useParams() as { locale: string };
  const copy = COPY[locale as keyof typeof COPY] || COPY.uk;

  const items = projects?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
  const [hasPaged, setHasPaged] = useState(false);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  if (!items.length) return null;

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;

    setAnimationDirection(nextPage > page ? 'next' : 'prev');
    setHasPaged(true);
    setPage(nextPage);
  };

  return (
    <section className="flex w-full flex-col gap-10 py-[60px]">
      <h2 className="m-0 text-center text-[28px] font-bold text-[var(--black-100)] md:text-[32px]">{title}</h2>

      <div
        key={page}
        className={clsx(
          'grid grid-cols-1 gap-[32px] md:grid-cols-3',
          hasPaged && (animationDirection === 'next' ? styles.slideNext : styles.slidePrev)
        )}
      >
        {pageItems.map(project => {
          const attrs = project.attributes;
          const slug = attrs?.slug;

          return (
            <article
              key={project.id}
              className="overflow-hidden rounded-[10px] bg-[#C4C4C4] p-[30px]"
            >
              <div className="flex h-full min-h-[296px] flex-col gap-4 rounded-[8px] bg-black/40 p-[18px] text-white">
                <h3 className="m-0 text-[20px] leading-[1.25] font-bold">{attrs?.title}</h3>

                {attrs?.description ? (
                  <p className="m-0 flex-1 text-[15px] leading-[1.55]">{attrs.description}</p>
                ) : (
                  <span className="flex-1" />
                )}

                {slug ? (
                  <Link
                    href={`/${locale}/projects/${slug}`}
                    className="self-end rounded-[10px] border-2 border-[var(--green-100)] bg-white px-8 py-3 text-[16px] leading-6 font-medium text-[var(--black-100)] no-underline transition-opacity duration-150 ease-out hover:opacity-85"
                  >
                    {attrs?.buttonText || copy.viewMore}
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <nav className="flex justify-end gap-[10px]" aria-label="Sub-projects pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => changePage(n)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-[16px] leading-none font-semibold transition-colors duration-150 ease-out ${
                n === page
                  ? 'border-[var(--green-100)] bg-[var(--green-100)] text-white'
                  : 'border-[var(--green-80)] bg-transparent text-[var(--green-80)] hover:bg-[var(--green-80)]/10'
              }`}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
        </nav>
      ) : null}
    </section>
  );
};
