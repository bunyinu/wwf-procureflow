import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "executive-panel lift overflow-hidden rounded-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative flex items-start justify-between gap-4 border-b border-ink-100/80 px-5 py-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-wwf-600/45 via-gold-400/45 to-transparent" />
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold tracking-tight text-ink-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-xs leading-5 text-ink-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
