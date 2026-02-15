import { useState } from 'react';
import clsx from 'clsx';

import { Cards, Button, ButtonTypeEnum } from '@/app/components/shared';
import type { CardItem } from '@/app/components/shared';
import { PageProps } from '../../../types';

import styles from './VolunteerPage.module.scss';

const BENEFITS: CardItem[] = [
  {
    id: 'experience',
    title: 'Унікальний досвід у соціальних проєктах',
  },
  {
    id: 'team',
    title: 'Команду, яка підтримає тебе на кожному кроці',
  },
  {
    id: 'impact',
    title: 'Можливість робити реальні зміни й бачити результати',
  },
];

const REVIEWS = [
  {
    id: 1,
    name: 'Імʼя Прізвище',
    role: 'Посада',
    text: `Ми прагнемо підтримати звільнених з полону та родини військовополонених у ці складні часи та організовуємо:
ініціативу "Вдома чекали" - зустрічаємо звільнених з полону на обмінах з теплом, турботою, вдячністю і невеличкими подарунками.
лекції з психологами - щоб навчити долати стрес і віднаходити взаєморозуміння.
зустрічі з дітьми - щоб формувати толерантність до змін у зовнішності після поранень і травм;`,
  },
  {
    id: 2,
    name: 'Анна К.',
    role: 'Волонтерка',
    text: `У фонді я відчула справжню командну роботу та підтримку.
Кожен крок має сенс, а результат видно в конкретних історіях людей.`,
  },
  {
    id: 3,
    name: 'Олександр С.',
    role: 'Координатор',
    text: `Це можливість застосувати свої навички для важливої справи.
Тут є відповідальність, розвиток і відчуття внеску у спільну мету.`,
  },
];

export const VolunteerPage = (_: PageProps) => {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const activeReview = REVIEWS[activeReviewIndex];

  return (
    <div className={styles.page}>
      <section className={styles.introSection}>
        <div className={styles.container}>
          <h1 className={clsx('h1', styles.title)}>Як стати волонтером</h1>

          <div className={styles.heroMedia} />

          <p className={styles.description}>
            Ми активно розширюємо нашу команду і запрошуємо людей з великим серцем долучитися до
            важливої місії - підтримки родин військовополонених та звільнених героїв. Якщо ти мрієш
            робити щось справді значуще, працювати з командою однодумців і змінювати світ на краще -
            ми чекаємо саме на тебе!
          </p>
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <h2 className={clsx('h2', styles.sectionTitle)}>Ти отримаєш</h2>

          <Cards
            items={BENEFITS}
            className={styles.benefitsGrid}
            cardClassName={styles.benefitCard}
            iconClassName={styles.benefitIcon}
            titleClassName={styles.benefitTitle}
          />

          <h2 className={clsx('h2', styles.sectionTitle, styles.reviewSectionTitle)}>Волонтери про нас</h2>

          <article className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.avatar} />
              <div>
                <div className={clsx('h3', styles.reviewerName)}>{activeReview.name}</div>
                <div className={styles.reviewerRole}>{activeReview.role}</div>
              </div>
            </div>

            <p className={styles.reviewText}>
              {activeReview.text}
            </p>

            <div className={styles.reviewPagination}>
              {REVIEWS.map((review, index) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => setActiveReviewIndex(index)}
                  className={clsx(
                    styles.pageButton,
                    activeReviewIndex === index && styles.pageButtonActive
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={clsx('h1', styles.ctaTitle)}>Хочеш бути частиною змін?</h2>
            <p className={styles.ctaText}>
              Фонд "Сила для Сильних" зростає і шукає людей із великим серцем та відкритою душею.
            </p>
            <p className={styles.ctaText}>
              Якщо ти хочеш допомагати родинам військовополонених, працювати з командою однодумців,
              втілювати соціальні ініціативи та вкладатися у справді важливе - ми чекаємо саме на тебе.
            </p>
            <Button label="Долучитися до команди" type={ButtonTypeEnum.Secondary} />
          </div>
        </div>
      </section>
    </div>
  );
};
