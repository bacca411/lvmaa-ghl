const GHL_API_BASE = "https://services.leadconnectorhq.com";

const GHL_CUSTOM_FIELDS = {
  studentId: "aWEE1WrxowIxGF1VVlC8",
  program: "qsLpRD464o5i6kMmA85I",
  status: "vSE9XyJaEauGM0ctJ5Xi",
  beltRank: "1Xalro1yGlUZZ0VZtwX5",
  lastAttended: "kInJnj4wT4LqM3QieiLq",
};

type GhlUpsertInput = {
  ghlContactId?: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  studentNumber?: string | null;
  program?: string | null;
  status?: string | null;
  beltRank?: string | null;
  lastAttended?: Date | string | null;
};

function getHeaders() {
  if (!process.env.GHL_API_KEY) {
    throw new Error("GHL_API_KEY is not set");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };
}

function formatDate(value?: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().split("T")[0];
}

function buildCustomFields(input: GhlUpsertInput) {
  const customFields: Array<{ id: string; value: string }> = [];

  if (input.studentNumber) {
    customFields.push({
      id: GHL_CUSTOM_FIELDS.studentId,
      value: input.studentNumber,
    });
  }

  if (input.program) {
    customFields.push({
      id: GHL_CUSTOM_FIELDS.program,
      value: input.program,
    });
  }

  if (input.status) {
    customFields.push({
      id: GHL_CUSTOM_FIELDS.status,
      value: input.status,
    });
  }

  if (input.beltRank) {
    customFields.push({
      id: GHL_CUSTOM_FIELDS.beltRank,
      value: input.beltRank,
    });
  }

  const lastAttended = formatDate(input.lastAttended);
  if (lastAttended) {
    customFields.push({
      id: GHL_CUSTOM_FIELDS.lastAttended,
      value: lastAttended,
    });
  }

  return customFields;
}

// CHANGED: use GHL upsert instead of plain create
export async function upsertGhlContact(input: GhlUpsertInput) {
  if (!process.env.GHL_LOCATION_ID) {
    throw new Error("GHL_LOCATION_ID is not set");
  }

  const response = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      locationId: process.env.GHL_LOCATION_ID,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || undefined,
      email: input.email || undefined,
      customFields: buildCustomFields(input),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || "Failed to upsert GHL contact"
    );
  }

  return data.contact;
}

export async function updateGhlContact(contactId: string, input: GhlUpsertInput) {
  const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || undefined,
      email: input.email || undefined,
      customFields: buildCustomFields(input),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || "Failed to update GHL contact"
    );
  }

  return data.contact;
}

export async function syncStudentToGhl(input: GhlUpsertInput) {
  if (input.ghlContactId) {
    return updateGhlContact(input.ghlContactId, input);
  }

  // CHANGED: if we do not already know the contact ID,
  // let GHL try to match by its duplicate settings before creating
  return upsertGhlContact(input);
}