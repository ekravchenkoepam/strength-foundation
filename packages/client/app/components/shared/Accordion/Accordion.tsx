'use client';

import React, { FC, useState } from 'react';
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
};

export const Accordion: FC<AccordionProps> = ({ year }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.accordionItem}>
      <div className={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
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
                  {r.Name || 'Без назви'}
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
