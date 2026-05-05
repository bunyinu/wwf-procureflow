import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LegacyBudgetReportingRedirectPage() {
  await requireRole("REPORTING");
  redirect("/workspaces/reporting");
}
