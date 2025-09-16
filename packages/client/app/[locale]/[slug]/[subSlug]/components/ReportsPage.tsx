'use client';

import React, { FC, useEffect, useState } from 'react';
import { fetchAPI } from '@/app/utils/fetch-api';
import { PageProps } from '../../types';

import { Tab, Accordion } from '@/app/components/shared';

export const ReportsPage: FC<PageProps> = ({ locale, slug, subSlug }) => {
  const [reportPage, setReportPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await fetchAPI({
          path: '/report-types',
          urlParams: { populate: 'Years.Reports.File,Reports' },
        });
        setReportPage(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchReports();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!reportPage?.data?.length) return <p>No reports found</p>;

  const reportTypes = reportPage.data;

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '50px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
       <h1>Reports Page</h1>
       <p>Locale: <strong>{locale}</strong></p>
       <p>Slug: <strong>{slug}</strong></p>
       <p>SubSlug: <strong>{subSlug}</strong></p>
     </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {reportTypes.map((report: any, i: number) => (
          <Tab
            key={report.id}
            name={report.attributes.Name}
            isActive={i === activeTab}
            onClick={() => handleTabClick(i)}
          />
        ))}
      </div>

      <div>
        <div>
          {reportTypes[activeTab].attributes.Years.map((year: any) => (
            <Accordion key={year.id} year={year} />
          ))}
        </div>
      </div>
    </div>
  );
};
