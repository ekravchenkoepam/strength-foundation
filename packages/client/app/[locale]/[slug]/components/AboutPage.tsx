import { PageProps } from '../types';

export const AboutPage = ({ locale, slug }: PageProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h1>About Page</h1>
      <p>Locale: <strong>{locale}</strong></p>
      <p>Slug: <strong>{slug}</strong></p>
    </div>
  );
}
