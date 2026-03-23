import clsx from 'clsx';

import styles from './DocumentsPage.module.scss';

import { useDocuments } from '@/app/[locale]/[slug]/[subSlug]/components/DocumentsPage/useDocuments';
import { PageProps } from '@/app/[locale]/[slug]/types';
import { Loading } from '@/app/components/shared';
import { ItemSelector } from '@/app/components/shared/ItemSelector';

export const DocumentsPage = ({ locale }: PageProps) => {
  const { documentsList, openInNewTab, isLoading, page } = useDocuments(locale);
  const actionLabel = locale === 'en' ? 'View' : 'Переглянути';

  if (isLoading) return <Loading headerText={page.title} />;

  return (
    <div className={styles.wrapper}>
      <div className={clsx('h1', styles.header)}>{page.title}</div>
      {page.description ? <div className={styles.description}>{page.description}</div> : null}
      <div className={styles.listContainer}>
        {documentsList.map(item => (
          <ItemSelector
            key={item.id}
            text={item.name}
            callbackHandler={openInNewTab(item.url)}
            actionLabel={actionLabel}
          />
        ))}
      </div>
    </div>
  );
};
