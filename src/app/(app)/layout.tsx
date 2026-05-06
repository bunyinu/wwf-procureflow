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
    <div className="app-gradient-shell flex min-h-screen">
      <Sidebar role={user.role as Role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          fullName={user.fullName}
          role={user.role as Role}
          email={user.email}
          unreadCount={unread}
        />
        <main className="fade-in flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
