import { sendEmail } from ".";

const FROM = process.env.SUPPORT_EMAIL as string;

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
