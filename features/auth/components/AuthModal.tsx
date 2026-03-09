"use client";

import { ArrowLeft, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { siteConfig } from "@/config/site";
import { authClient, signIn, signUp } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

type AuthMethod =
  | "select"
  | "otp-send"
  | "otp-verify"
  | "password-login"
  | "password-signup";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "login" | "signup";
}

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

const slideTransition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const };

export function AuthModal({
  open,
  onOpenChange,
  defaultView = "login",
}: AuthModalProps) {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("select");
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpSlotIds = useRef(
    Array.from({ length: 6 }, (_, i) => `otp-slot-${i}`),
  ).current;

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setName("");
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setMethod("select");
      setDirection(1);
      resetForm();
    }
  }, [open, resetForm]);

  const navigate = (to: AuthMethod, dir: number = 1) => {
    setError(null);
    setDirection(dir);
    setMethod(to);
  };

  const goBack = () => {
    if (method === "otp-verify") {
      setOtp(["", "", "", "", "", ""]);
      navigate("otp-send", -1);
    } else {
      navigate("select", -1);
    }
  };

  // --- Google ---
  const handleGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  // --- OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (otpError) {
        setError(otpError.message ?? "Failed to send code. Please try again.");
      } else {
        navigate("otp-verify", 1);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }
    } catch {
      setError("Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await signIn.emailOtp({
        email,
        otp: code,
      });
      if (verifyError) {
        setError(verifyError.message ?? "Invalid code. Please try again.");
      } else {
        onOpenChange(false);
        resetForm();
        router.push("/dashboard");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Password ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: loginError } = await signIn.email({ email, password });
      if (loginError) {
        setError(loginError.message ?? "Invalid email or password.");
      } else {
        onOpenChange(false);
        resetForm();
        router.push("/dashboard");
      }
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: signupError } = await signUp.email({ name, email, password });
      if (signupError) {
        setError(signupError.message ?? "Could not create account.");
      } else {
        onOpenChange(false);
        resetForm();
        router.push("/dashboard");
      }
    } catch {
      setError("Could not create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const title: Record<AuthMethod, string> = {
    select: defaultView === "signup" ? "Create your account" : "Welcome back",
    "otp-send": "Sign in with email",
    "otp-verify": "Check your email",
    "password-login": "Sign in with password",
    "password-signup": "Create your account",
  };

  const description: Record<AuthMethod, string> = {
    select: `Continue to ${siteConfig.name}`,
    "otp-send": "We\u2019ll send a 6-digit code to your email",
    "otp-verify": `Enter the code sent to ${email}`,
    "password-login": `Sign in to ${siteConfig.name}`,
    "password-signup": `Start using ${siteConfig.name} today`,
  };

  const showBack = method !== "select";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-100px">
        <DialogHeader className="relative text-center sm:text-center">
          <AnimatePresence mode="popLayout">
            {showBack && (
              <motion.button
                key="back-btn"
                type="button"
                onClick={goBack}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-1 left-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70">
            <span className="text-base font-bold text-primary-foreground">G</span>
          </div>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={method}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <DialogTitle className="text-center">{title[method]}</DialogTitle>
              <DialogDescription className="text-center">
                {description[method]}
              </DialogDescription>
            </motion.div>
          </AnimatePresence>
        </DialogHeader>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={method}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="space-y-4"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* === Method Select === */}
            {method === "select" && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-center gap-3 rounded-xl"
                  onClick={handleGoogle}
                  disabled={isLoading}
                >
                  <GoogleIcon className="size-5" />
                  Continue with Google
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-center gap-3 rounded-xl"
                  onClick={() => navigate("otp-send", 1)}
                >
                  <Mail size={16} strokeWidth={1.5} />
                  Continue with email code
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center gap-3 rounded-xl"
                  onClick={() =>
                    navigate(
                      defaultView === "signup" ? "password-signup" : "password-login",
                      1,
                    )
                  }
                >
                  <Lock size={16} strokeWidth={1.5} />
                  Continue with password
                </Button>
              </div>
            )}

            {/* === OTP Send === */}
            {method === "otp-send" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-email">Email address</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send code
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* === OTP Verify === */}
            {method === "otp-verify" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-3">
                  <Label>Verification code</Label>
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={otpSlotIds[i]}
                        ref={(el) => {
                          otpRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/20 text-center text-lg font-semibold tabular-nums outline-none transition-all",
                          "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                        )}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl"
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Verify &amp; sign in
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
              </form>
            )}

            {/* === Password Login === */}
            {method === "password-login" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pw-email">Email</Label>
                  <Input
                    id="pw-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-password">Password</Label>
                  <Input
                    id="pw-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      navigate("password-signup", 1);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {/* === Password Signup === */}
            {method === "password-signup" && (
              <form onSubmit={handlePasswordSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input
                    id="su-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Password</Label>
                  <Input
                    id="su-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      navigate("password-login", -1);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
