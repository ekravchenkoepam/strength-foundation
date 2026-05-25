// Shared block types for the Project page dynamic zone.
// `__component` is the Strapi discriminator and matches `<category>.<name>` from schema.json.

export type StrapiMedia = {
  data?: {
    id?: number;
    attributes?: {
      url?: string | null;
      name?: string | null;
      alternativeText?: string | null;
    };
  } | null;
};

export type HeroBlock = {
  __component: 'project-sections.hero';
  id: number;
  title?: string | null;
  caption?: string | null;
  intro?: string | null;
  quote?: string | null;
  image?: StrapiMedia;
};

export type SupportItem = {
  id: number;
  title: string;
  icon?: StrapiMedia;
};

export type SupportTypesBlock = {
  __component: 'project-sections.support-types';
  id: number;
  title: string;
  items?: SupportItem[];
};

export type SubProjectsBlock = {
  __component: 'project-sections.sub-projects';
  id: number;
  title: string;
  projects?: {
    data?: Array<{
      id: number;
      attributes?: {
        title?: string | null;
        slug?: string | null;
        description?: string | null;
        buttonText?: string | null;
        image?: StrapiMedia;
      };
    }>;
  };
};

export type PartnershipItem = {
  id: number;
  title: string;
  description: string;
};

export type PartnershipBlock = {
  __component: 'project-sections.partnership';
  id: number;
  title: string;
  items?: PartnershipItem[];
};

export type ContactChannel = {
  id: number;
  platform: 'telegram' | 'viber' | 'whatsapp' | 'signal' | 'messenger';
  label?: string | null;
  url: string;
};

export type ContactsBlock = {
  __component: 'project-sections.contacts';
  id: number;
  title: string;
  channelsLabel?: string | null;
  channels?: ContactChannel[];
  phone?: string | null;
  email?: string | null;
  qrText?: string | null;
  qrImage?: StrapiMedia;
  qrButtonText?: string | null;
  qrButtonHref?: string | null;
  footnote?: string | null;
};

export type ProjectBlock =
  | HeroBlock
  | SupportTypesBlock
  | SubProjectsBlock
  | PartnershipBlock
  | ContactsBlock;

export type ProjectResponse = {
  id: number;
  attributes?: {
    title?: string | null;
    slug?: string | null;
    blocks?: ProjectBlock[];
  };
};
