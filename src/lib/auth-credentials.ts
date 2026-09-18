import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import type { Role } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(8),
  organisation: z.string().min(2),
  district: z.string().min(2),
  state: z.string().min(2),
});

const adminRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(8),
  organisation: z.string().optional(),
  district: z.string().min(2),
  state: z.string().min(2),
  role: z.enum(["TRADER", "LMO", "GATC", "ADMIN"]),
});

export async function loginWithPassword(email: string, password: string) {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: "Invalid credentials" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      district: true,
      state: true,
      passwordHash: true,
    },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false as const, status: 401, error: "Email or password is incorrect" };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    district: user.district,
    state: user.state,
  });

  return { ok: true as const, role: user.role };
}

export async function registerTrader(input: Record<string, unknown>) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: "Please fill every field correctly" };
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) {
    return { ok: false as const, status: 409, error: "An account already exists with this email" };
  }

  const { password, ...profile } = parsed.data;
  const user = await prisma.user.create({
    data: {
      ...profile,
      email,
      passwordHash: await hashPassword(password),
      role: "TRADER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      district: true,
      state: true,
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: "TRADER",
    district: user.district,
    state: user.state,
  });

  return { ok: true as const };
}

export async function registerUser(input: Record<string, unknown>) {
  const parsed = adminRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: "Please fill every field correctly" };
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false as const, status: 409, error: "An account already exists with this email" };
  }

  const { password, ...profile } = parsed.data;
  const user = await prisma.user.create({
    data: {
      ...profile,
      email,
      passwordHash: await hashPassword(password),
      role: parsed.data.role,
    },
  });

  return { ok: true as const, user };
}
