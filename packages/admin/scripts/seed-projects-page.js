'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const UID = 'api::projects-page.projects-page';
const PROJECT_UID = 'api::project.project';
const SEED_PATH = path.join(__dirname, 'projects-page-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];

function syncLocalizations(strapi, modelUid, entries) {
  const validEntries = entries.filter(entry => entry?.id);

  if (validEntries.length < 2) {
    return Promise.resolve();
  }

  const model = strapi.getModel(modelUid);
  const service = strapi.plugin('i18n').service('localizations');

  return Promise.all(
    validEntries.map(entry =>
      service.syncLocalizations(
        {
          id: entry.id,
          localizations: validEntries
            .filter(localization => localization.id !== entry.id)
            .map(localization => ({ id: localization.id })),
        },
        { model }
      )
    )
  );
}

function readSeedFile() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.locales) {
    throw new Error('Invalid projects-page seed file: missing "locales" object.');
  }

  for (const locale of REQUIRED_LOCALES) {
    if (!data.locales[locale]) {
      throw new Error(`Invalid projects-page seed file: missing "${locale}" locale payload.`);
    }
  }

  return data.locales;
}

function normalizeProjectItem(projectItem) {
  if (projectItem && typeof projectItem === 'object') {
    return {
      title: projectItem.title,
      slug: projectItem.slug,
      subtitle: projectItem.subtitle || '',
      description: projectItem.description || '',
      buttonText: projectItem.buttonText || '',
      // `blocks` is the dynamic zone — keep raw, normalized at apply-time so
      // we can resolve sub-projects relations after the first seeding pass.
      blocks: Array.isArray(projectItem.blocks) ? projectItem.blocks : [],
    };
  }

  return null;
}

function getRequestedProjects(localePayload, locale) {
  const projects = localePayload?.projects;

  if (!Array.isArray(projects)) {
    throw new Error(`Invalid projects-page seed file: locales.${locale}.projects must be an array.`);
  }

  return projects.map(normalizeProjectItem);
}

async function findProjectBySlug(strapi, locale, slug) {
  const entries = await strapi.entityService.findMany(PROJECT_UID, {
    locale,
    publicationState: 'preview',
    filters: { slug },
    limit: 1,
  });

  return entries?.[0] || null;
}

async function upsertLocalizedProject(strapi, locale, projectItem, localizationId) {
  const existing = await findProjectBySlug(strapi, locale, projectItem.slug);

  // Pass 1: do NOT write `blocks` yet — sub-project relations need IDs that
  // only exist after every project (in every locale) has been upserted.
  const data = {
    locale,
    title: projectItem.title,
    slug: projectItem.slug,
    subtitle: projectItem.subtitle,
    description: projectItem.description,
    buttonText: projectItem.buttonText,
    publishedAt: new Date().toISOString(),
  };

  if (existing?.id) {
    return strapi.entityService.update(PROJECT_UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(PROJECT_UID, { data });
}

/**
 * Resolve any cross-project relations inside a `blocks` array.
 *
 * - `project-sections.sub-projects` carries `projects: string[]` (slugs in the
 *   seed file). We swap them for the locale-specific Project entry IDs.
 * - Components reference IDs by entity, so each locale must use its own map.
 *
 * Unknown slugs are dropped with a warning so a typo doesn't crash the seed.
 */
function resolveBlocks(blocks, locale, projectIdBySlugForLocale) {
  if (!Array.isArray(blocks)) return [];

  return blocks.map(block => {
    if (!block || typeof block !== 'object') return block;

    if (block.__component === 'project-sections.sub-projects') {
      const slugs = Array.isArray(block.projects) ? block.projects : [];
      const ids = slugs
        .map(slug => {
          const id = projectIdBySlugForLocale[slug];
          if (!id) {
            console.warn(
              `[seed] sub-projects: slug "${slug}" not found for locale "${locale}" — skipping.`
            );
          }
          return id;
        })
        .filter(Boolean);

      return { ...block, projects: ids };
    }

    return block;
  });
}

async function applyBlocksToProject(strapi, locale, projectItem, projectIdBySlugForLocale) {
  if (!Array.isArray(projectItem.blocks) || projectItem.blocks.length === 0) {
    return;
  }

  const existing = await findProjectBySlug(strapi, locale, projectItem.slug);
  if (!existing?.id) {
    console.warn(`[seed] cannot apply blocks: ${locale}/${projectItem.slug} not found after pass 1.`);
    return;
  }

  const resolvedBlocks = resolveBlocks(projectItem.blocks, locale, projectIdBySlugForLocale);

  await strapi.entityService.update(PROJECT_UID, existing.id, {
    data: {
      blocks: resolvedBlocks,
      publishedAt: new Date().toISOString(),
    },
  });
}

async function seedProjects(strapi, locales) {
  const ukProjects = getRequestedProjects(locales.uk, 'uk');
  const enProjects = getRequestedProjects(locales.en, 'en');

  if (ukProjects.length !== enProjects.length) {
    throw new Error(
      `Projects seed mismatch: locales.uk.projects has ${ukProjects.length} items, locales.en.projects has ${enProjects.length}.`
    );
  }

  const projectIdsByLocale = { uk: [], en: [] };
  const projectIdBySlugByLocale = { uk: {}, en: {} };

  // ---- Pass 1: create / update every project WITHOUT blocks --------------
  for (let index = 0; index < ukProjects.length; index += 1) {
    const ukProject = ukProjects[index];
    const enProject = enProjects[index];

    if (!ukProject?.title || !ukProject?.slug || !ukProject?.buttonText) {
      throw new Error(`Invalid projects seed at index ${index}: uk project must define title, slug, and buttonText.`);
    }

    if (!enProject?.title || !enProject?.slug || !enProject?.buttonText) {
      throw new Error(`Invalid projects seed at index ${index}: en project must define title, slug, and buttonText.`);
    }

    if (ukProject.slug !== enProject.slug) {
      throw new Error(
        `Projects seed slug mismatch at index ${index}: uk uses "${ukProject.slug}" and en uses "${enProject.slug}".`
      );
    }

    const ukEntry = await upsertLocalizedProject(strapi, 'uk', ukProject);
    const enEntry = await upsertLocalizedProject(strapi, 'en', enProject, ukEntry.id);

    await syncLocalizations(strapi, PROJECT_UID, [ukEntry, enEntry]);

    projectIdsByLocale.uk.push(ukEntry.id);
    projectIdsByLocale.en.push(enEntry.id);
    projectIdBySlugByLocale.uk[ukProject.slug] = ukEntry.id;
    projectIdBySlugByLocale.en[enProject.slug] = enEntry.id;
  }

  // ---- Pass 2: apply localized `blocks` with relations resolved ----------
  for (let index = 0; index < ukProjects.length; index += 1) {
    await applyBlocksToProject(strapi, 'uk', ukProjects[index], projectIdBySlugByLocale.uk);
    await applyBlocksToProject(strapi, 'en', enProjects[index], projectIdBySlugByLocale.en);
  }

  return projectIdsByLocale;
}

function normalizePayload(localePayload, locale, seededProjectIdsByLocale) {
  return {
    locale,
    title: localePayload.title,
    projects: seededProjectIdsByLocale[locale] || [],
    publishedAt: new Date().toISOString(),
  };
}

async function getLocaleEntry(strapi, locale) {
  return strapi.entityService.findMany(UID, {
    locale,
    publicationState: 'preview',
  });
}

async function upsertLocale(strapi, locale, localePayload, localizationId, seededProjectIdsByLocale) {
  const existing = await getLocaleEntry(strapi, locale);
  const data = normalizePayload(localePayload, locale, seededProjectIdsByLocale);

  if (existing?.id) {
    return strapi.entityService.update(UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(UID, { data });
}

async function seedProjectsPage(strapi) {
  const locales = readSeedFile();
  const seededProjectIdsByLocale = await seedProjects(strapi, locales);

  const ukEntry = await upsertLocale(strapi, 'uk', locales.uk, undefined, seededProjectIdsByLocale);
  const enEntry = await upsertLocale(strapi, 'en', locales.en, ukEntry.id, seededProjectIdsByLocale);

  await syncLocalizations(strapi, UID, [ukEntry, enEntry]);

  console.log(`Projects page seed complete. uk id=${ukEntry.id}, en id=${enEntry.id}`);
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
    await seedProjectsPage(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
