"use client";

import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfiles } from "@/features/profile-scan/hooks/useProfiles";
import { useActiveProfileStore } from "@/lib/stores";
import { cn, getProfileDisplayName } from "@/lib/utils";


const PLATFORM_LABELS: Record<string, string> = {
  upwork: "Upwork",
  fiverr: "Fiverr",
};

export function ProfileSwitcher() {
  const profileId = useActiveProfileStore((s) => s.profileId);
  const setProfileId = useActiveProfileStore((s) => s.setProfileId);
  const { data: profiles } = useProfiles();

  if (!profiles || profiles.length < 2) return null;

  const active = profiles.find((p) => p.id === profileId) ?? profiles[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent">
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            active.platform === "upwork"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
          )}
        >
          {PLATFORM_LABELS[active.platform] ?? active.platform}
        </span>
        <span className="flex-1 truncate font-medium">
          {getProfileDisplayName(active)}
        </span>
        <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        {profiles.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setProfileId(p.id)}
            className={cn(
              "flex items-center gap-2",
              p.id === active.id && "bg-accent",
            )}
          >
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                p.platform === "upwork"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
              )}
            >
              {PLATFORM_LABELS[p.platform] ?? p.platform}
            </span>
            <span className="truncate">{getProfileDisplayName(p)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
