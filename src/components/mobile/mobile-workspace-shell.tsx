import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function MobileWorkspaceLoading() {
  return (
    <div className="flex h-full flex-col bg-background p-4">
      <div className="space-y-3">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-24 rounded-[24px]" />
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_item, index) => (
          <Skeleton key={index} className="h-20 rounded-[24px]" />
        ))}
      </div>
    </div>
  )
}

export function MobileWorkspaceFrame({
  children,
  contentClassName,
  nav,
}: {
  children: ReactNode
  contentClassName?: string
  nav?: ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas-alt">
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          nav ? "pb-[4.25rem]" : "pb-0",
          contentClassName
        )}
      >
        {children}
      </div>
      {nav}
    </div>
  )
}
