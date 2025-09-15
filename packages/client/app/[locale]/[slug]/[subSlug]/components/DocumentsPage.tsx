import { PageProps } from '../../types';

export const DocumentsPage = ({ locale, slug, subSlug }: PageProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h1>Documents Page</h1>
      <p>Locale: <strong>{locale}</strong></p>
      <p>Slug: <strong>{slug}</strong></p>
      <p>SubSlug: <strong>{subSlug}</strong></p>
    </div>
  );
}
