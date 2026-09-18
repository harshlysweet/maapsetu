import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManagement } from "@/components/user-management";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/app");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      organisation: true,
      district: true,
      state: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <UserManagement users={users} />;
}
