import type { Attribute, Schema } from '@strapi/strapi';

export interface ContactsPhone extends Schema.Component {
  collectionName: 'components_contacts_phones';
  info: {
    description: '';
    displayName: 'Phone';
  };
  attributes: {
    number: Attribute.String;
  };
}

export interface FaqContactItem extends Schema.Component {
  collectionName: 'components_faq_contact_items';
  info: {
    description: '';
    displayName: 'Contact Item';
  };
  attributes: {
    highlight: Attribute.String;
    href: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface FaqFaqSection extends Schema.Component {
  collectionName: 'components_faq_faq_sections';
  info: {
    description: '';
    displayName: 'Faq Section';
  };
  attributes: {
    items: Attribute.Relation<'faq.faq-section', 'oneToMany', 'api::faq.faq'>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeAboutSection extends Schema.Component {
  collectionName: 'components_home_about_sections';
  info: {
    description: '';
    displayName: 'About Section';
  };
  attributes: {
    description: Attribute.Text;
    image: Attribute.Media<'images'>;
    imageAlt: Attribute.String;
    primaryButtonLabel: Attribute.String;
    primaryButtonLink: Attribute.String;
    secondaryButtonLabel: Attribute.String;
    secondaryButtonLink: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeActivitiesSection extends Schema.Component {
  collectionName: 'components_home_activities_sections';
  info: {
    description: '';
    displayName: 'Activities Section';
  };
  attributes: {
    items: Attribute.Component<'home.activity-item', true>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeActivityItem extends Schema.Component {
  collectionName: 'components_home_activity_items';
  info: {
    description: '';
    displayName: 'Activity Item';
  };
  attributes: {
    description: Attribute.Text;
    image: Attribute.Media<'images'>;
    imageAlt: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeAmbassadorsSection extends Schema.Component {
  collectionName: 'components_home_ambassadors_sections';
  info: {
    description: '';
    displayName: 'Ambassadors Section';
  };
  attributes: {
    ambassadorsList: Attribute.Component<'team.member', true>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeHelpSection extends Schema.Component {
  collectionName: 'components_home_help_sections';
  info: {
    description: '';
    displayName: 'Help Section';
  };
  attributes: {
    buttonLabel: Attribute.String;
    buttonLink: Attribute.String;
    description: Attribute.Text;
    secondaryDescription: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeIntroSection extends Schema.Component {
  collectionName: 'components_home_intro_sections';
  info: {
    description: '';
    displayName: 'Intro Section';
  };
  attributes: {
    description: Attribute.Text;
    image: Attribute.Media<'images'>;
    imageAlt: Attribute.String;
    subtitle: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomeNewsSection extends Schema.Component {
  collectionName: 'components_home_news_sections';
  info: {
    description: '';
    displayName: 'News Section';
  };
  attributes: {
    newsList: Attribute.Relation<'home.news-section', 'oneToMany', 'api::news.news'>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface HomePartnersSection extends Schema.Component {
  collectionName: 'components_home_partners_sections';
  info: {
    description: '';
    displayName: 'Partners Section';
  };
  attributes: {
    buttonLabel: Attribute.String;
    buttonLink: Attribute.String;
    partnersList: Attribute.Relation<'home.partners-section', 'oneToMany', 'api::partner.partner'>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface MissionMissionContent extends Schema.Component {
  collectionName: 'components_mission_mission_contents';
  info: {
    description: '';
    displayName: 'MissionContent';
  };
  attributes: {
    content: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'default';
        }
      >;
    image: Attribute.Media<'images'>;
    title: Attribute.String;
  };
}

export interface MissionPrinciple extends Schema.Component {
  collectionName: 'components_mission_principles';
  info: {
    description: '';
    displayName: 'Principle';
  };
  attributes: {
    content: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'default';
        }
      >;
    icon: Attribute.Enumeration<['hands', 'pigeon', 'libra', 'search', 'earth', 'lock']>;
    title: Attribute.String;
  };
}

export interface ProjectItemsContactChannel extends Schema.Component {
  collectionName: 'components_project_items_contact_channels';
  info: {
    description: 'Alternative communication channel (Telegram, Viber, WhatsApp, etc.)';
    displayName: 'Contact Channel';
    icon: 'phone';
  };
  attributes: {
    label: Attribute.String;
    platform: Attribute.Enumeration<['telegram', 'viber', 'whatsapp', 'signal', 'messenger']> & Attribute.Required;
    url: Attribute.String & Attribute.Required;
  };
}

export interface ProjectItemsPartnershipItem extends Schema.Component {
  collectionName: 'components_project_items_partnership_items';
  info: {
    description: 'Expandable item shown inside the Partnership accordion';
    displayName: 'Partnership Item';
    icon: 'chevron-down';
  };
  attributes: {
    description: Attribute.Text & Attribute.Required;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProjectItemsSupportItem extends Schema.Component {
  collectionName: 'components_project_items_support_items';
  info: {
    description: 'Icon + title card used inside the Support Types section';
    displayName: 'Support Item';
    icon: 'shield';
  };
  attributes: {
    description: Attribute.Text;
    icon: Attribute.Media<'images'>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProjectSectionsContacts extends Schema.Component {
  collectionName: 'components_project_sections_contacts';
  info: {
    description: 'Contact info block: channels, phone/email, QR code panel';
    displayName: 'Contacts';
    icon: 'phone';
  };
  attributes: {
    channels: Attribute.Component<'project-items.contact-channel', true>;
    channelsLabel: Attribute.String;
    email: Attribute.String;
    footnote: Attribute.String;
    phone: Attribute.String;
    qrButtonHref: Attribute.String;
    qrButtonText: Attribute.String;
    qrImage: Attribute.Media<'images'>;
    qrText: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProjectSectionsHero extends Schema.Component {
  collectionName: 'components_project_sections_heroes';
  info: {
    description: 'Project page hero: title, image with overlay caption, intro paragraph';
    displayName: 'Hero';
    icon: 'picture';
  };
  attributes: {
    caption: Attribute.Text;
    image: Attribute.Media<'images'>;
    intro: Attribute.Text;
    quote: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProjectSectionsPartnership extends Schema.Component {
  collectionName: 'components_project_sections_partnerships';
  info: {
    description: "'How to help' accordion section";
    displayName: 'Partnership';
    icon: 'handshake';
  };
  attributes: {
    items: Attribute.Component<'project-items.partnership-item', true>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProjectSectionsSubProjects extends Schema.Component {
  collectionName: 'components_project_sections_sub_projects';
  info: {
    description: 'Grid of cards linking to related Project entries';
    displayName: 'Sub Projects';
    icon: 'apps';
  };
  attributes: {
    projects: Attribute.Relation<'project-sections.sub-projects', 'oneToMany', 'api::project.project'>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProjectSectionsSupportTypes extends Schema.Component {
  collectionName: 'components_project_sections_support_types';
  info: {
    description: 'Olive section listing the main kinds of support (icon + title cards)';
    displayName: 'Support Types';
    icon: 'grid';
  };
  attributes: {
    items: Attribute.Component<'project-items.support-item', true>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ReportsReport extends Schema.Component {
  collectionName: 'components_reports_reports';
  info: {
    description: '';
    displayName: 'Report';
  };
  attributes: {
    file: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Attribute.String;
  };
}

export interface ReportsReportYear extends Schema.Component {
  collectionName: 'components_reports_report_years';
  info: {
    description: '';
    displayName: 'ReportYear';
  };
  attributes: {
    reports: Attribute.Component<'reports.report', true>;
    text: Attribute.String;
  };
}

export interface SharedButton extends Schema.Component {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    Button: Attribute.String;
  };
}

export interface SharedCtaSection extends Schema.Component {
  collectionName: 'components_shared_cta_sections';
  info: {
    description: '';
    displayName: 'CTA Section';
  };
  attributes: {
    buttonLink: Attribute.String;
    buttonText: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface SharedImage extends Schema.Component {
  collectionName: 'components_shared_images';
  info: {
    description: '';
    displayName: 'image';
  };
  attributes: {};
}

export interface SharedLink extends Schema.Component {
  collectionName: 'components_shared_links';
  info: {
    description: '';
    displayName: 'Link';
    icon: 'priceTag';
  };
  attributes: {
    href: Attribute.String;
    target: Attribute.Enumeration<['_blank', '_target']>;
    title: Attribute.String;
  };
}

export interface SharedVideo extends Schema.Component {
  collectionName: 'components_shared_videos';
  info: {
    displayName: 'video';
  };
  attributes: {
    video: Attribute.Media<'videos', true>;
  };
}

export interface SocialsSocial extends Schema.Component {
  collectionName: 'components_socials_socials';
  info: {
    description: '';
    displayName: 'Social';
    icon: 'earth';
  };
  attributes: {
    icon: Attribute.Enumeration<['telegram', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'spotify']>;
    link: Attribute.String;
  };
}

export interface TeamMember extends Schema.Component {
  collectionName: 'components_team_members';
  info: {
    description: '';
    displayName: 'Member';
    icon: 'archive';
  };
  attributes: {
    description: Attribute.Blocks;
    image: Attribute.Media<'images'>;
    name: Attribute.String;
    role: Attribute.String;
    socials: Attribute.Component<'socials.social', true>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'contacts.phone': ContactsPhone;
      'faq.contact-item': FaqContactItem;
      'faq.faq-section': FaqFaqSection;
      'home.about-section': HomeAboutSection;
      'home.activities-section': HomeActivitiesSection;
      'home.activity-item': HomeActivityItem;
      'home.ambassadors-section': HomeAmbassadorsSection;
      'home.help-section': HomeHelpSection;
      'home.intro-section': HomeIntroSection;
      'home.news-section': HomeNewsSection;
      'home.partners-section': HomePartnersSection;
      'mission.mission-content': MissionMissionContent;
      'mission.principle': MissionPrinciple;
      'project-items.contact-channel': ProjectItemsContactChannel;
      'project-items.partnership-item': ProjectItemsPartnershipItem;
      'project-items.support-item': ProjectItemsSupportItem;
      'project-sections.contacts': ProjectSectionsContacts;
      'project-sections.hero': ProjectSectionsHero;
      'project-sections.partnership': ProjectSectionsPartnership;
      'project-sections.sub-projects': ProjectSectionsSubProjects;
      'project-sections.support-types': ProjectSectionsSupportTypes;
      'reports.report': ReportsReport;
      'reports.report-year': ReportsReportYear;
      'shared.button': SharedButton;
      'shared.cta-section': SharedCtaSection;
      'shared.image': SharedImage;
      'shared.link': SharedLink;
      'shared.video': SharedVideo;
      'socials.social': SocialsSocial;
      'team.member': TeamMember;
    }
  }
}
