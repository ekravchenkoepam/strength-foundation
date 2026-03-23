'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::documents-page.documents-page';
const DOCUMENT_UID = 'api::document.document';
const SEED_PATH = path.join(__dirname, 'documents-page-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid documents-page seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!data.locales[locale]) {
      throw new Error(`Invalid documents-page seed file: missing "${locale}" locale payload.`);
    }
  }

  return data.locales;
}

function normalizePayload(localePayload, locale) {
  return {
    locale,
    title: localePayload.title,
    description: localePayload.description || '',
    documents: [],
    publishedAt: new Date().toISOString(),
  };
}

async function resolveDocumentIds(strapi, localePayload) {
  const requestedDocumentNames = Array.isArray(localePayload.documents) ? localePayload.documents : [];
  const documents = await strapi.entityService.findMany(DOCUMENT_UID, {
    publicationState: 'preview',
    fields: ['name'],
    sort: ['id:asc'],
  });

  if (!requestedDocumentNames.length) {
    return documents.map(document => document.id);
  }

  const documentsByName = new Map(documents.map(document => [document.name, document.id]));
  const missingDocumentNames = requestedDocumentNames.filter(name => !documentsByName.has(name));

  if (missingDocumentNames.length) {
    throw new Error(`Documents page seed references missing documents: ${missingDocumentNames.join(', ')}`);
  }

  return requestedDocumentNames.map(name => documentsByName.get(name));
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
  data.documents = await resolveDocumentIds(strapi, localePayload);

  if (existing?.id) {
    return strapi.entityService.update(UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(UID, { data });
}

async function seedDocumentsPage(strapi) {
  const locales = readSeedFile();

  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, ukEntry.id);

  console.log(`Documents page seed complete. uk id=${ukEntry.id}, en id=${enEntry.id}`);
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
    await seedDocumentsPage(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
