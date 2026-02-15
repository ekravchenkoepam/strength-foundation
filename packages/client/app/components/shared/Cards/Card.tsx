import { ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Card.module.scss';

export type CardProps = {
  icon?: ReactNode;
  title: ReactNode;
  content?: ReactNode;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
};

export const Card = ({
  icon,
  title,
  content,
  className,
  iconClassName,
  titleClassName,
  contentClassName,
}: CardProps) => {
  return (
    <article className={clsx(styles.card, className)}>
      <div className={clsx(styles.icon, iconClassName)}>
        {icon ?? '⭐'}
      </div>

      <h3 className={clsx('h4', styles.title, titleClassName)}>
        {title}
      </h3>

      {content && (
        <div className={clsx(styles.content, contentClassName)}>
          {content}
        </div>
      )}
    </article>
  );
};
