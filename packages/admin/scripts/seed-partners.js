'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::partner.partner';
const SEED_PATH = path.join(__dirname, 'partner-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];
const MIME_TYPES = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};
const ADMIN_ROOT = path.resolve(__dirname, '..');

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid partner seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!Array.isArray(data.locales?.[locale]?.partners)) {
      throw new Error(`Invalid partner seed file: missing locales.${locale}.partners array.`);
    }
  }

  return data.locales;
}

function resolveAssetPath(relativePath) {
  return path.resolve(__dirname, '..', '..', '..', relativePath);
}

function normalizePartner(partner, index) {
  return {
    name: partner.name,
    website: partner.website || null,
    logoPath: partner.logoPath,
    position: partner.position ?? index + 1,
    isHidden: Boolean(partner.isHidden),
  };
}

async function findExistingPartner(strapi, locale, position) {
  const entries = await strapi.entityService.findMany(UID, {
    locale,
    publicationState: 'preview',
    filters: { position },
    limit: 1,
  });

  return entries?.[0] || null;
}

async function findExistingMedia(strapi, fileName) {
  const entries = await strapi.db.query('plugin::upload.file').findMany({
    where: { name: fileName },
    limit: 1,
  });

  return entries?.[0] || null;
}

async function ensureMedia(strapi, relativePath) {
  const absolutePath = resolveAssetPath(relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Partner logo file not found: ${relativePath}`);
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
    throw new Error(`Unsupported partner logo file type: ${extension}`);
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

async function upsertLocalizedPartner(strapi, locale, partner, localizationId) {
  const existing = await findExistingPartner(strapi, locale, partner.position);
  const logoId = partner.logoPath ? await ensureMedia(strapi, partner.logoPath) : null;
  const data = {
    locale,
    name: partner.name,
    website: partner.website,
    position: partner.position,
    isHidden: partner.isHidden,
    logo: logoId,
    publishedAt: new Date().toISOString(),
  };

  if (existing?.id) {
    return strapi.entityService.update(UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(UID, { data });
}

async function seedPartners(strapi) {
  const locales = readSeedFile();
  const ukPartners = locales.uk.partners.map(normalizePartner);
  const enPartners = locales.en.partners.map(normalizePartner);

  if (ukPartners.length !== enPartners.length) {
    throw new Error(
      `Partner seed mismatch: locales.uk.partners has ${ukPartners.length} items, locales.en.partners has ${enPartners.length}.`
    );
  }

  for (let index = 0; index < ukPartners.length; index += 1) {
    const ukPartner = ukPartners[index];
    const enPartner = enPartners[index];

    const ukEntry = await upsertLocalizedPartner(strapi, 'uk', ukPartner);
    await upsertLocalizedPartner(strapi, 'en', enPartner, ukEntry.id);
  }

  console.log(`Partner seed complete. Seeded ${ukPartners.length} partner entries for uk/en.`);
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
    await seedPartners(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
