'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from '../page.module.scss';

import { FacebookIcon, InstagramIcon, LinkedinIcon } from '@/app/components/icons';
import { Button, ButtonTypeEnum } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';

type ActivityCard = {
  id: number;
  title: string;
  description: string;
  image?: string;
};

type MediaCard = {
  id: number;
  date: string;
  title: string;
};

type PartnerCard = {
  id: number;
  title: string;
  isHighlight?: boolean;
};

type AmbassadorCard = {
  id: number;
  name: string;
  role: string;
  description: string;
};

const ACTIVITIES: ActivityCard[] = [
  {
    id: 1,
    title: 'Соціальні проєкти',
    description:
      'Ми реалізуємо ініціативи для родин військовополонених та звільнених героїв:' +
      ' гуманітарні збори, адресну підтримку, локальні події та інформування суспільства.',
    image: '/images/hands.jpg',
  },
  {
    id: 2,
    title: 'Психологічна допомога',
    description:
      'Організовуємо індивідуальні консультації, групи підтримки та практичні зустрічі' +
      ' для тих, хто проживає складний період очікування або повернення близьких.',
    image: '/images/hands.jpg',
  },
  {
    id: 3,
    title: 'Консультаційний напрямок',
    description:
      'Надаємо базову юридичну та організаційну підтримку, допомагаємо сформувати' +
      ' подальші кроки та супроводжуємо в комунікації з профільними структурами.',
  },
];

const MEDIA_ITEMS: MediaCard[] = [
  {
    id: 1,
    date: '15.09.2025',
    title: 'Заголовок може бути максимально на три рядки',
  },
  {
    id: 2,
    date: '15.09.2025',
    title: 'Заголовок може бути максимально на три рядки',
  },
  {
    id: 3,
    date: '15.09.2025',
    title: 'Заголовок може бути максимально на три рядки',
  },
];

const PARTNERS: PartnerCard[] = [
  { id: 1, title: 'Логотип' },
  { id: 2, title: 'Логотип' },
  { id: 3, title: 'Логотип' },
  { id: 4, title: 'Логотип' },
  { id: 5, title: 'Логотип' },
  { id: 6, title: 'Логотип' },
  { id: 7, title: 'Місце для вашої компанії', isHighlight: true },
];

const AMBASSADORS: AmbassadorCard[] = [
  {
    id: 1,
    name: 'Імʼя Прізвище',
    role: 'Посада',
    description: 'Короткий опис',
  },
  {
    id: 2,
    name: 'Анастасія Чакабуш',
    role: 'Голова фонду',
    description: 'Короткий опис',
  },
  {
    id: 3,
    name: 'Анастасія Чакабуш',
    role: 'Голова фонду',
    description: 'Короткий опис',
  },
];

const HERO_CONTENT: Record<
  string,
  {
    description: string;
    text: string;
    title: string;
  }
> = {
  uk: {
    text: 'Благодійний фонд',
    title: 'Сила для сильних',
    description:
      'Ми прагнемо повернути героїв додому, підтримати їхніх близьких і привернути увагу суспільства' +
      ' до цієї проблеми.',
  },
  en: {
    text: 'Charity fund',
    title: 'Strength for the strong',
    description:
      'We strive to bring the heroes home, support their loved ones, and draw public attention to this problem.',
  },
};

export default function Home() {
  const { locale } = useApp();
  const router = useRouter();

  const [activitiesApi, setActivitiesApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!activitiesApi) return;

    const syncSlide = () => {
      setCurrentSlide(activitiesApi.selectedScrollSnap());
    };

    syncSlide();
    activitiesApi.on('select', syncSlide);
    activitiesApi.on('reInit', syncSlide);

    return () => {
      activitiesApi.off('select', syncSlide);
      activitiesApi.off('reInit', syncSlide);
    };
  }, [activitiesApi]);

  const currentLocale = locale || 'uk';
  const heroContent = HERO_CONTENT[currentLocale] || HERO_CONTENT.uk;

  const navigateTo = (path: string) => {
    router.push(`/${currentLocale}/${path}`);
  };

  return (
    <div className={styles.homePage}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroTitle}>{heroContent.title}</h1>
            <p className={styles.heroText}>{heroContent.text}</p>
          </div>

          <div className={styles.heroMedia}>
            <Image
              src="/images/hands.jpg"
              alt="Підтримка родин військовополонених"
              className={styles.heroImage}
              width={1200}
              height={800}
            />
            <p className={styles.heroDescription}>{heroContent.description}</p>
          </div>
        </div>
      </section>

      <section className={styles.aboutSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Про фонд</h2>

          <div className={styles.aboutGrid}>
            <Image
              className={styles.aboutImage}
              src="/images/hands.jpg"
              alt="Команда фонду"
              width={1200}
              height={800}
            />

            <div className={styles.aboutContent}>
              <p>
                Наша місія це сприяти звільненню військовополонених та підтримувати їхні родини у складні періоди
                очікування.
              </p>
              <p>
                Ми обʼєднуємо фахівців і волонтерів, щоб допомога була системною, своєчасною і зрозумілою для кожної
                сімʼї.
              </p>
              <p>
                Наші проєкти спрямовані на практичні рішення: інформаційний супровід, консультації, психологічну
                підтримку та соціальні ініціативи.
              </p>

              <div className={styles.aboutActions}>
                <Button label="Наші проєкти" type={ButtonTypeEnum.Primary} onClick={() => navigateTo('projects')} />
                <Button
                  label="Звітність організації"
                  type={ButtonTypeEnum.Secondary}
                  onClick={() => navigateTo('documents-and-reports/reports')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.activitiesSection}>
        <div className={styles.container}>
          <h2 className={clsx(styles.sectionTitle, styles.sectionTitleLight)}>Напрямки діяльності</h2>

          <Carousel setApi={setActivitiesApi} opts={{ align: 'start' }} className={styles.activitiesCarousel}>
            <CarouselContent>
              {ACTIVITIES.map(activity => (
                <CarouselItem key={activity.id} className={styles.activitySlide}>
                  <article className={styles.activityCard}>
                    <div className={styles.activityContent}>
                      <h3>{activity.title}</h3>
                      <p>{activity.description}</p>
                    </div>

                    <div className={styles.activityMedia}>
                      {activity.image ? (
                        <Image src={activity.image} alt={activity.title} width={1200} height={800} />
                      ) : (
                        <div className={styles.activityPlaceholder} />
                      )}
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className={styles.pagination}>
            {ACTIVITIES.map((activity, index) => (
              <button
                key={activity.id}
                type="button"
                className={clsx(styles.pageDot, index === currentSlide && styles.activeDot)}
                onClick={() => activitiesApi?.scrollTo(index)}
                aria-label={`Перейти до слайда ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.helpSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Потрібна допомога?</h2>
          <p className={styles.helpText}>
            Фонд &quot;Сила для Сильних&quot; зростає і шукає людей із великим серцем та відкритою душею.
          </p>
          <p className={styles.helpText}>
            Якщо ти хочеш допомагати родинам військовополонених, працювати з командою однодумців, втілювати соціальні
            ініціативи та вкладатися у справді важливе.
          </p>

          <Button
            label="Заповнити анкету"
            type={ButtonTypeEnum.Secondary}
            onClick={() => navigateTo('partnership/become-partner')}
          />
        </div>
      </section>

      <section className={styles.mediaSection}>
        <div className={styles.container}>
          <h2 className={clsx(styles.sectionTitle, styles.sectionTitleLight)}>Ми в медіа</h2>

          <div className={styles.mediaGrid}>
            {MEDIA_ITEMS.map(item => (
              <article key={item.id} className={styles.mediaCard}>
                <div className={styles.mediaPreview} />
                <div className={styles.mediaBody}>
                  <p className={styles.mediaDate}>{item.date}</p>
                  <h3 className={styles.mediaTitle}>{item.title}</h3>
                  <button type="button" className={styles.moreButton} onClick={() => navigateTo('news')}>
                    Детальніше
                    <Image src="/images/arrow-right.svg" alt="" aria-hidden width={20} height={20} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partnersSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Наші партнери</h2>

          <div className={styles.partnersGrid}>
            {PARTNERS.map(partner => (
              <div
                key={partner.id}
                className={clsx(styles.partnerCard, partner.isHighlight && styles.partnerCardHighlight)}
              >
                {partner.title}
              </div>
            ))}
          </div>

          <div className={styles.partnersAction}>
            <Button
              label="Стати партнером"
              type={ButtonTypeEnum.Secondary}
              onClick={() => navigateTo('partnership/become-partner')}
            />
          </div>
        </div>
      </section>

      <section className={styles.ambassadorsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Амбасадори фонду</h2>

          <div className={styles.ambassadorsGrid}>
            {AMBASSADORS.map(ambassador => (
              <article key={ambassador.id} className={styles.ambassadorCard}>
                <div className={styles.ambassadorPhoto}>
                  <div className={styles.ambassadorOverlay}>
                    <div>
                      <div className={styles.ambassadorName}>{ambassador.name}</div>
                      <div className={styles.ambassadorRole}>{ambassador.role}</div>
                    </div>

                    <div className={styles.socials}>
                      <a href="#" aria-label="linkedin">
                        <LinkedinIcon width="18" height="18" color="#484838" />
                      </a>
                      <a href="#" aria-label="facebook">
                        <FacebookIcon width="18" height="18" color="#484838" />
                      </a>
                      <a href="#" aria-label="instagram">
                        <InstagramIcon width="18" height="18" color="#484838" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles.ambassadorDescription}>{ambassador.description}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
