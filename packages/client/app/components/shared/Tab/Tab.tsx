'use client';

import React, { FC } from 'react';

import styles from './Tab.module.scss';

type TabProps = {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export const Tab: FC<TabProps> = ({ name, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
    >
      {name}
    </div>
  );
};
