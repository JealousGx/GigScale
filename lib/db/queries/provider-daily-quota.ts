import "server-only";

import { and, eq, lt, sql } from "drizzle-orm";

import { getDb, getMutationAffectedRows } from "..";
import { providerDailyQuota } from "../schema/provider-daily-quota";

export class ProviderDailyQuotaExceededError extends Error {
  provider: string;
  day: string;
  limitPerDay: number;
  providerUsed: number;

  constructor(data: {
    provider: string;
    day: string;
    limitPerDay: number;
    providerUsed: number;
  }) {
    super(
      `Daily quota exceeded for provider '${data.provider}' on ${data.day}. ` +
        `Limit ${data.limitPerDay}, used ${data.providerUsed}.`,
    );
    this.name = "ProviderDailyQuotaExceededError";
    this.provider = data.provider;
    this.day = data.day;
    this.limitPerDay = data.limitPerDay;
    this.providerUsed = data.providerUsed;
  }
}

function toUtcDayKey(date: Date): string {
  // `YYYY-MM-DD` in UTC; stable for “reset at midnight UTC” semantics.
  return date.toISOString().slice(0, 10);
}

export async function consumeProviderDailyQuotaOrThrow(data: {
  provider: string;
  limitPerDay: number;
  /**
   * For testing / deterministic runs. Defaults to `now` in UTC.
   */
  dayKey?: string;
}): Promise<{ dayKey: string; providerUsed: number; limitPerDay: number }> {
  const dayKey = data.dayKey ?? toUtcDayKey(new Date());

  // 1) Try atomic conditional increment on the existing row:
  //    UPDATE ... WHERE provider_used < limit
  //    This guarantees no overshoot under concurrency.
  const conditionalUpdate = await getDb()
    .update(providerDailyQuota)
    .set({
      providerUsed: sql`${providerDailyQuota.providerUsed} + 1`,
      updatedAt: sql`CURRENT_TIMESTAMP(3)`,
    })
    .where(
      and(
        eq(providerDailyQuota.provider, data.provider),
        eq(providerDailyQuota.day, dayKey),
        lt(providerDailyQuota.providerUsed, data.limitPerDay),
      ),
    );

  if (getMutationAffectedRows(conditionalUpdate) > 0) {
    const [row] = await getDb()
      .select({ providerUsed: providerDailyQuota.providerUsed })
      .from(providerDailyQuota)
      .where(
        and(
          eq(providerDailyQuota.provider, data.provider),
          eq(providerDailyQuota.day, dayKey),
        ),
      )
      .limit(1);

    // This should be impossible if the UPDATE matched an existing row.
    if (!row) {
      throw new Error(
        `Quota row missing after conditional update (provider=${data.provider}, day=${dayKey})`,
      );
    }

    return {
      dayKey,
      providerUsed: row.providerUsed,
      limitPerDay: data.limitPerDay,
    };
  }

  // 2) If the row doesn't exist yet, attempt INSERT.
  //    If another concurrent request inserted first, we'll retry the conditional
  //    UPDATE (still guaranteed to not overshoot because it checks provider_used < limit).
  try {
    await getDb().insert(providerDailyQuota).values({
      provider: data.provider,
      day: dayKey,
      providerUsed: 1,
      updatedAt: new Date(),
    });

    return {
      dayKey,
      providerUsed: 1,
      limitPerDay: data.limitPerDay,
    };
  } catch {
    // Unique constraint on (provider, day) is expected under concurrency.
  }

  const conditionalUpdateAfterInsertAttempt = await getDb()
    .update(providerDailyQuota)
    .set({
      providerUsed: sql`${providerDailyQuota.providerUsed} + 1`,
      updatedAt: sql`CURRENT_TIMESTAMP(3)`,
    })
    .where(
      and(
        eq(providerDailyQuota.provider, data.provider),
        eq(providerDailyQuota.day, dayKey),
        lt(providerDailyQuota.providerUsed, data.limitPerDay),
      ),
    );

  if (getMutationAffectedRows(conditionalUpdateAfterInsertAttempt) > 0) {
    const [row] = await getDb()
      .select({ providerUsed: providerDailyQuota.providerUsed })
      .from(providerDailyQuota)
      .where(
        and(
          eq(providerDailyQuota.provider, data.provider),
          eq(providerDailyQuota.day, dayKey),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error(
        `Quota row missing after conditional retry (provider=${data.provider}, day=${dayKey})`,
      );
    }

    return {
      dayKey,
      providerUsed: row.providerUsed,
      limitPerDay: data.limitPerDay,
    };
  }

  // 3) Still no conditional update: we are capped. Read current used count for a good error.
  const [row] = await getDb()
    .select({ providerUsed: providerDailyQuota.providerUsed })
    .from(providerDailyQuota)
    .where(
      and(
        eq(providerDailyQuota.provider, data.provider),
        eq(providerDailyQuota.day, dayKey),
      ),
    )
    .limit(1);

  if (!row) {
    // Extremely rare: treat as exceeded with used=0 so callers can surface a consistent message.
    throw new ProviderDailyQuotaExceededError({
      provider: data.provider,
      day: dayKey,
      limitPerDay: data.limitPerDay,
      providerUsed: 0,
    });
  }

  throw new ProviderDailyQuotaExceededError({
    provider: data.provider,
    day: dayKey,
    limitPerDay: data.limitPerDay,
    providerUsed: row.providerUsed,
  });
}

export async function getProviderDailyQuotaUsage(data: {
  provider: string;
  dayKey?: string;
}): Promise<{ dayKey: string; providerUsed: number | null }> {
  const dayKey = data.dayKey ?? toUtcDayKey(new Date());
  const [row] = await getDb()
    .select({ providerUsed: providerDailyQuota.providerUsed })
    .from(providerDailyQuota)
    .where(
      and(
        eq(providerDailyQuota.provider, data.provider),
        eq(providerDailyQuota.day, dayKey),
      ),
    )
    .limit(1);

  return { dayKey, providerUsed: row?.providerUsed ?? null };
}
