'use client';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from '../page.module.scss';

import { Button, ButtonTypeEnum, MemberCard } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';
import { getStrapiMedia } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';
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
  logoUrl?: string;
  website?: string;
};

type AmbassadorCard = {
  id: number;
  name: string;
  role: string;
  description?: Array<{
    type: string;
    children: Array<{
      type: string;
      text: string;
    }>;
  }> | null;
  image?: {
    data?: {
      attributes?: {
        url?: string | null;
        formats?: {
          medium?: {
            url?: string | null;
          };
        };
      };
    } | null;
  } | null;
  socials?: Array<{
    id: number;
    icon: 'linkedin' | 'facebook' | 'instagram';
    link: string;
  }> | null;
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

const PARTNERS_FALLBACK: PartnerCard[] = [
  { id: 1, title: 'Логотип' },
  { id: 2, title: 'Логотип' },
  { id: 3, title: 'Логотип' },
  { id: 4, title: 'Логотип' },
  { id: 5, title: 'Логотип' },
  { id: 6, title: 'Логотип' },
];

type PartnerApiResponse = {
  id: number;
  attributes: {
    name: string;
    website?: string | null;
    logo?: {
      data?: {
        attributes?: {
          url?: string | null;
        };
      } | null;
    };
  };
};

type HomePageApiResponse = {
  data?: {
    attributes?: {
      ambassadors?: Array<{
        id: number;
        name: string;
        role: string;
        description?: Array<{
          type: string;
          children?: Array<{
            type: string;
            text?: string;
          }>;
        }> | null;
        image?: {
          data?: {
            attributes?: {
              url?: string | null;
              formats?: {
                medium?: {
                  url?: string | null;
                };
              };
            };
          } | null;
        };
        socials?: Array<{
          icon?: 'linkedin' | 'facebook' | 'instagram';
          link?: string;
        }>;
      }>;
    };
  } | null;
};

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
  const partnerPlaceholderText = currentLocale === 'en' ? 'Place for your company' : 'Місце для вашої компанії';
  const containerClassName = clsx(
    'mx-auto',
    'w-[min(1460px,calc(100%-72px))]',
    'max-[1200px]:w-[min(1360px,calc(100%-56px))]',
    'max-[960px]:w-[min(1240px,calc(100%-40px))]',
    'max-[640px]:w-[min(1240px,calc(100%-24px))]',
    'max-[420px]:w-[min(1240px,calc(100%-16px))]'
  );
  const heroContainerClassName = 'w-full px-[52px] max-[960px]:px-5 max-[640px]:px-3 max-[420px]:px-2';
  const primaryActionClassName = clsx(
    'inline-flex min-h-[46px] items-center justify-center rounded-[10px]',
    'border border-transparent bg-white px-[30px] py-[14px]',
    'text-[16px] font-medium leading-6 text-[#181818]',
    'transition-colors hover:bg-[#f5f5f5] max-[640px]:w-full'
  );
  const secondaryActionClassName = clsx(
    'inline-flex min-h-[46px] items-center justify-center rounded-[10px]',
    'border border-transparent bg-[#efcb4c] px-[30px] py-[14px]',
    'text-[16px] font-medium leading-6 text-[#181818]',
    'transition-colors hover:bg-[#f5e094] max-[640px]:w-full'
  );
  const heroTitleClassName = clsx(
    'm-0 w-full text-center font-bold text-[86px] leading-[0.92]',
    'tracking-[-0.02em] text-[#151512]',
    'max-[1200px]:text-[72px] max-[960px]:text-[64px]',
    'max-[640px]:text-[48px] max-[420px]:text-[40px]'
  );
  const heroTextClassName = clsx(
    'm-0 w-full text-right text-[24px] leading-[1.15]',
    'font-medium text-[#151512]',
    'max-[1200px]:text-[22px] max-[960px]:text-[20px]',
    'max-[640px]:mx-auto max-[640px]:w-auto max-[640px]:text-center',
    'max-[640px]:text-[15px] max-[420px]:text-[13px]'
  );
  const heroMediaClassName = clsx(
    'relative mt-4 h-[695px] overflow-hidden bg-[#f3efe5]',
    'max-[1200px]:h-[clamp(260px,40vw,470px)]',
    'max-[960px]:h-[clamp(220px,42vw,300px)]',
    'max-[640px]:mt-4 max-[640px]:flex max-[640px]:h-auto',
    'max-[640px]:flex-col max-[640px]:gap-[10px] max-[640px]:p-[10px]'
  );
  const heroDescriptionClassName = clsx(
    'm-0 max-w-[470px] border px-3 py-[10px] text-[13px]',
    'leading-[1.4] text-[#2e2a21] backdrop-blur-[5px]',
    'max-[960px]:max-w-[calc(100%-24px)] max-[960px]:text-[12px]',
    'max-[960px]:leading-[1.35] max-[640px]:max-w-full',
    'max-[640px]:border-[#d7d7cf] max-[640px]:bg-[#efefeb]',
    'max-[640px]:text-[12px] max-[640px]:leading-[1.45]',
    'max-[640px]:backdrop-blur-none max-[420px]:px-[10px]',
    'max-[420px]:py-2 max-[420px]:text-[11px]',
    'min-[641px]:absolute min-[641px]:bottom-4 min-[641px]:right-4',
    'min-[641px]:border-white/80 min-[641px]:bg-[rgba(255,248,235,0.46)]',
    'min-[641px]:rounded-[2px]'
  );
  const aboutSectionClassName = clsx(
    'px-0 pb-[68px] pt-[46px]',
    'max-[960px]:pb-[50px] max-[960px]:pt-[38px]',
    'max-[640px]:py-[44px] max-[420px]:py-[32px]'
  );
  const aboutGridClassName = clsx(
    'mt-7 grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]',
    'gap-[18px] max-[960px]:grid-cols-1'
  );
  const aboutImageClassName = clsx(
    'h-[clamp(260px,24vw,360px)] w-full rounded-[2px] bg-[#cfcfcf]',
    'object-cover [object-position:center_62%]',
    'max-[960px]:h-[clamp(220px,32vw,300px)]'
  );
  const aboutContentClassName = clsx(
    'flex flex-col gap-[14px] text-[16px] leading-[1.62] text-[#464646]',
    'max-[640px]:text-[15px] max-[420px]:gap-[10px]',
    'max-[420px]:text-[14px] max-[420px]:leading-[1.5]'
  );

  const { data: partners = PARTNERS_FALLBACK } = useQuery<PartnerCard[]>({
    queryKey: ['partners', currentLocale],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/partners',
        urlParams: {
          locale: currentLocale,
          filters: {
            isHidden: {
              $ne: true,
            },
          },
          sort: ['position:asc', 'id:asc'],
          populate: {
            logo: {
              populate: '*',
            },
          },
        },
      });

      const items = Array.isArray(response?.data) ? (response.data as PartnerApiResponse[]) : [];

      return items.map(item => ({
        id: item.id,
        title: item.attributes.name,
        website: item.attributes.website || undefined,
        logoUrl: getStrapiMedia(item.attributes.logo?.data?.attributes?.url ?? ''),
      }));
    },
  });

  const { data: ambassadors = [] } = useQuery<AmbassadorCard[]>({
    queryKey: ['home-page', currentLocale, 'ambassadors'],
    queryFn: async () => {
      const response = (await fetchAPI({
        path: '/home-page',
        urlParams: {
          locale: currentLocale,
          populate: {
            ambassadors: {
              populate: {
                image: {
                  populate: '*',
                },
                socials: {
                  populate: '*',
                },
              },
            },
          },
        },
      })) as HomePageApiResponse;

      const items = response?.data?.attributes?.ambassadors || [];

      return items.map(item => ({
        id: item.id,
        name: item.name,
        role: item.role,
        description: (item.description || []).map(block => ({
          type: block.type || 'paragraph',
          children: (block.children || []).map(child => ({
            type: child.type || 'text',
            text: child.text || '',
          })),
        })),
        image: item.image
          ? {
              data: {
                attributes: {
                  url: getStrapiMedia(item.image?.data?.attributes?.url ?? ''),
                  formats: {
                    medium: {
                      url: getStrapiMedia(item.image?.data?.attributes?.formats?.medium?.url ?? ''),
                    },
                  },
                },
              },
            }
          : null,
        socials: (item.socials || [])
          .filter(
            social =>
              (social?.icon === 'linkedin' || social?.icon === 'facebook' || social?.icon === 'instagram') &&
              Boolean(social?.link)
          )
          .map((social, index) => ({
            id: index + 1,
            icon: social.icon as 'linkedin' | 'facebook' | 'instagram',
            link: social.link as string,
          })),
      }));
    },
  });

  const navigateTo = (path: string) => {
    router.push(`/${currentLocale}/${path}`);
  };

  return (
    <div className={styles.homePage}>
      <section className="px-0 pb-12 pt-8 max-[960px]:pb-10 max-[960px]:pt-7 max-[640px]:pb-7 max-[640px]:pt-6">
        <div className={heroContainerClassName}>
          <div className="flex w-full flex-col items-center gap-[6px] max-[640px]:gap-1">
            <h1 className={heroTitleClassName}>{heroContent.title}</h1>
            <p className={heroTextClassName}>{heroContent.text}</p>
          </div>

          <div className={heroMediaClassName}>
            <Image
              src="/images/hands-alt.png"
              alt="Підтримка родин військовополонених"
              className="h-full w-full rounded-[12px] object-cover object-center max-[640px]:h-[220px] max-[420px]:h-[190px]"
              width={1200}
              height={800}
            />
            <p className={heroDescriptionClassName}>{heroContent.description}</p>
          </div>
        </div>
      </section>

      <section className={aboutSectionClassName}>
        <div className={containerClassName}>
          <h2 className={styles.sectionTitle}>Про фонд</h2>

          <div className={aboutGridClassName}>
            <Image
              className={aboutImageClassName}
              src="/images/hands.jpg"
              alt="Команда фонду"
              width={1200}
              height={800}
            />

            <div className={aboutContentClassName}>
              <p className="m-0">
                Наша місія це сприяти звільненню військовополонених та підтримувати їхні родини у складні періоди
                очікування.
              </p>
              <p className="m-0">
                Ми обʼєднуємо фахівців і волонтерів, щоб допомога була системною, своєчасною і зрозумілою для кожної
                сімʼї.
              </p>
              <p className="m-0">
                Наші проєкти спрямовані на практичні рішення: інформаційний супровід, консультації, психологічну
                підтримку та соціальні ініціативи.
              </p>

              <div className="mt-3 flex flex-wrap gap-3 max-[640px]:flex-col max-[640px]:items-stretch max-[420px]:gap-2">
                <button type="button" className={primaryActionClassName} onClick={() => navigateTo('projects')}>
                  Наші проєкти
                </button>
                <button
                  type="button"
                  className={secondaryActionClassName}
                  onClick={() => navigateTo('documents-and-reports/reports')}
                >
                  Звітність організації
                </button>
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
            {partners.map((partner: PartnerCard) => (
              <div key={partner.id} className={styles.partnerCard}>
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noreferrer" aria-label={partner.title}>
                    {partner.logoUrl ? <img src={partner.logoUrl} alt={partner.title} /> : <span>{partner.title}</span>}
                  </a>
                ) : partner.logoUrl ? (
                  <span>
                    <img src={partner.logoUrl} alt={partner.title} />
                  </span>
                ) : (
                  <span>{partner.title}</span>
                )}
              </div>
            ))}
            <div className={clsx(styles.partnerCard, styles.partnerCardHighlight)}>{partnerPlaceholderText}</div>
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
            {ambassadors.map(ambassador => (
              <MemberCard key={ambassador.id} member={ambassador} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
