import qs from 'qs';

import { getStrapiURL } from './api-helpers';

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

export async function fetchAPI({ path, urlParams = {}, options = {} }: FetchAPIArgs) {
  const mergedUrlParams = {
    locale: 'uk',
    populate: '*',
    ...urlParams,
  };

  const mergedOptions: NextFetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  if (!mergedOptions.next && !mergedOptions.cache) {
    mergedOptions.next = { revalidate: 10 };
  }

  const queryString = qs.stringify(mergedUrlParams);
  const requestUrl = `${getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ''}`)}`;

  try {
    const response = await fetch(requestUrl, mergedOptions);
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Strapi request failed (${response.status}) for ${requestUrl}: ${responseText.slice(0, 200)}`);
    }

    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      throw new Error(
        `Expected JSON from ${requestUrl} but received "${contentType || 'unknown'}": ${responseText.slice(0, 200)}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('fetchAPI error:', error);
    throw new Error('Please check if your server is running and you set all the required tokens.');
  }
}
