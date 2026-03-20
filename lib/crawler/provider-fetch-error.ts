export type ProviderErrorKind =
  | "quota_exhausted"
  | "transient_failure"
  | "fatal";

export class ProviderFetchError extends Error {
  providerId: string;
  kind: ProviderErrorKind;

  constructor(data: {
    providerId: string;
    kind: ProviderErrorKind;
    message: string;
    cause?: unknown;
  }) {
    super(data.message, data.cause ? { cause: data.cause } : undefined);
    this.name = "ProviderFetchError";
    this.providerId = data.providerId;
    this.kind = data.kind;
  }
}
