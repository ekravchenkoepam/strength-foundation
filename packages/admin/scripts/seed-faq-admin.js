'use strict';

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'faq-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

const BASE_URL = process.env.STRAPI_URL;
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD;

const toSlug = value =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яіїєґ\- ]/gi, '')
    .replace(/\s+/g, '-');

const toLocalizedSlug = (baseSlug, locale) => {
  if (locale === 'uk') return baseSlug;
  const suffix = `-${locale}`;
  return baseSlug.endsWith(suffix) ? baseSlug : `${baseSlug}${suffix}`;
};

function parseSeedData() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (data?.locales) {
    for (const locale of REQUIRED_LOCALES) {
      if (!Array.isArray(data.locales?.[locale]?.categories)) {
        throw new Error(`Missing locales.${locale}.categories in faq-seed.json`);
      }
    }

    return data.locales;
  }

  if (Array.isArray(data?.categories)) {
    return { uk: { categories: data.categories } };
  }

  throw new Error('Invalid faq-seed.json format.');
}

async function login() {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin login failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json?.data?.token;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function requestAdmin(urlPath, token, options = {}, attempt = 1) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if ([502, 503, 504].includes(res.status) && attempt < 5) {
      const delay = 500 * attempt;
      console.warn(`Retrying ${urlPath} after ${delay}ms (status ${res.status})`);
      await sleep(delay);
      return requestAdmin(urlPath, token, options, attempt + 1);
    }
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json();
}

async function publishEntry(token, uid, id) {
  try {
    return await requestAdmin(`/content-manager/collection-types/${uid}/${id}/actions/publish`, token, {
      method: 'POST',
    });
  } catch (error) {
    const message = String(error?.message || '');
    if (message.includes('already.published')) {
      return null;
    }
    throw error;
  }
}

async function upsertCategory(token, category, position, locale, localizationId) {
  const baseSlug = category.slug || toSlug(category.title);
  const slug = toLocalizedSlug(baseSlug, locale);
  const categoryQuery =
    '/content-manager/collection-types/api::faq-category.faq-category' +
    `?filters[position][$eq]=${position}` +
    `&filters[locale][$eq]=${locale}` +
    '&page=1&pageSize=1';
  const existing = await requestAdmin(categoryQuery, token);

  const payload = {
    title: category.title,
    slug,
    position,
    locale,
  };

  if (localizationId) {
    payload.localizations = [localizationId];
  }

  if (existing?.results?.[0]) {
    const id = existing.results[0].id;
    const res = await requestAdmin(`/content-manager/collection-types/api::faq-category.faq-category/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await publishEntry(token, 'api::faq-category.faq-category', id);
    return res;
  }

  const created = await requestAdmin('/content-manager/collection-types/api::faq-category.faq-category', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const createdId = created?.id || created?.data?.id;
  if (createdId) {
    await publishEntry(token, 'api::faq-category.faq-category', createdId);
  }
  return created;
}

async function upsertFaq(token, faq, categoryId, position, locale, localizationId) {
  const faqQuery =
    '/content-manager/collection-types/api::faq.faq' +
    `?filters[category][id][$eq]=${categoryId}` +
    `&filters[position][$eq]=${position}` +
    `&filters[locale][$eq]=${locale}` +
    '&page=1&pageSize=1';
  const existing = await requestAdmin(faqQuery, token);

  const payload = {
    question: faq.question,
    answer: faq.answer,
    position,
    category: categoryId,
    locale,
  };

  if (localizationId) {
    payload.localizations = [localizationId];
  }

  if (existing?.results?.[0]) {
    const id = existing.results[0].id;
    const res = await requestAdmin(`/content-manager/collection-types/api::faq.faq/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await publishEntry(token, 'api::faq.faq', id);
    return res;
  }

  const created = await requestAdmin('/content-manager/collection-types/api::faq.faq', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const createdId = created?.id || created?.data?.id;
  if (createdId) {
    await publishEntry(token, 'api::faq.faq', createdId);
  }
  return created;
}

async function run() {
  if (!BASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Missing STRAPI_URL / STRAPI_ADMIN_EMAIL / STRAPI_ADMIN_PASSWORD');
  }

  const localizedData = parseSeedData();
  const ukCategories = localizedData.uk?.categories || [];
  const enCategories = localizedData.en?.categories || [];

  if (!ukCategories.length) {
    console.log('No categories found in seed file.');
    return;
  }

  const token = await login();

  for (let cIndex = 0; cIndex < ukCategories.length; cIndex += 1) {
    const ukCategory = ukCategories[cIndex];
    const enCategory = enCategories[cIndex];
    const position = cIndex + 1;

    const ukCategoryRes = await upsertCategory(token, ukCategory, position, 'uk');
    const ukCategoryId = ukCategoryRes?.id || ukCategoryRes?.data?.id;

    let enCategoryId = null;
    if (enCategory) {
      const enCategoryRes = await upsertCategory(token, enCategory, position, 'en', ukCategoryId);
      enCategoryId = enCategoryRes?.id || enCategoryRes?.data?.id;
    }

    const ukFaqs = ukCategory.faqs || [];
    const enFaqs = enCategory?.faqs || [];

    for (let fIndex = 0; fIndex < ukFaqs.length; fIndex += 1) {
      const ukFaq = ukFaqs[fIndex];
      const enFaq = enFaqs[fIndex];
      const faqPosition = fIndex + 1;

      const ukFaqRes = await upsertFaq(token, ukFaq, ukCategoryId, faqPosition, 'uk');
      const ukFaqId = ukFaqRes?.id || ukFaqRes?.data?.id;

      if (enFaq && enCategoryId) {
        await upsertFaq(token, enFaq, enCategoryId, faqPosition, 'en', ukFaqId);
      }
    }
  }

  console.log('FAQ seed complete for locales: uk, en');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
