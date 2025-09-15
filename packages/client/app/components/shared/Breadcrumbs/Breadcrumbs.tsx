import { FC } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

import styles from './breadcrumbs.module.scss';

type BreadcrumbsProps = {
  breadcrumbs: { href: string; title: string }[];
  locale: string;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ breadcrumbs, locale }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.breadcrumbs}>
        {breadcrumbs.slice(0, -1).map(({ href, title }) => (
          <li key={title} className={styles.breadcrumb}>
            <Link href={`/${locale}/${href}`}>{title}</Link>
            <img src="/images/breadcrumb-arrow.svg" alt="breadcrumb-arrow" />
          </li>
        ))}

        {breadcrumbs.length > 0 && (
          <li className={clsx(styles.breadcrumb, styles.inactive)}>
            {breadcrumbs[breadcrumbs.length - 1].title}
          </li>
        )}
      </ul>
    </div>
  );
};

