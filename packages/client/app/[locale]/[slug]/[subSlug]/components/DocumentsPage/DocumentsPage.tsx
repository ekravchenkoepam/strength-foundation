import { useDocuments } from '@/app/[locale]/[slug]/[subSlug]/components/DocumentsPage/useDocuments';
import { ItemSelector } from '@/app/components/shared/ItemSelector';
import styles from './DocumentsPage.module.scss';

export const DocumentsPage = () => {
  const {documentsList, openInNewTab} = useDocuments();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>Документи</h1>
      <div className={styles.listContainer}>
        {
          documentsList.map(item => (<ItemSelector key={item.id} text={item.name} callbackHandler={openInNewTab(item.url)} />))
        }
      </div>
    </div>
  );
}
