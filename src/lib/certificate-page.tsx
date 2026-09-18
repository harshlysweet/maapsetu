import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { CertificateResultView, PrintCertificateView } from "@/components/certificate-views";
import { prisma } from "@/lib/prisma";
import { certificateVerifyUrl } from "@/lib/public-url";
import { daysUntil, formatDate } from "@/lib/utils";

// Certificates are immutable once issued — cache for 1 hour
const getCertificate = unstable_cache(
  async (certificateNo: string) =>
    prisma.certificate.findUnique({
      where: { certificateNo },
      include: {
        instrument: { include: { owner: true } },
        application: { include: { inspection: { include: { officer: true } } } },
      },
    }),
  ["certificate"],
  { revalidate: 3600, tags: ["certificate"] },
);

export async function renderCertificatePage(certificateNo: string, print = false) {
  if (!certificateNo) notFound();

  const certificate = await getCertificate(certificateNo);
  if (!certificate) notFound();

  const remaining = daysUntil(certificate.validUntil) ?? 0;
  const valid = remaining >= 0;
  const verifyUrl = certificateVerifyUrl(certificate.certificateNo);
  // qrPayload is already stored in DB — no need to regenerate it every request
  const qrSrc = certificate.qrPayload;

  if (print) {
    return (
      <PrintCertificateView
        qrSrc={qrSrc}
        verifyUrl={verifyUrl}
        hash={certificate.integrityHash}
        rows={[
          ["print.certificateNo", certificate.certificateNo],
          ["print.applicationNo", certificate.application.applicationNo],
          ["print.instrument", `${certificate.instrument.make} ${certificate.instrument.model}`],
          ["print.serial", certificate.instrument.serialNumber],
          [
            "print.category",
            `${certificate.instrument.category} / ${certificate.instrument.accuracyClass}`,
          ],
          ["print.capacity", certificate.instrument.capacity],
          ["print.user", certificate.instrument.owner.name],
          ["print.premises", certificate.instrument.premisesName],
          ["print.address", certificate.instrument.address],
          ["print.issuedOn", formatDate(certificate.issuedAt)],
          ["print.validUntil", formatDate(certificate.validUntil)],
          ["print.inspectionResult", certificate.application.inspection?.result || "PASS"],
          ["print.observedError", certificate.application.inspection?.observedError || "—"],
        ]}
      />
    );
  }

  return (
    <CertificateResultView
      certificateNo={certificate.certificateNo}
      valid={valid}
      qrSrc={qrSrc}
      verifyUrl={verifyUrl}
      integrityHash={certificate.integrityHash}
      rows={[
        ["verify.instrument", `${certificate.instrument.make} ${certificate.instrument.model}`],
        ["verify.serial", certificate.instrument.serialNumber],
        [
          "verify.category",
          `${certificate.instrument.category} · Class ${certificate.instrument.accuracyClass}`,
        ],
        ["verify.premises", certificate.instrument.premisesName],
        [
          "verify.districtState",
          `${certificate.instrument.district}, ${certificate.instrument.owner.state}`,
        ],
        ["verify.issuedOn", formatDate(certificate.issuedAt)],
        ["verify.validUntil", formatDate(certificate.validUntil)],
        ["verify.inspectedBy", certificate.application.inspection?.officer.name || "—"],
        ["verify.result", certificate.application.inspection?.result || "PASS"],
      ]}
    />
  );
}
