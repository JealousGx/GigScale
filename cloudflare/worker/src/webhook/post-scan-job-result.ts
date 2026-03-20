export async function postWebhook(input: {
  webhookUrl: string;
  secret: string;
  payload: Record<string, unknown>;
  label: string;
}): Promise<void> {
  const { webhookUrl, secret, payload, label } = input;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-scan-jobs-secret": secret,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(
      `${label} webhook failed (${res.status})${
        bodyText ? `: ${bodyText}` : ""
      }`,
    );
  }
}

