export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

function endpoint(path) {
  return `${STRAPI_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function entryId(entry) {
  return entry?.documentId || entry?.id;
}

export function field(entry, name, fallback = "") {
  return entry?.[name] ?? entry?.attributes?.[name] ?? fallback;
}

export function relation(entry, name) {
  const value = field(entry, name, null);
  return value?.data ?? value ?? null;
}

export function relationName(entry, name, label = "Sem dados") {
  const related = relation(entry, name);
  return field(related, "name", field(related, "nome", label));
}

export function formatDate(value) {
  if (!value) return "Data por definir";
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function strapiRequest(path, options = {}) {
  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message || `Pedido falhou com estado ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function list(resource, query = "") {
  const suffix = query ? `?${query}` : "";
  const payload = await strapiRequest(`/api/${resource}${suffix}`, {
    cache: "no-store",
  });
  return payload?.data || [];
}

export async function createEntry(resource, data) {
  return strapiRequest(`/api/${resource}`, {
    method: "POST",
    body: JSON.stringify({ data: withPublish(data) }),
  });
}

export async function updateEntry(resource, id, data) {
  return strapiRequest(`/api/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data: withPublish(data) }),
  });
}

export async function deleteEntry(resource, id) {
  return strapiRequest(`/api/${resource}/${id}`, {
    method: "DELETE",
  });
}

function withPublish(data) {
  return {
    ...data,
    publishedAt: data.publishedAt || new Date().toISOString(),
  };
}
