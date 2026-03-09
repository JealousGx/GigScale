import { Loader2 } from "lucide-react";

export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <div className="h-7 w-48 animate-pulse rounded bg-muted/40" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted/30" />
      </div>
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
