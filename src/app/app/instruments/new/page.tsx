"use client";
import { useI18n } from "@/components/i18n-provider";
import { InstrumentForm } from "@/components/forms";

export default function NewInstrumentPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">{t("dash.instrPageTitle")}</h1>
      <p className="text-sm text-[var(--muted)] mt-2 mb-6">{t("dash.instrPageSubtitle")}</p>
      <div className="card p-5"><InstrumentForm /></div>
    </div>
  );
}
