import { Loader2 } from "lucide-react";

export default function AnalyzeLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div>
        <div className="h-7 w-40 animate-pulse rounded bg-muted/40" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted/30" />
      </div>
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
