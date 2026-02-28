import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react';

import { Loading, MemberCard, Slider } from '@/app/components/shared';
import { fetchAPI } from '@/app/utils/fetch-api';

export const TeamPage = () => {
  const { data: teamPage, isLoading: loading } = useQuery({
    queryKey: ['team-page'],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/team-page',
        urlParams: {
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

  console.log({ teamPage });

  const title = teamPage?.attributes?.title || '';
  const images = teamPage?.attributes?.images?.data || [];
  const motto = teamPage?.attributes?.motto || '';
  const members = teamPage?.attributes?.members || [];

  return (
    <>
      <div className="text-[44px] text-center font-bold mt-[32px] mb-[74px]">{title}</div>
      <Slider images={images} />
      <div className="flex items-center gap-8 p-[84px] px-[280px] text-[16px]">{motto}</div>
      <div
        className="
        relative
        flex justify-center gap-[32px]
        bg-[rgb(72,72,56)]
        bg-[url('/images/asphalt-bg.png')]
        bg-cover bg-center bg-no-repeat
        w-full px-[52px] pt-[100px] pb-[200px]
      "
      >
        <div className="flex justify-center gap-[32px] relative max-w-[1200px] w-full">
          {members.map((member: any) => (
            <MemberCard key={member.id} member={member} />
          ))}

          <div className="absolute -bottom-[80px] right-0">
            <button className="flex items-center gap-2 text-white hover:underline transition-colors text-[16px]">
              <div className="text-[16px]">Переглянути усіх членів команди</div>
              <Image src="/images/pointer-right.svg" alt="arrow" width={20} height={20} className="invert" />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-white text-center py-[120px] px-4">
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
