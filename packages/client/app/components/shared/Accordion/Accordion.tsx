'use client';

import React, { FC } from 'react';
import clsx from 'clsx';

import { getStrapiMedia } from '@/app/utils/api-helpers';

import styles from './Accordion.module.scss';

type Report = {
  id: number;
  Name?: string;
  File?: { data?: { attributes?: { url?: string } } };
};

type Year = { id: number; Text: string; Reports: Report[] };

type AccordionProps = {
  year: Year;
  isOpen: boolean;
  onToggle: () => void;
};

export const Accordion: FC<AccordionProps> = ({ year, isOpen, onToggle }) => (
  <div className={styles.accordionItem}>
    <div
      className={clsx(styles.accordionHeader, { [styles.active]: isOpen })}
      onClick={onToggle}
    >
      {year.Text}
    </div>

    {isOpen && (
      <ul className={styles.accordionContent}>
        {year.Reports.map((r) => (
          <li key={r.id}>
            {r.File?.data?.attributes?.url ? (
              <a
                href={getStrapiMedia(r.File.data.attributes.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/file.svg" alt="file" />
                <p>{r.Name || 'Без назви'}</p>
              </a>
            ) : (
              'No file'
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);
