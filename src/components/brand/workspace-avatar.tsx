import type { ComponentProps } from "react"
import { Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ─── Size presets ─────────────────────────────────────────────────────────────

const SIZE_CLASSES = {
  sm: { container: "size-7 rounded-md", icon: "h-3.5 w-3.5" },
  md: { container: "size-8 rounded-lg", icon: "h-4 w-4" },
  lg: { container: "size-11 rounded-[10px]", icon: "h-5 w-5" },
  xl: { container: "size-24 rounded-xl", icon: "h-10 w-10" },
} as const

type WorkspaceAvatarSize = keyof typeof SIZE_CLASSES

interface WorkspaceAvatarProps extends Omit<
  ComponentProps<typeof Avatar>,
  "children" | "size"
> {
  logoUrl?: string | null | undefined
  name: string
  size?: WorkspaceAvatarSize
  fallbackClassName?: string
}

/**
 * Single source of truth for rendering a school / organisation logo.
 *
 * - Renders `AvatarImage` when `logoUrl` is set, falls back to a `Building2`
 *   icon over a brand-tinted background otherwise.
 * - Sizes (`sm`, `md`, `lg`) ship with matching corner-radius presets so
 *   workspace avatars look consistent across the app (sidebar, profile
 *   picker, etc.).
 * - The `after` ring and child elements inherit the container's
 *   border-radius via `rounded-[inherit]`, so the entire avatar — image,
 *   fallback, and border ring — share the same rounded corners.
 */
export function WorkspaceAvatar({
  logoUrl,
  name,
  size = "md",
  className,
  fallbackClassName,
  ...avatarProps
}: WorkspaceAvatarProps) {
  const { container, icon } = SIZE_CLASSES[size]
  return (
    <Avatar
      {...avatarProps}
      className={cn(container, "after:rounded-[inherit]", className)}
    >
      {logoUrl && (
        <AvatarImage
          src={logoUrl}
          alt={name}
          className="rounded-[inherit] object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          "rounded-[inherit] bg-brand-on text-brand",
          fallbackClassName
        )}
      >
        <Building2 className={icon} />
      </AvatarFallback>
    </Avatar>
  )
}
