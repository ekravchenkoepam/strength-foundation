import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { FC } from 'react';

import { PageProps } from '@/app/[locale]/[slug]/types';
import { Loading, MemberCard, Slider } from '@/app/components/shared';
import { fetchAPI } from '@/app/utils/fetch-api';

export const TeamPage: FC<PageProps> = ({ locale }) => {
  const { data: teamPage, isLoading: loading } = useQuery({
    queryKey: ['team-page', locale],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/team-page',
        urlParams: {
          locale,
          populate: {
            images: {
              populate: '*',
            },
            members: {
              populate: {
                socials: {
                  populate: '*',
                },
                image: {
                  populate: '*',
                },
              },
            },
          },
        },
      });

      return data.data;
    },
  });

  if (loading) return <Loading headerText="Наша команда" />;

  const title = teamPage?.attributes?.title || '';
  const images = teamPage?.attributes?.images?.data || [];
  const motto = teamPage?.attributes?.motto || '';
  const members = teamPage?.attributes?.members || [];

  return (
    <>
      <div className="h1 mt-6 mb-8 text-center md:mt-8 md:mb-12">{title}</div>
      <Slider images={images} />
      <div className="px-4 py-10 text-[16px] leading-[24px] md:px-8 md:py-14 lg:px-[120px] xl:px-[220px]">{motto}</div>
      <div
        className="
        bg-[rgb(72,72,56)]
        bg-[url('/images/asphalt-bg.png')]
        bg-cover bg-center bg-no-repeat
        w-full px-4 pt-12 pb-14 md:px-6 md:pt-16 md:pb-20 lg:px-[52px] lg:pt-[100px] lg:pb-[120px]
      "
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex w-full flex-col gap-4 pb-3 md:gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-8">
            {members.map((member: any) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>

          <div className="mt-6 flex justify-end md:mt-8 lg:mt-10">
            <button className="flex items-center gap-2 text-white hover:underline transition-colors text-[16px]">
              <div className="text-[16px]">Переглянути усіх членів команди</div>
              <Image src="/images/pointer-right.svg" alt="arrow" width={20} height={20} className="invert" />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-[var(--white-80)] text-center py-[120px] px-4">
        <h2 className="text-[44px] font-bold mb-8">Хочеш бути частиною змін?</h2>

        <div className="text-left">
          <p className="text-[16px] max-w-[820px] mx-auto mb-6">
            Фонд &quot;Сила для Сильних&quot; зростає і шукає людей із великим серцем та відкритою душею.
          </p>

          <p className="text-[16px] max-w-[820px] mx-auto mb-10">
            Якщо ти хочеш допомагати родинам військовополонених, працювати з командою однодумців, втілювати соціальні
            ініціативи та вкладатися у справді важливе - ми чекаємо саме на тебе.
          </p>
        </div>

        <button className="bg-[#F2C94C] hover:bg-[#e6ba42] transition-colors text-black font-semibold py-4 px-10 rounded-[12px]">
          Долучитися до нашої команди
        </button>
      </div>
    </>
  );
};
