const PRODUCTION_SITE_URL = "https://maapsetu-mauve.vercel.app";

function isLocalHost(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function withHttps(host: string) {
  return `https://${host.replace(/^https?:\/\//, "")}`;
}

/** Live public origin for QR codes and shareable links — never localhost. */
export function publicAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit && !isLocalHost(explicit)) {
    return explicit;
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return withHttps(production);

  const deployment = process.env.VERCEL_URL;
  if (deployment && !isLocalHost(deployment)) return withHttps(deployment);

  return PRODUCTION_SITE_URL;
}

export function parseCertificatePath(code: string[]) {
  const decoded = code.map((part) => decodeURIComponent(part));
  const print = decoded.at(-1)?.toLowerCase() === "print";
  const certificateNo = (print ? decoded.slice(0, -1) : decoded).join("/");
  return { certificateNo, print };
}

export function certificatePath(certificateNo: string, print = false) {
  const segments = certificateNo
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => encodeURIComponent(part));
  return `/verify/${segments.join("/")}${print ? "/print" : ""}`;
}

export function certificateVerifyUrl(certificateNo: string) {
  // Query form survives older deploys and phone cameras; /verify already exists on Vercel.
  return `${publicAppUrl()}/verify?q=${encodeURIComponent(certificateNo)}`;
}
