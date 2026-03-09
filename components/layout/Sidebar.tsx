"use client";

import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  type LucideIcon,
  PenLine,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { dashboardNav } from "@/config/navigation";

import { signOut, useSession } from "@/lib/auth/client";
import { useCreditsStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "dashboard-speed-01": LayoutDashboard,
  "analytics-01": BarChart3,
  "idea-01": Lightbulb,
  "quill-write-02": PenLine,
  "credit-card-01": CreditCard,
  "settings-01": Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user ?? null;

  const setLoaded = useCreditsStore((s) => s.setLoaded);

  const handleSignOut = async () => {
    setLoaded(false);
    await signOut({ fetchOptions: { onSuccess: () => router.replace("/") } });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border/50 bg-sidebar">
      <div className="flex h-16 items-center px-6">
        <BrandLogo size="md" withText />
      </div>

      <nav className="flex-1 space-y-1 px-3 pt-4">
        {dashboardNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              {Icon && (
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="shrink-0"
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 text-xs font-medium">
              {user?.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user?.name ?? "Guest User"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "guest@gigscale.app"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
