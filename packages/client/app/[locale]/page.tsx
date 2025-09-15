'use client';

import { useEffect, useState } from 'react';

import { getStrapiMedia } from '@/app/utils/api-helpers';
import { getPageBySlug } from '@/app/services/pageService';

import { useApp } from '@/app/context/AppContext';

import styles from '../page.module.scss';
import clsx from 'clsx';
import { Button, ButtonTypeEnum } from '@/app/components/shared';

type Block = {
  __component: string;
  video?: { data: Video[] };
  image?: { data: Image[] };
  text?: string;
  title?: string;
  description?: string;
}

type Video = {
  id: string;
  attributes: {
    url: string;
    mime: string;
  };
}

type Image = {
  id: string;
  attributes: {
    url: string;
    alternativeText?: string;
  };
}

type Homepage = {
  attributes: {
    blocks: Block[];
  };
}

export default function Home() {
  const { locale } = useApp();
  const [homepage, setHomepage] = useState<Homepage | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!locale) return;

      const page = await getPageBySlug({
        slug: 'home',
        populate: {
          blocks: { populate: '*' },
        },
        locale,
      });
      setHomepage(page);
    }
    void fetchPage();
  }, [locale]);

  return (
    <div className={styles.homePage}>
      <div className={styles.headerBlock}>
        {homepage?.attributes?.blocks?.map((block: Block, index: number) => {
          switch (block.__component) {
            case "blocks.video":
              return (
                <div key={index}>
                  {block.video?.data?.map((video) => (
                    <video key={video.id} controls width="600">
                      <source
                        src={getStrapiMedia(video.attributes?.url)}
                        type={video.attributes?.mime}
                      />
                      Your browser does not support the video tag.
                    </video>
                  ))}
                </div>
              );

            case "blocks.image":
              return (
                <div key={index}>
                  {block.image?.data?.map((img) => (
                    <img
                      key={img.id}
                      src={getStrapiMedia(img.attributes?.url)}
                      alt={img.attributes?.alternativeText || ""}
                      width="500"
                    />
                  ))}
                </div>
              );

            case "blocks.header-block":
              return (
                <div key={index} className={styles.headerBlockContainer}>
                  <div className={styles.text}>{block.text}</div>
                  <div className={styles.title}>{block.title}</div>
                  <div className={styles.description}>{block.description}</div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
      <section className={clsx(styles.fundBlockContainer, styles.container)}>
        <div className={styles.blockTitle}>Про фонд</div>
        <div className={styles.content}>
          <img className={styles.image} src="/images/hands.jpg" alt="" />
          <div className={styles.description}>
            <div className={styles.text}>
              <p>
                Наша місія — сприяння звільненню військовополонених
                та надання допомоги їхнім родинам, а також героям, що
                повернулися з полону.
              </p>
              <br/>
              <p>
                Ми прагнемо повернути героїв додому, підтримати їхніх
                близьких і привернути увагу суспільства до цієї проблеми.
              </p>
              <br/>
              <p>
                Ми створили фонд, об’єднавши наші навички та досвід,
                бо неможливо залишатися осторонь, коли наші герої щодня
                перебувають у полоні, а їхні родини стукають у всі двері,
                шукаючи підтримки.
              </p>
            </div>
            <div className={styles.buttons}>
              <Button label="Наші проєкти" type={ButtonTypeEnum.Transparent} />
              <Button label="Звітність організації" type={ButtonTypeEnum.Secondary} />
            </div>
          </div>
        </div>
      </section>
      <section className={clsx(styles.teamBlockContainer, styles.container)}>
        <div className={styles.headerBlockContainer}>
          <h2 className={styles.blockTitle}>Наша команда</h2>
        </div>
        <div className={styles.teamListContainer}>
          <div className={styles.teamList}>
            <div className={styles.teamMember}>
              <div className={styles.bio}>
                <div className={styles.name}>Владислава Карцан</div>
                <div className={styles.role}>Голова фонду</div>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.bio}>
                <img src="/images/quotes.svg" alt="quotes" className={styles.quotes} />
                <div className={styles.name}>Анастасія Артемова</div>
                <div className={styles.role}>Співзасновниця</div>
                <div className={styles.extraInfo}>
                  Координаторка проєктів
                  "Історії сильних", “Допомога родинам
                  військовополонених”, а також організаторка
                  власної фотовиставки фонду.
                </div>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.bio}>
                <div className={styles.name}>Анастасія Чакубаш</div>
                <div className={styles.role}>Співзасновниця</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={clsx(styles.activitiesBlockContainer, styles.container)}>

      </section>
    </div>
  );
}
