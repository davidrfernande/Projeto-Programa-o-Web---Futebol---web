export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1338";

const TOKEN_KEY = "jwt";
const USER_KEY = "user";
const AUTH_EVENT = "auth-changed";
const ADMIN_ROLE_TYPE = "admin";

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

export function isAdminUser(user = getUser()) {
  const role = user?.role;
  const roleType = role?.type?.toLowerCase();
  const roleName = role?.name?.toLowerCase();

  return roleType === ADMIN_ROLE_TYPE || roleName === "admin" || roleName === "administrador";
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
  requireAdmin();

  return strapiRequest(`/api/${resource}`, {
    method: "POST",
    body: JSON.stringify({ data: withPublish(data) }),
  });
}

export async function updateEntry(resource, id, data) {
  requireAdmin();

  return strapiRequest(`/api/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data: withPublish(data) }),
  });
}

export async function deleteEntry(resource, id) {
  requireAdmin();

  return strapiRequest(`/api/${resource}/${id}`, {
    method: "DELETE",
  });
}

export async function createFavorite(team) {
  requireAuth();

  return strapiRequest("/api/favoritos", {
    method: "POST",
    body: JSON.stringify({ data: { team } }),
  });
}

export async function deleteFavorite(id) {
  requireAuth();

  return strapiRequest(`/api/favoritos/${id}`, {
    method: "DELETE",
  });
}

export async function importWorldCup({ league = 27, season = 188 } = {}) {
  requireAdmin();

  return strapiRequest("/api/import/world-cup", {
    method: "POST",
    body: JSON.stringify({ league, season }),
  });
}

export async function login(identifier, password) {
  const payload = await strapiRequest("/api/auth/local", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  saveSession(payload);
  await refreshCurrentUser().catch(() => null);
  return getUser() || payload.user;
}

export async function register(username, email, password) {
  const payload = await strapiRequest("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  saveSession(payload);
  await refreshCurrentUser().catch(() => null);
  return getUser() || payload.user;
}

export async function refreshCurrentUser() {
  if (!isLoggedIn()) return null;

  const user = await strapiRequest("/api/users/me?populate=role", {
    cache: "no-store",
  });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
  return user;
}

function withPublish(data) {
  return {
    ...data,
    publishedAt: data.publishedAt || new Date().toISOString(),
  };
}

function requireAdmin() {
  if (!isLoggedIn()) {
    throw new Error("Precisas de iniciar sessao para fazer esta acao.");
  }

  if (!isAdminUser()) {
    throw new Error("Apenas administradores podem fazer esta acao.");
  }
}

function requireAuth() {
  if (!isLoggedIn()) {
    throw new Error("Precisas de iniciar sessao para fazer esta acao.");
  }
}
