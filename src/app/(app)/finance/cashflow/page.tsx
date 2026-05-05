import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LegacyCashflowReportingRedirectPage() {
  await requireRole("REPORTING");
  redirect("/workspaces/reporting");
}
