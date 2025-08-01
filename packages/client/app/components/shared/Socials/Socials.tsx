'use client';

import { FC, useState } from 'react';

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon, SpotifyIcon,
  TelegramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/app/components/icons';

import styles from './Socials.module.scss';
import { SocialName } from '@/app/components/shared/Socials/types';

export interface SocialsProps {
  socials: any[];
  backgroundColor?: string;
  color?: string;
  hoverBackgroundColor?: string;
}

export const Socials: FC<SocialsProps> = ({
  socials,
  backgroundColor,
  color,
  hoverBackgroundColor = '#EFCB4C',
}) => {
  const [hovered, setHovered] = useState<SocialName | null>(null);

  const renderIcon = (name: SocialName, isHovered: boolean) => {
    const props = {
      backgroundColor: isHovered ? hoverBackgroundColor : backgroundColor,
      color,
    };

    switch (name) {
      case 'telegram':
        return <TelegramIcon {...props} />;
      case 'linkedin':
        return <LinkedinIcon {...props} />;
      case 'facebook':
        return <FacebookIcon {...props} />;
      case 'instagram':
        return <InstagramIcon {...props} />;
      case 'tiktok':
        return <TiktokIcon {...props} />;
      case 'youtube':
        return <YoutubeIcon {...props} />;
      case 'spotify':
        return <SpotifyIcon {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.socialsContainer}>
      {socials?.map(({ link, name }) => {
        const isHovered = hovered === name;

        return (
          <a
            key={name}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className="social-link"
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
