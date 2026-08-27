import { useQuery } from '@tanstack/react-query';

import { fetchAPI } from '@/app/utils/fetch-api';

type StrapiImage = {
  data?: {
    id?: number;
    attributes?: {
      url?: string | null;
      name?: string | null;
      alternativeText?: string | null;
    };
  } | null;
};

export type PartnershipRequestFormContent = {
  heading: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  consentText: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
  fieldErrorMessage: string;
};

export type PartnerPageContent = {
  title: string;
  background?: StrapiImage;
  description: string;
  requestTitle: string;
  alternativeChannelsTitle: string;
  phoneLabel: string;
  emailLabel: string;
  privacyText: string;
  form: PartnershipRequestFormContent;
};

export type VolunteerPageContent = {
  title: string;
  background?: StrapiImage;
  description: string;
  benefitsTitle: string;
  benefits: Array<{
    id: number;
    title: string;
  }>;
  testimonialsTitle: string;
  ctaTitle: string;
  ctaDescription: string;
  vacanciesButtonLabel: string;
};

export const usePartnerPageContent = (locale: string) =>
  useQuery<PartnerPageContent | null>({
    queryKey: ['partner-page', locale],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/partner-page',
        urlParams: {
          locale,
          populate: {
            background: '*',
            form: '*',
          },
        },
      });

      return response?.data?.attributes || null;
    },
  });

export const useVolunteerPageContent = (locale: string) =>
  useQuery<VolunteerPageContent | null>({
    queryKey: ['volunteer-page', locale],
    queryFn: async () => {
      const response = await fetchAPI({
        path: '/volunteer-page',
        urlParams: {
          locale,
          populate: {
            background: '*',
            benefits: '*',
          },
        },
      });

      return response?.data?.attributes || null;
    },
  });
