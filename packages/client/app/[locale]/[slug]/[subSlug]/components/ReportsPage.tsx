'use client';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { FC, useState } from 'react';

import styles from '../../../page.module.scss';
import { PageProps } from '../../types';

import { Tab, Accordion, Loading } from '@/app/components/shared';
import { sortByPosition } from '@/app/helpers';
import { extractAttributes } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

const sortYears = (years: any[]) => {
  return [...years].sort((a, b) => {
    const yearA = parseInt(a.text.replace(/\D/g, ''), 10);
    const yearB = parseInt(b.text.replace(/\D/g, ''), 10);
    return yearB - yearA;
  });
};

export const ReportsPage: FC<PageProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openYearId, setOpenYearId] = useState<number | null>(null);

  const { data: reportsByType = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['report-types'],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/report-types',
        urlParams: { populate: 'years.reports.file,reports' },
      });

      return extractAttributes(data.data);
    },
  });

  if (loading) return <Loading headerText="Звіти" />;
  if (!reportsByType.length) return <p>Звітів не знайдено</p>;

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setOpenYearId(null);
  };

  const handleToggleYear = (yearId: number) => () => {
    setOpenYearId(prevId => (prevId === yearId ? null : yearId));
  };

  const sortedReports = sortByPosition(reportsByType);

  const sortedYears = sortYears(reportsByType[activeTab].years);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={clsx('h1', styles.pageTitle)}>Звіти</div>
      </div>
      <div className={styles.tabs}>
        {sortedReports.map(
          (report: any, i: number) =>
            !report.isHidden && (
              <Tab key={report.id} name={report.name} isActive={i === activeTab} onClick={() => handleTabClick(i)} />
            )
        )}
      </div>

      <div className={styles.content}>
        {sortedYears.map((year: any) => (
          <Accordion key={year.id} year={year} isOpen={year.id === openYearId} onToggle={handleToggleYear(year.id)} />
        ))}
      </div>
    </div>
  );
};
