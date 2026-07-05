'use client';

import { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[var(--color-bg-primary)] text-white">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
        <Warning className="w-10 h-10 text-red-500" weight="fill" />
      </div>
      <h2 className="heading-1 mb-4 text-white">Application Error</h2>
      <p className="text-[var(--color-text-secondary)] mb-10 text-lg max-w-md">
        We encountered a critical error while trying to process your request.
      </p>
      <div className="flex gap-4">
        <button className="btn btn-secondary px-8 py-4" onClick={() => window.location.href = '/'}>
          Go Home
        </button>
        <button className="btn btn-primary px-8 py-4" onClick={() => reset()}>
          Try Again
        </button>
      </div>
    </div>
  );
}