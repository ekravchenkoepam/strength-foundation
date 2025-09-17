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

export const Accordion: FC<AccordionProps> = ({ year, isOpen, onToggle }) => {
  const arrowMap = {
    open: { src: '/images/arrow-up.svg', alt: 'Collapse' },
    closed: { src: '/images/arrow-down.svg', alt: 'Expand' },
  };

  const { src, alt } = isOpen ?
    arrowMap.open :
    arrowMap.closed;

  return (
    <div className={styles.accordionItem}>
      <div
        className={clsx(styles.accordionHeader, { [styles.active]: isOpen })}
        onClick={onToggle}
      >
        {year.Text}
        <img src={src} alt={alt} className={styles.arrow} />
      </div>

      {isOpen && (
        <ul className={styles.accordionContent}>
          {year.Reports.map((report) => (
            <li key={report.id}>
              {report.File?.data?.attributes?.url ? (
                <a
                  href={getStrapiMedia(report.File.data.attributes.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/images/file.svg" alt="file" />
                  <p>{report.Name || 'Без назви'}</p>
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
};
