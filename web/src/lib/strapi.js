export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1338";

const TOKEN_KEY = "jwt";
const USER_KEY = "user";
const AUTH_EVENT = "auth-changed";

function endpoint(path) {
  return `${STRAPI_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function saveSession({ jwt, user }) {
  localStorage.setItem(TOKEN_KEY, jwt);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function onAuthChange(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
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
  const token = getToken();

  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  requireAuth();

  return strapiRequest(`/api/${resource}`, {
    method: "POST",
    body: JSON.stringify({ data: withPublish(data) }),
  });
}

export async function updateEntry(resource, id, data) {
  requireAuth();

  return strapiRequest(`/api/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data: withPublish(data) }),
  });
}

export async function deleteEntry(resource, id) {
  requireAuth();

  return strapiRequest(`/api/${resource}/${id}`, {
    method: "DELETE",
  });
}

export async function login(identifier, password) {
  const payload = await strapiRequest("/api/auth/local", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  saveSession(payload);
  return payload;
}

export async function register(username, email, password) {
  const payload = await strapiRequest("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  saveSession(payload);
  return payload;
}

function withPublish(data) {
  return {
    ...data,
    publishedAt: data.publishedAt || new Date().toISOString(),
  };
}

function requireAuth() {
  if (!isLoggedIn()) {
    throw new Error("Precisas de iniciar sessao para fazer esta acao.");
  }
}
