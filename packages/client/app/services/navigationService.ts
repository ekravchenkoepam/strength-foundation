import { fetchAPI } from "@/app/utils/fetch-api";

export interface GetNavigationBySlugOptions {
  populate?: string;
  locale?: string;
  cache?: RequestCache;
}

export const getNavigations = async ({
  populate = "*",
  locale = "en",
  cache = "no-store",
}: GetNavigationBySlugOptions) => {
  const { data } = await fetchAPI({
    path: "/navigations",
    urlParams: {
      locale,
      populate,
    },
    options: { cache },
  });

  return data;
};
