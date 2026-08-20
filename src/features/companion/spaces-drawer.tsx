import {
  ChevronRight,
  GraduationCap,
  QrCode,
  Trash2,
  UserRound,
} from "lucide-react"

import { PersonAvatar } from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import {
  getProfileDisplayName,
  setSelectedProfile,
} from "@/features/auth/session"
import type { UserProfile } from "@/features/auth/types"
import { setSchoolIdGetter } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import {
  companionCopy,
  formatCompanionExpiry,
  getCompanionSessionTitle,
} from "./copy"
import {
  clearSelectedCompanionSession,
  removeCompanionSession,
  setSelectedCompanionSession,
  useCompanionSessions,
} from "./session-store"

type SpacesUserProfile = {
  photoUrl?: string | null
}

export function CompanionSpacesDrawer({
  currentLocale,
  onOpenChange,
  open,
  profiles,
  selectedProfile,
  userProfile,
}: {
  currentLocale: "fr" | "en"
  onOpenChange: (open: boolean) => void
  open: boolean
  profiles: UserProfile[]
  selectedProfile: UserProfile | null
  userProfile: SpacesUserProfile | undefined
}) {
  const copy = companionCopy(currentLocale)
  const { selectedSession, sessions } = useCompanionSessions()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[88svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle>{copy.companionSpaces}</DrawerTitle>
          <DrawerDescription>{copy.switchSpacesDescription}</DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
          <Button
            className="justify-start"
            onClick={() => {
              onOpenChange(false)
              window.location.assign(`/${currentLocale}/app/scan`)
            }}
            size="lg"
            type="button"
            variant="outline"
          >
            <QrCode data-icon="inline-start" />
            {copy.scanCompanionQr}
          </Button>

          <div className="flex flex-col gap-3">
            <SectionTitle>
              {currentLocale === "en"
                ? "Personal spaces"
                : "Espaces personnels"}
            </SectionTitle>
            {profiles.length ? (
              profiles.map((profile) => {
                const selected =
                  !selectedSession && profile.id === selectedProfile?.id
                const displayName =
                  getProfileDisplayName(profile) || profile.label
                const photoUrl =
                  selected && userProfile?.photoUrl
                    ? userProfile.photoUrl
                    : profile.photoUrl

                return (
                  <Card
                    className={cn(
                      "gap-3",
                      selected && "border-primary bg-primary/5"
                    )}
                    key={profile.id}
                    size="sm"
                  >
                    <CardContent className="flex items-center gap-3 px-0">
                      <PersonAvatar
                        className="size-14 text-base"
                        name={displayName}
                        size="lg"
                        src={photoUrl}
                        tone="brand-soft"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">
                          {displayName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {profile.schoolName ??
                            (currentLocale === "en"
                              ? "Pending school"
                              : "Ecole en attente")}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={getProfileBadgeVariant(profile)}>
                            {getProfileSpaceLabel(profile, currentLocale)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        disabled={selected || !profile.schoolId}
                        onClick={() => {
                          clearSelectedCompanionSession()
                          setSelectedProfile(profile)
                          setSchoolIdGetter(() => profile.schoolId)
                          window.location.assign(`/${currentLocale}/app/home`)
                        }}
                        size="sm"
                        variant={selected ? "secondary" : "outline"}
                      >
                        {selected
                          ? currentLocale === "en"
                            ? "Current"
                            : "Actuel"
                          : currentLocale === "en"
                            ? "Switch"
                            : "Changer"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <EmptyRow
                icon={<UserRound />}
                text={
                  currentLocale === "en"
                    ? "No personal profile is linked yet."
                    : "Aucun profil personnel n'est encore rattache."
                }
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SectionTitle>{copy.activeSessions}</SectionTitle>
            {sessions.length ? (
              <Card className="gap-0 p-0">
                {sessions.map((session, index) => {
                  const selected = session.id === selectedSession?.id

                  return (
                    <div key={session.id}>
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4",
                          selected && "bg-primary/5"
                        )}
                      >
                        <Badge className="size-8 p-0" variant="neutral">
                          <GraduationCap />
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">
                            {getCompanionSessionTitle(session)}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {copy.companion}
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline">
                              {formatCompanionExpiry(session, currentLocale)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          disabled={selected}
                          onClick={() => {
                            setSelectedCompanionSession(session.id)
                            setSchoolIdGetter(() => null)
                            window.location.assign(`/${currentLocale}/app/home`)
                          }}
                          size="icon-sm"
                          type="button"
                          variant={selected ? "secondary" : "outline"}
                        >
                          <ChevronRight />
                        </Button>
                        <Button
                          aria-label={
                            currentLocale === "en" ? "Remove" : "Retirer"
                          }
                          onClick={() => removeCompanionSession(session.id)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      {index < sessions.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </Card>
            ) : (
              <EmptyRow icon={<QrCode />} text={copy.emptySessions} />
            )}
          </div>
        </div>
        <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="flex-1" variant="outline">
              {currentLocale === "en" ? "Close" : "Fermer"}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
      <Badge className="size-8 p-0" variant="neutral">
        {icon}
      </Badge>
      <span className="min-w-0 flex-1">{text}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

function getProfileSpaceLabel(profile: UserProfile, locale: "fr" | "en") {
  if (profile.role === "STUDENT") return locale === "en" ? "Student" : "Eleve"
  if (profile.role === "TEACHER") return locale === "en" ? "Teacher" : "Prof"
  return locale === "en" ? "Parent" : "Parent"
}

function getProfileBadgeVariant(
  profile: UserProfile
): React.ComponentProps<typeof Badge>["variant"] {
  if (profile.role === "STUDENT") return "student"
  if (profile.role === "TEACHER") return "teacher"
  return "parent"
}
