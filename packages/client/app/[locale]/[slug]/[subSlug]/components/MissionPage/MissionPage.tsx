import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React from 'react';

import styles from './MissionPage.module.scss';

import { Loading } from '@/app/components/shared';
import { getStrapiMedia } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

export const MissionPage = () => {
  const { data: missionPage, isLoading: loading } = useQuery({
    queryKey: ['mission-page'],
    queryFn: async () => {
      const data = await fetchAPI({
        path: '/mission-page',
        urlParams: { populate: 'missionBlock.image,principles' },
      });
      return data.data;
    },
  });

  if (loading) return <Loading headerText="Місія та цінності" />;

  if (!missionPage) return null;

  return (
    <div className={styles.missionPage}>
      <div className={clsx('h1', styles.pageTitle)}>{missionPage.attributes.title}</div>

      <div className={styles.missionBlock}>
        {missionPage.attributes.missionBlock.map((block: any, index: number) => {
          const isEven = index % 2 !== 0;

          return (
            <div
              key={block.id}
              className={clsx(styles.missionSection, {
                [styles.reversed]: isEven,
              })}
            >
              <div className={styles.missionImage}>
                {block?.image?.data && (
                  <img src={getStrapiMedia(block.image.data.attributes.url)} alt={block.image.data.attributes.name} />
                )}
              </div>

              <div className={styles.missionContent}>
                <h2>{block.title}</h2>
                <div className={styles.missionText} dangerouslySetInnerHTML={{ __html: block.content }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.principlesBlock}>
        <div className={styles.principlesTitle}>{missionPage.attributes.principlesTitle}</div>
        <div className={styles.principlesList}>
          {missionPage.attributes.principles.map((principle: any) => (
            <div key={principle.id} className={styles.principleItem}>
              <div className={styles.principleIcon}>
                <img src={`/images/icons/${principle.icon}.svg`} alt={principle.title} />
              </div>
              <h3>{principle.title}</h3>
              <div className={styles.principleContent} dangerouslySetInnerHTML={{ __html: principle.content }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
