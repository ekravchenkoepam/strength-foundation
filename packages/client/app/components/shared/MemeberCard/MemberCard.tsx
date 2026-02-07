import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from '@/app/components/icons';

import { getStrapiMedia } from '@/app/utils/api-helpers';

interface Social {
  id: number;
  link: string;
  icon: 'linkedin' | 'facebook' | 'instagram';
}

interface Member {
  id: number;
  name: string;
  role: string;
  description: Array<{
    type: string;
    children: Array<{
      type: string;
      text: string;
    }>;
  }>;
  socials: Social[];
  image?: any;
}

interface MemberCardProps {
  member: Member;
}

const SocialIcon = ({
  icon,
  link,
}: {
  icon: 'linkedin' | 'facebook' | 'instagram';
  link: string;
}) => {
  const iconMap = {
    linkedin: LinkedinIcon,
    facebook: FacebookIcon,
    instagram: InstagramIcon,
  };

  const Icon = iconMap[icon];

  if (!Icon) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="w-[32px] h-[32px] flex items-center justify-center">
        <Icon backgroundColor="#FFFFFF" color="#484838" />
      </div>
    </a>
  );
};


export const MemberCard = ({ member }: MemberCardProps) => {
  const image =
    member.image?.data?.attributes?.formats?.medium?.url ??
    member.image?.data?.attributes?.url ??
    null;

  const imgUrl = getStrapiMedia(image);
  const descriptionText = member.description
    .map((block) => block.children.map((child) => child.text).join(''))
    .join('\n\n');

  return (
    <Card className="bg-[#ffffff] border-0 rounded-xl overflow-hidden flex flex-col p-0 w-full">
      <div className="relative w-full h-[425px]">
        <Image
          src={imgUrl}
          alt={member.name}
          fill
          className="object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="border border-white/30 rounded-lg p-4 backdrop-blur-sm bg-white/10">
            <div className="flex-1 mb-[8px]">
              <h3 className="text-[24px] font-semibold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-[16px] text-white/90">{member.role}</p>
            </div>

            <div className="flex justify-end gap-[8px]">
                {member.socials.map((social) => (
                  <SocialIcon
                    key={social.id}
                    icon={social.icon}
                    link={social.link}
                  />
                ))}
              </div>
          </div>
        </div>
      </div>

      <CardContent className="text-sm text-black leading-relaxed whitespace-pre-line p-8">
        {descriptionText}
      </CardContent>
    </Card>
  );
};
