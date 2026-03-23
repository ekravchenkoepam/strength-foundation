'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::navigation.navigation';
const SEED_PATH = path.join(__dirname, 'navigation-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid navigation seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!Array.isArray(data.locales?.[locale]?.navigations)) {
      throw new Error(`Invalid navigation seed file: missing locales.${locale}.navigations array.`);
    }
  }

  return data.locales;
}

function normalizePayload(navigation, locale, position) {
  const payload = {
    locale,
    title: navigation.title,
    href: navigation.href,
    isHidden: Boolean(navigation.isHidden),
    sublinks: (navigation.sublinks || []).map(sublink => ({
      title: sublink.title,
      href: sublink.href,
      target: sublink.target,
    })),
    publishedAt: new Date().toISOString(),
  };

  // `position` is unique in the current schema and collides across locales.
  // Keep ordering key on the primary locale only.
  if (locale === 'uk') {
    payload.position = navigation.position || position;
  }

  return payload;
}

async function findExistingNavigation(strapi, locale, payload) {
  if (typeof payload.position === 'number') {
    const existingByPosition = await strapi.entityService.findMany(UID, {
      locale,
      publicationState: 'preview',
      filters: { position: payload.position },
      limit: 1,
    });

    if (existingByPosition?.[0]) {
      return existingByPosition[0];
    }
  }

  const existingByHref = await strapi.entityService.findMany(UID, {
    locale,
    publicationState: 'preview',
    filters: { href: payload.href },
    limit: 1,
  });

  return existingByHref?.[0] || null;
}

async function upsertLocaleNavigation(strapi, locale, navigation, position, localizationId) {
  const data = normalizePayload(navigation, locale, position);
  const existing = await findExistingNavigation(strapi, locale, data);

  if (existing?.id) {
    return strapi.entityService.update(UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(UID, { data });
}

async function seedNavigation(strapi) {
  const locales = readSeedFile();
  const ukNavigations = locales.uk.navigations || [];
  const enNavigations = locales.en.navigations || [];

  for (let index = 0; index < ukNavigations.length; index += 1) {
    const position = index + 1;
    const ukNavigation = ukNavigations[index];
    const enNavigation = enNavigations[index];

    const ukEntry = await upsertLocaleNavigation(strapi, 'uk', ukNavigation, position);

    if (enNavigation) {
      await upsertLocaleNavigation(strapi, 'en', enNavigation, position, ukEntry.id);
    }
  }

  console.log(`Navigation seed complete. Seeded ${ukNavigations.length} entries for uk/en.`);
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
    await seedNavigation(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
