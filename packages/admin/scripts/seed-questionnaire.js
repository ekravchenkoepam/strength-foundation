'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'questionnaire-seed.json');
const DEFAULT_LOCALE = 'uk';

async function seedQuestionnaires(strapi) {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.questionnaires?.length) {
    console.log('No questionnaires found in seed file.');
    return;
  }

  for (let index = 0; index < data.questionnaires.length; index += 1) {
    const questionnaire = data.questionnaires[index];
    const payload = {
      title: questionnaire.title,
      url: questionnaire.url,
      position: questionnaire.position ?? index + 1,
      description: questionnaire.description || '',
      isExternal: questionnaire.isExternal ?? true,
      locale: DEFAULT_LOCALE,
      publishedAt: new Date().toISOString(),
    };

    const existing = await strapi.entityService.findMany('api::questionnaire.questionnaire', {
      filters: { url: questionnaire.url },
      limit: 1,
    });

    if (existing?.[0]) {
      await strapi.entityService.update('api::questionnaire.questionnaire', existing[0].id, {
        data: payload,
      });
    } else {
      await strapi.entityService.create('api::questionnaire.questionnaire', {
        data: payload,
      });
    }
  }

  console.log('Questionnaire seed complete.');
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
    await seedQuestionnaires(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
