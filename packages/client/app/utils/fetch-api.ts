import qs from "qs";
import { getStrapiURL } from "./api-helpers";

interface NextFetchOptions extends RequestInit {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
  cache?: RequestCache;
}

interface FetchAPIArgs {
  path: string;
  urlParams?: Record<string, any>;
  options?: NextFetchOptions;
}

export async function fetchAPI({
 path,
 urlParams = {},
 options = {},
}: FetchAPIArgs) {
  try {
    const mergedUrlParams = {
      locale: "uk",
      populate: "*",
      ...urlParams,
    };

    const mergedOptions: NextFetchOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    };

    if (!mergedOptions.next && !mergedOptions.cache) {
      mergedOptions.next = { revalidate: 60 };
    }

    const queryString = qs.stringify(mergedUrlParams);
    const requestUrl = `${getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ""}`)}`;

    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Please check if your server is running and you set all the required tokens.`
    );
  }
}
