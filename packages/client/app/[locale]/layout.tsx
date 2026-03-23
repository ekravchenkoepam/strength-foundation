import { AppContextProvider } from '@/app/context/AppProvider';
import { Footer } from '@/app/layout/footer';
import { Header } from '@/app/layout/header';
import { extractAttributes } from '@/app/utils/api-helpers';
import { fetchAPI } from '@/app/utils/fetch-api';

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;
  const { data: navigations }: any = await fetchAPI({
    path: '/navigations',
    urlParams: { locale },
  });
  const { data: socialLinks }: any = await fetchAPI({
    path: '/socials?=*',
    urlParams: { locale },
  });
  const { data: contact }: any = await fetchAPI({
    path: '/contact',
    urlParams: { locale },
  });

  const links = extractAttributes(navigations);
  const socials = extractAttributes(socialLinks);
  const contacts = extractAttributes(contact);

  return (
    <AppContextProvider links={links} socials={socials} locale={locale}>
      <Header />
      {children}
      <Footer contacts={contacts} />
    </AppContextProvider>
  );
}
