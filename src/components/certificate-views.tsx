"use client";

import Link from "next/link";
import { VerifySearch } from "@/components/verify-search";
import { PublicFooter, PublicHeader, StatusBadge, PageBanner } from "@/components/public";
import { useI18n } from "@/components/i18n-provider";
import { certificatePath } from "@/lib/public-url";

export function VerifyIndexView() {
  const { t } = useI18n();
  return (
    <div>
      <PublicHeader />
      <PageBanner titleKey="verify.title" crumbsKey="verify.crumbs" />
      <main id="main-content" className="gov-wrap max-w-2xl py-10">
        <p className="text-[var(--muted)] mb-6">{t("verify.intro")}</p>
        <div className="card p-6">
          <VerifySearch />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function CertificateResultView({
  certificateNo,
  valid,
  qrSrc,
  verifyUrl,
  integrityHash,
  rows,
}: {
  certificateNo: string;
  valid: boolean;
  qrSrc: string;
  verifyUrl: string;
  integrityHash: string;
  rows: [string, string][];
}) {
  const { t } = useI18n();
  return (
    <div>
      <PublicHeader />
      <PageBanner titleKey="verify.resultTitle" crumbsKey="verify.resultCrumbs" />
      <main id="main-content" className="gov-wrap max-w-4xl py-10">
        <div className={`border-l-4 p-4 mb-6 ${valid ? "border-[var(--forest)] bg-emerald-50" : "border-[var(--goi-red)] bg-red-50"}`}>
          <p className="text-sm uppercase tracking-wide font-bold">
            {valid ? t("verify.valid") : t("verify.expired")}
          </p>
          <h2 className="text-2xl font-bold mt-1">{certificateNo}</h2>
        </div>
        <div className="card p-6 grid md:grid-cols-[1fr_180px] gap-6">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b">
                  <th className="py-2 pr-4 text-left font-medium text-[var(--muted)] w-44">{t(k)}</th>
                  <td className="py-2 font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="Certificate QR" className="mx-auto w-40 h-40 border" />
            <p className="text-[10px] mt-2 break-all text-[var(--muted)]">
              <a href={verifyUrl} className="underline" target="_blank" rel="noreferrer">
                {verifyUrl}
              </a>
            </p>
            <StatusBadge status={valid ? "VERIFIED" : "EXPIRED"} />
            <Link href={certificatePath(certificateNo, true)} className="btn btn-ghost mt-3 w-full">
              {t("verify.printPdf")}
            </Link>
            <p className="font-mono text-[10px] break-all mt-3 text-[var(--muted)]">{integrityHash}</p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function CertificateNotFoundView() {
  const { t } = useI18n();
  return (
    <div>
      <PublicHeader />
      <PageBanner titleKey="verify.notFoundTitle" crumbsKey="verify.crumbs" />
      <main id="main-content" className="gov-wrap max-w-xl py-12">
        <p className="text-[var(--muted)]">{t("verify.notFound")}</p>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PrintCertificateView({
  qrSrc,
  verifyUrl,
  rows,
  hash,
}: {
  qrSrc: string;
  verifyUrl: string;
  rows: [string, string][];
  hash: string;
}) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-white p-10 print:p-0">
      <div className="mx-auto max-w-[800px] border-2 border-[var(--navy)] p-8">
        <p className="text-center text-xs uppercase tracking-[0.25em]">{t("print.dept")}</p>
        <h1 className="font-display text-3xl text-center mt-2">{t("print.title")}</h1>
        <p className="text-center text-sm mt-1">{t("print.issuedUnder")}</p>
        <div className="grid grid-cols-[1fr_160px] gap-6 mt-8 text-sm">
          <table className="w-full">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b">
                  <td className="py-2 text-[var(--muted)] w-40">{t(k)}</td>
                  <td className="py-2 font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="QR" className="w-40 h-40" />
            <p className="text-[9px] mt-2 break-all">{verifyUrl}</p>
          </div>
        </div>
        <p className="mt-8 text-[11px] font-mono break-all">
          {t("print.hash")}: {hash}
        </p>
        <p className="mt-6 text-xs text-[var(--muted)]">{t("print.footnote")}</p>
        <PrintButtonLocal />
      </div>
    </div>
  );
}

function PrintButtonLocal() {
  const { t } = useI18n();
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary mt-6 print:hidden">
      {t("print.print")}
    </button>
  );
}
