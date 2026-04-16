'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::home-page.home-page';
const NEWS_UID = 'api::news.news';
const SEED_PATH = path.join(__dirname, 'home-page-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid home-page seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!data.locales[locale]) {
      throw new Error(`Invalid home-page seed file: missing "${locale}" locale payload.`);
    }
  }

  return data.locales;
}

function toBlocks(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return [];

  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => ({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: line,
        },
      ],
    }));
}

function normalizeAmbassador(ambassador) {
  return {
    name: ambassador.name,
    role: ambassador.role,
    description: toBlocks(ambassador.description),
    socials: (ambassador.socials || []).map(social => ({
      icon: social.icon,
      link: social.link,
    })),
  };
}

function normalizePayload(localePayload, locale) {
  return {
    locale,
    news: [],
    ambassadors: (localePayload.ambassadors || []).map(normalizeAmbassador),
    publishedAt: new Date().toISOString(),
  };
}

function normalizeNewsItem(item, index) {
  return {
    title: item.title,
    date: item.date,
    link: item.link || null,
    source: item.source || null,
    position: item.position ?? index + 1,
  };
}

function getLocaleNews(locales, locale) {
  const news = locales?.[locale]?.news;

  if (!Array.isArray(news)) {
    throw new Error(`Invalid home-page seed file: locales.${locale}.news must be an array.`);
  }

  return news.map(normalizeNewsItem);
}

async function findExistingNews(strapi, locale, position) {
  const entries = await strapi.entityService.findMany(NEWS_UID, {
    locale,
    publicationState: 'preview',
    filters: { position },
    limit: 1,
  });

  return entries?.[0] || null;
}

async function upsertLocalizedNews(strapi, locale, newsItem, localizationId) {
  const existing = await findExistingNews(strapi, locale, newsItem.position);
  const data = {
    locale,
    title: newsItem.title,
    date: newsItem.date,
    link: newsItem.link,
    source: newsItem.source,
    position: newsItem.position,
    publishedAt: new Date().toISOString(),
  };

  if (existing?.id) {
    return strapi.entityService.update(NEWS_UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(NEWS_UID, { data });
}

async function seedNews(strapi, locales) {
  const ukNews = getLocaleNews(locales, 'uk');
  const enNews = getLocaleNews(locales, 'en');

  if (ukNews.length !== enNews.length) {
    throw new Error(
      `Home page news seed mismatch: locales.uk.news has ${ukNews.length} items, locales.en.news has ${enNews.length}.`
    );
  }

  const newsIdsByLocale = {
    uk: [],
    en: [],
  };

  for (let index = 0; index < ukNews.length; index += 1) {
    const ukEntry = await upsertLocalizedNews(strapi, 'uk', ukNews[index]);
    const enEntry = await upsertLocalizedNews(strapi, 'en', enNews[index], ukEntry.id);
    newsIdsByLocale.uk.push(ukEntry.id);
    newsIdsByLocale.en.push(enEntry.id);
  }

  return newsIdsByLocale;
}

async function getLocaleEntry(strapi, locale) {
  return strapi.entityService.findMany(UID, {
    locale,
    publicationState: 'preview',
  });
}

async function upsertLocale(strapi, locale, localePayload, newsIdsByLocale, localizationId) {
  const existing = await getLocaleEntry(strapi, locale);
  const data = normalizePayload(localePayload, locale);
  data.news = newsIdsByLocale?.[locale] || [];

  if (existing?.id) {
    return strapi.entityService.update(UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(UID, { data });
}

async function seedHomePage(strapi) {
  const locales = readSeedFile();
  const newsIdsByLocale = await seedNews(strapi, locales);

  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk, newsIdsByLocale);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, newsIdsByLocale, ukEntry.id);

  console.log(`Home page seed complete. uk id=${ukEntry.id}, en id=${enEntry.id}`);
}

async function run() {
  const createStrapi =
    strapiFactory.createStrapi ||
    (strapiFactory.default && strapiFactory.default.createStrapi) ||
    strapiFactory.default ||
    strapiFactory;

  if (typeof createStrapi !== 'function') {
    throw new Error('Unable to resolve createStrapi from @strapi/strapi');
  }

  const strapi = await createStrapi().load();
  try {
    await seedHomePage(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
