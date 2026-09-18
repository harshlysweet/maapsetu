"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useI18n } from "@/components/i18n-provider";
import { certificatePath } from "@/lib/public-url";

export function VerifySearch({ variant = "default" }: { variant?: "default" | "hero" }) {
  const { t } = useI18n();
  const router = useRouter();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("code") || "");
    if (value) router.push(certificatePath(value.trim()));
  };

  if (variant === "hero") {
    return (
      <form className="hero-search" onSubmit={onSubmit}>
        <input
          name="code"
          aria-label={t("forms.searchAria")}
          placeholder={t("forms.searchPlaceholder")}
          defaultValue="VC/TS/HYD/2025/00011"
          suppressHydrationWarning
        />
        <button type="submit" suppressHydrationWarning>{t("forms.search")}</button>
      </form>
    );
  }

  return (
    <form className="flex gap-0 overflow-hidden rounded-[2px] border" onSubmit={onSubmit}>
      <input
        name="code"
        className="field !rounded-none !border-0"
        placeholder="VC/TS/HYD/2025/00011"
        defaultValue="VC/TS/HYD/2025/00011"
        suppressHydrationWarning
      />
      <button className="btn btn-accent !rounded-none" suppressHydrationWarning>{t("forms.search")}</button>
    </form>
  );
}
