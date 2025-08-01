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
      'shared.button': SharedButton;
      'shared.image': SharedImage;
      'shared.link': SharedLink;
      'shared.video': SharedVideo;
    }
  }
}
