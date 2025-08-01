import { fetchAPI } from "@/app/utils/fetch-api";

type PopulateParams = Record<string, any>;

type GetPageBySlugOptions = {
  slug: string;
  populate?: PopulateParams | string;
  cache?: RequestCache;
  locale?: string;
};

export const getPageBySlug  = async ({
  slug,
  populate = "*",
  cache = "no-store",
  locale = "en",
}: GetPageBySlugOptions) => {
  const { data } = await fetchAPI({
    path: "/pages",
    urlParams: {
      filters: {
        slug: { $eq: slug },
      },
      locale,
      populate,
    },
    options: { cache },
  });

  return data.at(0);
}
