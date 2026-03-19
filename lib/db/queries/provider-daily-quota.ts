import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "..";
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

  const [row] = await getDb()
    .select()
    .from(providerDailyQuota)
    .where(
      and(
        eq(providerDailyQuota.provider, data.provider),
        eq(providerDailyQuota.day, dayKey),
      ),
    )
    .limit(1);

  if (!row) {
    await getDb().insert(providerDailyQuota).values({
      provider: data.provider,
      day: dayKey,
      providerUsed: 1,
      updatedAt: new Date(),
    });

    return { dayKey, providerUsed: 1, limitPerDay: data.limitPerDay };
  }

  if (row.providerUsed >= data.limitPerDay) {
    throw new ProviderDailyQuotaExceededError({
      provider: data.provider,
      day: dayKey,
      limitPerDay: data.limitPerDay,
      providerUsed: row.providerUsed,
    });
  }

  const nextUsed = row.providerUsed + 1;
  await getDb()
    .update(providerDailyQuota)
    .set({
      providerUsed: nextUsed,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(providerDailyQuota.provider, data.provider),
        eq(providerDailyQuota.day, dayKey),
      ),
    );

  return { dayKey, providerUsed: nextUsed, limitPerDay: data.limitPerDay };
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
