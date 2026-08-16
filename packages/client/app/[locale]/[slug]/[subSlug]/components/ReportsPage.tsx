'use client';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { FC, useState } from 'react';

import { Tab, Accordion, Loading } from '@/app/components/shared';
import { sortByPosition } from '@/app/helpers';
import { extractAttributes } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

import styles from '../../../page.module.scss';
import { PageProps } from '../../types';

type ReportYear = {
  id: number;
  text: string;
  reports: Array<{
    id: number;
    name?: string;
    file?: {
      data?: {
        attributes?: {
          url?: string;
        };
      };
    };
  }>;
};

type ReportType = {
  id: number;
  name: string;
  position?: number;
  isHidden?: boolean;
  years?: ReportYear[];
};

const sortYears = (years: ReportYear[]) => {
  return [...years].sort((a, b) => {
    const yearA = parseInt(String(a.text || '').replace(/\D/g, ''), 10) || 0;
    const yearB = parseInt(String(b.text || '').replace(/\D/g, ''), 10) || 0;
    return yearB - yearA;
  });
};

export const ReportsPage: FC<PageProps> = ({ locale }) => {
  const [activeReportTypeId, setActiveReportTypeId] = useState<number | null>(null);
  const [openYearId, setOpenYearId] = useState<number | null>(null);

  const { data: reportsByType = [], isLoading: loading } = useQuery<ReportType[]>({
    queryKey: ['report-types', locale],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/report-types',
        urlParams: {
          locale,
          populate: 'years.reports.file,reports',
          sort: ['position:asc'],
        },
      });

      return (extractAttributes<ReportType>(data.data) as ReportType[] | null) ?? [];
    },
  });

  if (loading) return <Loading headerText="Звіти" />;
  if (!reportsByType.length) return <p>Звітів не знайдено</p>;

  const handleTabClick = (reportTypeId: number) => {
    setActiveReportTypeId(reportTypeId);
    setOpenYearId(null);
  };

  const handleToggleYear = (yearId: number) => () => {
    setOpenYearId(prevId => (prevId === yearId ? null : yearId));
  };

  const visibleReports = sortByPosition(reportsByType).filter(report => !report.isHidden);
  if (!visibleReports.length) return <p>Звітів не знайдено</p>;

  const activeReport = visibleReports.find(report => report.id === activeReportTypeId) ?? visibleReports[0];
  const sortedYears = sortYears(activeReport?.years ?? []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={clsx('h1', styles.pageTitle)}>Звіти</div>
      </div>
      <div className={styles.tabs}>
        {visibleReports.map(report => (
          <Tab
            key={report.id}
            name={report.name}
            isActive={report.id === activeReport.id}
            onClick={() => handleTabClick(report.id)}
          />
        ))}
      </div>

      <div className={styles.content}>
        {sortedYears.map((year: any) => (
          <Accordion key={year.id} year={year} isOpen={year.id === openYearId} onToggle={handleToggleYear(year.id)} />
        ))}
      </div>
    </div>
  );
};
