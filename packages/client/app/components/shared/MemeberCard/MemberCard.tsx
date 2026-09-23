import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  SpotifyIcon,
  TelegramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/app/components/icons';
import type { SocialName } from '@/app/components/shared/Socials/types';
import { LiquidGlass } from '@/app/components/shared/LiquidGlass/LiquidGlass';
import { getStrapiMedia } from '@/app/utils/api-helpers';
import { Card, CardContent } from '@/components/ui/card';

interface Social {
  id: number;
  link: string;
  icon: SocialName;
}

interface Member {
  id: number;
  name: string;
  role: string;
  description?: Array<{
    type: string;
    children?: Array<{
      type: string;
      text: string;
    }>;
  }> | null;
  socials?: Social[] | null;
  image?: any;
}

interface MemberCardProps {
  member: Member;
  variant?: 'team';
}

const SocialIcon = ({ icon, link }: { icon: SocialName; link: string }) => {
  const iconMap = {
    telegram: TelegramIcon,
    linkedin: LinkedinIcon,
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    tiktok: TiktokIcon,
    youtube: YoutubeIcon,
    spotify: SpotifyIcon,
  };

  const Icon = iconMap[icon];

  if (!Icon) return null;

  return (
    <a
      href={link}
      aria-label={icon}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="w-[32px] h-[32px] flex items-center justify-center">
        <Icon backgroundColor="#FFFFFF" color="#484838" />
      </div>
    </a>
  );
};

export const MemberCard = ({ member, variant }: MemberCardProps) => {
  const image = member.image?.data?.attributes?.formats?.medium?.url ?? member.image?.data?.attributes?.url ?? null;
  const imgUrl = getStrapiMedia(image);
  const descriptionText = (member.description || [])
    .map(block => (block?.children || []).map(child => child?.text || '').join(''))
    .filter(Boolean)
    .join('\n\n');

  return (
    <Card
      className={clsx(
        'bg-[#ffffff] border-0 rounded-xl overflow-hidden flex flex-col p-0 w-full min-w-0 lg:min-w-0 lg:w-full',
        variant === 'team' && 'gap-0 rounded-[10px] min-[1440px]:min-h-[728px]'
      )}
    >
      <div className={clsx('relative w-full bg-[#cfcfcf]', variant === 'team' ? 'aspect-[652/425]' : 'h-[425px]')}>
        {imgUrl ? <Image src={imgUrl} alt={member.name} fill className="object-cover object-top" /> : null}

        <div className={clsx('absolute inset-x-0 bottom-0', variant === 'team' ? 'p-5 lg:p-8' : 'p-6')}>
          {variant === 'team' ? (
            <LiquidGlass tint="dark" intensity="strong" className="rounded-lg px-5 py-4">
              <MemberDetails member={member} />
            </LiquidGlass>
          ) : (
            <div className="rounded-lg border border-white/30 bg-white/10 p-4 backdrop-blur-sm">
              <MemberDetails member={member} />
            </div>
          )}
        </div>
      </div>

      <CardContent className="text-sm text-black leading-relaxed whitespace-pre-line p-5 md:p-6 lg:p-8">
        {descriptionText}
      </CardContent>
    </Card>
  );
};

const MemberDetails = ({ member }: { member: Member }) => (
  <>
    <div className="flex-1 mb-[8px]">
      <h3 className="text-[24px] font-semibold text-white mb-1">{member.name}</h3>
      <p className="text-[16px] text-white/90">{member.role}</p>
    </div>

    <div className="flex justify-end gap-[8px]">
      {(member.socials || []).map(social => (
        <SocialIcon key={social.id} icon={social.icon} link={social.link} />
      ))}
    </div>
  </>
);
