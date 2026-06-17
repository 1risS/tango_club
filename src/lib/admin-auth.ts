import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_SESSION_COOKIE = "btc_admin_session";

type AdminConfig = {
  username: string;
  password: string;
  sessionSecret: string;
};

function getAdminConfig(): AdminConfig {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !sessionSecret) {
    throw new Error(
      "Faltan credenciales de admin. Configura ADMIN_USERNAME, ADMIN_PASSWORD y ADMIN_SESSION_SECRET.",
    );
  }

  return {
    username,
    password,
    sessionSecret,
  };
}

async function buildSessionToken() {
  const { username, password, sessionSecret } = getAdminConfig();
  const payload = `${username}:${password}:${sessionSecret}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );

  return Buffer.from(digest).toString("base64url");
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAdminConfig();
  return username === config.username && password === config.password;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = await buildSessionToken();

  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return false;
  }

  return sessionCookie === (await buildSessionToken());
}

export async function requireAdminAccess() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}