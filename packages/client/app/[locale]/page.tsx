'use client';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from '../page.module.scss';

import { Button, ButtonTypeEnum, LiquidGlass, MemberCard } from '@/app/components/shared';
import type { SocialName } from '@/app/components/shared/Socials/types';
import { useApp } from '@/app/context/AppContext';
import { getStrapiMedia } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';

type ActivityCard = {
  id: number;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

type MediaCard = {
  id: number;
  date: string;
  title: string;
  link?: string;
  imageUrl?: string;
};

type PartnerCard = {
  id: number;
  title: string;
  logoUrl?: string;
  website?: string;
};

type PartnerListItemWithAttributes = {
  id: number;
  attributes?: {
    name?: string | null;
    website?: string | null;
    logo?: {
      data?: {
        attributes?: {
          url?: string | null;
        };
      } | null;
    } | null;
  };
};

type PartnerListItemFlat = {
  id: number;
  name?: string | null;
  website?: string | null;
  logo?: {
    url?: string | null;
    data?: {
      attributes?: {
        url?: string | null;
      };
    } | null;
  } | null;
};

type PartnerListItem = PartnerListItemWithAttributes | PartnerListItemFlat;

type NewsListItemWithAttributes = {
  id: number;
  attributes?: {
    title?: string | null;
    date?: string | null;
    link?: string | null;
    image?: {
      data?: {
        attributes?: {
          url?: string | null;
        };
      } | null;
    } | null;
  };
};

type NewsListItemFlat = {
  id: number;
  title?: string | null;
  date?: string | null;
  link?: string | null;
  image?: {
    url?: string | null;
    data?: {
      attributes?: {
        url?: string | null;
      };
    } | null;
  } | null;
};

type NewsListItem = NewsListItemWithAttributes | NewsListItemFlat;

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
    icon: SocialName;
    link: string;
  }> | null;
};

type AmbassadorSocial = NonNullable<AmbassadorCard['socials']>[number];

const ambassadorSocialIcons = new Set<SocialName>([
  'telegram',
  'linkedin',
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'spotify',
]);

const isSocialName = (icon: unknown): icon is SocialName =>
  typeof icon === 'string' && ambassadorSocialIcons.has(icon as SocialName);

type HomePageApiResponse = {
  data?: {
    attributes?: {
      introSection?: {
        title?: string | null;
        subtitle?: string | null;
        description?: string | null;
        image?: {
          data?: {
            attributes?: {
              url?: string | null;
            };
          } | null;
        } | null;
        imageAlt?: string | null;
      } | null;
      aboutSection?: {
        title?: string | null;
        description?: string | null;
        image?: {
          data?: {
            attributes?: {
              url?: string | null;
            };
          } | null;
        } | null;
        imageAlt?: string | null;
        primaryButtonLabel?: string | null;
        primaryButtonLink?: string | null;
        secondaryButtonLabel?: string | null;
        secondaryButtonLink?: string | null;
      } | null;
      activitiesSection?: {
        title?: string | null;
        items?: Array<{
          id: number;
          title?: string | null;
          description?: string | null;
          image?: {
            data?: {
              attributes?: {
                url?: string | null;
              };
            } | null;
          } | null;
          imageAlt?: string | null;
        }> | null;
      } | null;
      newsSection?: {
        title?: string | null;
        newsList?:
          | {
              data?: Array<{
                id: number;
                attributes?: {
                  title?: string | null;
                  date?: string | null;
                  link?: string | null;
                };
              }> | null;
            }
          | Array<{
              id: number;
              title?: string | null;
              date?: string | null;
              link?: string | null;
            }>
          | null;
      } | null;
      partnersSection?: {
        title?: string | null;
        buttonLabel?: string | null;
        buttonLink?: string | null;
        partnersList?:
          | {
              data?: Array<{
                id: number;
                attributes?: {
                  name?: string | null;
                  website?: string | null;
                  logo?: {
                    data?: {
                      attributes?: {
                        url?: string | null;
                      };
                    } | null;
                  } | null;
                };
              }> | null;
            }
          | Array<{
              id: number;
              name?: string | null;
              website?: string | null;
              logo?: {
                url?: string | null;
                data?: {
                  attributes?: {
                    url?: string | null;
                  };
                } | null;
              } | null;
            }>
          | null;
      } | null;
      helpSection?: {
        title?: string | null;
        description?: string | null;
        secondaryDescription?: string | null;
        buttonLabel?: string | null;
        buttonLink?: string | null;
      } | null;
      ambassadorsSection?: {
        title?: string | null;
        ambassadorsList?: Array<{
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
            icon?: SocialName;
            link?: string;
          }>;
        }> | null;
      } | null;
    };
  } | null;
};

type AboutSectionContent = {
  title: string;
  description: string[];
  imageUrl: string;
  imageAlt: string;
  primaryButtonLabel: string;
  primaryButtonLink: string;
  secondaryButtonLabel: string;
  secondaryButtonLink: string;
};

type HelpSectionContent = {
  title: string;
  description: string;
  secondaryDescription: string;
  buttonLabel: string;
  buttonLink: string;
};

type IntroSectionContent = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

type ActivitiesSectionContent = {
  title: string;
  items: ActivityCard[];
};

type HomePageContent = {
  introSection: IntroSectionContent | null;
  aboutSection: AboutSectionContent | null;
  activitiesSection: ActivitiesSectionContent | null;
  newsSectionTitle: string;
  helpSection: HelpSectionContent | null;
  partnersSectionTitle: string;
  partnersSectionButtonLabel: string;
  partnersSectionButtonLink: string;
  partners: PartnerCard[];
  ambassadorsSectionTitle: string;
  ambassadors: AmbassadorCard[];
  mediaItems: MediaCard[];
};

const formatNewsDate = (date: string) => {
  if (!date) {
    return '';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();

  return `${day}.${month}.${year}`;
};

const extractRelationItems = <T extends { id: number }>(relation?: { data?: T[] | null } | T[] | null) => {
  if (!relation) {
    return [];
  }

  if (Array.isArray(relation)) {
    return relation;
  }

  return relation.data || [];
};

const isPartnerListItemWithAttributes = (item: PartnerListItem): item is PartnerListItemWithAttributes =>
  'attributes' in item;

const isNewsListItemWithAttributes = (item: NewsListItem): item is NewsListItemWithAttributes => 'attributes' in item;

const mapPartnerListItem = (item: PartnerListItem): PartnerCard => {
  if (isPartnerListItemWithAttributes(item)) {
    return {
      id: item.id,
      title: item.attributes?.name || '',
      website: item.attributes?.website || undefined,
      logoUrl: getStrapiMedia(item.attributes?.logo?.data?.attributes?.url ?? ''),
    };
  }

  return {
    id: item.id,
    title: item.name || '',
    website: item.website || undefined,
    logoUrl: getStrapiMedia(item.logo?.data?.attributes?.url || item.logo?.url || ''),
  };
};

const mapNewsListItem = (item: NewsListItem): MediaCard => {
  if (isNewsListItemWithAttributes(item)) {
    return {
      id: item.id,
      title: item.attributes?.title || '',
      date: formatNewsDate(item.attributes?.date || ''),
      link: item.attributes?.link || undefined,
      imageUrl: getStrapiMedia(item.attributes?.image?.data?.attributes?.url ?? ''),
    };
  }

  return {
    id: item.id,
    title: item.title || '',
    date: formatNewsDate(item.date || ''),
    link: item.link || undefined,
    imageUrl: getStrapiMedia(item.image?.data?.attributes?.url || item.image?.url || ''),
  };
};

const mapHomePageData = (response: HomePageApiResponse): HomePageContent => {
  const attributes = response?.data?.attributes;
  const intro = attributes?.introSection;
  const about = attributes?.aboutSection;
  const activities = attributes?.activitiesSection;
  const newsSection = attributes?.newsSection;
  const partnersSection = attributes?.partnersSection;
  const help = attributes?.helpSection;
  const ambassadorsSection = attributes?.ambassadorsSection;

  const partners = extractRelationItems<PartnerListItem>(partnersSection?.partnersList).map(mapPartnerListItem);

  const ambassadors = (ambassadorsSection?.ambassadorsList || []).map(item => ({
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
        (
          social
        ): social is {
          icon: AmbassadorSocial['icon'];
          link: string;
        } => isSocialName(social?.icon) && typeof social?.link === 'string' && social.link.length > 0
      )
      .map((social, index) => ({
        id: index + 1,
        icon: social.icon,
        link: social.link,
      })),
  }));

  const mediaItems = extractRelationItems<NewsListItem>(newsSection?.newsList).map(mapNewsListItem);

  return {
    introSection: intro
      ? {
          title: intro.title || '',
          subtitle: intro.subtitle || '',
          description: intro.description || '',
          imageUrl: getStrapiMedia(intro.image?.data?.attributes?.url ?? ''),
          imageAlt: intro.imageAlt || '',
        }
      : null,
    aboutSection: about
      ? {
          title: about.title || '',
          description: (about.description || '')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean),
          imageUrl: getStrapiMedia(about.image?.data?.attributes?.url ?? ''),
          imageAlt: about.imageAlt || '',
          primaryButtonLabel: about.primaryButtonLabel || '',
          primaryButtonLink: about.primaryButtonLink || '',
          secondaryButtonLabel: about.secondaryButtonLabel || '',
          secondaryButtonLink: about.secondaryButtonLink || '',
        }
      : null,
    activitiesSection: activities
      ? {
          title: activities.title || '',
          items: (activities.items || []).map(item => ({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            image: getStrapiMedia(item.image?.data?.attributes?.url ?? ''),
            imageAlt: item.imageAlt || item.title || '',
          })),
        }
      : null,
    newsSectionTitle: newsSection?.title || '',
    helpSection: help
      ? {
          title: help.title || '',
          description: help.description || '',
          secondaryDescription: help.secondaryDescription || '',
          buttonLabel: help.buttonLabel || '',
          buttonLink: help.buttonLink || '',
        }
      : null,
    partnersSectionTitle: partnersSection?.title || '',
    partnersSectionButtonLabel: partnersSection?.buttonLabel || '',
    partnersSectionButtonLink: partnersSection?.buttonLink || '',
    partners,
    ambassadorsSectionTitle: ambassadorsSection?.title || '',
    ambassadors,
    mediaItems,
  };
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

  // Auto-height: Embla lays slides out as equal-height flex siblings, so short
  // slides inherit the tallest slide's height and leave an empty gap below.
  // Resize the viewport to the active slide's card height on select/resize.
  useEffect(() => {
    if (!activitiesApi) return;

    const viewport = activitiesApi.rootNode();

    const syncHeight = () => {
      const index = activitiesApi.selectedScrollSnap();
      const slide = activitiesApi.slideNodes()[index];
      const card = slide?.firstElementChild as HTMLElement | undefined;
      if (viewport && card) {
        viewport.style.height = `${card.offsetHeight}px`;
      }
    };

    syncHeight();
    activitiesApi.on('select', syncHeight);
    activitiesApi.on('reInit', syncHeight);
    window.addEventListener('resize', syncHeight);

    return () => {
      activitiesApi.off('select', syncHeight);
      activitiesApi.off('reInit', syncHeight);
      window.removeEventListener('resize', syncHeight);
    };
  }, [activitiesApi]);

  const currentLocale = locale || 'uk';
  const partnerPlaceholderText = currentLocale === 'en' ? 'Place for your company' : 'Місце для вашої компанії';

  const { data: homePageData, isLoading } = useQuery<HomePageContent>({
    queryKey: ['home-page', currentLocale],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response = (await fetchAPI({
        path: '/home-page',
        urlParams: {
          locale: currentLocale,
          populate: {
            introSection: {
              populate: {
                image: {
                  populate: '*',
                },
              },
            },
            aboutSection: {
              populate: {
                image: {
                  populate: '*',
                },
              },
            },
            activitiesSection: {
              populate: {
                items: {
                  populate: {
                    image: {
                      populate: '*',
                    },
                  },
                },
              },
            },
            newsSection: {
              populate: {
                newsList: {
                  sort: ['position:asc', 'id:asc'],
                  populate: '*',
                },
              },
            },
            partnersSection: {
              populate: {
                partnersList: {
                  sort: ['position:asc', 'id:asc'],
                  filters: {
                    isHidden: {
                      $ne: true,
                    },
                  },
                  populate: {
                    logo: {
                      populate: '*',
                    },
                  },
                },
              },
            },
            helpSection: {
              populate: '*',
            },
            ambassadorsSection: {
              populate: {
                ambassadorsList: {
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
          },
        },
      })) as HomePageApiResponse;

      return mapHomePageData(response);
    },
  });
  const introSection = homePageData?.introSection || null;
  const aboutSection = homePageData?.aboutSection || null;
  const activitiesSection = homePageData?.activitiesSection || null;
  const newsSectionTitle = homePageData?.newsSectionTitle || '';
  const helpSection = homePageData?.helpSection || null;
  const partnersSectionTitle = homePageData?.partnersSectionTitle || '';
  const partnersSectionButtonLabel = homePageData?.partnersSectionButtonLabel || '';
  const partnersSectionButtonLink = homePageData?.partnersSectionButtonLink || '';
  const partners = homePageData?.partners || [];
  const ambassadorsSectionTitle = homePageData?.ambassadorsSectionTitle || '';
  const ambassadors = homePageData?.ambassadors || [];
  const mediaItems = homePageData?.mediaItems || [];

  const navigateTo = (path: string) => {
    router.push(`/${currentLocale}/${path}`);
  };

  if (isLoading) {
    return (
      <div className={styles.homePage}>
        <div className="px-[52px] pt-8 max-[960px]:px-5 max-[640px]:px-3 max-[420px]:px-3">
          <div className="mb-4 h-[72px] w-3/4 animate-pulse rounded-lg bg-[#e8e5de] mx-auto" />
          <div
            className="h-[695px] max-[1200px]:h-[clamp(260px,40vw,470px)]
            max-[960px]:h-[clamp(220px,42vw,300px)] animate-pulse rounded-xl bg-[#e8e5de]"
          />
        </div>
        <div className="px-[52px] py-[68px] max-[960px]:px-5 max-[640px]:px-3">
          <div className="mx-auto mb-12 h-10 w-1/3 animate-pulse rounded-lg bg-[#e8e5de]" />
          <div className="flex gap-8 max-[960px]:flex-col">
            <div
              className="flex-1 animate-pulse rounded-xl bg-[#e8e5de]"
              style={{ minHeight: 'clamp(320px,28vw,520px)' }}
            />
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-5 animate-pulse rounded bg-[#e8e5de]" style={{ width: `${90 - i * 8}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      {introSection ? (
        <section
          className="mb-[120px] px-[52px] pt-8 max-[960px]:mb-0 max-[960px]:px-5 max-[960px]:pb-10 max-[960px]:pt-7
          max-[640px]:px-3 max-[640px]:pb-7 max-[640px]:pt-6 max-[420px]:px-3"
        >
          <div className="w-full">
            <div className="flex w-full flex-col items-center gap-[6px] max-[640px]:gap-1">
              <h1
                className="m-0 w-full text-center font-bold text-[125px] leading-[0.92] text-[#151512]
                max-[1200px]:text-[86px] max-[960px]:text-[64px] max-[640px]:text-[48px] max-[420px]:text-[40px]"
              >
                {introSection.title}
              </h1>
              <p
                className={clsx(
                  styles.introSubtitle,
                  `m-0 w-full text-[28px] leading-[32px] font-bold text-[#151512]
                  max-[1200px]:text-[22px] max-[1200px]:leading-[1.15] max-[960px]:text-[20px] max-[640px]:mx-auto max-[640px]:w-auto
                  max-[640px]:text-[15px] max-[420px]:text-[13px]`
                )}
              >
                {introSection.subtitle}
              </p>
            </div>

            <div
              className="relative mt-4 h-[695px] overflow-hidden rounded-[12px] bg-[#f3efe5]
              max-[1200px]:h-[clamp(260px,40vw,470px)]
              max-[960px]:h-[clamp(220px,42vw,300px)]
              max-[640px]:mt-4 max-[640px]:h-[360px] max-[420px]:h-[320px]"
            >
              {introSection.imageUrl ? (
                <Image
                  src={introSection.imageUrl}
                  alt={introSection.imageAlt}
                  className="h-full w-full rounded-[12px] object-cover object-center"
                  width={1200}
                  height={800}
                />
              ) : (
                <div className="h-full w-full rounded-[12px] bg-[#f3efe5]" />
              )}
              <LiquidGlass
                tint="neutral"
                intensity="subtle"
                /* Clear translucent plate — minimal blur keeps the photo
                   readable through it so the edge refraction (displacement)
                   stays visible, matching the design's glass-rim look.
                   Inline style wins over TINT_CLASS regardless of utility order. */
                style={{ background: 'rgba(255, 255, 255, 0.12)' }}
                className="absolute right-8 bottom-20 max-w-[610px] rounded-[14px] px-6 py-6
                max-[1200px]:right-5 max-[1200px]:bottom-5 max-[1200px]:max-w-[520px] max-[1200px]:py-5
                max-[960px]:right-4 max-[960px]:bottom-4 max-[960px]:max-w-[calc(100%-32px)] max-[960px]:px-5 max-[960px]:py-4
                max-[640px]:right-3 max-[640px]:bottom-3 max-[640px]:left-3 max-[640px]:max-w-none max-[640px]:px-4 max-[640px]:py-3
                max-[420px]:right-2 max-[420px]:bottom-2 max-[420px]:left-2 max-[420px]:px-[14px] max-[420px]:py-[10px]"
              >
                <p
                  className="m-0 text-[20px] leading-[24px] font-bold text-[var(--black-100)]
                  max-[1200px]:text-[18px] max-[1200px]:leading-[1.35]
                  max-[960px]:text-[16px]
                  max-[640px]:text-[14px] max-[640px]:leading-[1.4]
                  max-[420px]:text-[13px]"
                >
                  {introSection.description}
                </p>
              </LiquidGlass>
            </div>
          </div>
        </section>
      ) : null}

      {aboutSection ? (
        <section
          className="px-[52px] pb-[68px] max-[960px]:px-5 max-[960px]:pb-[50px] max-[960px]:pt-[38px]
          max-[640px]:px-3 max-[640px]:py-[44px] max-[420px]:px-3 max-[420px]:py-[32px]"
        >
          <div className="w-full">
            <h2 className={styles.sectionTitle}>{aboutSection.title}</h2>

            <div className="mt-[58px] flex w-full items-start justify-around gap-[32px] max-[1200px]:gap-6 max-[960px]:mt-10 max-[960px]:flex-col max-[960px]:gap-6 max-[640px]:mt-7">
              <div className="flex flex-1 max-[960px]:block max-[960px]:w-full">
                {aboutSection.imageUrl ? (
                  <Image
                    className="h-[clamp(420px,34vw,580px)] w-full rounded-[10px] bg-[#cfcfcf]
                    object-cover [object-position:center_62%]
                    max-[960px]:h-[clamp(280px,38vw,360px)] max-[640px]:h-[240px] max-[420px]:h-[210px]"
                    src={aboutSection.imageUrl}
                    alt={aboutSection.imageAlt}
                    width={1200}
                    height={800}
                  />
                ) : (
                  <div
                    className="h-[clamp(420px,34vw,580px)] w-full rounded-[10px] bg-[#cfcfcf]
                    max-[960px]:h-[clamp(280px,38vw,360px)] max-[640px]:h-[240px] max-[420px]:h-[210px]"
                    aria-hidden
                  />
                )}
              </div>

              <div
                className="flex h-[clamp(420px,34vw,580px)] w-full flex-1 flex-col gap-[14px] text-[16px]
                leading-[1.62] text-justify text-[#151512] max-[960px]:h-auto max-[640px]:text-[15px]
                max-[420px]:gap-[10px] max-[420px]:text-[14px] max-[420px]:leading-[1.5]"
              >
                {aboutSection.description.map((paragraph, index) => (
                  <p key={`${aboutSection.title}-${index}`} className="m-0">
                    {paragraph}
                  </p>
                ))}

                <div className="mt-auto pt-3 flex flex-wrap gap-6 max-[640px]:flex-col max-[640px]:items-stretch max-[420px]:gap-2">
                  {aboutSection.primaryButtonLabel && aboutSection.primaryButtonLink ? (
                    <button
                      type="button"
                      className="inline-flex min-h-[46px] items-center justify-center rounded-[10px]
                      border-2 border-[#484838] bg-white px-[30px] py-[14px] text-[16px] font-medium leading-6
                      text-[#181818] transition-colors hover:bg-[#f5f5f5] max-[640px]:w-full"
                      onClick={() => navigateTo(aboutSection.primaryButtonLink)}
                    >
                      {aboutSection.primaryButtonLabel}
                    </button>
                  ) : null}
                  {aboutSection.secondaryButtonLabel && aboutSection.secondaryButtonLink ? (
                    <button
                      type="button"
                      className="inline-flex min-h-[46px] items-center justify-center rounded-[10px]
                      border border-transparent bg-[#efcb4c] px-[30px] py-[14px] text-[16px] font-medium leading-6
                      text-[#181818] transition-colors hover:bg-[#f5e094] max-[640px]:w-full"
                      onClick={() => navigateTo(aboutSection.secondaryButtonLink)}
                    >
                      {aboutSection.secondaryButtonLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activitiesSection ? (
        <section className={styles.activitiesSection}>
          <div className="w-full px-[52px] max-[960px]:px-5 max-[640px]:px-3 max-[420px]:px-3">
            <h2 className={clsx(styles.sectionTitle, styles.sectionTitleLight)}>{activitiesSection.title}</h2>

            <Carousel setApi={setActivitiesApi} opts={{ align: 'start' }} className={styles.activitiesCarousel}>
              <CarouselContent>
                {activitiesSection.items.map(activity => (
                  <CarouselItem key={activity.id} className={styles.activitySlide}>
                    <article className={styles.activityCard}>
                      <div className={styles.activityColumn}>
                        <div className={styles.activityContent}>
                          <h3>{activity.title}</h3>
                          <p>{activity.description}</p>
                        </div>

                        <div className={styles.pagination}>
                          {activitiesSection.items.map((item, index) => (
                            <button
                              key={item.id}
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

                      <div className={styles.activityMedia}>
                        {activity.image ? (
                          <Image
                            src={activity.image}
                            alt={activity.imageAlt || activity.title}
                            width={1200}
                            height={800}
                          />
                        ) : (
                          <div className={styles.activityPlaceholder} />
                        )}
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
      ) : null}

      {helpSection ? (
        <section className={styles.helpSection}>
          <div className={styles.container}>
            <div className={styles.helpInner}>
              <h2 className={styles.sectionTitle}>{helpSection.title}</h2>
              <div>
                {helpSection.description ? <p className={styles.helpText}>{helpSection.description}</p> : null}
                {helpSection.secondaryDescription ? (
                  <p className={styles.helpText}>{helpSection.secondaryDescription}</p>
                ) : null}
              </div>

              {helpSection.buttonLabel && helpSection.buttonLink ? (
                <Button
                  label={helpSection.buttonLabel}
                  type={ButtonTypeEnum.Secondary}
                  onClick={() => navigateTo(helpSection.buttonLink)}
                />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {mediaItems.length > 0 ? (
        <section className={styles.mediaSection}>
          <div className={styles.mediaContainer}>
            <h2 className={clsx(styles.sectionTitle, styles.sectionTitleLight)}>{newsSectionTitle}</h2>

            <div className={styles.mediaGrid}>
              {mediaItems.map(item => (
                <article key={item.id} className={styles.mediaCard}>
                  <div className={styles.mediaPreview}>
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} width={425} height={320} /> : null}
                  </div>
                  <div className={styles.mediaBody}>
                    <p className={styles.mediaDate}>{item.date}</p>
                    <h3 className={styles.mediaTitle}>{item.title}</h3>
                    <button
                      type="button"
                      className={styles.moreButton}
                      onClick={() =>
                        item.link ? window.open(item.link, '_blank', 'noopener,noreferrer') : navigateTo('news')
                      }
                    >
                      Детальніше
                      <Image src="/images/arrow-right.svg" alt="" aria-hidden width={20} height={20} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.partnersSection}>
        <div className={styles.partnersContainer}>
          <h2 className={styles.sectionTitle}>{partnersSectionTitle}</h2>

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

          {partnersSectionButtonLabel && partnersSectionButtonLink ? (
            <div className={styles.partnersAction}>
              <Button
                label={partnersSectionButtonLabel}
                type={ButtonTypeEnum.Secondary}
                onClick={() => navigateTo(partnersSectionButtonLink)}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.ambassadorsSection}>
        <div className={styles.ambassadorsContainer}>
          <h2 className={styles.sectionTitle}>{ambassadorsSectionTitle}</h2>

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
