// app/[workspaceSlug]/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold text-red-600">Session Expired or Unauthorized</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button 
        onClick={() => reset()} 
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Try Again
      </button>
    </div>
  );
}