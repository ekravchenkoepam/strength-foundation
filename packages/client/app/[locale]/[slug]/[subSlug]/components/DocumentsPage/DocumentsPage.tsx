import { useDocuments } from '@/app/[locale]/[slug]/[subSlug]/components/DocumentsPage/useDocuments';
import { ItemSelector } from '@/app/components/shared/ItemSelector';
import clsx from 'clsx';

import styles from './DocumentsPage.module.scss';

export const DocumentsPage = () => {
  const {documentsList, openInNewTab} = useDocuments();

  return (
    <div className={styles.wrapper}>
      <div className={clsx('h1', styles.header)}>Документи</div>
      <div className={styles.listContainer}>
        {
          documentsList.map(item => (<ItemSelector key={item.id} text={item.name} callbackHandler={openInNewTab(item.url)} />))
        }
      </div>
    </div>
  );
}
