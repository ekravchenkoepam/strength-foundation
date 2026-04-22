'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::home-page.home-page';
const NEWS_UID = 'api::news.news';
const PARTNER_UID = 'api::partner.partner';
const SEED_PATH = path.join(__dirname, 'home-page-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];
const ADMIN_ROOT = path.resolve(__dirname, '..');
const MIME_TYPES = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

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

function resolveAssetPath(relativePath) {
  return path.resolve(__dirname, '..', '..', '..', relativePath);
}

async function findExistingMedia(strapi, fileName) {
  const entries = await strapi.db.query('plugin::upload.file').findMany({
    where: { name: fileName },
    limit: 1,
  });

  return entries?.[0] || null;
}

async function ensureMedia(strapi, relativePath) {
  if (!relativePath) {
    return null;
  }

  const absolutePath = resolveAssetPath(relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Home page about image not found: ${relativePath}`);
  }

  const fileName = path.basename(absolutePath);
  const existing = await findExistingMedia(strapi, fileName);

  if (existing?.id) {
    return existing.id;
  }

  const fileStats = fs.statSync(absolutePath);
  const extension = path.extname(absolutePath).toLowerCase();
  const mimeType = MIME_TYPES[extension];

  if (!mimeType) {
    throw new Error(`Unsupported home page about image file type: ${extension}`);
  }

  const uploadedFiles = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: {
        fileInfo: {
          name: fileName,
          alternativeText: path.parse(fileName).name,
          caption: '',
        },
      },
      files: {
        path: absolutePath,
        name: fileName,
        type: mimeType,
        size: fileStats.size,
      },
    });

  return uploadedFiles?.[0]?.id || null;
}

async function normalizeAboutSection(strapi, aboutSection) {
  if (!aboutSection) {
    return null;
  }

  return {
    title: aboutSection.title || null,
    description: aboutSection.description || null,
    image: aboutSection.imagePath ? await ensureMedia(strapi, aboutSection.imagePath) : null,
    imageAlt: aboutSection.imageAlt || null,
    primaryButtonLabel: aboutSection.primaryButtonLabel || null,
    primaryButtonLink: aboutSection.primaryButtonLink || null,
    secondaryButtonLabel: aboutSection.secondaryButtonLabel || null,
    secondaryButtonLink: aboutSection.secondaryButtonLink || null,
  };
}

async function normalizeIntroSection(strapi, introSection) {
  if (!introSection) {
    return null;
  }

  return {
    title: introSection.title || null,
    subtitle: introSection.subtitle || null,
    description: introSection.description || null,
    image: introSection.imagePath ? await ensureMedia(strapi, introSection.imagePath) : null,
    imageAlt: introSection.imageAlt || null,
  };
}

async function normalizeActivityItem(strapi, item) {
  return {
    title: item.title || null,
    description: item.description || null,
    image: item.imagePath ? await ensureMedia(strapi, item.imagePath) : null,
    imageAlt: item.imageAlt || null,
  };
}

async function normalizeActivitiesSection(strapi, activitiesSection) {
  if (!activitiesSection) {
    return null;
  }

  const items = [];

  for (const item of activitiesSection.items || []) {
    items.push(await normalizeActivityItem(strapi, item));
  }

  return {
    title: activitiesSection.title || null,
    items,
  };
}

function normalizeHelpSection(helpSection) {
  if (!helpSection) {
    return null;
  }

  return {
    title: helpSection.title || null,
    description: helpSection.description || null,
    secondaryDescription: helpSection.secondaryDescription || null,
    buttonLabel: helpSection.buttonLabel || null,
    buttonLink: helpSection.buttonLink || null,
  };
}

function normalizeNewsSection(newsSection) {
  if (!newsSection) {
    return null;
  }

  return {
    title: newsSection.title || null,
  };
}

function normalizePartnersSection(partnersSection) {
  if (!partnersSection) {
    return null;
  }

  return {
    title: partnersSection.title || null,
    buttonLabel: partnersSection.buttonLabel || null,
    buttonLink: partnersSection.buttonLink || null,
    partnersList: [],
  };
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

function normalizeAmbassadorsSection(ambassadorsSection) {
  if (!ambassadorsSection) {
    return null;
  }

  return {
    title: ambassadorsSection.title || null,
    ambassadorsList: (ambassadorsSection.ambassadorsList || []).map(normalizeAmbassador),
  };
}

async function normalizePayload(strapi, localePayload, locale) {
  return {
    locale,
    introSection: await normalizeIntroSection(strapi, localePayload.introSection),
    aboutSection: await normalizeAboutSection(strapi, localePayload.aboutSection),
    activitiesSection: await normalizeActivitiesSection(strapi, localePayload.activitiesSection),
    newsSection: normalizeNewsSection(localePayload.newsSection),
    partnersSection: normalizePartnersSection(localePayload.partnersSection),
    helpSection: normalizeHelpSection(localePayload.helpSection),
    ambassadorsSection: normalizeAmbassadorsSection(localePayload.ambassadorsSection),
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

function getLocalePartners(locales, locale) {
  const partners = locales?.[locale]?.partnersSection?.partnersList;

  if (!Array.isArray(partners)) {
    throw new Error(`Invalid home-page seed file: locales.${locale}.partnersSection.partnersList must be an array.`);
  }

  return partners;
}

async function findPartnerByPosition(strapi, locale, position) {
  const entries = await strapi.entityService.findMany(PARTNER_UID, {
    locale,
    publicationState: 'preview',
    filters: { position },
    sort: ['position:asc', 'id:asc'],
    limit: 1,
  });

  return entries?.[0] || null;
}

async function resolvePartnerIds(strapi, locales, locale) {
  const positions = getLocalePartners(locales, locale);
  const ids = [];
  const missing = [];

  for (const position of positions) {
    const partner = await findPartnerByPosition(strapi, locale, position);

    if (!partner?.id) {
      missing.push(position);
      continue;
    }

    ids.push(partner.id);
  }

  if (missing.length > 0) {
    throw new Error(
      `Home page seed references missing partners for locale "${locale}" at positions: ${missing.join(', ')}`
    );
  }

  return ids;
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

async function upsertLocale(strapi, locale, localePayload, newsIdsByLocale, partnerIdsByLocale, localizationId) {
  const existing = await getLocaleEntry(strapi, locale);
  const data = await normalizePayload(strapi, localePayload, locale);
  data.newsSection = {
    ...(data.newsSection || {}),
    newsList: newsIdsByLocale?.[locale] || [],
  };
  data.partnersSection = {
    ...(data.partnersSection || {}),
    partnersList: partnerIdsByLocale?.[locale] || [],
  };

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
  const partnerIdsByLocale = {
    uk: await resolvePartnerIds(strapi, locales, 'uk'),
    en: await resolvePartnerIds(strapi, locales, 'en'),
  };

  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk, newsIdsByLocale, partnerIdsByLocale);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, newsIdsByLocale, partnerIdsByLocale, ukEntry.id);

  console.log(`Home page seed complete. uk id=${ukEntry.id}, en id=${enEntry.id}`);
}

async function run() {
  process.chdir(ADMIN_ROOT);

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
