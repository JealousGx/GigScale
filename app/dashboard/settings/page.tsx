"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSession } from "@/lib/auth/client";
import { useThemeStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const { theme, setTheme } = useThemeStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

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

      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
            />
          </div>
          <Button className="rounded-2xl">Save Changes</Button>
        </div>
      </section>

      <div className="h-px bg-border/30" />

      {/* Appearance Section */}
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
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border/30" />

      {/* Danger Zone */}
      <section className="space-y-6">
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
          <Button variant="destructive" size="sm" className="rounded-xl">
            Delete
          </Button>
        </div>
      </section>
    </div>
  );
}
