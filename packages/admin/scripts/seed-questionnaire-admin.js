'use strict';

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'questionnaire-seed.json');
const DEFAULT_LOCALE = 'uk';

const BASE_URL = process.env.STRAPI_URL;
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD;

async function login() {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin login failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json?.data?.token;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function requestAdmin(urlPath, token, options = {}, attempt = 1) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if ([502, 503, 504].includes(res.status) && attempt < 5) {
      const delay = 500 * attempt;
      console.warn(`Retrying ${urlPath} after ${delay}ms (status ${res.status})`);
      await sleep(delay);
      return requestAdmin(urlPath, token, options, attempt + 1);
    }
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json();
}

async function publishEntry(token, uid, id) {
  try {
    return await requestAdmin(`/content-manager/collection-types/${uid}/${id}/actions/publish`, token, {
      method: 'POST',
    });
  } catch (error) {
    const message = String(error?.message || '');
    if (message.includes('already.published')) {
      return null;
    }
    throw error;
  }
}

async function upsertQuestionnaire(token, questionnaire, index) {
  const existing = await requestAdmin(
    `/content-manager/collection-types/api::questionnaire.questionnaire?filters[url][$eq]=${encodeURIComponent(
      questionnaire.url
    )}&page=1&pageSize=1`,
    token
  );

  const payload = {
    title: questionnaire.title,
    url: questionnaire.url,
    position: questionnaire.position ?? index + 1,
    description: questionnaire.description || '',
    isExternal: questionnaire.isExternal ?? true,
    locale: DEFAULT_LOCALE,
  };

  if (existing?.results?.[0]) {
    const id = existing.results[0].id;
    const res = await requestAdmin(`/content-manager/collection-types/api::questionnaire.questionnaire/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await publishEntry(token, 'api::questionnaire.questionnaire', id);
    return res;
  }

  const created = await requestAdmin('/content-manager/collection-types/api::questionnaire.questionnaire', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const createdId = created?.id || created?.data?.id;
  if (createdId) {
    await publishEntry(token, 'api::questionnaire.questionnaire', createdId);
  }
  return created;
}

async function run() {
  if (!BASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Missing STRAPI_URL / STRAPI_ADMIN_EMAIL / STRAPI_ADMIN_PASSWORD');
  }

  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.questionnaires?.length) {
    console.log('No questionnaires found in seed file.');
    return;
  }

  const token = await login();

  for (let index = 0; index < data.questionnaires.length; index += 1) {
    await upsertQuestionnaire(token, data.questionnaires[index], index);
  }

  console.log('Questionnaire seed complete.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
