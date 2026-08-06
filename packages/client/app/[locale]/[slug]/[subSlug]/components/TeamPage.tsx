import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
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
            joinTeamSection: {
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
  const joinTeamSection = teamPage?.attributes?.joinTeamSection || null;
  const ctaDescription = String(joinTeamSection?.description || '')
    .split('\n')
    .map((line: string) => line.trim())
    .filter(Boolean);
  const ctaButtonText = joinTeamSection?.buttonText || '';
  const ctaButtonLink = joinTeamSection?.buttonLink || '#';

  return (
    <>
      <div className="h1 mt-6 mb-8 text-center md:mt-8 md:mb-12">{title}</div>
      <Slider images={images} />
      <div className="px-6 py-10 text-[16px] leading-[24px] md:px-8 md:py-14 lg:px-[120px] xl:px-[220px]">{motto}</div>
      <div
        className="
        bg-[rgb(72,72,56)]
        bg-[url('/images/asphalt-bg.png')]
        bg-cover bg-center bg-no-repeat
        w-full px-6 pt-12 pb-14 md:pt-16 md:pb-20 lg:px-[52px] lg:pt-[100px] lg:pb-[120px]
      "
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <div
            className="grid w-full gap-4 pb-3 md:gap-6 lg:gap-8"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))' }}
          >
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
      {joinTeamSection && (
        <div className="w-full bg-[var(--white-80)] px-6 pt-[120px] pb-[52px] text-center lg:px-[52px] lg:py-[120px]">
          <h2 className="text-[44px] font-bold mb-8">{joinTeamSection.title}</h2>

          <div className="text-left max-w-[820px] mx-auto mb-10">
            {ctaDescription.map((paragraph: string, index: number) => (
              <p key={`${paragraph}-${index}`} className="text-[16px] mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          {ctaButtonText && (
            <Link
              href={ctaButtonLink}
              className="inline-block bg-[#F2C94C] hover:bg-[#e6ba42] transition-colors text-black font-semibold py-4 px-10 rounded-[12px]"
            >
              {ctaButtonText}
            </Link>
          )}
        </div>
      )}
    </>
  );
};
