import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { requireUser } from "@/lib/auth";
import { getNotificationsFor } from "@/lib/notifications";
import type { Role } from "@/lib/enums";

export default async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const notifications = await getNotificationsFor(user);
  const unread = notifications.filter((n) => n.unread).length;
  return (
    <div className="flex min-h-screen bg-[#f5f8fb]">
      <Sidebar role={user.role as Role} />
      <div className="flex min-w-0 flex-1 flex-col bg-[#f5f8fb]">
        <Topbar
          fullName={user.fullName}
          role={user.role as Role}
          email={user.email}
          unreadCount={unread}
        />
        <main className="flex-1 p-1.5 sm:p-2">{children}</main>
      </div>
    </div>
  );
}
