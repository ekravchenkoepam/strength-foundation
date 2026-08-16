'use strict';

const fs = require('fs');
const path = require('path');
const strapiFactory = require('@strapi/strapi');

const UID = 'api::partner-page.partner-page';
const SEED_PATH = path.join(__dirname, 'partner-page-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid partner-page seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!data.locales[locale]) {
      throw new Error(`Invalid partner-page seed file: missing "${locale}" locale payload.`);
    }
  }

  return data.locales;
}

function normalizePayload(localePayload, locale) {
  return {
    locale,
    ...localePayload,
    form: {
      ...localePayload.form,
    },
    publishedAt: new Date().toISOString(),
  };
}

async function getLocaleEntry(strapi, locale) {
  return strapi.entityService.findMany(UID, {
    locale,
    publicationState: 'preview',
  });
}

async function upsertLocale(strapi, locale, localePayload, localizationId) {
  const existing = await getLocaleEntry(strapi, locale);
  const data = normalizePayload(localePayload, locale);

  if (existing?.id) {
    return strapi.entityService.update(UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(UID, { data });
}

async function seedPartnerPage(strapi) {
  const locales = readSeedFile();
  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, ukEntry.id);

  console.log(`Partner page seed complete. uk id=${ukEntry.id}, en id=${enEntry.id}`);
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
    await seedPartnerPage(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  seedPartnerPage,
};
