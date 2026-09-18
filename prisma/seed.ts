import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import QRCode from "qrcode";
import { certificateVerifyUrl } from "../src/lib/public-url";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.application.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.user.deleteMany();

  const password = async (plain: string) => bcrypt.hash(plain, 8);

  const [admin, lmo, gatc, trader] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@maapsetu.gov.in",
        passwordHash: await password("Admin@123"),
        name: "Controller, Hyderabad",
        phone: "040-23200001",
        role: "ADMIN",
        organisation: "State Legal Metrology Department, Telangana",
        district: "Hyderabad",
        state: "Telangana",
      },
    }),
    prisma.user.create({
      data: {
        email: "lmo@maapsetu.gov.in",
        passwordHash: await password("Lmo@123"),
        name: "Inspector K. Rao",
        phone: "9876500001",
        role: "LMO",
        organisation: "LMO Circle — Secunderabad",
        district: "Hyderabad",
        state: "Telangana",
      },
    }),
    prisma.user.create({
      data: {
        email: "gatc@maapsetu.gov.in",
        passwordHash: await password("Gatc@123"),
        name: "Apex Weights GATC",
        phone: "9876500002",
        role: "GATC",
        organisation: "Apex Weights Pvt Ltd (GATC)",
        district: "Hyderabad",
        state: "Telangana",
      },
    }),
    prisma.user.create({
      data: {
        email: "shop@maapsetu.gov.in",
        passwordHash: await password("Shop@123"),
        name: "Lakshmi Kirana & General",
        phone: "9876500003",
        role: "TRADER",
        organisation: "Lakshmi Kirana",
        district: "Hyderabad",
        state: "Telangana",
      },
    }),
  ]);

  const shopScale = await prisma.instrument.create({
    data: {
      ownerId: trader.id,
      category: "NAWI",
      accuracyClass: "III",
      serialNumber: "ES-440-Hyd-1182",
      make: "Essae",
      model: "DS-852",
      capacity: "30 kg / e=5 g",
      premisesName: "Lakshmi Kirana, Karkhana",
      address: "12, Old Market Road, Karkhana, Secunderabad",
      district: "Hyderabad",
      lat: 17.4588,
      lng: 78.4986,
      status: "VERIFIED",
      lastVerifiedAt: daysAgo(300),
      validUntil: daysFromNow(65),
    },
  });

  const expiringScale = await prisma.instrument.create({
    data: {
      ownerId: trader.id,
      category: "NAWI",
      accuracyClass: "III",
      serialNumber: "NAWI-8821-KIR",
      make: "Atco",
      model: "AT-15",
      capacity: "15 kg / e=2 g",
      premisesName: "Lakshmi Kirana, Karkhana",
      address: "12, Old Market Road, Karkhana, Secunderabad",
      district: "Hyderabad",
      lat: 17.4589,
      lng: 78.4987,
      status: "EXPIRING",
      lastVerifiedAt: daysAgo(340),
      validUntil: daysFromNow(18),
    },
  });

  const dispenser = await prisma.instrument.create({
    data: {
      ownerId: trader.id,
      category: "DISPENSER",
      accuracyClass: "0.5",
      serialNumber: "HP-NZ-7781",
      make: "Gilbarco",
      model: "SK700-2",
      capacity: "Petrol nozzle 1",
      premisesName: "Lakshmi Filling Station",
      address: "NH-44, Bowenpally, Hyderabad",
      district: "Hyderabad",
      lat: 17.4672,
      lng: 78.4791,
      status: "UNVERIFIED",
    },
  });

  const weighbridge = await prisma.instrument.create({
    data: {
      ownerId: trader.id,
      category: "WEIGHBRIDGE",
      accuracyClass: "III",
      serialNumber: "WB-100T-009",
      make: "Avery Weigh-Tronix",
      model: "Bridge 100",
      capacity: "100 t / e=20 kg",
      premisesName: "Lakshmi Logistics Yard",
      address: "IDA Jeedimetla, Hyderabad",
      district: "Hyderabad",
      lat: 17.5154,
      lng: 78.4482,
      status: "UNVERIFIED",
    },
  });

  const failedScale = await prisma.instrument.create({
    data: {
      ownerId: trader.id,
      category: "NAWI",
      accuracyClass: "III",
      serialNumber: "FAIL-COUNTER-04",
      make: "Local",
      model: "LC-10",
      capacity: "10 kg / e=5 g",
      premisesName: "Lakshmi Kirana, Karkhana",
      address: "12, Old Market Road, Karkhana, Secunderabad",
      district: "Hyderabad",
      lat: 17.4587,
      lng: 78.4985,
      status: "FAILED",
    },
  });

  const certifiedApp = await prisma.application.create({
    data: {
      applicationNo: "APP/TS/HYD/2025/00011",
      instrumentId: shopScale.id,
      type: "REVERIFICATION",
      status: "CERTIFIED",
      feeAmount: 200,
      assignedToId: lmo.id,
      assignedKind: "LMO",
      scheduledAt: daysAgo(300),
    },
  });

  await prisma.inspection.create({
    data: {
      applicationId: certifiedApp.id,
      officerId: lmo.id,
      result: "PASS",
      standardUsed: "F2 1 kg + 200 g working standard",
      maxPermissibleError: "±1 e at 500 e",
      observedError: "+0.4 e",
      notes: "Seal intact. Scale within MPE across 5 test loads.",
      lat: 17.4588,
      lng: 78.4986,
      inspectedAt: daysAgo(300),
    },
  });

  await issueSeedCertificate({
    applicationId: certifiedApp.id,
    instrumentId: shopScale.id,
    certificateNo: "VC/TS/HYD/2025/00011",
    issuedAt: daysAgo(300),
    validUntil: daysFromNow(65),
    serial: shopScale.serialNumber,
  });

  await prisma.application.create({
    data: {
      applicationNo: "APP/TS/HYD/2026/00041",
      instrumentId: expiringScale.id,
      type: "REVERIFICATION",
      status: "SUBMITTED",
      feeAmount: 200,
    },
  });

  await prisma.application.create({
    data: {
      applicationNo: "APP/TS/HYD/2026/00042",
      instrumentId: dispenser.id,
      type: "FIRST",
      status: "ASSIGNED",
      feeAmount: 1500,
      assignedToId: lmo.id,
      assignedKind: "LMO",
      scheduledAt: daysFromNow(1),
    },
  });

  await prisma.application.create({
    data: {
      applicationNo: "APP/TS/HYD/2026/00043",
      instrumentId: weighbridge.id,
      type: "FIRST",
      status: "ASSIGNED",
      feeAmount: 4000,
      assignedToId: gatc.id,
      assignedKind: "GATC",
      scheduledAt: daysFromNow(3),
    },
  });

  const failedApp = await prisma.application.create({
    data: {
      applicationNo: "APP/TS/HYD/2026/00044",
      instrumentId: failedScale.id,
      type: "REVERIFICATION",
      status: "FAILED",
      feeAmount: 200,
      assignedToId: lmo.id,
      assignedKind: "LMO",
      scheduledAt: daysAgo(2),
      remarks: "Exceeds MPE. Instrument withdrawn from trade use.",
    },
  });

  await prisma.inspection.create({
    data: {
      applicationId: failedApp.id,
      officerId: lmo.id,
      result: "FAIL",
      standardUsed: "F2 1 kg working standard",
      maxPermissibleError: "±1 e at 500 e",
      observedError: "+3.2 e",
      notes: "Corner-load error. Recommend repairer before re-application.",
      lat: 17.4587,
      lng: 78.4985,
      inspectedAt: daysAgo(2),
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: trader.id,
        action: "APPLICATION_SUBMITTED",
        entity: "Application",
        entityId: "seed",
        detail: "Demo dataset loaded for SIH 2026 prototype.",
      },
      {
        actorId: admin.id,
        action: "ASSIGNED",
        entity: "Application",
        entityId: "seed",
        detail: "LMO and GATC assignments created for Hyderabad circle.",
      },
    ],
  });

  console.log("Seeded MaapSetu demo users and instruments.");
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function issueSeedCertificate(opts: {
  applicationId: string;
  instrumentId: string;
  certificateNo: string;
  issuedAt: Date;
  validUntil: Date;
  serial: string;
}) {
  const integrityHash = createHash("sha256")
    .update(
      JSON.stringify({
        certificateNo: opts.certificateNo,
        serial: opts.serial,
        result: "PASS",
        issuedAt: opts.issuedAt.toISOString(),
        validUntil: opts.validUntil.toISOString(),
      }),
    )
    .digest("hex");

  const qrPayload = await QRCode.toDataURL(certificateVerifyUrl(opts.certificateNo), {
    margin: 1,
    width: 240,
  });

  await prisma.certificate.create({
    data: {
      certificateNo: opts.certificateNo,
      applicationId: opts.applicationId,
      instrumentId: opts.instrumentId,
      issuedAt: opts.issuedAt,
      validUntil: opts.validUntil,
      integrityHash,
      qrPayload,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
