"use client";
import React, { useEffect } from "react";

const GeneralError = ({ error, onRetry = null }) => {
  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
   <div className="my-4 flex flex-col items-center">
  <div className="rounded-lg border border-[var(--color-primary-light)] bg-[var(--color-surface)] p-4 text-[var(--color-text)]">
    <p className="mt-1 text-sm text-[var(--color-muted)]">
          {error?.message || "خطایی رخ داده است. لطفاً مجدداً تلاش کنید."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            تلاش مجدد
          </button>
        )}
      </div>
    </div>
  );
};

export default GeneralError;
