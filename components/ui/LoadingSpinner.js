
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-6 bg-[var(--color-background)]">

      {/* Spinner */}
      <div className="relative flex h-20 w-20 items-center justify-center">

        {/* Soft glow */}
        <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-10 blur-xl animate-pulse" />

        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[var(--color-hover)]" />

        {/* Animated ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--color-primary)] border-r-[var(--color-primary-light)]" />

        {/* Inner circle */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-md">
          <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]" />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-bold tracking-wide text-[var(--color-text)]">
          کمی صبر کنید
        </span>


        {/* Loading dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)]"
              style={{ animationDelay: `${item * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
