import { env } from "@/lib/env";

import { sendEmail } from ".";

const FROM = env.NEXT_PUBLIC_SUPPORT_EMAIL;

export async function sendAuthOTPEmail(data: { email: string; otp: string }) {
  await sendEmail({
    from: FROM,
    to: data.email,
    template: {
      id: "account-verification-code",
      variables: {
        OTP: data.otp,
        CURR_YEAR: new Date().getFullYear(),
      },
    },
  });
}
