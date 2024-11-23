import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-white">
      <p>Loading</p>
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}
