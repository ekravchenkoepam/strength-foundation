'use client';

import React, { FC } from 'react';

import styles from './Loading.module.scss';

type LoadingProps = {
  headerText?: string;
  message?: string;
};

export const Loading: FC<LoadingProps> = ({ headerText, message = 'Loading...' }) => (
  <div className={styles.wrapper}>
    <h1 className={styles.header}>{headerText}</h1>
    <p className={styles.message}>{message}</p>
  </div>
);
