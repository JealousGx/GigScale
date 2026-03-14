"use server";

import { cookies } from "next/headers";

import { THEME_COOKIE_NAME } from "@/lib/theme";

export async function setThemeCookie(resolved: "dark" | "light") {
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE_NAME, resolved, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}
