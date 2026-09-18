import { createHash } from "crypto";
import QRCode from "qrcode";
import { prisma } from "./prisma";
import { catalogueFor } from "./constants";

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function daysFromNow(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next;
}

export async function nextApplicationNo() {
  const count = await prisma.application.count();
  return `APP/TS/HYD/${new Date().getFullYear()}/${String(count + 1).padStart(5, "0")}`;
}

export async function nextCertificateNo() {
  const count = await prisma.certificate.count();
  return `VC/TS/HYD/${new Date().getFullYear()}/${String(count + 1).padStart(5, "0")}`;
}

export async function issueCertificate(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { instrument: true, inspection: true },
  });
  if (!application?.inspection || application.inspection.result !== "PASS") {
    throw new Error("Certificate can only be issued after a passing inspection");
  }

  const existing = await prisma.certificate.findFirst({
    where: { applicationId },
  });
  if (existing) return existing;

  const catalogue = catalogueFor(application.instrument.category);
  const issuedAt = new Date();
  const validUntil = addMonths(issuedAt, catalogue?.validityMonths ?? 12);
  const certificateNo = await nextCertificateNo();
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${base}/verify/${encodeURIComponent(certificateNo)}`;

  const integrityHash = createHash("sha256")
    .update(
      JSON.stringify({
        certificateNo,
        serial: application.instrument.serialNumber,
        result: application.inspection.result,
        issuedAt: issuedAt.toISOString(),
        validUntil: validUntil.toISOString(),
      }),
    )
    .digest("hex");

  const qrPayload = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 240,
  });

  const certificate = await prisma.certificate.create({
    data: {
      certificateNo,
      applicationId,
      instrumentId: application.instrumentId,
      issuedAt,
      validUntil,
      integrityHash,
      qrPayload,
    },
  });

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "CERTIFIED" },
  });

  await prisma.instrument.update({
    where: { id: application.instrumentId },
    data: {
      status: "VERIFIED",
      lastVerifiedAt: issuedAt,
      validUntil,
    },
  });

  return certificate;
}
