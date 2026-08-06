import { PageProps } from '../types';

export const AboutPage = ({ locale, slug }: PageProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 lg:px-[52px]">
      <h1>About Page</h1>
      <p>Locale: <strong>{locale}</strong></p>
      <p>Slug: <strong>{slug}</strong></p>
    </div>
  );
}
