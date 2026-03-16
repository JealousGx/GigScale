import { NextResponse } from "next/server";

import { TimeoutError } from "@/lib/utils/timeout";

/** Default: 5 min in browser only; no CDN caching (private = user-specific data). */
const DEFAULT_MAX_AGE = 60 * 5; // 5 minutes
const DEFAULT_STALE_WHILE_REVALIDATE = 60 * 60 * 24; // 24 hours

export type CacheOptions = {
  /** Browser cache TTL in seconds. Default 300. */
  maxAge?: number;
  /** How long browser may serve stale while revalidating, in seconds. Default 86400. */
  staleWhileRevalidate?: number;
};

/**
 * 200 OK with Cache-Control: private (browser only).
 * Use for auth-scoped data (profile, analysis, rewrites, suggestions) so the CDN
 * never caches it and one user can never receive another user's cached response.
 */
export function okCached<T>(data: T, options: CacheOptions = {}, status = 200) {
  const maxAge = options.maxAge ?? DEFAULT_MAX_AGE;
  const stale = options.staleWhileRevalidate ?? DEFAULT_STALE_WHILE_REVALIDATE;
  const cacheControl = `private, max-age=${maxAge}, stale-while-revalidate=${stale}`;
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": cacheControl,
      Vary: "Cookie",
    },
  });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function handleRouteError(error: unknown, logPrefix: string) {
  console.error(logPrefix, error);
  if (error instanceof TimeoutError) {
    return NextResponse.json({ error: error.message }, { status: 504 });
  }
  return serverError();
}
