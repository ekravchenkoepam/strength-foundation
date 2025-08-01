import { FC } from 'react';

import { IconType } from '@/app/types';

export const ArrowDown: FC<IconType> = ({
  height = 25,
  width = 25,
}) => (
  <svg width={width} height={height} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_524_882)">
      <path
        d="M11.155 16.5474C11.6237 17.0161 12.385 17.0161 12.8537 16.5474L17.6537 11.7474C17.9987 11.4024 18.1 10.8886 17.9125 10.4386C17.725 9.98861 17.29 9.69611 16.8025 9.69611L7.20246 9.69611C6.7187 9.69611 6.27996 9.98861 6.09246 10.4386C5.90496 10.8886 6.00995 11.4024 6.3512 11.7474L11.1512 16.5474L11.155 16.5474Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_524_882">
        <rect width="12" height="19.2" fill="white" transform="translate(18.0024 21.7) rotate(-180)"/>
      </clipPath>
    </defs>
  </svg>
);
