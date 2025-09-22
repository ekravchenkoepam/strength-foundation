import type { Attribute, Schema } from '@strapi/strapi';

export interface BlocksHeaderBlock extends Schema.Component {
  collectionName: 'components_blocks_header_blocks';
  info: {
    description: '';
    displayName: 'HeaderBlock';
  };
  attributes: {
    description: Attribute.Text;
    text: Attribute.String;
    title: Attribute.String;
  };
}

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

export interface SharedImage extends Schema.Component {
  collectionName: 'components_shared_images';
  info: {
    displayName: 'image';
  };
  attributes: {
    image: Attribute.Media<'images', true>;
  };
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

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'blocks.header-block': BlocksHeaderBlock;
      'contacts.phone': ContactsPhone;
      'reports.report': ReportsReport;
      'reports.report-year': ReportsReportYear;
      'shared.button': SharedButton;
      'shared.image': SharedImage;
      'shared.link': SharedLink;
      'shared.video': SharedVideo;
    }
  }
}
