import { Loader2 } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <div className="h-7 w-32 animate-pulse rounded bg-muted/40" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted/30" />
      </div>
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
