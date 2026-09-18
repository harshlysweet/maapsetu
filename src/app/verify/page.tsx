import { VerifyIndexView } from "@/components/certificate-views";
import { renderCertificatePage } from "@/lib/certificate-page";

export default async function VerifyIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const certificateNo = q?.trim();
  if (certificateNo) {
    return renderCertificatePage(certificateNo);
  }

  return <VerifyIndexView />;
}
