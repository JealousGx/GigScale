import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth, type GenericEndpointContext } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";

import { sendAuthOTPEmail } from "@/lib/emails/auth-otp";
import { env } from "@/lib/env";
import {
  handleOrderPaid,
  handleSubscriptionActive,
  handleSubscriptionCanceled,
  handleSubscriptionRevoked,
  handleSubscriptionUncanceled,
  handleSubscriptionUpdated,
} from "@/lib/polar/webhooks";

import { getDb } from "../db";
import * as schema from "../db/schema";
import { accountId, sessionId, userId, verificationId } from "../id";

const OTP_LENGTH = 6;
const OTP_EXPIRATION_SECONDS = 600;
const ALLOWED_OTP_ATTEMPTS = 5;

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "production",
});

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "mysql",
    schema,
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  plugins: [
    emailOTP({
      sendVerificationOTP,
      otpLength: OTP_LENGTH,
      expiresIn: OTP_EXPIRATION_SECONDS,
      allowedAttempts: ALLOWED_OTP_ATTEMPTS,
    }),

    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: env.POLAR_PRO_PRODUCT_ID,
              slug: "Pro",
            },
            {
              productId: env.POLAR_ENTERPRISE_PRODUCT_ID,
              slug: "Enterprise",
            },
          ],
          successUrl: "/dashboard/billing/checkout/success",
          returnUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onSubscriptionActive: handleSubscriptionActive,
          onSubscriptionCanceled: handleSubscriptionCanceled,
          onSubscriptionRevoked: handleSubscriptionRevoked,
          onSubscriptionUncanceled: handleSubscriptionUncanceled,
          onSubscriptionUpdated: handleSubscriptionUpdated,
          onOrderPaid: handleOrderPaid,
        }),
      ],
    }),
  ],

  experimental: {
    joins: true,
  },

  advanced: {
    database: {
      generateId: (opts) => {
        switch (opts.model) {
          case "user": {
            return userId();
          }

          case "session": {
            return sessionId();
          }

          case "account": {
            return accountId();
          }

          case "verification": {
            return verificationId();
          }

          default: {
            return false;
          }
        }
      },
    },
  },
});

async function sendVerificationOTP(
  data: {
    email: string;
    otp: string;
    type: "sign-in" | "email-verification" | "forget-password" | "change-email";
  },
  _ctx?: GenericEndpointContext | undefined,
) {
  const { email, otp, type } = data;
  switch (type) {
    case "sign-in":
    case "email-verification": {
      await sendAuthOTPEmail({ email, otp });
      break;
    }

    default: {
      throw new Error(
        "Unsupported OTP type. Only 'sign-in', 'email-verification', 'forget-password', and 'change-email' are supported.",
      );
    }
  }
}
