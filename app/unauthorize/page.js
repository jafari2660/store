"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-lg">
        <div className="mb-5 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-hover)]">
            <span className="text-4xl font-bold text-[var(--color-primary)]">
              !
            </span>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-[var(--color-primary)]">
          دسترسی غیرمجاز
        </h1>

        <p className="mb-6 leading-8 text-[var(--color-muted)]">
          شما اجازه دسترسی به پنل مدیریت را ندارید.
          برای استفاده از این بخش باید با حساب کاربری مدیر وارد شوید.
        </p>

        <button
          onClick={() => router.replace("/")}
          className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    </main>
  );
}
