"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "@/lib/auth-actions";
import { DEMO_ACCOUNTS, INSTRUMENT_CATALOGUE } from "@/lib/constants";
import { useI18n } from "@/components/i18n-provider";
import { getAllDistricts, getStateForDistrict } from "@/lib/india-locations";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const data = await loginAction(formData);
    setPending(false);
    if (!data.ok) {
      setError(data.error || t("login.failed"));
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label className="lbl">{t("login.email")}</label>
        <input name="email" type="email" required className="field" defaultValue="shop@maapsetu.gov.in" />
      </div>
      <div>
        <label className="lbl">{t("login.password")}</label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            required
            className="field pr-10"
            defaultValue="Shop@123"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--navy)]"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? t("login.signingIn") : t("login.signIn")}
      </button>
      <div className="rounded-xl bg-[var(--cream)] p-3 text-xs space-y-1">
        <p className="font-semibold text-[var(--navy)]">{t("login.demo")}</p>
        {DEMO_ACCOUNTS.map((a) => (
          <p key={a.email}>
            {a.role}: {a.email} / {a.password}
          </p>
        ))}
      </div>
    </form>
  );
}

export function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [districtInput, setDistrictInput] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [autoState, setAutoState] = useState("");

  const allDistricts = getAllDistricts();
  const filteredDistricts = allDistricts.filter((d) =>
    d.toLowerCase().startsWith(districtInput.toLowerCase())
  );

  function handleDistrictSelect(district: string) {
    setSelectedDistrict(district);
    setDistrictInput(district);
    setShowDistrictDropdown(false);
    const state = getStateForDistrict(district);
    setAutoState(state || "");
  }

  async function onSubmit(formData: FormData) {
    setError("");
    const data = await registerAction(formData);
    if (!data.ok) {
      setError(data.error || t("register.failed"));
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="lbl">{t("register.name")}</label>
        <input name="name" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("register.email")}</label>
        <input name="email" type="email" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("register.password")}</label>
        <div className="relative">
          <input name="password" type={showPw ? "text" : "password"} required className="field pr-10" />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--navy)]"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>
      <div>
        <label className="lbl">{t("register.phone")}</label>
        <input name="phone" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("register.organisation")}</label>
        <input name="organisation" required className="field" />
      </div>
      <div className="relative">
        <label className="lbl">{t("register.district")}</label>
        <input
          name="district"
          required
          className="field"
          value={districtInput}
          onChange={(e) => {
            setDistrictInput(e.target.value);
            setShowDistrictDropdown(true);
          }}
          onFocus={() => setShowDistrictDropdown(true)}
          onBlur={() => setTimeout(() => setShowDistrictDropdown(false), 200)}
        />
        {showDistrictDropdown && filteredDistricts.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded shadow-lg">
            {filteredDistricts.map((district, index) => (
              <div
                key={`${district}-${index}`}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleDistrictSelect(district)}
              >
                {district}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="lbl">{t("register.state")}</label>
        <input
          name="state"
          required
          className="field"
          value={autoState}
          onChange={(e) => setAutoState(e.target.value)}
          placeholder="Auto-filled from district"
        />
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn btn-primary sm:col-span-2">{t("register.submit")}</button>
    </form>
  );
}

export function InstrumentForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const res = await fetch("/api/instruments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/app/instruments");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="lbl">{t("dash.instrCategory")}</label>
        <select name="category" className="field" required>
          {INSTRUMENT_CATALOGUE.map((c) => (
            <option key={c.category} value={c.category}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="lbl">{t("dash.instrSerial")}</label>
        <input name="serialNumber" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("dash.instrMake")}</label>
        <input name="make" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("dash.instrModel")}</label>
        <input name="model" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("dash.instrCapacity")}</label>
        <input name="capacity" required className="field" placeholder="30 kg / e=5 g" />
      </div>
      <div className="sm:col-span-2">
        <label className="lbl">{t("dash.instrPremises")}</label>
        <input name="premisesName" required className="field" />
      </div>
      <div className="sm:col-span-2">
        <label className="lbl">{t("dash.instrAddress")}</label>
        <input name="address" required className="field" />
      </div>
      <div>
        <label className="lbl">{t("dash.instrLat")}</label>
        <input name="lat" required className="field" defaultValue="17.385" />
      </div>
      <div>
        <label className="lbl">{t("dash.instrLng")}</label>
        <input name="lng" required className="field" defaultValue="78.486" />
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn btn-primary sm:col-span-2" disabled={pending}>
        {pending ? "Saving..." : t("dash.instrSave")}
      </button>
    </form>
  );
}

export function ApplyButton({ instrumentId, type }: { instrumentId: string; type: "FIRST" | "REVERIFICATION" }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function apply() {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instrumentId, type }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/app/applications");
    router.refresh();
  }

  return (
    <div>
      <button onClick={apply} className="btn btn-accent py-2 text-sm">
        Apply {type === "FIRST" ? "first verification" : "re-verification"}
      </button>
      {error ? <p className="text-xs text-red-700 mt-1">{error}</p> : null}
    </div>
  );
}

export function AssignForm({
  applicationId,
  officers,
}: {
  applicationId: string;
  officers: { id: string; name: string; role: string }[];
}) {
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    await fetch(`/api/applications/${applicationId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officerId: formData.get("officerId"),
        scheduledAt: formData.get("scheduledAt"),
      }),
    });
    router.refresh();
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const value = tomorrow.toISOString().slice(0, 16);

  return (
    <form action={onSubmit} className="flex flex-wrap gap-2 items-end">
      <select name="officerId" className="field" required>
        {officers.map((o) => (
          <option key={o.id} value={o.id}>
            {o.role} — {o.name}
          </option>
        ))}
      </select>
      <input type="datetime-local" name="scheduledAt" className="field" defaultValue={value} />
      <button className="btn btn-primary">Assign</button>
    </form>
  );
}

export function AutoAssignButton() {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function run() {
    const res = await fetch("/api/admin/auto-assign", { method: "POST" });
    const data = await res.json();
    setMsg(`Assigned ${data.assigned} pending applications by instrument type and load.`);
    router.refresh();
  }

  return (
    <div>
      <button onClick={run} className="btn btn-accent">
        Auto-assign pending jobs
      </button>
      {msg ? <p className="text-sm mt-2 text-[var(--forest)]">{msg}</p> : null}
    </div>
  );
}

export function InspectForm({
  applicationId,
  lat,
  lng,
}: {
  applicationId: string;
  lat: number;
  lng: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [coords, setCoords] = useState({ lat, lng });

  function useLocation() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  async function onSubmit(formData: FormData) {
    formData.set("lat", String(coords.lat));
    formData.set("lng", String(coords.lng));
    const res = await fetch(`/api/applications/${applicationId}/inspect`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/app/applications");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="lbl">Result</label>
          <select name="result" className="field" required>
            <option value="PASS">PASS — within MPE</option>
            <option value="FAIL">FAIL — exceeds MPE</option>
          </select>
        </div>
        <div>
          <label className="lbl">Observed error</label>
          <input name="observedError" required className="field" placeholder="+0.4 e" />
        </div>
        <div className="sm:col-span-2">
          <label className="lbl">Working standard used</label>
          <input name="standardUsed" className="field" placeholder="F2 1 kg working standard" />
        </div>
        <div className="sm:col-span-2">
          <label className="lbl">Observations</label>
          <textarea name="notes" required className="field min-h-24" />
        </div>
        <div className="sm:col-span-2">
          <label className="lbl">Site photograph</label>
          <input name="photo" type="file" accept="image/*" capture="environment" className="field" />
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Geo-tag: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — hardcoded onto the inspection
        record with timestamp.
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={useLocation} className="btn btn-ghost">
          Use live GPS
        </button>
        <button className="btn btn-primary">Submit inspection</button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}

export function PrintButton() {
  const { t } = useI18n();
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary mt-6 print:hidden">
      {t("print.print")}
    </button>
  );
}

export function DeleteCertificateButton({ certificateId }: { certificateId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function deleteCertificate() {
    if (!confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/certificates/${certificateId}`, {
      method: "DELETE",
    });

    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete certificate");
    }
  }

  return (
    <button
      onClick={deleteCertificate}
      disabled={loading}
      className="btn btn-ghost py-2 text-sm text-red-600 hover:text-red-700"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}

export function UserCreateForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [districtInput, setDistrictInput] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [autoState, setAutoState] = useState("");

  const allDistricts = getAllDistricts();
  const filteredDistricts = allDistricts.filter((d) =>
    d.toLowerCase().startsWith(districtInput.toLowerCase())
  );

  function handleDistrictSelect(district: string) {
    setSelectedDistrict(district);
    setDistrictInput(district);
    setShowDistrictDropdown(false);
    const state = getStateForDistrict(district);
    setAutoState(state || "");
  }

  async function onSubmit(formData: FormData) {
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create user");
      return;
    }
    router.push("/app/users");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="lbl">Name</label>
        <input name="name" required className="field" />
      </div>
      <div>
        <label className="lbl">Email</label>
        <input name="email" type="email" required className="field" />
      </div>
      <div>
        <label className="lbl">Password</label>
        <div className="relative">
          <input name="password" type={showPw ? "text" : "password"} required className="field pr-10" />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--navy)]"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>
      <div>
        <label className="lbl">Phone</label>
        <input name="phone" required className="field" />
      </div>
      <div>
        <label className="lbl">Role</label>
        <select name="role" className="field" required>
          <option value="TRADER">Trader (Business)</option>
          <option value="LMO">LMO (Inspector)</option>
          <option value="GATC">GATC (Test Centre)</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div>
        <label className="lbl">Organisation (Optional)</label>
        <input name="organisation" className="field" />
      </div>
      <div className="relative">
        <label className="lbl">District</label>
        <input
          name="district"
          required
          className="field"
          value={districtInput}
          onChange={(e) => {
            setDistrictInput(e.target.value);
            setShowDistrictDropdown(true);
          }}
          onFocus={() => setShowDistrictDropdown(true)}
          onBlur={() => setTimeout(() => setShowDistrictDropdown(false), 200)}
        />
        {showDistrictDropdown && filteredDistricts.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded shadow-lg">
            {filteredDistricts.map((district, index) => (
              <div
                key={`${district}-${index}`}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleDistrictSelect(district)}
              >
                {district}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="lbl">State</label>
        <input
          name="state"
          required
          className="field"
          value={autoState}
          onChange={(e) => setAutoState(e.target.value)}
          placeholder="Auto-filled from district"
        />
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn btn-primary sm:col-span-2">Create User</button>
    </form>
  );
}
