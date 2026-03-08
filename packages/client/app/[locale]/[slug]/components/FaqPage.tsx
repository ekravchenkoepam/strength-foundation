import { useQuery } from '@tanstack/react-query';
import React, { FC, useMemo } from 'react';

import { PageProps } from '../types';

import { Collapse, Loading } from '@/app/components/shared';
import { fetchAPI } from '@/app/utils/fetch-api';

type FaqItem = {
  question: string;
  answer: string;
};

type ContactItem = {
  title: string;
  highlight: string;
  href: string;
};

type FaqCategoryItem = {
  id: number;
  title: string;
  faqs: FaqItem[];
};

type FaqPageData = {
  id: number;
  attributes: {
    title: string;
    description: string;
    contactsTitle: string;
    faqTitle: string;
    contacts?: Array<{
      id: number;
      title: string;
      highlight?: string;
      href?: string;
    }>;
    faqSection?: Array<{
      id: number;
      title?: string;
      items?: {
        data?: Array<{
          id: number;
          attributes?: {
            question?: string;
            answer?: string;
            position?: number;
          };
        }>;
      };
    }>;
  };
};

type FaqPageContent = {
  title: string;
  description: string;
  contactsTitle: string;
  faqTitle: string;
  contacts: ContactItem[];
  categories: FaqCategoryItem[];
};

const defaultFaqPageContent: FaqPageContent = {
  title: '',
  description: '',
  contactsTitle: '',
  faqTitle: '',
  contacts: [],
  categories: [],
};

export const FaqPage: FC<PageProps> = ({ locale }) => {
  const getQuestionIndex = (index: number) => `${index + 1}.`;
  const { data: faqPage, isLoading: loading } = useQuery<FaqPageData | null>({
    queryKey: ['faq-page', locale],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/faq-page',
        urlParams: {
          locale,
          populate: {
            contacts: '*',
            faqSection: {
              populate: {
                items: {
                  sort: ['position:asc'],
                },
              },
            },
          },
        },
      });

      return data?.data || null;
    },
  });

  const normalizedFaqPage = useMemo<FaqPageContent>(() => {
    if (!faqPage?.attributes) {
      return defaultFaqPageContent;
    }

    const contacts: ContactItem[] = (faqPage.attributes.contacts || []).map(contact => ({
      title: contact.title || '',
      highlight: contact.highlight || '',
      href: contact.href || '#',
    }));

    const categories: FaqCategoryItem[] = (faqPage.attributes.faqSection || []).map((category, categoryIndex) => {
      const faqs: FaqItem[] = (category.items?.data || []).map(faq => ({
        question: faq.attributes?.question || '',
        answer: faq.attributes?.answer || '',
      }));

      return {
        id: category.id || categoryIndex,
        title: category.title || '',
        faqs,
      };
    });

    return {
      title: faqPage.attributes.title || '',
      description: faqPage.attributes.description || '',
      contactsTitle: faqPage.attributes.contactsTitle || '',
      faqTitle: faqPage.attributes.faqTitle || '',
      contacts,
      categories,
    };
  }, [faqPage]);

  if (loading) return <Loading headerText="Найчастіше задавані питання" />;

  const { title, description, contactsTitle, faqTitle, contacts, categories } = normalizedFaqPage;

  return (
    <div className="w-full text-[16px] text-[var(--color-dark)]">
      <section className="bg-[var(--white-80)] px-4 pt-8 pb-10 md:px-8 md:pt-10 md:pb-14 lg:px-[52px] lg:pt-[32px] lg:pb-[90px]">
        <div className="mx-auto flex w-full flex-col items-center text-center">
          <div className="h1 mb-8 md:mb-12 lg:mb-[74px]">{title}</div>
          <div className="max-w-[760px] text-left text-[18px] leading-8 text-[var(--black-80)] md:text-[16px] md:leading-7">
            {description}
          </div>
        </div>
      </section>

      <section
        className="
          bg-[var(--green-100)] bg-[url('/images/asphalt-bg.png')] bg-cover bg-center
          px-4 py-10 text-[var(--color-light)] md:px-8 md:py-14 lg:px-[50px] lg:py-[100px]
        "
      >
        <div className="mx-auto">
          <div className="h2 pb-8 text-center text-[var(--color-light)] md:pb-12 lg:pb-[80px]">{contactsTitle}</div>
          <div className="grid grid-cols-1 gap-[32px] md:grid-cols-2">
            {contacts.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="
                  flex flex-col gap-[24px]
                  rounded-[14px] border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.04)]
                  p-5 text-[16px] leading-[24px] md:p-[24px] md:text-[24px] md:leading-[28px]
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
                  {item.title}
                  {item.highlight ? (
                    <>
                      {' '}
                      <a
                        className="underline decoration-[var(--yellow-100)] underline-offset-4 break-words"
                        href={item.href}
                      >
                        {item.highlight}
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--white-80)] px-4 py-10 md:px-8 md:py-12 lg:px-[50px] lg:py-[72px]">
        <div className="h2 mb-8 text-center md:mb-10 lg:mb-[46px]">{faqTitle}</div>
        <div className="mx-auto flex w-full flex-col gap-8 md:gap-10 lg:gap-[72px] lg:px-[50px]">
          {categories.map(category => (
            <div
              key={category.id}
              className="rounded-[16px] bg-[var(--white-80)] p-5 shadow-[0_10px_32px_rgba(0,0,0,0.08)] md:p-8 lg:p-[40px] last:mb-0"
            >
              <div className="mb-5 text-[24px] leading-[32px] font-semibold md:mb-7 md:text-[28px] md:leading-[38px]">
                {category.title}
              </div>
              <div className="flex flex-col gap-4 md:gap-6 lg:gap-[32px]">
                {category.faqs.map((item, index) => (
                  <Collapse
                    key={`${category.id}-${item.question}`}
                    trigger={
                      <div className="flex w-full items-center justify-between gap-3 text-left text-[16px] leading-[22px] font-semibold md:gap-4">
                        <span>
                          {getQuestionIndex(index)} {item.question}
                        </span>
                      </div>
                    }
                    className="rounded-[12px]"
                    triggerClassName="
                      px-4 py-4 md:px-6 md:py-5 text-[16px] leading-[22px] font-semibold
                      data-[state=open]:border-b-2 data-[state=open]:border-[#EFCB4C] data-[state=open]:rounded-b-none
                    "
                    contentClassName="px-4 pb-4 md:px-6 md:pb-5 text-[15px] leading-6 text-[var(--black-80)]"
                  >
                    <div dangerouslySetInnerHTML={{ __html: item.answer }} />
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
