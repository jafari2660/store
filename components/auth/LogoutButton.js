"use client";

import { signOut, useSession } from "next-auth/react";
import { AiOutlineLogout } from "react-icons/ai";

const LogoutButton = () => {
  const { status } = useSession();

  if (status !== "authenticated") return null;

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="
    flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]
    px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-primary)]
    hover:bg-[var(--color-hover)] hover:text-[var(--color-primary)]"
    >
      <AiOutlineLogout size={18} />
      <span>خروج</span>
    </button>
  );
};

export default LogoutButton;
