import * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden border border-transparent px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "rounded-full bg-primary text-primary-foreground",
        secondary: "rounded-full bg-secondary text-secondary-foreground",
        outline: "rounded-full border-border text-foreground",
        destructive: "rounded-full bg-[#FCEEE8] text-[#CF4A22]",
        success: "rounded-full bg-[#E3FCF7] text-[#00684A]",
        warning: "rounded-full bg-[#FEF5E8] text-[#C76C17]",
        neutral: "rounded-full bg-[#F0F2F1] text-[#5C6C75]",
        brand: "rounded-full bg-[#001E2B] text-brand",
        // Role badges
        director: "rounded-full bg-role-director-bg text-role-director",
        teacher: "rounded-full bg-role-teacher-bg text-role-teacher",
        parent: "rounded-full bg-role-parent-bg text-role-parent",
        student: "rounded-full bg-role-student-bg text-role-student",
        staff: "rounded-full bg-role-staff-bg text-role-staff",
        // Category tags — 4px radius, uppercase, white on color
        "cat-academic":
          "rounded-[4px] bg-cat-academic text-[10px] tracking-[0.6px] text-white uppercase",
        "cat-finance":
          "rounded-[4px] bg-cat-finance text-[10px] tracking-[0.6px] text-white uppercase",
        "cat-presence":
          "rounded-[4px] bg-cat-presence text-[10px] tracking-[0.6px] text-white uppercase",
        "cat-admin":
          "rounded-[4px] bg-cat-admin text-[10px] tracking-[0.6px] text-white uppercase",
        // Grade cells — 6px radius, mono font
        "grade-good":
          "rounded-[6px] bg-grade-good-bg font-mono text-grade-good tabular-nums",
        "grade-mid":
          "rounded-[6px] bg-grade-mid-bg font-mono text-grade-mid tabular-nums",
        "grade-bad":
          "rounded-[6px] bg-grade-bad-bg font-mono text-grade-bad tabular-nums",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
