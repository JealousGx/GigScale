"use client";

import imageCompression from "browser-image-compression";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authClient, useSession } from "@/lib/auth/client";
import { useThemeStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, refetch } = useSession();
  const user = session?.user ?? null;
  const { theme, setTheme } = useThemeStore();

  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setAvatarPreview(user.image ?? null);
    }
  }, [user]);

  useEffect(() => {
    async function checkAccounts() {
      try {
        const { data } = await authClient.listAccounts();
        const hasCredential = data?.some(
          (a: { providerId: string }) => a.providerId === "credential",
        );
        setHasPassword(!!hasCredential);
      } catch {
        setHasPassword(false);
      }
    }
    checkAccounts();
  }, []);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 1 * 1024 * 1024) {
        toast.error("File too large. Maximum 1MB.");
        return;
      }

      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: "image/webp",
        });

        const formData = new FormData();
        formData.append("avatar", compressed, "avatar.webp");
        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        await res.json();
        await refetch();
        toast.success("Avatar updated");
      } catch (err) {
        setAvatarPreview(user?.image ?? null);
        toast.error(
          err instanceof Error ? err.message : "Failed to upload avatar",
        );
      }
    },
    [user, refetch],
  );

  const handleProfileSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setProfileLoading(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      await refetch();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (hasPassword && !currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      if (hasPassword) {
        const { error } = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });
        if (error) {
          toast.error(error.message ?? "Failed to change password");
          return;
        }
      } else {
        const res = await fetch("/api/auth/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data.message ?? "Failed to set password");
          return;
        }
        setHasPassword(true);
      }

      toast.success(
        hasPassword ? "Password changed successfully" : "Password set successfully",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;

    setDeleteLoading(true);
    try {
      await authClient.deleteUser();
      toast.success("Account deleted");
      router.replace("/");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar size="lg" className="size-20">
              {avatarPreview && (
                <AvatarImage src={avatarPreview} alt={name} />
              )}
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 text-lg font-semibold">
                {name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110"
            >
              <Camera size={12} strokeWidth={2} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click the camera icon to change your avatar
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Display Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="max-w-sm bg-muted/20"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here
            </p>
          </div>
          <Button
            onClick={handleProfileSave}
            disabled={profileLoading || name.trim() === (user?.name ?? "")}
            className="rounded-2xl"
          >
            {profileLoading && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </Button>
        </div>
      </section>

      <div className="h-px bg-border/30" />

      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {hasPassword ? "Change Password" : "Set Password"}
        </h2>

        {hasPassword === false && (
          <p className="text-sm text-muted-foreground">
            You signed in with a magic code or social login. Set a password to
            also sign in with email &amp; password.
          </p>
        )}

        <div className="max-w-sm space-y-4">
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">
              {hasPassword ? "New Password" : "Password"}
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={
              passwordLoading ||
              !newPassword ||
              (hasPassword === true && !currentPassword)
            }
            variant="outline"
            className="rounded-2xl"
          >
            {passwordLoading && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {hasPassword ? "Change Password" : "Set Password"}
          </Button>
        </div>
      </section>

      <div className="h-px bg-border/30" />

      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </h2>
        <div className="space-y-3">
          <p className="text-sm font-medium">Theme</p>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  theme === t.value
                    ? "bg-foreground text-background"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border/30" />

      <section className="space-y-6 pb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive/70">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/2 p-5">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Delete
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          By using this service you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">Terms</a>,{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, and{" "}
          <a href="/refund-policy" className="text-primary hover:underline">Refund Policy</a>.
        </p>
      </section>
    </div>
  );
}
