'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::team-page.team-page';
const SEED_PATH = path.join(__dirname, 'team-page-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid team-page seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!data.locales[locale]) {
      throw new Error(`Invalid team-page seed file: missing "${locale}" locale payload.`);
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

function normalizeMember(member) {
  return {
    name: member.name,
    role: member.role,
    description: toBlocks(member.description),
    socials: (member.socials || []).map(social => ({
      icon: social.icon,
      link: social.link,
    })),
  };
}

function normalizePayload(localePayload, locale) {
  return {
    locale,
    title: localePayload.title,
    motto: localePayload.motto,
    members: (localePayload.members || []).map(normalizeMember),
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

async function seedTeamPage(strapi) {
  const locales = readSeedFile();

  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, ukEntry.id);

  console.log(`Team page seed complete. uk id=${ukEntry.id}, en id=${enEntry.id}`);
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
    await seedTeamPage(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
