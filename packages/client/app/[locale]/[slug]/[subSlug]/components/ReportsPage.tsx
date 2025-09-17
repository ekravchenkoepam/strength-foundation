'use client';

import React, { FC, useEffect, useState } from 'react';
import { fetchAPI } from '@/app/utils/fetch-api';
import { PageProps } from '../../types';

import { Tab, Accordion, Loading } from '@/app/components/shared';
import { extractAttributes } from '@/app/utils/api-helpers';

import styles from '../../../page.module.scss'

const sortYears = (years: any[]) => {
  return [...years].sort((a, b) => {
    const yearA = parseInt(a.Text.replace(/\D/g, ''), 10);
    const yearB = parseInt(b.Text.replace(/\D/g, ''), 10);
    return yearB - yearA;
  });
};

export const ReportsPage: FC<PageProps> = () => {
  const [reportsByType, setReportsByType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openYearId, setOpenYearId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await fetchAPI({
          path: '/report-types',
          urlParams: { populate: 'Years.Reports.File,Reports' },
        });

        const updatedReports = extractAttributes(data.data)

        setReportsByType(updatedReports);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchReports();
  }, []);

  if (loading) return <Loading headerText="Звіти"/>;
  if (!reportsByType.length) return <p>Звітів не знайдено</p>;

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setOpenYearId(null);
  };

  const handleToggleYear = (yearId: number) => () => {
    setOpenYearId((prevId) => (prevId === yearId ? null : yearId));
  };

  const sortedYears = sortYears(reportsByType[activeTab].Years);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Звіти</h1>
      </div>
      <div className={styles.tabs}>
        {reportsByType.map((report: any, i: number) => (
          <Tab
            key={report.id}
            name={report.Name}
            isActive={i === activeTab}
            onClick={() => handleTabClick(i)}
          />
        ))}
      </div>

      <div className={styles.content}>
        {sortedYears.map((year: any) => (
          <Accordion
            key={year.id}
            year={year}
            isOpen={year.id === openYearId}
            onToggle={handleToggleYear(year.id)}
          />
        ))}
      </div>
    </div>
  );
};
