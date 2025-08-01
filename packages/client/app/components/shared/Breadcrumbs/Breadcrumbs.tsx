import { FC } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

import styles from './breadcrumbs.module.scss';

export interface BreadcrumbsProps {
  breadcrumbs: any[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.breadcrumbs}>
        {breadcrumbs.map(({ href, label }, index) =>
          index !== breadcrumbs.length - 1 ? (
            <li key={label} className={clsx(styles.breadcrumb, styles.inactive)}>
              <Link href={href}>{label}</Link>
              <img src="/images/breadcrumb-arrow.svg" alt="breadcrumb-arrow" />
            </li>
          ) : (
            <li key={label} className={styles.breadcrumb}>
              {label}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
