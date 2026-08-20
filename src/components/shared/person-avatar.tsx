import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buildApiUrl } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { withAppBase } from "@/lib/route-base"

type PersonAvatarTone = "brand" | "brand-soft" | "dark" | "staff" | "student"

export function PersonAvatar({
  className,
  fallback,
  name,
  size = "default",
  src,
  tone = "student",
}: {
  className?: string
  fallback?: string
  name: string
  size?: "default" | "lg" | "sm"
  src?: string | null
  tone?: PersonAvatarTone
}) {
  const imageSrc = resolveAvatarSrc(src)

  return (
    <Avatar className={className} size={size}>
      {imageSrc && <AvatarImage alt={name} src={imageSrc} />}
      <AvatarFallback
        className={cn(
          "font-semibold",
          tone === "brand" && "bg-brand text-brand-on",
          tone === "brand-soft" && "bg-brand-soft text-brand-dark",
          tone === "dark" && "bg-hero-bg text-brand",
          tone === "staff" && "bg-role-staff-bg text-role-staff",
          tone === "student" && "bg-role-student-bg text-role-student"
        )}
      >
        {fallback ?? getPersonInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function resolveAvatarSrc(src?: string | null) {
  if (!src) return null
  if (/^(https?:|data:|blob:)/i.test(src)) return src
  if (src.startsWith("/api/v1/")) {
    return buildApiUrl(src.replace(/^\/api\/v1/, ""))
  }
  if (src.startsWith("/uploads/")) {
    const apiRoot = buildApiUrl("/").replace(/\/api\/v1\/?$/, "")
    return new URL(src, apiRoot).toString()
  }
  if (src.startsWith("/")) return withAppBase(src)
  return src
}

function getPersonInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
