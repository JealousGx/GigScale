import { polarClient } from "@polar-sh/better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient(), polarClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
