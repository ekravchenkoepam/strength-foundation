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

function normalizeDocumentItem(documentItem) {
  if (typeof documentItem === 'string') {
    return { name: documentItem };
  }

  if (documentItem && typeof documentItem === 'object' && typeof documentItem.name === 'string') {
    return { name: documentItem.name };
  }

  return null;
}

function getLocaleDocuments(locales, locale) {
  const documents = locales?.[locale]?.documents;

  if (!Array.isArray(documents)) {
    throw new Error(`Invalid documents-page seed file: locales.${locale}.documents must be an array.`);
  }

  return documents.map(normalizeDocumentItem);
}

async function findDocumentByName(strapi, locale, name) {
  const entries = await strapi.entityService.findMany(DOCUMENT_UID, {
    locale,
    publicationState: 'preview',
    filters: { name },
    limit: 1,
  });

  return entries?.[0] || null;
}

async function upsertLocalizedDocument(strapi, locale, documentItem, localizationId) {
  const existing = await findDocumentByName(strapi, locale, documentItem.name);
  const data = {
    locale,
    name: documentItem.name,
    publishedAt: new Date().toISOString(),
  };

  if (existing?.id) {
    return strapi.entityService.update(DOCUMENT_UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(DOCUMENT_UID, { data });
}

async function seedDocuments(strapi, locales) {
  const ukDocuments = getLocaleDocuments(locales, 'uk');
  const enDocuments = getLocaleDocuments(locales, 'en');

  if (ukDocuments.length !== enDocuments.length) {
    throw new Error(
      `Documents seed mismatch: locales.uk.documents has ${ukDocuments.length} items, locales.en.documents has ${enDocuments.length}.`
    );
  }

  const documentIdsByLocale = {
    uk: [],
    en: [],
  };

  for (let index = 0; index < ukDocuments.length; index += 1) {
    const ukDocument = ukDocuments[index];
    const enDocument = enDocuments[index];

    if (!ukDocument?.name || !enDocument?.name) {
      throw new Error(`Invalid documents seed at index ${index}: both uk and en documents must define a name.`);
    }

    const ukEntry = await upsertLocalizedDocument(strapi, 'uk', ukDocument);
    const enEntry = await upsertLocalizedDocument(strapi, 'en', enDocument, ukEntry.id);
    documentIdsByLocale.uk.push(ukEntry.id);
    documentIdsByLocale.en.push(enEntry.id);
  }

  return documentIdsByLocale;
}

async function resolveDocumentIds(strapi, locale, localePayload, seededDocumentIdsByLocale) {
  const requestedDocuments = Array.isArray(localePayload.documents)
    ? localePayload.documents.map(normalizeDocumentItem)
    : [];

  if (seededDocumentIdsByLocale?.[locale]?.length) {
    return seededDocumentIdsByLocale[locale];
  }

  const documents = await strapi.entityService.findMany(DOCUMENT_UID, {
    publicationState: 'preview',
    fields: ['name'],
    locale,
    sort: ['id:asc'],
  });

  if (!requestedDocuments.length) {
    return documents.map(document => document.id);
  }

  const documentsByName = new Map(documents.map(document => [document.name, document.id]));
  const requestedDocumentNames = requestedDocuments.map(document => document?.name).filter(Boolean);
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

async function upsertLocale(strapi, locale, localePayload, seededDocumentIdsByLocale, localizationId) {
  const existing = await getLocaleEntry(strapi, locale);
  const data = normalizePayload(localePayload, locale);
  data.documents = await resolveDocumentIds(strapi, locale, localePayload, seededDocumentIdsByLocale);

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
  const seededDocumentIdsByLocale = await seedDocuments(strapi, locales);

  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk, seededDocumentIdsByLocale);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, seededDocumentIdsByLocale, ukEntry.id);

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
