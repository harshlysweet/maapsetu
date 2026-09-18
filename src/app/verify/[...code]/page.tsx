import { notFound } from "next/navigation";
import { renderCertificatePage } from "@/lib/certificate-page";
import { parseCertificatePath } from "@/lib/public-url";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string[] }>;
}) {
  const { code } = await params;
  const { certificateNo, print } = parseCertificatePath(code);
  if (!certificateNo) notFound();
  return renderCertificatePage(certificateNo, print);
}
