const BASE = "http://localhost:3000";

function cookieJar() {
  const map = new Map();
  return {
    apply(headers) {
      const raw = headers.getSetCookie?.() || [];
      for (const c of raw) {
        const [pair] = c.split(";");
        const i = pair.indexOf("=");
        if (i > 0) map.set(pair.slice(0, i), pair.slice(i + 1));
      }
    },
    header() {
      return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function req(jar, path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      cookie: jar.header(),
      ...(opts.body ? { "content-type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
    redirect: "manual",
  });
  jar.apply(res.headers);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { text: text.slice(0, 400) };
  }
  return { status: res.status, json, location: res.headers.get("location") };
}

const email = `flow.${Date.now()}@example.com`;
const password = "FlowTest123";
const jar = cookieJar();
const log = [];

function step(name, ok, extra) {
  log.push({ name, ok, extra });
  console.log(`${ok ? "OK" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
}

const reg = await req(jar, "/api/auth/register", {
  method: "POST",
  body: JSON.stringify({
    name: "Flow Test Kirana",
    email,
    password,
    phone: "9000000001",
    organisation: "Flow Test Kirana",
    district: "Hyderabad",
    state: "Telangana",
  }),
});
step("Register business", reg.status === 200 && reg.json.ok, `status ${reg.status} ${JSON.stringify(reg.json)}`);

const inst = await req(jar, "/api/instruments", {
  method: "POST",
  body: JSON.stringify({
    category: "NAWI",
    serialNumber: `FL-${Date.now()}`,
    make: "Essae",
    model: "DS-852",
    capacity: "30 kg / e=5 g",
    premisesName: "Flow Test Shop",
    address: "Karkhana, Secunderabad",
    lat: 17.385,
    lng: 78.486,
  }),
});
step("Register instrument", inst.status === 200 && inst.json.instrument, inst.json.error || inst.json.instrument?.serialNumber);

const apply = await req(jar, "/api/applications", {
  method: "POST",
  body: JSON.stringify({ instrumentId: inst.json.instrument?.id, type: "FIRST" }),
});
step("Apply for verification", apply.status === 200 && apply.json.application, apply.json.error || apply.json.application?.applicationNo);

const admin = cookieJar();
const adminLogin = await req(admin, "/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "admin@maapsetu.gov.in", password: "Admin@123" }),
});
step("Admin login", adminLogin.status === 200 && adminLogin.json.ok, JSON.stringify(adminLogin.json));

const auto = await req(admin, "/api/admin/auto-assign", { method: "POST" });
step("Admin auto-assign (approve queue)", auto.status === 200, JSON.stringify(auto.json));

const apps = await req(admin, "/api/applications");
const mine = apps.json.applications?.find((a) => a.id === apply.json.application?.id);
step("Application appears in admin list", Boolean(mine), mine ? `${mine.applicationNo} ${mine.status}` : "missing");

const lmo = cookieJar();
const lmoLogin = await req(lmo, "/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "lmo@maapsetu.gov.in", password: "Lmo@123" }),
});
step("Officer login", lmoLogin.status === 200 && lmoLogin.json.ok, JSON.stringify(lmoLogin.json));

const officerApps = await req(lmo, "/api/applications");
const job = officerApps.json.applications?.find((a) => a.id === apply.json.application?.id);
step("Job assigned to officer list", Boolean(job), job ? `${job.status} → ${job.assignedTo?.name}` : "not on officer list");

const form = new FormData();
form.set("result", "PASS");
form.set("observedError", "+0.2 e");
form.set("standardUsed", "F2 1 kg working standard");
form.set("notes", "Within MPE. Stamping recommended.");
form.set("lat", "17.385");
form.set("lng", "78.486");
const inspectRes = await fetch(`${BASE}/api/applications/${apply.json.application?.id}/inspect`, {
  method: "POST",
  headers: { cookie: lmo.header() },
  body: form,
});
const inspectJson = await inspectRes.json();
step("Officer inspection PASS", inspectRes.status === 200 && inspectJson.ok, JSON.stringify(inspectJson));

const after = await req(admin, "/api/applications");
const certified = after.json.applications?.find((a) => a.id === apply.json.application?.id);
step(
  "Certificate added to application list",
  certified?.status === "CERTIFIED" && Boolean(certified.certificate),
  certified ? `${certified.status} ${certified.certificate?.certificateNo || ""}` : "missing",
);

if (certified?.certificate?.certificateNo) {
  const q = encodeURIComponent(certified.certificate.certificateNo);
  const page = await fetch(`${BASE}/verify?q=${q}`);
  const html = await page.text();
  const hasNo = html.includes(certified.certificate.certificateNo);
  const hasVercel = html.includes("maapsetu-mauve.vercel.app");
  const noLocalhostQr = !html.includes("http://localhost:3000/verify");
  step("Public verify page loads new certificate", page.status === 200 && hasNo, `status ${page.status}`);
  step("QR / share URL uses Vercel, not localhost", hasVercel && noLocalhostQr, hasVercel ? "vercel" : "missing vercel url");
}

const failed = log.filter((s) => !s.ok);
process.exit(failed.length ? 1 : 0);
