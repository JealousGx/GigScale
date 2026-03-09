import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  authenticateRequest,
  handleRouteError,
  ok,
  parseBody,
  serverError,
} from "@/lib/api";
import { env } from "@/lib/env";

const SEVERITY_COLORS: Record<string, number> = {
  low: 0x3b82f6,
  medium: 0xf59e0b,
  high: 0xef4444,
  critical: 0x7f1d1d,
};

const SEVERITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const bugReportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  what: z
    .string()
    .min(10, "Please describe what happened (min 10 chars)")
    .max(1000),
  steps: z.string().max(1000).optional(),
  expected: z.string().max(500).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  page: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseBody(request, bugReportSchema);
    if ("error" in parsed) return parsed.error;

    const { title, what, steps, expected, severity, page } = parsed.data;

    let userName = "Anonymous";
    let userEmail = "N/A";
    let userId = "N/A";

    try {
      const authed = await authenticateRequest();
      if (authed) {
        userId = authed.userId;
        userName = authed.session.user.name || "Unknown";
        userEmail = authed.session.user.email || "N/A";
      }
    } catch {
      // User not authenticated — send as anonymous
    }

    const fields = [{ name: "What happened", value: what, inline: false }];

    if (steps) {
      fields.push({ name: "Steps to reproduce", value: steps, inline: false });
    }

    if (expected) {
      fields.push({
        name: "Expected behavior",
        value: expected,
        inline: false,
      });
    }

    fields.push(
      {
        name: "Severity",
        value: SEVERITY_LABELS[severity] ?? severity,
        inline: true,
      },
      { name: "Page", value: page || "Not specified", inline: true },
    );

    fields.push(
      { name: "User", value: userName, inline: true },
      { name: "Email", value: userEmail, inline: true },
      { name: "User ID", value: `\`${userId}\``, inline: true },
    );

    const isProduction = env.BETTER_AUTH_URL.includes("gigscale.app");
    const envTag = isProduction
      ? ""
      : `[${env.BETTER_AUTH_URL.includes("localhost") ? "QA" : "Staging"}] `;

    const embed = {
      title: `${envTag}Bug: ${title}`,
      color: SEVERITY_COLORS[severity] ?? 0x6b7280,
      fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: `GigScale Bug Report${envTag ? ` • ${envTag.trim()}` : ""}`,
      },
    };

    const webhookRes = await fetch(env.DISCORD_BUG_REPORT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "GigScale Bug Reporter",
        embeds: [embed],
      }),
    });

    if (!webhookRes.ok) {
      console.error(
        "[Discord Webhook]",
        webhookRes.status,
        await webhookRes.text(),
      );
      return serverError("Failed to submit bug report. Please try again.");
    }

    return ok({ success: true });
  } catch (error) {
    return handleRouteError(error, "[POST /api/feedback/bug]");
  }
}
