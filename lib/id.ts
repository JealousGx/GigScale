import { uuidv7 } from "uuidv7";

function uuidv7Base64Url() {
  const hex = uuidv7().replace(/-/g, "");
  return Buffer.from(hex, "hex").toString("base64url");
}

export function prefixedId(prefix: string) {
  return `${prefix}_${uuidv7Base64Url()}`;
}

export const ID_PREFIXES = {
  user: "usr",
  session: "ses",
  account: "acc",
  verification: "vrf",
  profile: "prf",
  analysis: "anl",
  suggestion: "sug",
  rewrite: "rwt",
  subscription: "sub",
  usageLog: "usg",
  providerDailyQuota: "pqd",
} as const;

export function userId() {
  return prefixedId(ID_PREFIXES.user);
}

export function sessionId() {
  return prefixedId(ID_PREFIXES.session);
}

export function accountId() {
  return prefixedId(ID_PREFIXES.account);
}

export function verificationId() {
  return prefixedId(ID_PREFIXES.verification);
}

export function profileId() {
  return prefixedId(ID_PREFIXES.profile);
}

export function analysisId() {
  return prefixedId(ID_PREFIXES.analysis);
}

export function suggestionId() {
  return prefixedId(ID_PREFIXES.suggestion);
}

export function rewriteId() {
  return prefixedId(ID_PREFIXES.rewrite);
}

export function subscriptionId() {
  return prefixedId(ID_PREFIXES.subscription);
}

export function usageLogId() {
  return prefixedId(ID_PREFIXES.usageLog);
}

export function providerDailyQuotaId() {
  return prefixedId(ID_PREFIXES.providerDailyQuota);
}
