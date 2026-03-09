"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Image from "next/image";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PageTransition } from "@/components/motion/PageTransition";
import { CreditsProvider } from "@/components/providers/CreditsProvider";
import { useSession } from "@/lib/auth/client";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo/logo.png"
          alt="GigScale"
          width={40}
          height={40}
          className="size-10 rounded-xl"
          priority
        />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/?auth=login");
    }
  }, [isPending, session, router]);

  if (isPending) return <DashboardSkeleton />;
  if (!session) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <CreditsProvider>
        <div className="lg:pl-64">
          <Navbar onMenuToggle={() => setMobileOpen(true)} />
          <main className="px-6 py-8 lg:px-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </CreditsProvider>
    </div>
  );
}
