'use client';

import React, { FC } from 'react';

type LoadingProps = {
  headerText?: string;
};

export const Loading: FC<LoadingProps> = ({ headerText }) => (
  <div
    className="
      mx-auto flex w-full max-w-[980px] flex-col items-center gap-8
      px-4 pb-16 pt-8 md:px-[50px] md:pb-[100px] md:pt-12
    "
  >
    {headerText && <h1 className="h1 m-0 text-center">{headerText}</h1>}
    <div
      className="
        h-14 w-14 animate-spin rounded-full border-4
        border-[rgba(72,72,56,0.2)] border-t-[var(--color-yellow)]
      "
    />
  </div>
);
