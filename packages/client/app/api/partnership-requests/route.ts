import { NextRequest, NextResponse } from 'next/server';

type PartnershipRequestBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
};

const AIRTABLE_FIELDS = {
  name: 'name',
  phone: 'phone',
  email: 'email',
  message: 'message',
  consent: 'consent',
} as const;

const readText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ERROR_MESSAGES = {
  notConfigured: 'Форму тимчасово не налаштовано. Спробуйте пізніше.',
  invalidBody: 'Некоректні дані форми.',
  invalidFields: 'Перевірте обов’язкові поля та згоду на обробку даних.',
  submissionFailed: 'Не вдалося надіслати запит. Спробуйте ще раз.',
} as const;

const createAirtableRecord = (url: string, accessToken: string, fields: Record<string, string | boolean>) =>
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields }],
      typecast: true,
    }),
    cache: 'no-store',
  });

const readAirtableErrorType = async (response: Response) => {
  const airtableError = (await response.json().catch(() => null)) as {
    error?: { type?: string };
  } | null;

  return airtableError?.error?.type;
};

export async function POST(request: NextRequest) {
  let body: PartnershipRequestBody;

  try {
    body = (await request.json()) as PartnershipRequestBody;
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.invalidBody }, { status: 400 });
  }

  const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_PARTNERSHIP_TABLE_ID;

  if (!accessToken || !baseId || !tableId) {
    console.error('[Partnership request] Airtable environment variables are not configured');
    return NextResponse.json({ error: ERROR_MESSAGES.notConfigured }, { status: 503 });
  }

  if (readText(body.website, 200)) {
    return NextResponse.json({ success: true });
  }

  const name = readText(body.name, 120);
  const phone = readText(body.phone, 50);
  const email = readText(body.email, 254).toLowerCase();
  const message = readText(body.message, 2000);

  if (name.length < 2 || phone.length < 7 || !isValidEmail(email) || body.consent !== true) {
    return NextResponse.json({ error: ERROR_MESSAGES.invalidFields }, { status: 400 });
  }

  const fields: Record<string, string | boolean> = {
    [AIRTABLE_FIELDS.name]: name,
    [AIRTABLE_FIELDS.phone]: phone,
    [AIRTABLE_FIELDS.email]: email,
    [AIRTABLE_FIELDS.consent]: true,
  };

  if (message) {
    fields[AIRTABLE_FIELDS.message] = message;
  }

  const airtableUrl = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;
  let airtableResponse: Response;

  try {
    airtableResponse = await createAirtableRecord(airtableUrl, accessToken, fields);
  } catch (error) {
    console.error('[Partnership request] Airtable could not be reached', error);
    return NextResponse.json({ error: ERROR_MESSAGES.submissionFailed }, { status: 502 });
  }

  if (!airtableResponse.ok) {
    let airtableErrorType = await readAirtableErrorType(airtableResponse);

    if (airtableErrorType === 'INVALID_VALUE_FOR_COLUMN') {
      console.info('[Partnership request] Retrying consent as a text value');

      try {
        airtableResponse = await createAirtableRecord(airtableUrl, accessToken, {
          ...fields,
          [AIRTABLE_FIELDS.consent]: 'true',
        });
        airtableErrorType = airtableResponse.ok ? undefined : await readAirtableErrorType(airtableResponse);
      } catch (error) {
        console.error('[Partnership request] Airtable could not be reached during retry', error);
        return NextResponse.json({ error: ERROR_MESSAGES.submissionFailed }, { status: 502 });
      }
    }

    if (!airtableResponse.ok) {
      console.error('[Partnership request] Airtable rejected the record', {
        status: airtableResponse.status,
        type: airtableErrorType,
      });

      return NextResponse.json({ error: ERROR_MESSAGES.submissionFailed }, { status: 502 });
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
