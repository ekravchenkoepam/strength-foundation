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

const getDataOrFallback = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    console.error('Locale layout data fetch failed:', error);
    return fallback;
  }
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;
  const navigationsResponse: any = await getDataOrFallback(
    fetchAPI({
      path: '/navigations',
      urlParams: { locale },
    }),
    { data: [] }
  );
  const socialsResponse: any = await getDataOrFallback(
    fetchAPI({
      path: '/socials?=*',
      urlParams: { locale },
    }),
    { data: [] }
  );
  const contactResponse: any = await getDataOrFallback(
    fetchAPI({
      path: '/contact',
      urlParams: { locale },
    }),
    { data: null }
  );

  const links = (extractAttributes(navigationsResponse.data) as any[]) || [];
  const socials = (extractAttributes(socialsResponse.data) as any[]) || [];
  const contacts = extractAttributes(contactResponse.data);

  return (
    <AppContextProvider links={links} socials={socials} locale={locale}>
      <Header />
      {children}
      <Footer contacts={contacts} />
    </AppContextProvider>
  );
}
