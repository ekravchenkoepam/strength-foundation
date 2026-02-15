import { ReactNode } from 'react';
import clsx from 'clsx';

import { Card } from './Card';

import styles from './Cards.module.scss';

export type CardItem = {
  id: string | number;
  title: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
};

type CardsProps<T extends CardItem = CardItem> = {
  items: T[];
  className?: string;
  cardClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  renderIcon?: (item: T) => ReactNode;
  renderTitle?: (item: T) => ReactNode;
  renderContent?: (item: T) => ReactNode;
};

export const Cards = <T extends CardItem>({
  items,
  className,
  cardClassName,
  iconClassName,
  titleClassName,
  contentClassName,
  renderIcon,
  renderTitle,
  renderContent,
}: CardsProps<T>) => {
  return (
    <div className={clsx(styles.grid, className)}>
      {items.map((item) => (
        <Card
          key={item.id}
          icon={renderIcon ? renderIcon(item) : item.icon}
          title={renderTitle ? renderTitle(item) : item.title}
          content={renderContent ? renderContent(item) : item.content}
          className={cardClassName}
          iconClassName={iconClassName}
          titleClassName={titleClassName}
          contentClassName={contentClassName}
        />
      ))}
    </div>
  );
};
