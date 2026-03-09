"use server";

import { Resend } from "resend";

import { env } from "@/lib/env";

type BaseEmail = {
  to: string;
  from: string;
};

type RawEmail = BaseEmail & {
  template?: never;
  subject: string;
  html: string;
  text: string;
};

type TemplateEmail = BaseEmail & {
  template: {
    id: string;
    variables?: Record<string, string | number> | undefined;
  };
  subject?: never;
  html?: never;
  text?: never;
};

type SendEmailArgs = RawEmail | TemplateEmail;

export const sendEmail = async (data: SendEmailArgs) => {
  const resend = new Resend(env.RESEND_API_KEY);

  const { from, to, template, subject, html, text } = data;

  const payload = template
    ? { from, to, template }
    : { from, to, subject, html, text };

  const { error } = await resend.emails.send(payload);

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
