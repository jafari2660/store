
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

        <span className="text-sm text-[var(--color-muted)]">
          در حال بارگذاری...
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
