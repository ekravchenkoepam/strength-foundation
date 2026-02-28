import clsx from 'clsx';

import styles from './DocumentsPage.module.scss';

import { useDocuments } from '@/app/[locale]/[slug]/[subSlug]/components/DocumentsPage/useDocuments';
import { Loading } from '@/app/components/shared';
import { ItemSelector } from '@/app/components/shared/ItemSelector';

export const DocumentsPage = () => {
  const { documentsList, openInNewTab, isLoading } = useDocuments();

  if (isLoading) return <Loading headerText="Документи" />;

  return (
    <div className={styles.wrapper}>
      <div className={clsx('h1', styles.header)}>Документи</div>
      <div className={styles.listContainer}>
        {documentsList.map(item => (
          <ItemSelector key={item.id} text={item.name} callbackHandler={openInNewTab(item.url)} />
        ))}
      </div>
    </div>
  );
};
