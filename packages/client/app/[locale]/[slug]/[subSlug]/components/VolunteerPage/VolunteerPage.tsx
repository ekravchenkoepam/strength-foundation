import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';

import { PageProps } from '../../../types';

import type { CardItem } from '@/app/components/shared';
import { Button, ButtonTypeEnum, Cards } from '@/app/components/shared';
import { fetchAPI } from '@/app/utils/fetch-api';

const BENEFITS: CardItem[] = [
  {
    id: 'experience',
    title: 'Унікальний досвід у соціальних проєктах',
  },
  {
    id: 'team',
    title: 'Команду, яка підтримає тебе на кожному кроці',
  },
  {
    id: 'impact',
    title: 'Можливість робити реальні зміни й бачити результати',
  },
];

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

export const VolunteerPage = (_: PageProps) => {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/testimonials',
        urlParams: {
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
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/questionnaires',
        urlParams: {
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
  const safeActiveReviewIndex = testimonials.length ? Math.min(activeReviewIndex, testimonials.length - 1) : 0;
  const activeReview = testimonials[safeActiveReviewIndex];

  return (
    <div className="w-full">
      <section className="bg-[var(--white-80)] pb-[52px] md:pb-[72px]">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h1 className="h1 pb-[30px] pt-6 text-center md:pb-12 md:pt-8">Як стати волонтером</h1>

          <div className="h-[min(34vw,530px)] min-h-[260px] w-full rounded-[20px] bg-[#c4c4c4]" />

          <p className="mx-auto mt-6 max-w-[760px] text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-12">
            Ми активно розширюємо нашу команду і запрошуємо людей з великим серцем долучитися до важливої місії -
            підтримки родин військовополонених та звільнених героїв. Якщо ти мрієш робити щось справді значуще,
            працювати з командою однодумців і змінювати світ на краще - ми чекаємо саме на тебе!
          </p>
        </div>
      </section>

      <section
        className="
          bg-[var(--green-100)] bg-[url('/images/asphalt-bg.png')] bg-cover bg-center
          pb-[70px] pt-16 text-[color:var(--white-100)] md:pb-[96px] md:pt-[86px]
        "
      >
        <div className="mx-auto px-6 lg:px-[52px]">
          <h2 className="h2 text-center">Ти отримаєш</h2>

          <Cards
            items={BENEFITS}
            className="mt-7 md:mt-[46px]"
            cardClassName="min-h-[210px] bg-white/[0.02]"
            iconClassName="h-[60px] w-[60px]"
            titleClassName="max-w-[372px] font-[var(--h4-weight)] leading-[var(--h4-line)]"
          />

          <h2 className="h2 mt-16 text-center md:mt-[98px]">Волонтери про нас</h2>

          {activeReview && (
            <article className="mt-7 rounded-[18px] border border-white/30 bg-[rgba(72,72,56,0.4)] p-5 md:mt-10 md:p-7">
              <div className="flex items-start gap-[18px] md:items-center">
                <div className="h-[66px] w-[66px] rounded-full bg-[#d9d9d9] md:h-[86px] md:w-[86px]" />
                <div>
                  <div className="h3 m-0">{activeReview.name}</div>
                  <div className="mt-2 text-[length:var(--h7-size)] leading-[var(--h7-line)]">{activeReview.role}</div>
                </div>
              </div>

              <p className="mt-[18px] max-w-[900px] whitespace-pre-line text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-[22px]">
                {activeReview.text}
              </p>

              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => setActiveReviewIndex(index)}
                    className={clsx(
                      'h-[44px] w-[44px] rounded-full',
                      'text-[length:var(--h6-size)] leading-[1]',
                      activeReviewIndex === index
                        ? 'border border-[var(--white-100)] bg-[var(--white-100)] text-[color:var(--green-100)]'
                        : 'border border-white/65 bg-transparent text-[color:var(--white-100)]'
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </article>
          )}
        </div>
      </section>

      <div className="bg-[var(--white-80)] px-[50px] pb-[80px] pt-[110px]">
        <div className="mx-auto flex max-w-[1700px] flex-col items-center">
          <h2 className="h1 mb-[32px] mt-0 text-center">Хочеш бути частиною змін?</h2>
          <div className="mx-auto max-w-[820px] text-left text-[length:var(--h8-size)] leading-[var(--h8-line)]">
            <p>Фонд &quot;Сила для Сильних&quot; зростає і шукає людей із великим серцем та відкритою душею.</p>
            <p className="mt-4">
              Якщо ти хочеш допомагати родинам військовополонених, працювати з командою однодумців, втілювати соціальні
              ініціативи та вкладатися у справді важливе - ми чекаємо саме на тебе.
            </p>
          </div>

          <div className="my-[54px] grid w-full grid-cols-1 gap-[20px] md:grid-cols-3 md:gap-[33px]">
            {questionnaires.map(questionnaire => (
              <a
                key={questionnaire.id}
                target={questionnaire.isExternal ? '_blank' : undefined}
                rel={questionnaire.isExternal ? 'noreferrer' : undefined}
                href={questionnaire.href}
                className="
                  min-h-[168px] items-center justify-between gap-4 rounded-2xl
                  border border-[#f2c94c] bg-transparent px-5 py-6 text-[color:var(--black-100)]
                  no-underline shadow-[0_8px_22px_rgba(34,33,29,0.1)]
                  md:min-h-[132px] md:rounded-[24px]
                "
              >
                <span className="m-0 text-left text-[20px] leading-[var(--h4-line)] font-[var(--h4-weight)]">
                  {questionnaire.title}
                </span>
                <div className="flex justify-end">
                  <img src="/images/pointer-right.svg" alt="arrow" className="h-[32px] w-[24px]" />
                </div>
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <Button label="Переглянути усі актуальні вакансії" type={ButtonTypeEnum.Secondary} />
          </div>
        </div>
      </div>
    </div>
  );
};
