import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

import { Collapse, Loading } from '@/app/components/shared';
import { fetchAPI } from '@/app/utils/fetch-api';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  id: number;
  attributes: {
    title: string;
    slug?: string;
    position?: number;
    faqs?: {
      data: Array<{
        id: number;
        attributes: {
          question: string;
          answer: string;
          position?: number;
        };
      }>;
    };
  };
};

const contacts = [
  {
    title: 'Напишіть нам в директ у наш Instagram',
    highlight: 'Instagram',
    href: 'https://instagram.com/strength.foundation',
    icon: '/images/number-1.svg',
  },
  {
    title: 'На електронну пошту:',
    highlight: 'info@strength.foundation',
    href: 'mailto:info@strength.foundation',
    icon: '/images/number-2.svg',
  },
  {
    title: 'У Viber/Telegram:',
    highlight: '+380 00 000 00 00',
    href: 'tel:+380000000000',
    icon: '/images/number-3.svg',
  },
  {
    title: 'Або ж заповніть форму за посиланням. Ми зв’яжемось із вами протягом 1–2 днів.',
    highlight: '',
    href: '#',
    icon: '/images/number-4.svg',
  },
];

export const FaqPage = () => {
  const getQuestionIndex = (index: number) => `${index + 1}.`;
  const { data: categories = [], isLoading: loading } = useQuery<FaqCategory[]>({
    queryKey: ['faq-categories'],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/faq-categories',
        urlParams: {
          populate: {
            faqs: {
              sort: ['position:asc'],
            },
          },
          sort: ['position:asc'],
        },
      });

      return data?.data || [];
    },
  });

  const normalizedCategories = useMemo(() => {
    return categories.map(category => {
      const faqs: FaqItem[] =
        category.attributes?.faqs?.data?.map(faq => ({
          question: faq.attributes.question,
          answer: faq.attributes.answer || '',
        })) || [];

      return {
        id: category.id,
        title: category.attributes?.title || '',
        faqs,
      };
    });
  }, [categories]);

  if (loading) return <Loading headerText="Найчастіше задавані питання" />;

  return (
    <div className="w-full text-[16px] text-[var(--color-dark)]">
      <section className="-mx-[50px] bg-[var(--color-light)] px-[52px] pt-[32px] pb-[90px]">
        <div className="mx-auto flex w-full flex-col items-center text-center">
          <div className="h1 mb-[74px]">Потрібна допомога?</div>
          <div className="max-w-[760px] text-[16px] text-left leading-7 text-[var(--black-80)]">
            Наш фонд підтримує родини військовополонених та зниклих безвісти. Ми надаємо юридичні консультації,
            психологічну підтримку, а також проводимо зустрічі, заходи й активності для родин та дітей. Якщо вам
            потрібна допомога — звертайтесь у зручний для вас спосіб.
          </div>
        </div>
      </section>

      <section className="bg-[var(--green-100)] bg-[url('/images/asphalt-bg.png')] bg-cover bg-center py-[100px] px-[50px] text-[var(--color-light)]">
        <div className="mx-auto">
          <div className="h2 text-center text-[var(--color-light)] pb-[80px]">Як з нами зв’язатися</div>
          <div className="grid grid-cols-1 gap-[32px] md:grid-cols-2">
            {contacts.map((item, index) => (
              <div
                key={item.title}
                className="
                  flex flex-col gap-[24px]
                  rounded-[14px] border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.04)] p-[24px] text-[24px]
                "
              >
                <div className="">
                  <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[var(--color-light)]">
                    <img
                      src={`/images/number-${index + 1}.svg`}
                      alt={`Крок ${index + 1}`}
                      className="h-[32px] w-[32px]"
                    />
                  </div>
                </div>
                <div className="leading-6 text-[var(--color-light)]">
                  {item.title}{' '}
                  <a className="underline decoration-[var(--yellow-100)] underline-offset-4" href={item.href}>
                    {item.highlight}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="-mx-[50px] bg-[var(--white-80)] px-[50px] py-[72px]">
        <div className="h2 mb-[46px] text-center">Найчастіше задавані питання</div>
        <div className="flex flex-col gap-[72px] mx-auto w-full px-[50px]">
          {normalizedCategories.map(category => (
            <div
              key={category.id}
              className="rounded-[16px] bg-[var(--color-light)] p-[40px] shadow-[0_10px_32px_rgba(0,0,0,0.08)] last:mb-0"
            >
              <div className="mb-[32px] text-[28px] font-semibold">{category.title}</div>
              <div className="flex flex-col gap-[32px]">
                {category.faqs.map((item, index) => (
                  <Collapse
                    key={`${category.id}-${item.question}`}
                    trigger={
                      <div className="flex w-full items-center justify-between gap-4 text-left text-[16px] font-semibold">
                        <span>
                          {getQuestionIndex(index)} {item.question}
                        </span>
                      </div>
                    }
                    className="rounded-[12px]"
                    triggerClassName="
                      text-[16px] font-semibold
                      data-[state=open]:border-b-2 data-[state=open]:border-[#EFCB4C] data-[state=open]:rounded-b-none
                    "
                    contentClassName="text-[15px] leading-6 text-[var(--black-80)]"
                  >
                    {item.answer}
                  </Collapse>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
