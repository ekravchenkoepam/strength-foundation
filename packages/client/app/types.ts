export interface LinkType {
  href: string;
  title: string;
  sublinks: any;
  position: number;
  isHidden: boolean;
}

export interface ImageType {
  src: string;
  alt: string;
}

export interface IconType {
  className?: string;
  backgroundColor?: string;
  color?: string;
  width?: string;
  height?: string;
}

export enum CollectionTypeEnum {
  Photo = 'photo',
  ThreeD = 'threeD',
  Pdf = 'pdf',
}
