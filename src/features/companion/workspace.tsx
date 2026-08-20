import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  FileCheck2,
  Home,
  Link2,
  ListChecks,
  QrCode,
  ScanLine,
  UserRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/features/auth/types"
import { CourseAttendancePage } from "@/features/teacher/course-attendance"

import {
  companionCopy,
  formatCompanionExpiry,
  getCompanionActionDescription,
  getCompanionActionLabel,
  getCompanionSessionTitle,
} from "./copy"
import { CompanionQrScannerPage } from "./qr-scanner-page"
import { CompanionGateScannerPage } from "./gate-scanner-page"
import { removeCompanionSession } from "./session-store"
import type { CompanionActionType, CompanionSession } from "./types"

type CompanionTab =
  | "home"
  | "notifications"
  | "profile"
  | "scan"
  | "gate-scanner"
  | "course-attendance"

const companionTabs: CompanionTab[] = [
  "home",
  "notifications",
  "profile",
  "scan",
  "gate-scanner",
  "course-attendance",
]

const companionActionIcons: Record<CompanionActionType, LucideIcon> = {
  COURSE_ATTENDANCE_ROUNDS: ListChecks,
  DOCUMENT_VERIFY: FileCheck2,
  GATE_SCANNER: ScanLine,
  STUDENT_PHOTO: Camera,
  STUDENT_PHOTO_BATCH: Camera,
}

export function CompanionWorkspace({
  initialSection,
  locale,
  profileContent,
  session,
}: {
  initialSection?: string
  locale: "fr" | "en"
  profileContent: React.ReactNode
  session: CompanionSession
}) {
  const navigate = useNavigate()
  const tab = normalizeCompanionTab(initialSection)

  useEffect(() => {
    if (initialSection === tab) return

    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: tab },
      replace: true,
    })
  }, [initialSection, locale, navigate, tab])

  function changeTab(nextTab: CompanionTab) {
    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: nextTab },
    })
  }

  if (tab === "scan" && session.action === "GATE_SCANNER" && session.schoolId) {
    return (
      <CompanionGateScannerPage
        locale={locale}
        onBack={() => changeTab("home")}
        schoolId={session.schoolId}
      />
    )
  }

  if (tab === "scan" && session.action === "COURSE_ATTENDANCE_ROUNDS") {
    return (
      <CourseAttendancePage
        context={null}
        onBack={() => changeTab("home")}
        schoolId={session.schoolId}
      />
    )
  }

  return (
    <CompanionFrame
      nav={
        shouldShowCompanionBottomNav(tab) ? (
          <CompanionBottomNav
            active={tab}
            items={[
              {
                id: "home",
                icon: Home,
                label: locale === "en" ? "Home" : "Accueil",
              },
              {
                id: "notifications",
                icon: Bell,
                label: locale === "en" ? "Notifications" : "Notifications",
              },
              {
                id: "profile",
                icon: UserRound,
                label: locale === "en" ? "Account" : "Compte",
              },
            ]}
            onChange={changeTab}
          />
        ) : null
      }
    >
      {tab === "home" && (
        <CompanionHome
          locale={locale}
          onCloseSession={() => {
            removeCompanionSession(session.id)
            window.location.assign(`/${locale}/app/profile`)
          }}
          onOpenScan={() => changeTab("scan")}
          session={session}
        />
      )}
      {tab === "notifications" && <CompanionNotifications locale={locale} />}
      {tab === "profile" && profileContent}
      {tab === "scan" && (
        <CompanionScanPage locale={locale} onBack={() => changeTab("home")} />
      )}
    </CompanionFrame>
  )
}

export function AccountOnlyWorkspace({
  initialSection,
  locale,
  profileContent,
}: {
  initialSection?: string
  locale: "fr" | "en"
  profileContent: React.ReactNode
}) {
  const navigate = useNavigate()
  const tab = normalizeCompanionTab(initialSection)

  useEffect(() => {
    if (initialSection === tab) return

    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: tab },
      replace: true,
    })
  }, [initialSection, locale, navigate, tab])

  function changeTab(nextTab: CompanionTab) {
    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: nextTab },
    })
  }

  return (
    <CompanionFrame
      nav={
        shouldShowCompanionBottomNav(tab) ? (
          <CompanionBottomNav
            active={tab}
            items={[
              {
                id: "home",
                icon: Home,
                label: locale === "en" ? "Home" : "Accueil",
              },
              {
                id: "notifications",
                icon: Bell,
                label: locale === "en" ? "Notifications" : "Notifications",
              },
              {
                id: "profile",
                icon: UserRound,
                label: locale === "en" ? "Account" : "Compte",
              },
            ]}
            onChange={changeTab}
          />
        ) : null
      }
    >
      {tab === "home" && (
        <AccountOnlyHome locale={locale} onOpenScan={() => changeTab("scan")} />
      )}
      {tab === "notifications" && <CompanionNotifications locale={locale} />}
      {tab === "profile" && profileContent}
      {tab === "scan" && (
        <CompanionScanPage locale={locale} onBack={() => changeTab("home")} />
      )}
    </CompanionFrame>
  )
}

export function EmployeeWorkspace({
  initialSection,
  locale,
  profile,
  profileContent,
}: {
  initialSection?: string
  locale: "fr" | "en"
  profile: UserProfile
  profileContent: React.ReactNode
}) {
  const navigate = useNavigate()
  const tab = normalizeCompanionTab(initialSection)
  const schoolId = profile.schoolId

  useEffect(() => {
    if (initialSection === tab) return
    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: tab },
      replace: true,
    })
  }, [initialSection, locale, navigate, tab])

  function changeTab(nextTab: CompanionTab) {
    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: nextTab },
    })
  }

  if (tab === "gate-scanner" && schoolId) {
    return (
      <CompanionGateScannerPage
        locale={locale}
        onBack={() => changeTab("home")}
        schoolId={schoolId}
      />
    )
  }

  if (tab === "course-attendance") {
    return (
      <CourseAttendancePage
        context={null}
        onBack={() => changeTab("home")}
        schoolId={schoolId}
      />
    )
  }

  return (
    <CompanionFrame
      nav={
        <CompanionBottomNav
          active={tab}
          items={[
            {
              id: "home",
              icon: Home,
              label: locale === "en" ? "Home" : "Accueil",
            },
            { id: "notifications", icon: Bell, label: "Notifications" },
            {
              id: "profile",
              icon: UserRound,
              label: locale === "en" ? "Account" : "Compte",
            },
          ]}
          onChange={changeTab}
        />
      }
    >
      {tab === "home" && (
        <div>
          <CompanionHeader
            subtitle={profile.schoolName ?? "Lernn"}
            title={locale === "en" ? "Field workspace" : "Espace Terrain"}
          />
          <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
            <Card variant="dark">
              <CardContent className="flex flex-col gap-2 px-0">
                <Badge className="w-fit" variant="secondary">
                  {profile.role}
                </Badge>
                <p className="text-sm leading-6 text-white/75">
                  {locale === "en"
                    ? "Run day-to-day school actions from your phone."
                    : "Effectuez les actions quotidiennes de l'école depuis votre téléphone."}
                </p>
              </CardContent>
            </Card>
            <Button
              className="h-auto justify-start gap-4 p-4"
              disabled={!schoolId}
              onClick={() => changeTab("gate-scanner")}
              variant="outline"
            >
              <ScanLine className="size-6" />
              <span className="text-left">
                <span className="block font-semibold">
                  {locale === "en" ? "Entries and exits" : "Entrées et sorties"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {locale === "en"
                    ? "Scan Lernn cards at the gate"
                    : "Scanner les cartes Lernn au portail"}
                </span>
              </span>
            </Button>
            <Button
              className="h-auto justify-start gap-4 p-4"
              disabled={!schoolId}
              onClick={() => changeTab("course-attendance")}
              variant="outline"
            >
              <ListChecks className="size-6" />
              <span className="text-left">
                <span className="block font-semibold">
                  {locale === "en" ? "Course attendance" : "Présence aux cours"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {locale === "en"
                    ? "Open and complete roll calls"
                    : "Ouvrir et compléter les appels"}
                </span>
              </span>
            </Button>
          </div>
        </div>
      )}
      {tab === "notifications" && <CompanionNotifications locale={locale} />}
      {tab === "profile" && profileContent}
    </CompanionFrame>
  )
}

function CompanionHome({
  locale,
  onCloseSession,
  onOpenScan,
  session,
}: {
  locale: "fr" | "en"
  onCloseSession: () => void
  onOpenScan: () => void
  session: CompanionSession
}) {
  const copy = companionCopy(locale)

  return (
    <div>
      <CompanionHeader
        subtitle={copy.companion}
        title={getCompanionSessionTitle(session)}
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <Card variant="dark">
          <CardContent className="flex flex-col gap-4 px-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">
                  {getCompanionActionLabel(session.action)}
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {copy.companion}
                </div>
              </div>
              <Badge variant="secondary">
                {formatCompanionExpiry(session, locale)}
              </Badge>
            </div>
            <p className="text-sm leading-6 text-white/75">
              {getCompanionActionDescription(session.action)}
            </p>
          </CardContent>
        </Card>

        <CompanionActionPlaceholder
          action={session.action}
          locale={locale}
          onOpenScan={onOpenScan}
        />

        <Button
          onClick={onCloseSession}
          size="lg"
          type="button"
          variant="outline"
        >
          {locale === "en"
            ? "Close temporary session"
            : "Fermer la session temporaire"}
        </Button>
      </div>
    </div>
  )
}

function AccountOnlyHome({
  locale,
  onOpenScan,
}: {
  locale: "fr" | "en"
  onOpenScan: () => void
}) {
  const copy = companionCopy(locale)
  const [invitationOpen, setInvitationOpen] = useState(false)

  return (
    <div>
      <CompanionHeader
        subtitle={copy.companionSpaces}
        title={copy.accountHomeTitle}
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <Card variant="dark">
          <CardContent className="flex flex-col gap-3 px-0">
            <Badge className="w-fit" variant="secondary">
              {locale === "en"
                ? "No personal profile"
                : "Aucun profil personnel"}
            </Badge>
            <p className="text-sm leading-6 text-white/75">
              {copy.accountHomeDescription}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            className="justify-start"
            onClick={onOpenScan}
            size="lg"
            type="button"
          >
            <QrCode data-icon="inline-start" />
            {copy.scanCompanionQr}
          </Button>
          <Button
            className="justify-start"
            onClick={() => setInvitationOpen(true)}
            size="lg"
            type="button"
            variant="outline"
          >
            <Link2 data-icon="inline-start" />
            {copy.pasteInvitation}
          </Button>
        </div>

        <Card size="sm">
          <CardContent className="flex items-start gap-3 px-0">
            <Badge className="size-8 p-0" variant="neutral">
              <CheckCircle2 />
            </Badge>
            <p className="text-sm leading-6 text-muted-foreground">
              {locale === "en"
                ? "Use the Account tab to edit your profile and sign out."
                : "Utilisez l'onglet Compte pour modifier votre profil et vous deconnecter."}
            </p>
          </CardContent>
        </Card>
      </div>
      <InvitationEntryDrawer
        locale={locale}
        onOpenChange={setInvitationOpen}
        open={invitationOpen}
      />
    </div>
  )
}

function CompanionActionPlaceholder({
  action,
  locale,
  onOpenScan,
}: {
  action: CompanionActionType
  locale: "fr" | "en"
  onOpenScan: () => void
}) {
  const copy = companionCopy(locale)
  const Icon = companionActionIcons[action]
  const actionAvailable =
    action === "GATE_SCANNER" || action === "COURSE_ATTENDANCE_ROUNDS"

  return (
    <Card category="admin">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon />
          {getCompanionActionLabel(action)}
        </CardTitle>
        <CardDescription>
          {getCompanionActionDescription(action)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4">
        {!actionAvailable && (
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-start gap-3">
              <Badge className="size-8 p-0" variant="warning">
                <AlertTriangle />
              </Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                {copy.placeholder}
              </p>
            </div>
          </div>
        )}
        {actionAvailable && (
          <Button onClick={onOpenScan} type="button" variant="outline">
            <Icon data-icon="inline-start" />
            {action === "GATE_SCANNER"
              ? locale === "en"
                ? "Open scanner"
                : "Ouvrir le scanner"
              : locale === "en"
                ? "Open roll calls"
                : "Ouvrir les appels"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function CompanionNotifications({ locale }: { locale: "fr" | "en" }) {
  const copy = companionCopy(locale)

  return (
    <div>
      <CompanionHeader
        subtitle={copy.companion}
        title={locale === "en" ? "Notifications" : "Notifications"}
      />
      <div className="px-5 pt-4">
        <Card size="sm">
          <Empty className="p-4">
            <EmptyHeader>
              <EmptyTitle>
                {locale === "en" ? "No notification" : "Aucune notification"}
              </EmptyTitle>
              <EmptyDescription>{copy.notificationsEmpty}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      </div>
    </div>
  )
}

function CompanionScanPage({
  locale,
  onBack,
}: {
  locale: "fr" | "en"
  onBack: () => void
}) {
  return <CompanionQrScannerPage locale={locale} onBack={onBack} />
}

function InvitationEntryDrawer({
  locale,
  onOpenChange,
  open,
}: {
  locale: "fr" | "en"
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setValue("")
      setError(null)
    }
  }, [open])

  function openInvitation() {
    const token = extractInvitationToken(value)
    if (!token) {
      setError(
        locale === "en"
          ? "Paste an invitation link or token."
          : "Collez un lien ou token d'invitation."
      )
      return
    }

    window.location.assign(`/${locale}/invite/${encodeURIComponent(token)}`)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[80svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle>
            {locale === "en" ? "Accept invitation" : "Accepter une invitation"}
          </DrawerTitle>
          <DrawerDescription>
            {locale === "en"
              ? "Paste the invitation link sent by the school."
              : "Collez le lien d'invitation envoye par l'ecole."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-5 pb-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                {locale === "en" ? "Invitation link" : "Lien d'invitation"}
              </FieldLabel>
              <Input
                autoFocus
                onChange={(event) => setValue(event.target.value)}
                placeholder={`/${locale}/invite/...`}
                value={value}
              />
            </Field>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </FieldGroup>
        </div>
        <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="flex-1" variant="outline">
              {locale === "en" ? "Cancel" : "Annuler"}
            </Button>
          </DrawerClose>
          <Button className="flex-1" onClick={openInvitation} type="button">
            {locale === "en" ? "Open" : "Ouvrir"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function CompanionFrame({
  children,
  nav,
}: {
  children: React.ReactNode
  nav?: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas-alt">
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          nav ? "pb-[4.25rem]" : "pb-0"
        )}
      >
        {children}
      </div>
      {nav}
    </div>
  )
}

function CompanionHeader({
  onBack,
  subtitle,
  title,
}: {
  onBack?: () => void
  subtitle: string
  title: string
}) {
  return (
    <header className="sticky top-0 z-50 flex min-h-16 items-center gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur">
      {onBack && (
        <Button
          aria-label="Back"
          className="size-8 shrink-0 rounded-full"
          onClick={onBack}
          size="icon"
          variant="ghost"
        >
          <ArrowLeft />
        </Button>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {subtitle}
        </p>
        <h1 className="truncate text-lg leading-tight font-bold tracking-normal">
          {title}
        </h1>
      </div>
    </header>
  )
}

function CompanionBottomNav({
  active,
  items,
  onChange,
}: {
  active: CompanionTab
  items: Array<{
    icon: React.ComponentType
    id: CompanionTab
    label: string
  }>
  onChange: (id: CompanionTab) => void
}) {
  return (
    <nav className="mobile-device-shell fixed right-0 bottom-0 left-0 z-[70] mx-auto flex h-14 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === active

        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-medium text-muted-foreground",
              isActive && "text-foreground"
            )}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            {isActive && (
              <span className="absolute top-0 h-0.5 w-7 rounded-full bg-brand" />
            )}
            <span className="relative grid place-items-center">
              <Icon />
            </span>
            <span className="truncate px-1">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function normalizeCompanionTab(section: string | undefined): CompanionTab {
  return companionTabs.includes(section as CompanionTab)
    ? (section as CompanionTab)
    : "home"
}

function shouldShowCompanionBottomNav(tab: CompanionTab) {
  return tab === "home" || tab === "notifications" || tab === "profile"
}

function extractInvitationToken(rawText: string) {
  const value = rawText.trim()
  if (!value) return null

  try {
    const url = new URL(value)
    const token = extractTokenFromInvitationPath(url.pathname)
    if (token) return token
  } catch {
    const token = extractTokenFromInvitationPath(value)
    if (token) return token
  }

  if (/^[A-Za-z0-9._~-]{8,}$/.test(value)) return value
  return null
}

function extractTokenFromInvitationPath(path: string) {
  const match = path.match(/\/(?:invite|invitation)\/([^/?#]+)/)
  const token = match?.[1]
  return token ? decodeURIComponent(token) : null
}
