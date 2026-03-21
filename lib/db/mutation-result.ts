import "server-only";

import type { ResultSetHeader } from "mysql2/promise";

/**
 * Normalizes Drizzle write-result shapes:
 * - **mysql2**: `[ResultSetHeader, FieldPacket[]]` → `affectedRows`
 * - **TiDB serverless**: `FullResult` → `rowsAffected` (see `@tidbcloud/serverless`)
 */
export function getMutationAffectedRows(result: unknown): number {
  if (result == null) return 0;

  if (Array.isArray(result) && result[0]) {
    const header = result[0] as ResultSetHeader;
    if (typeof header.affectedRows === "number") return header.affectedRows;
  }

  if (typeof result === "object") {
    const r = result as Record<string, unknown>;
    const n =
      (typeof r.rowsAffected === "number" ? r.rowsAffected : undefined) ??
      (typeof r.affectedRows === "number" ? r.affectedRows : undefined) ??
      (typeof r.rowCount === "number" ? r.rowCount : undefined) ??
      (typeof r.changes === "number" ? r.changes : undefined);
    if (typeof n === "number") return n;
  }

  return 0;
}
