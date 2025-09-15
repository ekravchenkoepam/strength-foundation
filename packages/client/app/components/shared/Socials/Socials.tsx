'use client';

import { ComponentType, FC, useState } from 'react';

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon, SpotifyIcon,
  TelegramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/app/components/icons';

import { SocialName } from '@/app/components/shared/Socials/types';

import styles from './Socials.module.scss';

type SocialsProps = {
  socials: any[];
  backgroundColor?: string;
  color?: string;
  hoverBackgroundColor?: string;
}

type IconProps = {
  backgroundColor?: string;
  color?: string;
};

const iconMap: Record<SocialName, ComponentType<IconProps>> = {
  telegram: TelegramIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  spotify: SpotifyIcon,
};

export const Socials: FC<SocialsProps> = ({
  socials,
  backgroundColor,
  color,
  hoverBackgroundColor = '#EFCB4C',
}) => {
  const [hovered, setHovered] = useState<SocialName | null>(null);

  const renderIcon = (name: SocialName, isHovered: boolean) => {
    const Icon = iconMap[name];

    if (!Icon) return null;

    const currentBackgroundColor = isHovered ? hoverBackgroundColor : backgroundColor;

    return <Icon backgroundColor={currentBackgroundColor} color={color} />;
  };

  return (
    <div className={styles.socialsContainer}>
      {socials?.map(({ link, name }) => {
        const isHovered = hovered === name;

        return (
          <a
            key={name}
            href={link}
            aria-label={name}
            target='_blank'
            rel='noopener noreferrer'
            className='social-link'
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
          >
            {renderIcon(name, isHovered)}
          </a>
        );
      })}
    </div>
  )
};
