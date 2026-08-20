import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  FileCheck2,
  FileText,
  Home,
  Languages,
  ListChecks,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Smartphone,
  Trash2,
  Upload,
  UserRound,
  WalletCards,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type {
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from "react"
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import enGbFlagUrl from "flag-icons/flags/4x3/gb.svg"
import enUsFlagUrl from "flag-icons/flags/4x3/us.svg"
import frFlagUrl from "flag-icons/flags/4x3/fr.svg"
import { toast } from "sonner"

import { withAppBase, withoutAppBase } from "@/lib/route-base"

import { FeeProgressRing, GradeCell, LernnLogo } from "@/components/brand"
import {
  MobileFloatingBar,
  MobileWorkspaceFrame,
  MobileWorkspaceLoading,
} from "@/components/mobile"
import { PersonAvatar } from "@/components/shared/person-avatar"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  clearCachedAuthSession,
  getSelectedProfile,
  getProfileDisplayName,
  getWorkspaceForProfile,
  setSelectedProfile,
} from "@/features/auth/session"
import type { UserProfile } from "@/features/auth/types"
import { fetchProfiles, logout as logoutRequest } from "@/features/auth/api"
import { companionCopy } from "@/features/companion/copy"
import type { CompanionSession } from "@/features/companion/types"
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationsQueryOptions,
  unreadNotificationsQueryOptions,
} from "@/features/notifications/queries"
import type {
  AppNotification,
  NotificationsPayload,
} from "@/features/notifications/queries"
import {
  mobileSchoolYearsQueryOptions,
  type MobileAcademicPeriod,
  type MobileSchoolYear,
} from "@/features/school-years"
import { parentDashboardQueryOptions } from "@/features/parent/dashboard"
import { getCanonicalAcademicAccessState } from "@/features/parent/academic-access"
import { parentPaymentsSummaryQueryOptions } from "@/features/parent/payments"
import {
  childReportCardsQueryOptions,
  childSubjectGradesQueryOptions,
  parentChildrenGradesQueryOptions,
} from "@/features/parent/report-cards"
import type {
  AcademicPeriod,
  ChildReportCard,
  ParentChildSubjectGrades,
  ParentGradesChild,
  ParentGradingScale,
  ParentReportSubjectAverage,
  ParentSubjectGrade,
} from "@/features/parent/report-cards"
import { getSubjectColor } from "@/features/parent/subject-colors"
import { parentChildPresenceQueryOptions } from "@/features/parent/presence"
import type {
  ParentPaymentChild,
  ParentPaymentsSummary,
  PaymentListItem,
} from "@/features/parent/payments"
import type { ParentChildPresence } from "@/features/parent/presence"
import type { StudentCourseAttendanceItem } from "@/features/presence/types"
import type { ParentChildSummary } from "@/features/parent/types"
import {
  studentChildrenGradesQueryOptions,
  studentDashboardQueryOptions,
  studentPaymentsSummaryQueryOptions,
  studentPresenceQueryOptions,
  studentReportCardsQueryOptions,
  studentScheduleQueryOptions,
  studentSubjectGradesQueryOptions,
} from "@/features/student/queries"
import type {
  StudentScheduleDay,
  StudentScheduleSlot,
} from "@/features/student/queries"
import type { StudentDashboard } from "@/features/student/types"
import { isStudentDashboardLoading } from "@/features/student/dashboard-query-state"
import { useCurrentDate } from "@/hooks/use-current-date"
import {
  createTeacherEvaluation,
  deleteTeacherEvaluation,
  publishTeacherEvaluation,
  saveTeacherAppreciations,
  saveTeacherEvaluationGrades,
  teacherAppreciationsQueryOptions,
  teacherClassGradeGridQueryOptions,
  teacherDashboardQueryOptions,
  teacherEvaluationGradeGridQueryOptions,
  teacherEvaluationsQueryOptions,
  teacherScheduleQueryOptions,
  updateTeacherEvaluation,
} from "@/features/teacher/queries"
import { buildChangedTeacherGrades } from "@/features/teacher/grade-entry"
import {
  buildChangedTeacherAppreciations,
  type TeacherAppreciationDraft,
} from "@/features/teacher/appreciations"
import type { CourseAttendanceRouteContext } from "@/features/teacher/course-attendance"
import type {
  TeacherDashboard,
  TeacherClassSummary,
  TeacherEvaluation,
  TeacherEvaluationStatus,
  TeacherEvaluationType,
  TeacherScheduleSlot,
  TeacherTodayCourse,
} from "@/features/teacher/types"
import {
  fmtCompactAmount,
  fmtDate,
  fmtDuration,
  fmtFCFA,
  fmtMonthShort,
  fmtRelativeTime,
  fmtTime,
} from "@/lib/format"
import {
  apiClient,
  ApiError,
  getApiErrorMessage,
  setSchoolIdGetter,
  showApiError,
} from "@/lib/api-client"
import { importWithChunkReload } from "@/lib/lazy-import"
import { cn } from "@/lib/utils"
import * as m from "@/paraglide/messages"

const CompanionSpacesDrawer = lazy(() =>
  importWithChunkReload(
    "companion-spaces",
    () => import("@/features/companion/spaces-drawer")
  ).then((module) => ({
    default: module.CompanionSpacesDrawer,
  }))
)
const AccountOnlyWorkspace = lazy(() =>
  importWithChunkReload(
    "account-workspace",
    () => import("@/features/companion/workspace")
  ).then((module) => ({
    default: module.AccountOnlyWorkspace,
  }))
)
const CompanionWorkspace = lazy(() =>
  importWithChunkReload(
    "companion-workspace",
    () => import("@/features/companion/workspace")
  ).then((module) => ({
    default: module.CompanionWorkspace,
  }))
)
const EmployeeWorkspace = lazy(() =>
  importWithChunkReload(
    "employee-workspace",
    () => import("@/features/companion/workspace")
  ).then((module) => ({
    default: module.EmployeeWorkspace,
  }))
)
const CourseAttendancePage = lazy(() =>
  importWithChunkReload(
    "course-attendance",
    () => import("@/features/teacher/course-attendance")
  ).then((module) => ({
    default: module.CourseAttendancePage,
  }))
)

interface MobileLandingProps {
  locale: "fr" | "en"
}

type ParentTab =
  | "home"
  | "notifications"
  | "payments"
  | "presence"
  | "profile"
  | "reports"
  | "schedule"
  | "subjects"
  | "evaluations"
type StudentTab =
  | "home"
  | "evaluations"
  | "notifications"
  | "payments"
  | "presence"
  | "profile"
  | "reports"
  | "schedule"
  | "subjects"
type TeacherTab =
  | "classes"
  | "course-attendance"
  | "evaluation-new"
  | "evaluations"
  | "grade-entry"
  | "home"
  | "notifications"
  | "profile"
  | "schedule"
type AppModuleLink = {
  description: string
  illustration: string
  label: string
  onClick: () => void
}
type ParentPresenceView = "calendar" | "history"
type AcademicYearContextValue = {
  isError: boolean
  isLoading: boolean
  selectedYear: MobileSchoolYear | null
  selectedYearId: string | null
  setSelectedYearId: (id: string | null) => void
  years: MobileSchoolYear[]
}
type UpcomingPaymentLine = {
  amount: number
  child: ParentChildSummary
  dueDate: string | null
  id: string
  label: string
  overdue: boolean
}
type UpcomingEvaluationPreview = {
  classGroupCode: string | null
  date: string
  id: string
  periodId: string | null
  subjectColor: string | null
  subjectName: string | null
  title: string
  type: TeacherEvaluationType
}
type ApiEvaluationListItem = {
  classGroup?: { code: string | null; id: string; name: string } | null
  date: string
  gradeCount?: number
  id: string
  periodId?: string | null
  subjectLevel?: {
    subject: {
      code: string | null
      color?: string | null
      id: string
      name: string
    }
  } | null
  title: string
  type: TeacherEvaluationType
}
const MOBILE_EVALUATION_TYPES = [
  "HOMEWORK",
  "QUIZ",
  "ORAL",
  "PROJECT",
  "EXAM",
] as const satisfies readonly TeacherEvaluationType[]
const NO_UPCOMING_EVALUATIONS: UpcomingEvaluationPreview[] = []
type PaymentMonthlyActivity = {
  amount: number
  key: string
  label: string
}
type MonthRange = {
  endDate: string
  startDate: string
}
type PresenceCalendarStatus =
  | "absent"
  | "future"
  | "late"
  | "no-event"
  | "off"
  | "present"
type PresenceDayEvents = {
  courseItems: StudentCourseAttendanceItem[]
  date: string
  entry: ParentPresenceHistoryEvent | null
  events: ParentPresenceHistoryEvent[]
  exit: ParentPresenceHistoryEvent | null
  extraCount: number
  status: "absent" | "late" | "present"
}
type PresenceCalendarCell = {
  dayEvents: PresenceDayEvents | null
  day: number
  hasJustification: boolean
  isoDate: string
  status: PresenceCalendarStatus
}
type ParentPresenceHistoryEvent = ParentChildPresence["history"]["data"][number]
type EvaluationCalendarDay = {
  date: string
  evaluations: UpcomingEvaluationPreview[]
}

const parentTabs: ParentTab[] = [
  "home",
  "notifications",
  "reports",
  "schedule",
  "subjects",
  "evaluations",
  "presence",
  "payments",
  "profile",
]
const studentTabs: StudentTab[] = [
  "home",
  "notifications",
  "reports",
  "schedule",
  "subjects",
  "evaluations",
  "presence",
  "payments",
  "profile",
]
const scheduleDays: StudentScheduleDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]
const teacherTabs: TeacherTab[] = [
  "home",
  "notifications",
  "classes",
  "course-attendance",
  "evaluation-new",
  "evaluations",
  "grade-entry",
  "schedule",
  "profile",
]

type ActivityTone = "grades" | "messages" | "payments" | "presence"
type RecentActivityItem = {
  id: string
  icon: LucideIcon
  subtitle: string
  time: string
  title: string
  tone: ActivityTone
}

const notificationIcons: Record<AppNotification["type"], LucideIcon> = {
  GRADE: FileCheck2,
  PAYMENT: WalletCards,
  PRESENCE: CalendarDays,
  SYSTEM: Bell,
}

export function MobileLanding({ locale }: MobileLandingProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="hidden min-h-svh items-center justify-center px-8 text-center 2xl:flex">
        <div className="flex max-w-sm flex-col items-center gap-5">
          <LernnLogo size={30} />
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
            <Smartphone className="size-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              {m.app_desktop_title()}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.app_desktop_description()}
            </p>
          </div>
        </div>
      </div>

      <main className="mobile-device-shell mx-auto flex min-h-svh w-full flex-col px-5 py-6 2xl:hidden">
        <header className="flex items-center justify-between">
          <LernnLogo size={24} />
          <div className="flex items-center gap-2">
            <LocalePill locale="fr" currentLocale={locale} />
            <LocalePill locale="en" currentLocale={locale} />
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
              {m.app_eyebrow()}
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-balance">
              {m.app_title()}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              {m.app_description()}
            </p>
          </div>

          <div className="grid gap-2">
            <Button asChild size="lg">
              <a href={withAppBase(`/${locale}/app/home`)}>
                {m.app_continue()}
              </a>
            </Button>
            <Button variant="outline" size="lg">
              {m.app_card_login()}
            </Button>
          </div>
        </section>

        <div className="pb-[env(safe-area-inset-bottom)]" />
      </main>
    </div>
  )
}

export function MobileShellPlaceholder({
  activeCompanionSession = null,
  initialSection,
  selectedProfile = null,
}: {
  activeCompanionSession?: CompanionSession | null
  initialSection?: string
  selectedProfile?: UserProfile | null
}) {
  const currentLocale = getRouteLocale()
  const profileContent = (
    <ProfileView fallbackPhotoUrl={selectedProfile?.photoUrl ?? null} />
  )

  if (activeCompanionSession) {
    return (
      <div className="min-h-svh bg-canvas-alt text-foreground">
        <main className="mobile-device-shell mx-auto flex h-svh w-full flex-col overflow-hidden bg-canvas-alt shadow-lg">
          <Suspense fallback={<MobileWorkspaceLoading />}>
            <CompanionWorkspace
              initialSection={initialSection}
              locale={currentLocale}
              profileContent={profileContent}
              session={activeCompanionSession}
            />
          </Suspense>
        </main>
      </div>
    )
  }

  if (!selectedProfile) {
    return (
      <div className="min-h-svh bg-canvas-alt text-foreground">
        <main className="mobile-device-shell mx-auto flex h-svh w-full flex-col overflow-hidden bg-canvas-alt shadow-lg">
          <Suspense fallback={<MobileWorkspaceLoading />}>
            <AccountOnlyWorkspace
              initialSection={initialSection}
              locale={currentLocale}
              profileContent={profileContent}
            />
          </Suspense>
        </main>
      </div>
    )
  }

  const preferredWorkspace = getWorkspaceForProfile(selectedProfile) ?? "parent"
  const workspace = preferredWorkspace
  const profileName = getProfileDisplayName(selectedProfile)

  return (
    <div className="min-h-svh bg-canvas-alt text-foreground">
      <main className="mobile-device-shell mx-auto flex h-svh w-full flex-col overflow-hidden bg-canvas-alt shadow-lg">
        {workspace === "parent" ? (
          <ParentWorkspace
            initialSection={initialSection}
            profilePhotoUrl={selectedProfile?.photoUrl ?? null}
            profileName={profileName}
            schoolName={selectedProfile?.schoolName ?? null}
            schoolId={selectedProfile?.schoolId ?? null}
          />
        ) : workspace === "student" ? (
          <StudentWorkspace
            initialSection={initialSection}
            profilePhotoUrl={selectedProfile?.photoUrl ?? null}
            profileName={profileName}
            schoolName={selectedProfile?.schoolName ?? null}
            schoolId={selectedProfile?.schoolId ?? null}
          />
        ) : workspace === "teacher" ? (
          <TeacherWorkspace
            initialSection={initialSection}
            profilePhotoUrl={selectedProfile?.photoUrl ?? null}
            profileName={profileName}
            schoolId={selectedProfile?.schoolId ?? null}
          />
        ) : (
          <Suspense fallback={<MobileWorkspaceLoading />}>
            <EmployeeWorkspace
              initialSection={initialSection}
              locale={currentLocale}
              profile={selectedProfile}
              profileContent={profileContent}
            />
          </Suspense>
        )}
      </main>
    </div>
  )
}

function useSelectedAcademicYear(
  schoolId: string | null
): AcademicYearContextValue {
  const schoolYearsQuery = useQuery({
    ...mobileSchoolYearsQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const years = useMemo(
    () => schoolYearsQuery.data ?? [],
    [schoolYearsQuery.data]
  )
  const storageKey = schoolId ? `lernn.mobile.schoolYear.${schoolId}` : null
  const [selectedYearIdState, setSelectedYearIdState] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!schoolId || !years.length) {
      setSelectedYearIdState(null)
      return
    }

    const storedId = storageKey ? window.localStorage.getItem(storageKey) : null
    const fallbackYear = years.find((year) => year.isCurrent) ?? years[0]
    const nextYearId =
      storedId && years.some((year) => year.id === storedId)
        ? storedId
        : (fallbackYear?.id ?? null)

    setSelectedYearIdState((currentYearId) =>
      currentYearId && years.some((year) => year.id === currentYearId)
        ? currentYearId
        : nextYearId
    )
  }, [schoolId, storageKey, years])

  const setSelectedYearId = useCallback(
    (yearId: string | null) => {
      setSelectedYearIdState(yearId)
      if (!storageKey) return

      if (yearId) {
        window.localStorage.setItem(storageKey, yearId)
      } else {
        window.localStorage.removeItem(storageKey)
      }
    },
    [storageKey]
  )

  const selectedYear =
    years.find((year) => year.id === selectedYearIdState) ??
    years.find((year) => year.isCurrent) ??
    years[0] ??
    null

  return {
    isError: schoolYearsQuery.isError,
    isLoading: schoolYearsQuery.isLoading,
    selectedYear,
    selectedYearId: selectedYear?.id ?? selectedYearIdState,
    setSelectedYearId,
    years,
  }
}

function ParentWorkspace({
  initialSection,
  profilePhotoUrl,
  profileName,
  schoolName,
  schoolId,
}: {
  initialSection?: string
  profilePhotoUrl: string | null
  profileName: string
  schoolName: string | null
  schoolId: string | null
}) {
  const navigate = useNavigate()
  const currentLocale = getRouteLocale()
  const tab = normalizeParentTab(initialSection)
  const academicYearContext = useSelectedAcademicYear(schoolId)
  const unreadNotificationsQuery = useQuery(unreadNotificationsQueryOptions())
  const unreadNotificationBadge = formatNotificationBadge(
    unreadNotificationsQuery.data ?? 0
  )

  useEffect(() => {
    if (initialSection === tab) return
    void navigate({
      to: "/$locale/app/$section",
      params: { locale: currentLocale, section: tab },
      replace: true,
    })
  }, [currentLocale, initialSection, navigate, tab])

  function changeTab(nextTab: ParentTab) {
    void navigate({
      to: "/$locale/app/$section",
      params: { locale: currentLocale, section: nextTab },
    })
  }

  return (
    <MobileWorkspaceFrame
      contentClassName={tab === "notifications" ? "bg-background" : undefined}
      nav={
        shouldShowParentBottomNav(tab) ? (
          <BottomNav
            active={getPrimaryParentTab(tab)}
            items={[
              { id: "home", icon: Home, label: m.mobile_nav_home() },
              {
                id: "notifications",
                badge: unreadNotificationBadge,
                icon: Bell,
                label: m.mobile_nav_notifications(),
              },
              { id: "profile", icon: UserRound, label: m.mobile_nav_profile() },
            ]}
            onChange={changeTab}
          />
        ) : null
      }
    >
      {tab === "home" && (
        <ParentHome
          onOpenNotifications={() => changeTab("notifications")}
          onOpenPayments={() => changeTab("payments")}
          onOpenPresence={() => changeTab("presence")}
          onOpenReports={() => changeTab("reports")}
          onOpenSchedule={() => changeTab("schedule")}
          onOpenSubjects={() => changeTab("subjects")}
          onOpenEvaluations={() => changeTab("evaluations")}
          profilePhotoUrl={profilePhotoUrl}
          profileName={profileName}
          schoolName={schoolName}
          schoolId={schoolId}
        />
      )}
      {tab === "reports" && (
        <ParentReports
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          onOpenPayments={() => changeTab("payments")}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "presence" && (
        <ParentPresence
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
        />
      )}
      {tab === "payments" && (
        <ParentPayments
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
        />
      )}
      {tab === "schedule" && (
        <ParentSchedule
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "subjects" && (
        <ParentSubjects
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "evaluations" && (
        <ParentEvaluations
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
        />
      )}
      {tab === "notifications" && <NotificationsView />}
      {tab === "profile" && <ProfileView fallbackPhotoUrl={profilePhotoUrl} />}
    </MobileWorkspaceFrame>
  )
}

function StudentWorkspace({
  initialSection,
  profilePhotoUrl,
  profileName,
  schoolName,
  schoolId,
}: {
  initialSection?: string
  profilePhotoUrl: string | null
  profileName: string
  schoolName: string | null
  schoolId: string | null
}) {
  const navigate = useNavigate()
  const currentLocale = getRouteLocale()
  const tab = normalizeStudentTab(initialSection)
  const academicYearContext = useSelectedAcademicYear(schoolId)
  const unreadNotificationsQuery = useQuery(unreadNotificationsQueryOptions())
  const unreadNotificationBadge = formatNotificationBadge(
    unreadNotificationsQuery.data ?? 0
  )
  const defaultYearPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const dashboardQuery = useQuery({
    ...studentDashboardQueryOptions(schoolId ?? "", defaultYearPeriod?.id),
    enabled: Boolean(
      schoolId && (!academicYearContext.isLoading || defaultYearPeriod)
    ),
  })
  const dashboardLoading = isStudentDashboardLoading({
    hasSchool: Boolean(schoolId),
    isAcademicYearLoading: academicYearContext.isLoading,
    isDashboardPending: dashboardQuery.isPending,
  })

  useEffect(() => {
    if (initialSection === tab) return
    void navigate({
      to: "/$locale/app/$section",
      params: { locale: currentLocale, section: tab },
      replace: true,
    })
  }, [currentLocale, initialSection, navigate, tab])

  function changeTab(nextTab: StudentTab) {
    void navigate({
      to: "/$locale/app/$section",
      params: { locale: currentLocale, section: nextTab },
    })
  }

  return (
    <MobileWorkspaceFrame
      contentClassName={tab === "notifications" ? "bg-background" : undefined}
      nav={
        shouldShowStudentBottomNav(tab) ? (
          <BottomNav
            active={getPrimaryStudentTab(tab)}
            items={[
              { id: "home", icon: Home, label: m.mobile_nav_home() },
              {
                id: "notifications",
                badge: unreadNotificationBadge,
                icon: Bell,
                label: m.mobile_nav_notifications(),
              },
              { id: "profile", icon: UserRound, label: m.mobile_nav_profile() },
            ]}
            onChange={changeTab}
          />
        ) : null
      }
    >
      {tab === "home" && (
        <StudentHome
          academicYearContext={academicYearContext}
          dashboard={dashboardQuery.data}
          isError={dashboardQuery.isError}
          isLoading={dashboardLoading}
          onOpenNotifications={() => changeTab("notifications")}
          onOpenPayments={() => changeTab("payments")}
          onOpenPresence={() => changeTab("presence")}
          onOpenReports={() => changeTab("reports")}
          onOpenSchedule={() => changeTab("schedule")}
          onOpenSubjects={() => changeTab("subjects")}
          onOpenEvaluations={() => changeTab("evaluations")}
          onRetry={() => void dashboardQuery.refetch()}
          profilePhotoUrl={profilePhotoUrl}
          profileName={profileName}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "reports" && (
        <StudentReports
          academicYearContext={academicYearContext}
          dashboard={dashboardQuery.data}
          isError={dashboardQuery.isError}
          isLoading={dashboardLoading}
          onBack={() => changeTab("home")}
          onOpenPayments={() => changeTab("payments")}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "schedule" && (
        <StudentSchedule
          academicYearContext={academicYearContext}
          dashboard={dashboardQuery.data}
          isError={dashboardQuery.isError}
          isLoading={dashboardLoading}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "presence" && (
        <StudentPresence
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
        />
      )}
      {tab === "payments" && (
        <StudentPayments
          academicYearContext={academicYearContext}
          dashboard={dashboardQuery.data}
          isError={dashboardQuery.isError}
          isLoading={dashboardLoading}
          onBack={() => changeTab("home")}
          onRetryDashboard={() => void dashboardQuery.refetch()}
          schoolId={schoolId}
        />
      )}
      {tab === "subjects" && (
        <StudentSubjects
          academicYearContext={academicYearContext}
          dashboard={dashboardQuery.data}
          isError={dashboardQuery.isError}
          isLoading={dashboardLoading}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
          schoolName={schoolName}
        />
      )}
      {tab === "evaluations" && (
        <StudentEvaluations
          academicYearContext={academicYearContext}
          isError={dashboardQuery.isError}
          isLoading={dashboardLoading}
          onBack={() => changeTab("home")}
          schoolId={schoolId}
        />
      )}
      {tab === "notifications" && <NotificationsView />}
      {tab === "profile" && <ProfileView fallbackPhotoUrl={profilePhotoUrl} />}
    </MobileWorkspaceFrame>
  )
}

function TeacherWorkspace({
  initialSection,
  profilePhotoUrl,
  profileName,
  schoolId,
}: {
  initialSection?: string
  profilePhotoUrl: string | null
  profileName: string
  schoolId: string | null
}) {
  const navigate = useNavigate()
  const currentLocale = getRouteLocale()
  const tab = normalizeTeacherTab(initialSection)
  const [selectedClass, setSelectedClass] =
    useState<TeacherClassSummary | null>(null)
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<TeacherEvaluation | null>(null)
  const [selectedScheduleClassId, setSelectedScheduleClassId] =
    useState<string>("all")
  const [courseAttendanceContext, setCourseAttendanceContext] =
    useState<CourseAttendanceRouteContext | null>(null)
  const academicYearContext = useSelectedAcademicYear(schoolId)
  const unreadNotificationsQuery = useQuery(unreadNotificationsQueryOptions())
  const unreadNotificationBadge = formatNotificationBadge(
    unreadNotificationsQuery.data ?? 0
  )
  const defaultTeacherPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const [selectedTeacherPeriodId, setSelectedTeacherPeriodId] = useState<
    string | null
  >(null)
  const teacherPeriodOptions = useMemo(
    () => getAcademicYearPeriodOptions(academicYearContext.selectedYear),
    [academicYearContext.selectedYear]
  )
  const activeTeacherPeriodId =
    selectedTeacherPeriodId ?? defaultTeacherPeriod?.id ?? null

  useEffect(() => {
    setSelectedTeacherPeriodId(null)
  }, [academicYearContext.selectedYearId])

  useEffect(() => {
    if (initialSection === tab) return
    void navigate({
      to: "/$locale/app/$section",
      params: { locale: currentLocale, section: tab },
      replace: true,
    })
  }, [currentLocale, initialSection, navigate, tab])

  function changeTab(nextTab: TeacherTab) {
    void navigate({
      to: "/$locale/app/$section",
      params: { locale: currentLocale, section: nextTab },
    })
  }

  function openCourseAttendance(context: CourseAttendanceRouteContext | null) {
    setCourseAttendanceContext(context)
    changeTab("course-attendance")
  }

  return (
    <MobileWorkspaceFrame
      contentClassName={tab === "notifications" ? "bg-background" : undefined}
      nav={
        shouldShowTeacherBottomNav(tab) ? (
          <BottomNav
            active={getPrimaryTeacherTab(tab)}
            items={[
              { id: "home", icon: Home, label: m.mobile_nav_home() },
              {
                id: "notifications",
                badge: unreadNotificationBadge,
                icon: Bell,
                label: m.mobile_nav_notifications(),
              },
              { id: "profile", icon: UserRound, label: m.mobile_nav_profile() },
            ]}
            onChange={changeTab}
          />
        ) : null
      }
    >
      {tab === "home" && (
        <TeacherToday
          onOpenCourseAttendance={openCourseAttendance}
          onOpenClasses={() => changeTab("classes")}
          onOpenEvaluations={() => changeTab("evaluations")}
          onOpenSchedule={() => changeTab("schedule")}
          periodId={activeTeacherPeriodId}
          profilePhotoUrl={profilePhotoUrl}
          profileName={profileName}
          schoolId={schoolId}
        />
      )}
      {tab === "classes" && (
        <TeacherClasses
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          onOpenCourseAttendance={openCourseAttendance}
          onCreateEvaluation={(classItem) => {
            setSelectedClass(classItem ?? null)
            setSelectedEvaluation(null)
            changeTab("evaluation-new")
          }}
          onOpenSchedule={(classGroupId) => {
            setSelectedScheduleClassId(classGroupId)
            changeTab("schedule")
          }}
          periodId={activeTeacherPeriodId}
          schoolId={schoolId}
        />
      )}
      {tab === "evaluations" && (
        <TeacherEvaluations
          academicYearContext={academicYearContext}
          onBack={() => changeTab("home")}
          onCreateEvaluation={() => {
            setSelectedClass(null)
            setSelectedEvaluation(null)
            changeTab("evaluation-new")
          }}
          onEditEvaluation={(evaluation) => {
            setSelectedEvaluation(evaluation)
            setSelectedClass(null)
            changeTab("evaluation-new")
          }}
          onOpenEvaluation={(evaluation) => {
            setSelectedEvaluation(evaluation)
            changeTab("grade-entry")
          }}
          onPeriodChange={setSelectedTeacherPeriodId}
          periodOptions={teacherPeriodOptions}
          schoolId={schoolId}
          selectedPeriodId={activeTeacherPeriodId}
        />
      )}
      {tab === "evaluation-new" && (
        <TeacherEvaluationCreatePage
          defaultClass={selectedClass}
          evaluation={selectedEvaluation}
          onBack={() => changeTab("evaluations")}
          onSaved={(evaluation, mode) => {
            setSelectedEvaluation(evaluation)
            changeTab(mode === "edit" ? "evaluations" : "grade-entry")
          }}
          periodOptions={teacherPeriodOptions}
          schoolId={schoolId}
          selectedPeriodId={activeTeacherPeriodId}
        />
      )}
      {tab === "grade-entry" && (
        <TeacherGradeEntry
          evaluation={selectedEvaluation}
          onBack={() => changeTab("evaluations")}
          schoolId={schoolId}
        />
      )}
      {tab === "schedule" && (
        <TeacherSchedule
          initialClassId={selectedScheduleClassId}
          onBack={() => changeTab("home")}
          onOpenCourseAttendance={openCourseAttendance}
          schoolId={schoolId}
        />
      )}
      {tab === "course-attendance" && (
        <Suspense fallback={<MobileWorkspaceLoading />}>
          <CourseAttendancePage
            context={courseAttendanceContext}
            onBack={() => changeTab("home")}
            schoolId={schoolId}
          />
        </Suspense>
      )}
      {tab === "notifications" && <NotificationsView />}
      {tab === "profile" && <ProfileView fallbackPhotoUrl={profilePhotoUrl} />}
    </MobileWorkspaceFrame>
  )
}

function normalizeParentTab(section: string | undefined): ParentTab {
  return parentTabs.includes(section as ParentTab)
    ? (section as ParentTab)
    : "home"
}

function normalizeStudentTab(section: string | undefined): StudentTab {
  return studentTabs.includes(section as StudentTab)
    ? (section as StudentTab)
    : "home"
}

function normalizeTeacherTab(section: string | undefined): TeacherTab {
  return teacherTabs.includes(section as TeacherTab)
    ? (section as TeacherTab)
    : "home"
}

function getPrimaryParentTab(tab: ParentTab): ParentTab {
  return tab === "notifications" || tab === "profile" ? tab : "home"
}

function shouldShowParentBottomNav(tab: ParentTab) {
  return tab === "home" || tab === "notifications" || tab === "profile"
}

function getPrimaryStudentTab(tab: StudentTab): StudentTab {
  return tab === "notifications" || tab === "profile" ? tab : "home"
}

function shouldShowStudentBottomNav(tab: StudentTab) {
  return tab === "home" || tab === "notifications" || tab === "profile"
}

function getPrimaryTeacherTab(tab: TeacherTab): TeacherTab {
  return tab === "notifications" || tab === "profile" ? tab : "home"
}

function shouldShowTeacherBottomNav(tab: TeacherTab) {
  return tab === "home" || tab === "notifications" || tab === "profile"
}

function MobileHeader({
  onBack,
  right,
  subtitle,
  title,
}: {
  onBack?: () => void
  right?: React.ReactNode
  subtitle: string
  title: string
}) {
  return (
    <header className="sticky top-0 z-50 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2.5">
        {onBack && (
          <Button
            aria-label={m.mobile_back()}
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
      </div>
      {right}
    </header>
  )
}

function PresenceHeader({
  onBack,
  right,
  subtitle,
  title,
}: {
  onBack?: () => void
  right?: React.ReactNode
  subtitle: string
  title: string
}) {
  return (
    <MobileHeader
      onBack={onBack}
      right={right}
      subtitle={subtitle}
      title={title}
    />
  )
}

function MonthSwitcher({
  max,
  min,
  onChange,
  onNext,
  onPrevious,
  value,
}: {
  max?: Date | null
  min?: Date | null
  onChange: (value: Date) => void
  onNext: () => void
  onPrevious: () => void
  value: Date
}) {
  const normalizedMax = max ? startOfMonthDate(max) : null
  const normalizedMin = min ? startOfMonthDate(min) : null
  const canGoNext =
    !normalizedMax || compareMonth(addMonths(value, 1), normalizedMax) <= 0
  const canGoPrevious =
    !normalizedMin || compareMonth(addMonths(value, -1), normalizedMin) >= 0
  const selectMonth = (rawValue: string) => {
    const nextDate = parseMonthInputValue(rawValue)
    if (nextDate) {
      onChange(clampMonthDate(nextDate, normalizedMin, normalizedMax))
    }
  }

  return (
    <div className="flex shrink-0 items-center rounded-full border bg-background p-0.5 shadow-sm">
      <Button
        aria-label={m.mobile_presence_previous_month()}
        className="size-8 rounded-full"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        size="icon"
        variant="ghost"
      >
        <ChevronLeft data-icon="inline-start" />
      </Button>
      <Input
        aria-label={
          getRouteLocale() === "fr" ? "Choisir le mois" : "Choose month"
        }
        className="h-8 w-28 border-0 bg-transparent px-1 text-center text-xs font-semibold shadow-none focus-visible:ring-0"
        onChange={(event) => selectMonth(event.currentTarget.value)}
        onInput={(event) => selectMonth(event.currentTarget.value)}
        max={normalizedMax ? formatMonthInputValue(normalizedMax) : undefined}
        min={normalizedMin ? formatMonthInputValue(normalizedMin) : undefined}
        type="month"
        value={formatMonthInputValue(value)}
      />
      <Button
        aria-label={m.mobile_presence_next_month()}
        className="size-8 rounded-full"
        disabled={!canGoNext}
        onClick={onNext}
        size="icon"
        variant="ghost"
      >
        <ChevronRight data-icon="inline-start" />
      </Button>
    </div>
  )
}

function ModuleGrid({
  modules,
  title,
}: {
  modules: AppModuleLink[]
  title: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {modules.map((module) => (
          <ModuleTile key={module.label} module={module} />
        ))}
      </div>
    </div>
  )
}

function ModuleTile({ module }: { module: AppModuleLink }) {
  const illustrationSrc = `${withAppBase(module.illustration)}?v=20260528`

  return (
    <button
      className="group relative flex min-h-[132px] flex-col items-start justify-start overflow-hidden rounded-xl border bg-background p-4 text-left shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={module.onClick}
      type="button"
    >
      <span className="relative z-10 block min-w-0 pr-6">
        <span className="block truncate text-sm font-semibold">
          {module.label}
        </span>
        <span className="mt-1 line-clamp-3 block max-w-[6.5rem] text-xs leading-snug text-muted-foreground">
          {module.description}
        </span>
      </span>
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-2 bottom-2 size-16 object-contain"
        src={illustrationSrc}
      />
    </button>
  )
}

function ParentHome({
  onOpenNotifications,
  onOpenPayments,
  onOpenPresence,
  onOpenReports,
  onOpenSchedule,
  onOpenSubjects,
  onOpenEvaluations,
  profilePhotoUrl,
  profileName,
  schoolName,
  schoolId,
}: {
  onOpenNotifications: () => void
  onOpenPayments: () => void
  onOpenPresence: () => void
  onOpenReports: () => void
  onOpenSchedule: () => void
  onOpenSubjects: () => void
  onOpenEvaluations: () => void
  profilePhotoUrl: string | null
  profileName: string
  schoolName: string | null
  schoolId: string | null
}) {
  const currentDate = useCurrentDate()
  const dashboardQuery = useQuery({
    ...parentDashboardQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const userProfileQuery = useQuery({
    queryKey: ["users", "profile"],
    queryFn: fetchUserProfile,
  })
  const gradesQuery = useQuery({
    ...parentChildrenGradesQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const paymentsSummaryQuery = useQuery({
    ...parentPaymentsSummaryQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const notificationsQuery = useQuery({
    ...notificationsQueryOptions(),
    enabled: Boolean(schoolId),
  })
  const dashboard = dashboardQuery.data
  const visibleChildren = dashboard?.children ?? []
  const firstChild = visibleChildren[0] ?? null
  const headerPhotoUrl = userProfileQuery.data?.photoUrl ?? profilePhotoUrl
  const gradesByEnrollment = useMemo(() => {
    const map = new Map<string, ParentGradesChild>()
    for (const child of gradesQuery.data?.children ?? []) {
      map.set(child.enrollmentId, child)
    }
    return map
  }, [gradesQuery.data?.children])
  const upcomingEvaluationsQuery = useQuery({
    queryKey: ["parent", "upcoming-evaluations", schoolId],
    queryFn: () => fetchParentUpcomingEvaluations(schoolId ?? ""),
    enabled: Boolean(schoolId),
    staleTime: 60_000,
  })
  const paymentsByEnrollment = useMemo(() => {
    const map = new Map<string, ParentPaymentChild>()
    for (const entry of paymentsSummaryQuery.data?.children ?? []) {
      map.set(entry.child.enrollmentId, entry)
    }
    return map
  }, [paymentsSummaryQuery.data?.children])
  const scopedPaymentSummary = paymentsSummaryQuery.data ?? null
  const scopedBalance =
    scopedPaymentSummary?.totalBalance ??
    visibleChildren.reduce((sum, child) => sum + child.balance, 0)
  const hasBalance = scopedBalance > 0
  const recentActivityItems = useMemo(
    () => getRecentActivityItems(notificationsQuery.data?.data ?? []),
    [notificationsQuery.data?.data]
  )

  return (
    <div>
      <MobileHeader
        right={
          <InitialsAvatar
            initials={getInitials(profileName || "Parent")}
            src={headerPhotoUrl}
            tone="dark"
          />
        }
        subtitle={fmtDate(currentDate, "long")}
        title={
          profileName
            ? m.mobile_parent_greeting_name({ name: profileName.split(" ")[0] })
            : m.mobile_parent_greeting()
        }
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        {dashboardQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : dashboardQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            kind="error"
            onAction={() => void dashboardQuery.refetch()}
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : (
          <ParentHighlightCard
            child={firstChild}
            familyTotalBalance={scopedBalance}
            hasBalance={hasBalance}
            paymentSummary={scopedPaymentSummary}
          />
        )}

        <ModuleGrid
          modules={[
            {
              description: m.mobile_module_reports_description(),
              illustration: "/module-illustrations/grades-3d.png",
              label: m.mobile_nav_grades(),
              onClick: onOpenReports,
            },
            {
              description: m.mobile_module_presence_description(),
              illustration: "/module-illustrations/attendance-3d.png",
              label: m.mobile_presence(),
              onClick: onOpenPresence,
            },
            {
              description: m.mobile_module_schedule_description(),
              illustration: "/module-illustrations/schedule-3d.png",
              label: m.mobile_nav_courses(),
              onClick: onOpenSchedule,
            },
            {
              description: m.mobile_module_payments_description(),
              illustration: "/module-illustrations/fees-3d.png",
              label: m.mobile_nav_payments(),
              onClick: onOpenPayments,
            },
            {
              description: m.mobile_module_subjects_description(),
              illustration: "/module-illustrations/subjects-3d.png",
              label: m.mobile_nav_subjects(),
              onClick: onOpenSubjects,
            },
            {
              description: m.mobile_module_evaluations_description(),
              illustration: "/module-illustrations/evaluations-3d.png",
              label: m.mobile_reports_evaluations(),
              onClick: onOpenEvaluations,
            },
          ]}
          title={m.mobile_home_modules_title()}
        />

        <UpcomingEvaluationsPreview
          evaluations={upcomingEvaluationsQuery.data ?? NO_UPCOMING_EVALUATIONS}
          isError={upcomingEvaluationsQuery.isError}
          onRetry={() => void upcomingEvaluationsQuery.refetch()}
        />

        <SectionTitle>{m.mobile_parent_children()}</SectionTitle>
        {dashboard?.children.length ? (
          <div className="flex flex-col gap-3">
            {visibleChildren.map((child) => (
              <ChildCard
                child={child}
                gradesChild={gradesByEnrollment.get(child.enrollmentId) ?? null}
                key={child.enrollmentId}
                paymentChild={
                  paymentsByEnrollment.get(child.enrollmentId) ?? null
                }
                schoolName={schoolName}
              />
            ))}
          </div>
        ) : (
          !dashboardQuery.isLoading &&
          !dashboardQuery.isError && (
            <DashboardState
              kind="empty"
              title={m.mobile_parent_no_child_title()}
              description={m.mobile_parent_no_child_description()}
            />
          )
        )}

        <RecentActivitySection
          items={recentActivityItems}
          onOpenGrades={onOpenReports}
          onOpenNotifications={onOpenNotifications}
          onOpenPayments={onOpenPayments}
          onOpenPresence={onOpenPresence}
        />
      </div>
    </div>
  )
}

function StudentHome({
  academicYearContext,
  dashboard,
  isError,
  isLoading,
  onOpenNotifications,
  onOpenPayments,
  onOpenPresence,
  onOpenReports,
  onOpenSchedule,
  onOpenSubjects,
  onOpenEvaluations,
  onRetry,
  profilePhotoUrl,
  profileName,
  schoolId,
  schoolName,
}: {
  academicYearContext: AcademicYearContextValue
  dashboard: StudentDashboard | undefined
  isError: boolean
  isLoading: boolean
  onOpenNotifications: () => void
  onOpenPayments: () => void
  onOpenPresence: () => void
  onOpenReports: () => void
  onOpenSchedule: () => void
  onOpenSubjects: () => void
  onOpenEvaluations: () => void
  onRetry: () => void
  profilePhotoUrl: string | null
  profileName: string
  schoolId: string | null
  schoolName: string | null
}) {
  const info = dashboard?.info
  const displayName = info ? getStudentDashboardName(info) : profileName
  const firstName = displayName ? getFirstName(displayName) : ""
  const notificationsQuery = useQuery({
    ...notificationsQueryOptions(),
    enabled: Boolean(schoolId),
  })
  const paymentsSummaryQuery = useQuery({
    ...studentPaymentsSummaryQueryOptions(
      schoolId ?? "",
      dashboard,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId && dashboard),
  })
  const upcomingEvaluationsQuery = useQuery({
    queryKey: [
      "student",
      "upcoming-evaluations",
      schoolId,
      academicYearContext.selectedYearId ?? "current",
    ],
    queryFn: () =>
      fetchStudentUpcomingEvaluations(
        schoolId ?? "",
        academicYearContext.selectedYearId ?? undefined
      ),
    enabled: Boolean(schoolId),
    staleTime: 60_000,
  })
  const recentActivityItems = useMemo(
    () => getRecentActivityItems(notificationsQuery.data?.data ?? []),
    [notificationsQuery.data?.data]
  )
  const paymentSummary = paymentsSummaryQuery.data ?? null

  return (
    <div>
      <MobileHeader
        right={
          <InitialsAvatar
            initials={getInitials(displayName || "Eleve")}
            src={info?.photoUrl ?? profilePhotoUrl}
            tone="student"
          />
        }
        subtitle={schoolName ?? m.mobile_student_space()}
        title={
          firstName
            ? m.mobile_student_greeting_name({ name: firstName })
            : m.mobile_student_greeting()
        }
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        {isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : isError || !dashboard ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            kind="error"
            onAction={onRetry}
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : (
          <>
            <StudentHighlightCard
              dashboard={dashboard}
              paymentSummary={paymentSummary}
            />

            <StudentAttendanceCapsule presence={dashboard.presence} />

            <ModuleGrid
              modules={[
                {
                  description: m.mobile_module_reports_description(),
                  illustration: "/module-illustrations/grades-3d.png",
                  label: m.mobile_nav_grades(),
                  onClick: onOpenReports,
                },
                {
                  description: m.mobile_module_schedule_description(),
                  illustration: "/module-illustrations/schedule-3d.png",
                  label: m.mobile_nav_courses(),
                  onClick: onOpenSchedule,
                },
                {
                  description: m.mobile_module_presence_student_description(),
                  illustration: "/module-illustrations/attendance-3d.png",
                  label: m.mobile_presence(),
                  onClick: onOpenPresence,
                },
                {
                  description: m.mobile_module_payments_student_description(),
                  illustration: "/module-illustrations/fees-3d.png",
                  label: m.mobile_nav_payments(),
                  onClick: onOpenPayments,
                },
                {
                  description: m.mobile_module_subjects_description(),
                  illustration: "/module-illustrations/subjects-3d.png",
                  label: m.mobile_nav_subjects(),
                  onClick: onOpenSubjects,
                },
                {
                  description: m.mobile_module_evaluations_description(),
                  illustration: "/module-illustrations/evaluations-3d.png",
                  label: m.mobile_reports_evaluations(),
                  onClick: onOpenEvaluations,
                },
              ]}
              title={m.mobile_home_modules_title()}
            />

            <UpcomingEvaluationsPreview
              evaluations={
                upcomingEvaluationsQuery.data ?? NO_UPCOMING_EVALUATIONS
              }
              isError={upcomingEvaluationsQuery.isError}
              onRetry={() => void upcomingEvaluationsQuery.refetch()}
            />

            <RecentActivitySection
              items={recentActivityItems}
              onOpenGrades={onOpenReports}
              onOpenNotifications={onOpenNotifications}
              onOpenPayments={onOpenPayments}
              onOpenPresence={onOpenPresence}
            />
          </>
        )}
      </div>
    </div>
  )
}

function StudentReports({
  academicYearContext,
  dashboard,
  isError,
  isLoading,
  onBack,
  onOpenPayments,
  schoolId,
  schoolName,
}: {
  academicYearContext: AcademicYearContextValue
  dashboard: StudentDashboard | undefined
  isError: boolean
  isLoading: boolean
  onBack: () => void
  onOpenPayments: () => void
  schoolId: string | null
  schoolName: string | null
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  )
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const reportCardsQuery = useQuery({
    ...studentReportCardsQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const reportCards = useMemo(
    () =>
      (reportCardsQuery.data ?? []).filter((reportCard) =>
        academicYearContext.selectedYearId
          ? reportCard.schoolYearId === academicYearContext.selectedYearId
          : true
      ),
    [academicYearContext.selectedYearId, reportCardsQuery.data]
  )
  const defaultYearPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const activeReportCard = useMemo(
    () =>
      selectedPeriodId
        ? (reportCards.find(
            (reportCard) =>
              reportCard.kind === "PERIOD" &&
              reportCard.periodId === selectedPeriodId
          ) ?? null)
        : getLatestPeriodReportCard(reportCards),
    [reportCards, selectedPeriodId]
  )
  const gradesQuery = useQuery({
    ...studentChildrenGradesQueryOptions(
      schoolId ?? "",
      selectedPeriodId ??
        defaultYearPeriod?.id ??
        activeReportCard?.periodId ??
        undefined,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const activePeriod = gradesQuery.data?.period ?? null
  const activePeriodId =
    selectedPeriodId ??
    defaultYearPeriod?.id ??
    activeReportCard?.periodId ??
    activePeriod?.id ??
    null
  const activePeriodLabel = activeReportCard
    ? formatReportPeriodShort(activeReportCard)
    : formatAcademicPeriodShort(activePeriod)
  const periodOptions = useMemo(() => {
    const yearOptions = getAcademicYearPeriodOptions(
      academicYearContext.selectedYear
    )

    return yearOptions.length
      ? yearOptions
      : getReportPeriodOptions(reportCards, activePeriod)
  }, [academicYearContext.selectedYear, activePeriod, reportCards])
  const selectedGradesChild = gradesQuery.data?.children[0] ?? null
  const dashboardChild = dashboardToReportChild(dashboard)
  const selectedChild = selectedGradesChild ?? dashboardChild
  const academicAccessBlockState =
    getCanonicalAcademicAccessState(dashboardChild)
  const academicAccessBlocked = academicAccessBlockState.blocked
  const subjects = useMemo(
    () => selectedGradesChild?.subjectAverages ?? [],
    [selectedGradesChild?.subjectAverages]
  )

  useEffect(() => {
    setSelectedSubjectId(null)
  }, [activePeriodId])

  useEffect(() => {
    setSelectedPeriodId(defaultYearPeriod?.id ?? null)
    setSelectedSubjectId(null)
  }, [defaultYearPeriod?.id])

  const subjectDetailQueries = useQueries({
    queries: subjects.map((subject) => ({
      ...studentSubjectGradesQueryOptions(
        schoolId ?? "",
        subject.subjectLevelId,
        activePeriodId ?? ""
      ),
      enabled: Boolean(schoolId && activePeriodId),
    })),
  })
  const subjectDetailsById = useMemo(() => {
    const details = new Map<string, ParentChildSubjectGrades>()

    subjects.forEach((subject, index) => {
      const detail = subjectDetailQueries[index]?.data
      if (detail) {
        details.set(subject.subjectLevelId, detail)
      }
    })

    return details
  }, [subjectDetailQueries, subjects])
  const selectedSubject =
    subjects.find((subject) => subject.subjectLevelId === selectedSubjectId) ??
    null
  const selectedSubjectDetail = selectedSubject
    ? (subjectDetailsById.get(selectedSubject.subjectLevelId) ?? null)
    : null
  const selectedGradingScale = getReportsChildGradingScale(selectedGradesChild)

  if (selectedSubject && selectedChild) {
    return (
      <ParentSubjectDetail
        childName={formatReportsChildName(selectedChild)}
        detail={selectedSubjectDetail}
        gradingScale={
          selectedSubjectDetail?.gradingScale ?? selectedGradingScale
        }
        isLoading={subjectDetailQueries.some((query) => query.isLoading)}
        paymentBlockReason={academicAccessBlockState.reason}
        onBack={() => setSelectedSubjectId(null)}
        periodLabel={activePeriodLabel}
        subjectEyebrow={activePeriodLabel}
        subject={selectedSubject}
      />
    )
  }

  const reportsLoading =
    isLoading ||
    reportCardsQuery.isLoading ||
    gradesQuery.isLoading ||
    academicYearContext.isLoading
  const reportsError =
    isError ||
    reportCardsQuery.isError ||
    gradesQuery.isError ||
    academicYearContext.isError

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_reports_eyebrow()}
        title={m.mobile_reports_results_title()}
      />
      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        <PeriodContextSelector
          onSelect={setSelectedPeriodId}
          options={periodOptions}
          selectedId={activePeriodId}
        />
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : reportsLoading ? (
          <ParentReportsSkeleton />
        ) : reportsError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            kind="error"
            onAction={() => {
              void Promise.all([
                reportCardsQuery.refetch(),
                gradesQuery.refetch(),
              ])
            }}
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : !selectedChild ? (
          <DashboardState
            description={m.mobile_reports_no_subject_description()}
            kind="empty"
            title={m.mobile_reports_no_subject_title()}
          />
        ) : (
          <>
            <ParentReportSummaryCard
              child={selectedChild}
              isPaymentBlocked={academicAccessBlocked}
              showIdentity={false}
              schoolName={schoolName}
            />

            {academicAccessBlocked &&
            academicAccessBlockState.reason === "card" ? (
              <AcademicAccessBlockedCard
                blockState={academicAccessBlockState}
                onOpenPayments={onOpenPayments}
                periodLabel={activePeriodLabel}
              />
            ) : (
              <ParentReportCardStatus reportCard={activeReportCard} />
            )}

            <div className="flex flex-col gap-2">
              <SectionTitle>
                {m.mobile_reports_subjects_title({
                  period: activePeriodLabel,
                })}
              </SectionTitle>

              {subjects.length > 0 ? (
                <Card className="gap-0 p-0">
                  {subjects.map((subject, index) => {
                    const subjectColor = getSubjectColor(
                      subject.subjectCode || subject.subjectName,
                      subject.subjectColor
                    )

                    return (
                      <div key={subject.subjectLevelId}>
                        <button
                          className="flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          onClick={() =>
                            setSelectedSubjectId(subject.subjectLevelId)
                          }
                          type="button"
                        >
                          <span
                            aria-hidden
                            className="h-9 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: subjectColor.border }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {subject.subjectName}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {m.mobile_reports_subject_meta({
                                coefficient: subject.coefficient,
                              })}
                            </div>
                          </div>
                          <ReportGradeBadge
                            gradingScale={selectedGradingScale}
                            value={
                              academicAccessBlocked ? null : subject.average
                            }
                          />
                        </button>
                        {index < subjects.length - 1 && <Separator />}
                      </div>
                    )
                  })}
                </Card>
              ) : (
                <DashboardState
                  description={
                    activePeriodId
                      ? m.mobile_reports_no_subject_description()
                      : m.mobile_reports_no_period_description()
                  }
                  kind="empty"
                  title={
                    activePeriodId
                      ? m.mobile_reports_no_subject_title()
                      : m.mobile_reports_no_period_title()
                  }
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StudentSchedule({
  academicYearContext,
  dashboard,
  isError,
  isLoading,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  dashboard: StudentDashboard | undefined
  isError: boolean
  isLoading: boolean
  onBack: () => void
  schoolId: string | null
  schoolName: string | null
}) {
  const [selectedDay, setSelectedDay] = useState<StudentScheduleDay>(
    () => toApiDayOfWeek(new Date()) as StudentScheduleDay
  )
  const scheduleQuery = useQuery({
    ...studentScheduleQueryOptions(
      schoolId ?? "",
      dashboard?.info.classGroupId
    ),
    enabled: Boolean(schoolId && dashboard?.info.classGroupId),
  })
  const schedule = scheduleQuery.data
  const slotsByDay = useMemo(
    () => groupScheduleSlotsByDay(schedule?.slots ?? []),
    [schedule?.slots]
  )
  const selectedDaySlots = slotsByDay.get(selectedDay) ?? []

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_schedule_eyebrow()}
        title={formatScheduleDayShort(selectedDay)}
      />

      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : isLoading ||
          scheduleQuery.isLoading ||
          academicYearContext.isLoading ? (
          <ScheduleSkeleton />
        ) : isError ||
          scheduleQuery.isError ||
          academicYearContext.isError ||
          !dashboard ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            onAction={() => void scheduleQuery.refetch()}
            title={m.mobile_dashboard_error_title()}
          />
        ) : !schedule?.slots.length ? (
          <DashboardState
            description={m.mobile_schedule_empty_description()}
            kind="empty"
            title={m.mobile_schedule_empty_title()}
          />
        ) : (
          <ScheduleDayView
            onSelectDay={setSelectedDay}
            selectedDay={selectedDay}
            slots={selectedDaySlots}
            slotsByDay={slotsByDay}
          />
        )}
      </div>
    </div>
  )
}

function ParentSchedule({
  academicYearContext,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  schoolId: string | null
  schoolName: string | null
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<StudentScheduleDay>(
    () => toApiDayOfWeek(new Date()) as StudentScheduleDay
  )
  const dashboardQuery = useQuery({
    ...parentDashboardQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const defaultYearPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const gradesQuery = useQuery({
    ...parentChildrenGradesQueryOptions(
      schoolId ?? "",
      defaultYearPeriod?.id,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const dashboardChildren = useMemo(
    () => dashboardQuery.data?.children ?? [],
    [dashboardQuery.data?.children]
  )
  const children = useMemo(
    () =>
      gradesQuery.data?.children.map((child) =>
        mapGradesChildToSummary(child, dashboardChildren)
      ) ?? dashboardChildren,
    [dashboardChildren, gradesQuery.data?.children]
  )

  useEffect(() => {
    if (
      children[0] &&
      (!selectedChildId ||
        !children.some((child) => child.enrollmentId === selectedChildId))
    ) {
      setSelectedChildId(children[0].enrollmentId)
    }
  }, [children, selectedChildId])

  const selectedDashboardChild =
    children.find((child) => child.enrollmentId === selectedChildId) ??
    children[0] ??
    null
  const selectedGradesChild =
    gradesQuery.data?.children.find(
      (child) => child.enrollmentId === selectedDashboardChild?.enrollmentId
    ) ?? null
  const academicAccessBlocked = getCanonicalAcademicAccessState(
    selectedDashboardChild
  ).blocked
  const scheduleQuery = useQuery({
    ...studentScheduleQueryOptions(
      schoolId ?? "",
      selectedGradesChild?.classGroup.id,
      selectedDashboardChild?.enrollmentId
    ),
    enabled: Boolean(
      schoolId && selectedGradesChild?.classGroup.id && !academicAccessBlocked
    ),
  })
  const schedule = scheduleQuery.data
  const slotsByDay = useMemo(
    () => groupScheduleSlotsByDay(schedule?.slots ?? []),
    [schedule?.slots]
  )
  const selectedDaySlots = slotsByDay.get(selectedDay) ?? []
  const isLoading =
    dashboardQuery.isLoading ||
    gradesQuery.isLoading ||
    scheduleQuery.isLoading ||
    academicYearContext.isLoading
  const isError =
    dashboardQuery.isError ||
    gradesQuery.isError ||
    scheduleQuery.isError ||
    academicYearContext.isError

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_schedule_eyebrow()}
        title={formatScheduleDayShort(selectedDay)}
      />

      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <ChildrenScopeSelector
          children={children}
          idType="enrollment"
          mode="single"
          onSelectionChange={(ids) => setSelectedChildId(ids[0] ?? null)}
          selectedIds={
            selectedDashboardChild ? [selectedDashboardChild.enrollmentId] : []
          }
        />
        <AcademicYearContextSelector context={academicYearContext} />

        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : isLoading ? (
          <ScheduleSkeleton />
        ) : isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            onAction={() => {
              void Promise.all([
                dashboardQuery.refetch(),
                gradesQuery.refetch(),
                scheduleQuery.refetch(),
              ])
            }}
            title={m.mobile_dashboard_error_title()}
          />
        ) : !selectedGradesChild ? (
          <DashboardState
            description={m.mobile_schedule_empty_description()}
            kind="empty"
            title={m.mobile_schedule_empty_title()}
          />
        ) : !schedule?.slots.length ? (
          <DashboardState
            description={m.mobile_schedule_empty_description()}
            kind="empty"
            title={m.mobile_schedule_empty_title()}
          />
        ) : (
          <ScheduleDayView
            onSelectDay={setSelectedDay}
            selectedDay={selectedDay}
            slots={selectedDaySlots}
            slotsByDay={slotsByDay}
          />
        )}
      </div>
    </div>
  )
}

type ChildrenScopeSelectorMode = "multiple" | "single"
type ContextPeriodOption = {
  id: string
  label: string
  meta: string | null
}

function AcademicYearContextSelector({
  context,
}: {
  context: AcademicYearContextValue
}) {
  const [open, setOpen] = useState(false)
  const selectedYear = context.selectedYear

  if (!context.years.length && !selectedYear) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        className="h-12 w-full justify-between rounded-lg px-3 py-2"
        disabled={context.isLoading || context.isError}
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <span className="min-w-0 text-left">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">
            {getRouteLocale() === "fr" ? "Annee academique" : "Academic year"}
          </span>
          <span className="block truncate text-sm font-semibold">
            {selectedYear?.label ??
              (context.isLoading
                ? m.mobile_dashboard_loading()
                : getRouteLocale() === "fr"
                  ? "Aucune annee"
                  : "No year")}
          </span>
        </span>
        <ChevronDown data-icon="inline-end" />
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {getRouteLocale() === "fr" ? "Annee academique" : "Academic year"}
          </DrawerTitle>
          <DrawerDescription>
            {getRouteLocale() === "fr"
              ? "Choisissez l'annee utilisee pour cette page."
              : "Choose the year used for this page."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          <div className="flex flex-col gap-2">
            {context.years.map((year) => {
              const selected = year.id === selectedYear?.id

              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected
                      ? "border-brand-dark bg-brand-soft text-brand-dark"
                      : "bg-background"
                  )}
                  key={year.id}
                  onClick={() => {
                    context.setSelectedYearId(year.id)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {year.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatSchoolYearRange(year)}
                    </span>
                  </span>
                  {selected ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{m.mobile_close()}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ChildrenScopeSelector({
  children,
  idType,
  mode,
  onSelectionChange,
  selectedIds,
}: {
  children: ParentChildSummary[]
  idType: "enrollment" | "identity"
  mode: ChildrenScopeSelectorMode
  onSelectionChange: (ids: string[]) => void
  selectedIds: string[]
}) {
  const [open, setOpen] = useState(false)
  const isMultiple = mode === "multiple"
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const effectiveSelectedIds =
    isMultiple && selectedIds.length === 0
      ? children.map((child) => getChildScopeId(child, idType))
      : selectedIds
  const effectiveSelectedSet = useMemo(
    () => new Set(effectiveSelectedIds),
    [effectiveSelectedIds]
  )
  const visibleChildren = children.slice(0, 5)

  if (!children.length) return null

  const toggleChild = (child: ParentChildSummary) => {
    const id = getChildScopeId(child, idType)

    if (!isMultiple) {
      onSelectionChange([id])
      setOpen(false)
      return
    }

    const currentIds =
      selectedIds.length === 0
        ? children.map((item) => getChildScopeId(item, idType))
        : selectedIds
    const nextIds = currentIds.includes(id)
      ? currentIds.filter((item) => item !== id)
      : [...currentIds, id]

    onSelectionChange(
      nextIds.length === children.length || nextIds.length === 0 ? [] : nextIds
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <div className="flex max-w-full [scrollbar-width:none] items-start gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {visibleChildren.map((child) => {
          const id = getChildScopeId(child, idType)
          const selected = effectiveSelectedSet.has(id)

          return (
            <button
              aria-pressed={selected}
              className="group flex shrink-0 flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              key={id}
              onClick={() => toggleChild(child)}
              type="button"
            >
              <span className="relative">
                <PersonAvatar
                  className={cn(
                    "size-12 border-2 transition-opacity",
                    selected
                      ? "border-brand text-foreground"
                      : "border-transparent opacity-45 grayscale"
                  )}
                  name={formatStudentName(child)}
                  src={child.photoUrl}
                />
                {!selected ? (
                  <span className="absolute -right-1 bottom-0 grid size-5 place-items-center rounded-full bg-foreground text-background shadow-sm">
                    <Plus className="size-3" />
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "max-w-16 truncate text-xs font-semibold",
                  selected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {child.firstName}
              </span>
            </button>
          )
        })}
        <button
          className="flex shrink-0 flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="grid size-12 place-items-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground">
            <Plus className="size-5" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {getRouteLocale() === "fr" ? "Plus" : "More"}
          </span>
        </button>
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {getRouteLocale() === "fr"
              ? "Enfants affiches"
              : "Displayed children"}
          </DrawerTitle>
          <DrawerDescription>
            {isMultiple
              ? getRouteLocale() === "fr"
                ? "Choisissez un ou plusieurs enfants pour cette vue."
                : "Choose one or more children for this view."
              : getRouteLocale() === "fr"
                ? "Cette page affiche un enfant a la fois."
                : "This page shows one child at a time."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          <div className="flex flex-col gap-2">
            {isMultiple ? (
              <button
                aria-pressed={selectedIds.length === 0}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  selectedIds.length === 0
                    ? "border-brand-dark bg-brand-soft text-brand-dark"
                    : "bg-background"
                )}
                onClick={() => onSelectionChange([])}
                type="button"
              >
                <span className="font-semibold">
                  {getRouteLocale() === "fr"
                    ? "Tous les enfants"
                    : "All children"}
                </span>
                {selectedIds.length === 0 ? (
                  <CheckCircle2 className="size-4" />
                ) : null}
              </button>
            ) : null}
            {children.map((child) => {
              const id = getChildScopeId(child, idType)
              const selected =
                isMultiple && selectedIds.length === 0
                  ? true
                  : selectedSet.has(id)

              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected
                      ? "border-brand-dark bg-brand-soft text-brand-dark"
                      : "bg-background"
                  )}
                  key={id}
                  onClick={() => toggleChild(child)}
                  type="button"
                >
                  <PersonAvatar
                    className="size-9"
                    name={formatStudentName(child)}
                    src={child.photoUrl}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {formatStudentName(child)}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {child.classGroupCode}
                    </span>
                  </span>
                  {selected ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>{m.mobile_close()}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function PeriodContextSelector({
  description,
  label,
  onSelect,
  options,
  selectedId,
  title,
}: {
  description?: string
  label?: string
  onSelect: (id: string | null) => void
  options: ContextPeriodOption[]
  selectedId: string | null
  title?: string
}) {
  const [open, setOpen] = useState(false)
  const selectedOption =
    options.find((option) => option.id === selectedId) ?? options[0] ?? null

  if (!selectedOption) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        className="h-12 w-full justify-between rounded-lg px-3 py-2"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <span className="min-w-0 text-left">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">
            {label ?? (getRouteLocale() === "fr" ? "Periode" : "Period")}
          </span>
          <span className="block truncate text-sm font-semibold">
            {selectedOption.label}
          </span>
        </span>
        <ChevronDown data-icon="inline-end" />
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {title ??
              (getRouteLocale() === "fr"
                ? "Periode academique"
                : "Academic period")}
          </DrawerTitle>
          <DrawerDescription>
            {description ??
              (getRouteLocale() === "fr"
                ? "Changez la periode utilisee pour les notes et bulletins."
                : "Change the period used for grades and report cards.")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const selected = option.id === selectedOption.id

              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected
                      ? "border-brand-dark bg-brand-soft text-brand-dark"
                      : "bg-background"
                  )}
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {option.label}
                    </span>
                    {option.meta ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.meta}
                      </span>
                    ) : null}
                  </span>
                  {selected ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{m.mobile_close()}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

type TeacherClassFilterOption = {
  id: string
  label: string
  meta?: string | null
}

function TeacherClassContextSelector({
  onSelect,
  options,
  selectedId,
}: {
  onSelect: (id: string) => void
  options: TeacherClassFilterOption[]
  selectedId: string
}) {
  const [open, setOpen] = useState(false)
  const selectedOption =
    options.find((option) => option.id === selectedId) ?? options[0] ?? null

  if (!selectedOption) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        className="h-12 w-full justify-between rounded-lg px-3 py-2"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <span className="min-w-0 text-left">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase">
            {teacherCopy("Classe", "Class")}
          </span>
          <span className="block truncate text-sm font-semibold">
            {selectedOption.label}
          </span>
        </span>
        <ChevronDown data-icon="inline-end" />
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{teacherCopy("Classe", "Class")}</DrawerTitle>
          <DrawerDescription>
            {teacherCopy(
              "Choisissez la classe utilisee pour cette page.",
              "Choose the class used for this page."
            )}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const selected = option.id === selectedOption.id

              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected
                      ? "border-brand-dark bg-brand-soft text-brand-dark"
                      : "bg-background"
                  )}
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {option.label}
                    </span>
                    {option.meta ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.meta}
                      </span>
                    ) : null}
                  </span>
                  {selected ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{m.mobile_close()}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function FloatingControls({
  align = "end",
  children,
  hideOnScroll = true,
}: {
  align?: "center" | "end"
  children: React.ReactNode
  hideOnScroll?: boolean
}) {
  return (
    <MobileFloatingBar
      align="stretch"
      className={cn(align === "center" ? "justify-center" : "justify-end")}
      hideOnScroll={hideOnScroll}
      variant="plain"
    >
      {children}
    </MobileFloatingBar>
  )
}

function ScheduleDayView({
  onSelectDay,
  selectedDay,
  slots,
  slotsByDay,
}: {
  onSelectDay: (day: StudentScheduleDay) => void
  selectedDay: StudentScheduleDay
  slots: StudentScheduleSlot[]
  slotsByDay: Map<StudentScheduleDay, StudentScheduleSlot[]>
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
        {scheduleDays.map((day) => {
          const selected = day === selectedDay
          const count = slotsByDay.get(day)?.length ?? 0

          return (
            <button
              aria-pressed={selected}
              className={cn(
                "flex min-w-16 shrink-0 flex-col items-center gap-1 rounded-xl border bg-background px-3 py-2 text-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                selected
                  ? "border-brand-dark bg-brand-soft text-brand-dark"
                  : "text-muted-foreground"
              )}
              key={day}
              onClick={() => onSelectDay(day)}
              type="button"
            >
              <span className="text-[10px] font-semibold uppercase">
                {formatScheduleDayShort(day)}
              </span>
              <span className="font-mono text-sm font-bold">{count}</span>
            </button>
          )
        })}
      </div>
      <StudentDaySchedule slots={slots} />
    </div>
  )
}

function StudentDaySchedule({ slots }: { slots: StudentScheduleSlot[] }) {
  return (
    <div className="flex flex-col gap-3">
      {slots.length ? (
        <Card className="gap-0 p-0">
          {slots.map((slot, index) => (
            <div key={slot.id}>
              <StudentScheduleDetailedRow slot={slot} />
              {index < slots.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
      ) : (
        <DashboardState
          description={m.mobile_schedule_day_empty_description()}
          kind="empty"
          title={m.mobile_schedule_day_empty_title()}
        />
      )}
    </div>
  )
}

function StudentScheduleDetailedRow({ slot }: { slot: StudentScheduleSlot }) {
  const subjectColor = getSubjectColor(
    slot.subjectLevel.subject.code || slot.subjectLevel.subject.name
  )
  const teacherName = formatScheduleTeacher(slot)
  const duration = formatScheduleSlotDuration(slot.startTime, slot.endTime)

  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 p-4">
      <div className="flex flex-col items-center justify-center border-r pr-3 text-center">
        <div className="font-mono text-sm font-bold">{slot.startTime}</div>
        <div className="mt-1 font-mono text-xs text-muted-foreground">
          {slot.endTime}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
            style={{ backgroundColor: subjectColor.border }}
          />
          {slot.subjectLevel.subject.name}
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <PersonAvatar
            className="size-8"
            name={teacherName}
            size="sm"
            src={null}
            tone="staff"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted-foreground">
              {teacherName}
              {slot.classGroup.code ? ` - ${slot.classGroup.code}` : ""}
            </div>
            <div className="text-xs text-muted-foreground">{duration}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
      <Card className="gap-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-4/5" />
      </Card>
    </div>
  )
}

function ParentSubjects({
  academicYearContext,
  onBack,
  schoolId,
  schoolName,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  schoolId: string | null
  schoolName: string | null
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const dashboardQuery = useQuery({
    ...parentDashboardQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const defaultYearPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const gradesQuery = useQuery({
    ...parentChildrenGradesQueryOptions(
      schoolId ?? "",
      defaultYearPeriod?.id,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const dashboardChildren = useMemo(
    () => dashboardQuery.data?.children ?? [],
    [dashboardQuery.data?.children]
  )
  const children = useMemo(
    () =>
      gradesQuery.data?.children.map((child) =>
        mapGradesChildToSummary(child, dashboardChildren)
      ) ?? dashboardChildren,
    [dashboardChildren, gradesQuery.data?.children]
  )

  useEffect(() => {
    if (
      children[0] &&
      (!selectedChildId ||
        !children.some((child) => child.enrollmentId === selectedChildId))
    ) {
      setSelectedChildId(children[0].enrollmentId)
    }
  }, [children, selectedChildId])

  const selectedDashboardChild =
    children.find((child) => child.enrollmentId === selectedChildId) ??
    children[0] ??
    null
  const selectedGradesChild =
    gradesQuery.data?.children.find(
      (child) => child.enrollmentId === selectedDashboardChild?.enrollmentId
    ) ?? null
  const academicAccessBlocked = getCanonicalAcademicAccessState(
    selectedDashboardChild
  ).blocked
  const scheduleQuery = useQuery({
    ...studentScheduleQueryOptions(
      schoolId ?? "",
      selectedGradesChild?.classGroup.id,
      selectedDashboardChild?.enrollmentId
    ),
    enabled: Boolean(
      schoolId && selectedGradesChild?.classGroup.id && !academicAccessBlocked
    ),
  })
  const subjects = selectedGradesChild?.subjectAverages ?? []
  const teachers = useMemo(
    () => getSubjectTeachersFromSchedule(scheduleQuery.data?.slots ?? []),
    [scheduleQuery.data?.slots]
  )
  const isLoading =
    dashboardQuery.isLoading ||
    gradesQuery.isLoading ||
    academicYearContext.isLoading
  const isError =
    dashboardQuery.isError || gradesQuery.isError || academicYearContext.isError

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={
          selectedGradesChild
            ? [
                selectedGradesChild.classGroup.code,
                schoolName ?? selectedGradesChild.classGroup.name,
              ]
                .filter(Boolean)
                .join(" - ")
            : m.mobile_subjects_eyebrow()
        }
        title={m.mobile_subjects_title()}
      />

      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <ChildrenScopeSelector
          children={children}
          idType="enrollment"
          mode="single"
          onSelectionChange={(ids) => setSelectedChildId(ids[0] ?? null)}
          selectedIds={
            selectedDashboardChild ? [selectedDashboardChild.enrollmentId] : []
          }
        />
        <AcademicYearContextSelector context={academicYearContext} />

        <Tabs defaultValue="subjects">
          <TabsList className="grid w-full grid-cols-2 rounded-full border bg-background p-1 shadow-sm">
            <TabsTrigger
              className="rounded-full data-active:bg-brand-dark data-active:text-white"
              value="subjects"
            >
              {m.mobile_subjects_tab_subjects()}
            </TabsTrigger>
            <TabsTrigger
              className="rounded-full data-active:bg-brand-dark data-active:text-white"
              value="teachers"
            >
              {m.mobile_subjects_tab_teachers()}
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4" value="subjects">
            {!schoolId ? (
              <DashboardState
                description={m.auth_profile_without_school()}
                kind="empty"
                title={m.mobile_dashboard_error_title()}
              />
            ) : isLoading ? (
              <SubjectsSkeleton />
            ) : isError ? (
              <DashboardState
                actionLabel={m.auth_retry()}
                description={m.mobile_dashboard_error_description()}
                kind="error"
                onAction={() => {
                  void Promise.all([
                    dashboardQuery.refetch(),
                    gradesQuery.refetch(),
                  ])
                }}
                title={m.mobile_dashboard_error_title()}
              />
            ) : !subjects.length ? (
              <DashboardState
                description={m.mobile_subjects_empty_description()}
                kind="empty"
                title={m.mobile_subjects_empty_title()}
              />
            ) : (
              <Card className="gap-0 p-0">
                {subjects.map((subject, index) => (
                  <div key={subject.subjectLevelId}>
                    <SubjectSummaryRow subject={subject} />
                    {index < subjects.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            )}
          </TabsContent>
          <TabsContent className="mt-4" value="teachers">
            {scheduleQuery.isLoading ? (
              <SubjectsSkeleton />
            ) : scheduleQuery.isError ? (
              <DashboardState
                actionLabel={m.auth_retry()}
                description={m.mobile_dashboard_error_description()}
                kind="error"
                onAction={() => void scheduleQuery.refetch()}
                title={m.mobile_dashboard_error_title()}
              />
            ) : teachers.length ? (
              <Card className="gap-0 p-0">
                {teachers.map((teacher, index) => (
                  <div
                    key={`${teacher.staffAssignmentId}-${teacher.subjectCode}`}
                  >
                    <SubjectTeacherRow teacher={teacher} />
                    {index < teachers.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                description={m.mobile_subjects_teachers_empty_description()}
                kind="empty"
                title={m.mobile_subjects_teachers_empty_title()}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StudentSubjects({
  academicYearContext,
  dashboard,
  isError,
  isLoading,
  onBack,
  schoolId,
  schoolName,
}: {
  academicYearContext: AcademicYearContextValue
  dashboard: StudentDashboard | undefined
  isError: boolean
  isLoading: boolean
  onBack: () => void
  schoolId: string | null
  schoolName: string | null
}) {
  const defaultYearPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const gradesQuery = useQuery({
    ...studentChildrenGradesQueryOptions(
      schoolId ?? "",
      defaultYearPeriod?.id,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const selectedGradesChild = gradesQuery.data?.children[0] ?? null
  const scheduleQuery = useQuery({
    ...studentScheduleQueryOptions(
      schoolId ?? "",
      selectedGradesChild?.classGroup.id ?? dashboard?.info.classGroupId
    ),
    enabled: Boolean(
      schoolId &&
      (selectedGradesChild?.classGroup.id ?? dashboard?.info.classGroupId)
    ),
  })
  const subjects = selectedGradesChild?.subjectAverages ?? []
  const teachers = useMemo(
    () => getSubjectTeachersFromSchedule(scheduleQuery.data?.slots ?? []),
    [scheduleQuery.data?.slots]
  )
  const headerSubtitle = selectedGradesChild
    ? [
        selectedGradesChild.classGroup.code,
        schoolName ?? selectedGradesChild.classGroup.name,
      ]
        .filter(Boolean)
        .join(" - ")
    : dashboard
      ? [
          dashboard.info.classGroupCode,
          schoolName ?? dashboard.info.classGroupName,
        ]
          .filter(Boolean)
          .join(" - ")
      : m.mobile_subjects_eyebrow()
  const loading =
    isLoading || gradesQuery.isLoading || academicYearContext.isLoading
  const error = isError || gradesQuery.isError || academicYearContext.isError

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={headerSubtitle}
        title={m.mobile_subjects_title()}
      />

      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />

        <Tabs defaultValue="subjects">
          <TabsList className="grid w-full grid-cols-2 rounded-full border bg-background p-1 shadow-sm">
            <TabsTrigger
              className="rounded-full data-active:bg-brand-dark data-active:text-white"
              value="subjects"
            >
              {m.mobile_subjects_tab_subjects()}
            </TabsTrigger>
            <TabsTrigger
              className="rounded-full data-active:bg-brand-dark data-active:text-white"
              value="teachers"
            >
              {m.mobile_subjects_tab_teachers()}
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4" value="subjects">
            {!schoolId ? (
              <DashboardState
                description={m.auth_profile_without_school()}
                kind="empty"
                title={m.mobile_dashboard_error_title()}
              />
            ) : loading ? (
              <SubjectsSkeleton />
            ) : error ? (
              <DashboardState
                actionLabel={m.auth_retry()}
                description={m.mobile_dashboard_error_description()}
                kind="error"
                onAction={() => void gradesQuery.refetch()}
                title={m.mobile_dashboard_error_title()}
              />
            ) : !subjects.length ? (
              <DashboardState
                description={m.mobile_subjects_empty_description()}
                kind="empty"
                title={m.mobile_subjects_empty_title()}
              />
            ) : (
              <Card className="gap-0 p-0">
                {subjects.map((subject, index) => (
                  <div key={subject.subjectLevelId}>
                    <SubjectSummaryRow subject={subject} />
                    {index < subjects.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            )}
          </TabsContent>
          <TabsContent className="mt-4" value="teachers">
            {scheduleQuery.isLoading ? (
              <SubjectsSkeleton />
            ) : scheduleQuery.isError ? (
              <DashboardState
                actionLabel={m.auth_retry()}
                description={m.mobile_dashboard_error_description()}
                kind="error"
                onAction={() => void scheduleQuery.refetch()}
                title={m.mobile_dashboard_error_title()}
              />
            ) : teachers.length ? (
              <Card className="gap-0 p-0">
                {teachers.map((teacher, index) => (
                  <div
                    key={`${teacher.staffAssignmentId}-${teacher.subjectCode}`}
                  >
                    <SubjectTeacherRow teacher={teacher} />
                    {index < teachers.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                description={m.mobile_subjects_teachers_empty_description()}
                kind="empty"
                title={m.mobile_subjects_teachers_empty_title()}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SubjectSummaryRow({
  subject,
}: {
  subject: ParentReportSubjectAverage
}) {
  const subjectColor = getSubjectColor(
    subject.subjectCode || subject.subjectName,
    subject.subjectColor
  )

  return (
    <div className="flex items-center gap-3 p-4">
      <span
        className="h-12 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: subjectColor.border }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {subject.subjectName}
        </div>
        <div className="text-xs text-muted-foreground">
          coef. {subject.coefficient}
        </div>
      </div>
    </div>
  )
}

function SubjectTeacherRow({
  teacher,
}: {
  teacher: {
    photoUrl?: string | null
    subjectCode: string
    subjectColor?: string | null
    subjectName: string
    staffAssignmentId: string
    teacherName: string
  }
}) {
  const subjectColor = getSubjectColor(
    teacher.subjectCode || teacher.subjectName,
    teacher.subjectColor
  )

  return (
    <div className="flex items-center gap-4 p-4">
      <span
        className="h-12 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: subjectColor.border }}
      />
      <div className="shrink-0">
        <PersonAvatar
          className="size-11"
          name={teacher.teacherName}
          size="lg"
          src={teacher.photoUrl ?? null}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {teacher.teacherName}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {teacher.subjectName}
        </div>
      </div>
    </div>
  )
}

function SubjectsSkeleton() {
  return (
    <Card className="gap-0 p-0">
      {[0, 1, 2].map((item) => (
        <div className="p-4" key={item}>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
    </Card>
  )
}

function StudentPresence({
  academicYearContext,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  schoolId: string | null
}) {
  const [selectedDayEvents, setSelectedDayEvents] =
    useState<PresenceDayEvents | null>(null)
  const [selectedPresenceAgendaDate, setSelectedPresenceAgendaDate] = useState<
    string | null
  >(null)
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonthDate(new Date())
  )
  const [view, setView] = useState<ParentPresenceView>("calendar")
  const monthRange = useMemo(
    () => getMonthRange(selectedMonth),
    [selectedMonth]
  )
  const presenceQuery = useQuery({
    ...studentPresenceQueryOptions(
      schoolId ?? "",
      monthRange.startDate,
      monthRange.endDate
    ),
    enabled: Boolean(schoolId),
  })
  const presence = presenceQuery.data
  const presenceDayRows = useMemo(
    () => (presence ? getPresenceDayRows(presence, monthRange) : []),
    [monthRange, presence]
  )
  const presenceAgendaDays = selectedPresenceAgendaDate
    ? presenceDayRows.filter((day) => day.date === selectedPresenceAgendaDate)
    : presenceDayRows

  useEffect(() => {
    setSelectedDayEvents(null)
    setSelectedPresenceAgendaDate(null)
  }, [monthRange.startDate])

  useEffect(() => {
    const year = academicYearContext.selectedYear
    if (!year) return
    setSelectedMonth(getInitialMonthForSchoolYear(year))
  }, [academicYearContext.selectedYear])

  return (
    <div className="min-h-[calc(100svh-5.5rem)]">
      <PresenceHeader
        onBack={onBack}
        subtitle={m.mobile_presence_subtitle()}
        title={fmtDate(selectedMonth, "month-year")}
      />
      <div className="flex flex-col gap-2 px-5 pt-2 pb-24">
        <AcademicYearContextSelector context={academicYearContext} />
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : presenceQuery.isLoading || academicYearContext.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : presenceQuery.isError || academicYearContext.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void presenceQuery.refetch()
            }}
            kind="error"
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : presence ? (
          <>
            <Tabs
              className="gap-3"
              value={view}
              onValueChange={(value) => setView(value as ParentPresenceView)}
            >
              <PresenceStatsGrid presence={presence} />
              <TabsList className="h-7 rounded-full bg-background p-0.5 shadow-sm">
                <TabsTrigger
                  className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                  value="calendar"
                >
                  <CalendarDays data-icon="inline-start" />
                  {m.mobile_presence_calendar_tab()}
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                  value="history"
                >
                  <ListChecks data-icon="inline-start" />
                  {m.mobile_presence_history_tab()}
                </TabsTrigger>
              </TabsList>
              <TabsContent className="mt-0" value="calendar">
                <div className="flex flex-col gap-3">
                  <PresenceCalendar
                    monthDate={selectedMonth}
                    onNextMonth={() =>
                      setSelectedMonth((date) =>
                        clampMonthDate(
                          addMonths(date, 1),
                          academicYearContext.selectedYear
                            ? new Date(
                                academicYearContext.selectedYear.startDate
                              )
                            : null,
                          academicYearContext.selectedYear
                            ? new Date(academicYearContext.selectedYear.endDate)
                            : null
                        )
                      )
                    }
                    onPreviousMonth={() =>
                      setSelectedMonth((date) =>
                        clampMonthDate(
                          addMonths(date, -1),
                          academicYearContext.selectedYear
                            ? new Date(
                                academicYearContext.selectedYear.startDate
                              )
                            : null,
                          academicYearContext.selectedYear
                            ? new Date(academicYearContext.selectedYear.endDate)
                            : null
                        )
                      )
                    }
                    onSelectDay={(date) =>
                      setSelectedPresenceAgendaDate((current) =>
                        current === date ? null : date
                      )
                    }
                    presence={presence}
                    range={monthRange}
                    selectedDate={selectedPresenceAgendaDate}
                  />
                  <PresenceDayAgenda
                    date={selectedPresenceAgendaDate}
                    days={presenceAgendaDays}
                    onSelectDay={setSelectedDayEvents}
                  />
                </div>
              </TabsContent>
              <TabsContent className="mt-0" value="history">
                <PresenceHistory
                  onSelectDay={setSelectedDayEvents}
                  presence={presence}
                  range={monthRange}
                />
              </TabsContent>
            </Tabs>

            {presence.plannedAbsences.length > 0 && (
              <div className="flex flex-col gap-3">
                <SectionTitle>
                  {m.mobile_presence_planned_absences()}
                </SectionTitle>
                <PlannedAbsenceList presence={presence} />
              </div>
            )}
            <PresenceDayDetailsDrawer
              day={selectedDayEvents}
              onOpenChange={(open) => {
                if (!open) setSelectedDayEvents(null)
              }}
              scope="student"
            />
            <FloatingControls align="end">
              <MonthSwitcher
                max={
                  academicYearContext.selectedYear
                    ? new Date(academicYearContext.selectedYear.endDate)
                    : null
                }
                min={
                  academicYearContext.selectedYear
                    ? new Date(academicYearContext.selectedYear.startDate)
                    : null
                }
                onChange={setSelectedMonth}
                onNext={() => setSelectedMonth((date) => addMonths(date, 1))}
                onPrevious={() =>
                  setSelectedMonth((date) => addMonths(date, -1))
                }
                value={selectedMonth}
              />
            </FloatingControls>
          </>
        ) : null}
      </div>
    </div>
  )
}

function StudentPayments({
  academicYearContext,
  dashboard,
  isError,
  isLoading,
  onBack,
  onRetryDashboard,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  dashboard: StudentDashboard | undefined
  isError: boolean
  isLoading: boolean
  onBack: () => void
  onRetryDashboard: () => void
  schoolId: string | null
}) {
  const paymentsQuery = useQuery({
    ...studentPaymentsSummaryQueryOptions(
      schoolId ?? "",
      dashboard,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId && dashboard),
  })
  const summary = paymentsQuery.data
  const paymentChildren = summary?.children ?? []
  const upcomingPayments = summary ? getUpcomingPaymentLines(summary) : []
  const receiptPayments =
    summary?.payments.filter((payment) => payment.receipt) ?? []

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_payments_subtitle()}
        title={m.mobile_nav_payments()}
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : isLoading ||
          paymentsQuery.isLoading ||
          academicYearContext.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : isError ||
          paymentsQuery.isError ||
          academicYearContext.isError ||
          !dashboard ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              onRetryDashboard()
              void paymentsQuery.refetch()
            }}
            kind="error"
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : summary ? (
          <PaymentOverviewCards
            paymentChildren={paymentChildren}
            receiptPayments={receiptPayments}
            scope="student"
            summary={summary}
          />
        ) : null}

        {!isLoading &&
        !isError &&
        !paymentsQuery.isLoading &&
        !paymentsQuery.isError &&
        !academicYearContext.isLoading &&
        !academicYearContext.isError &&
        summary ? (
          <>
            <SectionTitle>{m.mobile_payments_due_tab()}</SectionTitle>
            {upcomingPayments.length ? (
              <Card className="gap-0 p-0">
                {upcomingPayments.map((payment, index) => (
                  <div key={payment.id}>
                    <UpcomingPaymentRow payment={payment} scope="student" />
                    {index < upcomingPayments.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                kind="empty"
                title={m.mobile_no_balance_title()}
                description={m.mobile_no_student_balance_description()}
              />
            )}

            <SectionTitle>{m.mobile_payments_history_tab()}</SectionTitle>
            {!summary.paymentHistoryAvailable ? (
              <DashboardState
                kind="error"
                title={m.mobile_payments_history_limited_title()}
                description={m.mobile_payments_history_limited_student_description()}
              />
            ) : receiptPayments.length ? (
              <Card className="gap-0 p-0">
                {receiptPayments.map((payment, index) => (
                  <div key={payment.id}>
                    <PaymentReceiptRow payment={payment} scope="student" />
                    {index < receiptPayments.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                kind="empty"
                title={m.mobile_no_receipt_title()}
                description={m.mobile_no_receipt_description()}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

function ParentHighlightCard({
  child,
  familyTotalBalance,
  hasBalance,
  paymentSummary,
}: {
  child: ParentChildSummary | null
  familyTotalBalance: number
  hasBalance: boolean
  paymentSummary: ParentPaymentsSummary | null
}) {
  const paidProgress = paymentSummary
    ? getPaymentPaidProgress(paymentSummary)
    : hasBalance
      ? 0
      : 0
  const compactValue = paymentSummary
    ? fmtCompactAmount(paymentSummary.totalBalance)
    : fmtCompactAmount(familyTotalBalance)

  return (
    <Card className="gap-3" variant="dark">
      <CardContent className="flex items-center gap-4 px-0">
        <div className="min-w-0 flex-1">
          <CardDescription className="text-brand">
            {hasBalance
              ? m.mobile_parent_amount_due()
              : m.mobile_parent_family_clear()}
          </CardDescription>
          <CardTitle className="mt-2">
            {hasBalance
              ? fmtFCFA(familyTotalBalance)
              : m.mobile_parent_no_due()}
          </CardTitle>
          <CardDescription className="mt-2 text-white/70">
            {child
              ? `${formatStudentName(child)} - ${child.classGroupCode}`
              : m.mobile_parent_no_child_description()}
          </CardDescription>
        </div>
        <FeeProgressRing
          centerClassName="font-mono text-sm font-bold text-white"
          centerText={compactValue}
          percent={paidProgress}
          progressClassName="stroke-brand"
          size={72}
          thickness={4}
          trackClassName="stroke-white/20"
        />
      </CardContent>
    </Card>
  )
}

function StudentHighlightCard({
  dashboard,
  paymentSummary,
}: {
  dashboard: StudentDashboard
  paymentSummary: ParentPaymentsSummary | null
}) {
  const academicAccessBlocked =
    getCanonicalAcademicAccessState(dashboard).blocked
  const remainingAmount = Math.max(
    paymentSummary?.totalBalance ?? dashboard.balance,
    0
  )
  const totalFees = paymentSummary?.totalFees ?? remainingAmount
  const paidAmount = Math.max(totalFees - remainingAmount, 0)
  const paidProgress =
    totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0

  return (
    <Card
      className="gap-4 border-white/10 bg-hero-bg shadow-[0_18px_44px_rgba(8,21,40,0.22)]"
      variant="dark"
    >
      <CardContent className="flex items-center gap-4 px-0">
        <div className="min-w-0 flex-1">
          <CardDescription className="text-brand">
            {m.mobile_student_space()}
          </CardDescription>
          <CardTitle className="mt-2 leading-tight">
            {getStudentDashboardName(dashboard.info)}
          </CardTitle>
          <CardDescription className="mt-2 text-white/70">
            {dashboard.info.classGroupCode} - {dashboard.info.schoolYearLabel}
          </CardDescription>
        </div>
        <FeeProgressRing
          centerClassName="font-mono text-sm font-bold text-white"
          centerText={fmtCompactAmount(remainingAmount)}
          percent={Math.min(100, Math.max(0, paidProgress))}
          progressClassName="stroke-brand"
          size={78}
          thickness={4}
          trackClassName="stroke-white/15"
        />
      </CardContent>
      <CardContent className="grid grid-cols-2 gap-2 px-0 pt-0">
        <StudentMetric
          label={m.mobile_average()}
          value={
            dashboard.grades.periodAverage === null || academicAccessBlocked
              ? "-"
              : formatGrade(dashboard.grades.periodAverage)
          }
        />
        <StudentMetric
          label={m.mobile_rank()}
          value={
            academicAccessBlocked ? "-" : formatStudentDashboardRank(dashboard)
          }
        />
      </CardContent>
    </Card>
  )
}

function StudentAttendanceCapsule({
  presence,
}: {
  presence: StudentDashboard["presence"]
}) {
  return (
    <Card className="gap-0 rounded-2xl bg-background p-1" size="sm">
      <div className="grid grid-cols-3 divide-x overflow-hidden rounded-xl bg-muted/40">
        <StudentAttendanceSegment
          label={m.mobile_status_present_plural()}
          value={String(presence.present)}
        />
        <StudentAttendanceSegment
          label={m.mobile_presence_absences()}
          value={String(presence.absent)}
        />
        <StudentAttendanceSegment
          label={m.mobile_presence_lates()}
          value={String(presence.late)}
        />
      </div>
    </Card>
  )
}

function StudentAttendanceSegment({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 bg-background px-2 py-3 text-center">
      <span className="font-mono text-base leading-none font-bold">
        {value}
      </span>
      <span className="max-w-full truncate text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  )
}

function ChildCard({
  child,
  gradesChild,
  paymentChild,
  schoolName,
}: {
  child: ParentChildSummary
  gradesChild: ParentGradesChild | null
  paymentChild: ParentPaymentChild | null
  schoolName: string | null
}) {
  const hasBalance = child.balance > 0
  const cardAccessBlockState = getCanonicalAcademicAccessState(child)
  const cardAccessBlocked = cardAccessBlockState.blocked
  const academicAccessBlocked = cardAccessBlocked
  const rankLabel = academicAccessBlocked
    ? null
    : formatChildRank(child, gradesChild)
  const paymentRemaining = paymentChild?.balance.balance ?? child.balance
  const paymentTotal = paymentChild?.balance.totalFees ?? child.balance
  const paymentPaid = Math.max(paymentTotal - paymentRemaining, 0)
  const showPaymentProgress = Boolean(paymentChild || hasBalance)

  return (
    <Card className="gap-3" size="sm">
      <CardContent className="flex items-center gap-3 px-0">
        <PersonAvatar
          className="size-11"
          name={formatStudentName(child)}
          size="lg"
          src={child.photoUrl}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {formatStudentName(child)}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {child.classGroupCode} - {schoolName ?? child.classGroupName}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {child.presenceToday.status !== "absent" && (
              <Badge
                variant={
                  child.presenceToday.status === "present"
                    ? "success"
                    : "neutral"
                }
              >
                {formatPresenceStatus(child.presenceToday.status)}
              </Badge>
            )}
            {rankLabel ? (
              <span className="text-xs text-muted-foreground">
                {m.mobile_rank()} :{" "}
                <span className="font-semibold text-foreground">
                  {rankLabel}
                </span>
              </span>
            ) : null}
            {cardAccessBlocked ? (
              <span className="text-xs font-semibold text-grade-mid">
                {teacherCopy(
                  "Carte Lernn non regularisee",
                  "Lernn card not settled"
                )}
              </span>
            ) : null}
            {cardAccessBlocked ? (
              <span className="basis-full text-[11px] leading-4 text-muted-foreground">
                {teacherCopy(
                  "Rapprochez-vous de l'administration de l'ecole.",
                  "Please contact the school administration."
                )}
              </span>
            ) : null}
          </div>
        </div>
        {showPaymentProgress && !cardAccessBlocked ? (
          <FeeProgressRing
            centerClassName="font-mono text-[11px] font-semibold text-foreground"
            centerText={fmtCompactAmount(paymentRemaining)}
            percent={paymentTotal > 0 ? (paymentPaid / paymentTotal) * 100 : 0}
            size={44}
            thickness={3}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

function RecentActivitySection({
  items,
  onOpenGrades,
  onOpenNotifications,
  onOpenPayments,
  onOpenPresence,
}: {
  items: RecentActivityItem[]
  onOpenGrades: () => void
  onOpenNotifications: () => void
  onOpenPayments: () => void
  onOpenPresence: () => void
}) {
  if (!items.length) return null

  return (
    <>
      <SectionTitle>{m.mobile_parent_activity()}</SectionTitle>
      <Card className="gap-0 p-0">
        {items.map((item, index) => (
          <ActivityRow
            item={item}
            key={item.id}
            onOpenGrades={onOpenGrades}
            onOpenNotifications={onOpenNotifications}
            onOpenPayments={onOpenPayments}
            onOpenPresence={onOpenPresence}
            showSeparator={index < items.length - 1}
          />
        ))}
      </Card>
    </>
  )
}

function ActivityRow({
  item,
  onOpenGrades,
  onOpenMessages,
  onOpenNotifications,
  onOpenPayments,
  onOpenPresence,
  showSeparator,
}: {
  item: RecentActivityItem
  onOpenGrades: () => void
  onOpenMessages?: () => void
  onOpenNotifications: () => void
  onOpenPayments: () => void
  onOpenPresence: () => void
  showSeparator: boolean
}) {
  const Icon = item.icon
  const title = item.title
  const action = getActivityAction(item.tone, {
    onOpenGrades,
    onOpenMessages,
    onOpenNotifications,
    onOpenPayments,
    onOpenPresence,
  })

  return (
    <div>
      <button
        aria-label={title}
        className="flex w-full items-start gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={action}
        type="button"
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg",
            getActivityIconBackground(item.tone)
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {item.subtitle}
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {item.time}
        </span>
      </button>
      {showSeparator && <Separator />}
    </div>
  )
}

function getActivityAction(
  tone: ActivityTone,
  handlers: {
    onOpenGrades: () => void
    onOpenMessages?: () => void
    onOpenNotifications: () => void
    onOpenPayments: () => void
    onOpenPresence: () => void
  }
) {
  if (tone === "presence") return handlers.onOpenPresence
  if (tone === "grades") return handlers.onOpenGrades
  if (tone === "payments") return handlers.onOpenPayments
  return handlers.onOpenMessages ?? handlers.onOpenNotifications
}

function getActivityIconBackground(tone: ActivityTone) {
  if (tone === "presence") return "bg-brand-soft text-brand-dark"
  if (tone === "payments") return "bg-role-parent-bg text-cat-finance"
  if (tone === "grades") return "bg-info-bg text-cat-academic"
  return "bg-role-teacher-bg text-role-teacher"
}

function getRecentActivityItems(
  notifications: AppNotification[]
): RecentActivityItem[] {
  return notifications.slice(0, 4).map((notification) => {
    const tone = getNotificationActivityTone(notification.type)
    const Icon = notificationIcons[notification.type] ?? Bell

    return {
      icon: Icon,
      id: notification.id,
      subtitle: notification.body,
      time: fmtRelativeTime(notification.createdAt),
      title: notification.title,
      tone,
    }
  })
}

function getNotificationActivityTone(
  type: AppNotification["type"]
): ActivityTone {
  if (type === "PRESENCE") return "presence"
  if (type === "PAYMENT") return "payments"
  if (type === "GRADE") return "grades"
  return "messages"
}

function UpcomingEvaluationsPreview({
  evaluations,
  isError,
  onRetry,
}: {
  evaluations: UpcomingEvaluationPreview[]
  isError: boolean
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>{m.mobile_home_upcoming_evaluations_title()}</SectionTitle>
      {isError ? (
        <DashboardState
          actionLabel={m.auth_retry()}
          description={m.mobile_dashboard_error_description()}
          kind="error"
          onAction={onRetry}
          title={m.mobile_dashboard_error_title()}
        />
      ) : evaluations.length ? (
        <Card className="gap-0 p-0">
          {evaluations.map((evaluation, index) => (
            <div key={evaluation.id}>
              <EvaluationPreviewRow evaluation={evaluation} />
              {index < evaluations.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
      ) : (
        <DashboardState
          description={m.mobile_home_upcoming_evaluations_empty_description()}
          kind="empty"
          title={m.mobile_home_upcoming_evaluations_empty_title()}
        />
      )}
    </div>
  )
}

function EvaluationPreviewRow({
  evaluation,
}: {
  evaluation: UpcomingEvaluationPreview
}) {
  const typeStyle = getEvaluationTypeStyle(evaluation.type)

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {fmtMonthShort(evaluation.date)}
        </span>
        <span className="font-mono text-lg font-semibold">
          {new Date(evaluation.date).getDate().toString().padStart(2, "0")}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <Badge className={typeStyle.badgeClassName} variant="neutral">
          {formatEvaluationType(evaluation.type)}
        </Badge>
        <p className="mt-1 truncate text-sm font-semibold">
          {evaluation.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[evaluation.classGroupCode, evaluation.subjectName]
            .filter(Boolean)
            .join(" - ")}
        </p>
      </div>
    </div>
  )
}

function ParentEvaluations({
  academicYearContext,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  schoolId: string | null
}) {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonthDate(new Date())
  )
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [selectedDayEvaluations, setSelectedDayEvaluations] = useState<
    UpcomingEvaluationPreview[]
  >([])
  const [selectedEvaluationAgendaDate, setSelectedEvaluationAgendaDate] =
    useState<string | null>(null)
  const dashboardQuery = useQuery({
    ...parentDashboardQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const evaluationsQuery = useQuery({
    queryKey: [
      "parent",
      "evaluations-school-year",
      schoolId,
      academicYearContext.selectedYearId ?? "current",
    ],
    queryFn: () =>
      fetchParentSchoolYearEvaluations(
        schoolId ?? "",
        academicYearContext.selectedYearId ?? undefined
      ),
    enabled: Boolean(schoolId),
    staleTime: 60_000,
  })
  const evaluations = evaluationsQuery.data ?? NO_UPCOMING_EVALUATIONS
  const periodOptions = useMemo(
    () => getAcademicYearPeriodOptions(academicYearContext.selectedYear),
    [academicYearContext.selectedYear]
  )
  const selectedPeriod =
    academicYearContext.selectedYear?.periods.find(
      (period) => period.id === selectedPeriodId
    ) ?? null
  const periodEvaluations = useMemo(
    () => getEvaluationsInPeriod(evaluations, selectedPeriod),
    [evaluations, selectedPeriod]
  )
  const monthEvaluations = useMemo(
    () => getEvaluationsInMonth(periodEvaluations, selectedMonth),
    [periodEvaluations, selectedMonth]
  )
  const evaluationDayRows = useMemo(
    () => getEvaluationCalendarDays(monthEvaluations),
    [monthEvaluations]
  )
  const evaluationAgendaItems = selectedEvaluationAgendaDate
    ? (evaluationDayRows.find(
        (day) => day.date === selectedEvaluationAgendaDate
      )?.evaluations ?? [])
    : monthEvaluations

  useEffect(() => {
    const year = academicYearContext.selectedYear
    if (!year) return
    const period = getDefaultAcademicPeriod(year)
    setSelectedPeriodId(period?.id ?? null)
    setSelectedMonth(
      period
        ? startOfMonthDate(new Date(period.startDate))
        : getInitialMonthForSchoolYear(year)
    )
    setSelectedDayEvaluations([])
    setSelectedEvaluationAgendaDate(null)
  }, [academicYearContext.selectedYear])

  useEffect(() => {
    const period = selectedPeriod
    if (!period) return
    setSelectedMonth(startOfMonthDate(new Date(period.startDate)))
    setSelectedDayEvaluations([])
    setSelectedEvaluationAgendaDate(null)
  }, [selectedPeriod])

  useEffect(() => {
    setSelectedDayEvaluations([])
    setSelectedEvaluationAgendaDate(null)
  }, [selectedMonth])

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_reports_evaluations()}
        title={fmtDate(selectedMonth, "month-year")}
      />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : dashboardQuery.isLoading ||
          evaluationsQuery.isLoading ||
          academicYearContext.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : dashboardQuery.isError ||
          evaluationsQuery.isError ||
          academicYearContext.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            onAction={() => {
              void Promise.all([
                dashboardQuery.refetch(),
                evaluationsQuery.refetch(),
              ])
            }}
            title={m.mobile_dashboard_error_title()}
          />
        ) : (
          <>
            <PeriodContextSelector
              onSelect={setSelectedPeriodId}
              options={periodOptions}
              selectedId={selectedPeriodId}
            />
            <Tabs
              className="gap-3"
              value={view}
              onValueChange={(value) => setView(value as "calendar" | "list")}
            >
              <TabsList className="h-8 rounded-full border bg-background p-1 shadow-sm">
                <TabsTrigger
                  className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                  value="calendar"
                >
                  <CalendarDays data-icon="inline-start" />
                  {m.mobile_presence_calendar_tab()}
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                  value="list"
                >
                  <ListChecks data-icon="inline-start" />
                  {getRouteLocale() === "fr" ? "Liste" : "List"}
                </TabsTrigger>
              </TabsList>
              <TabsContent className="mt-0" value="calendar">
                <div className="flex flex-col gap-3">
                  <EvaluationCalendar
                    evaluations={monthEvaluations}
                    monthDate={selectedMonth}
                    onNextMonth={() =>
                      setSelectedMonth((date) =>
                        clampMonthDate(
                          addMonths(date, 1),
                          academicYearContext.selectedYear
                            ? new Date(
                                academicYearContext.selectedYear.startDate
                              )
                            : null,
                          academicYearContext.selectedYear
                            ? new Date(academicYearContext.selectedYear.endDate)
                            : null
                        )
                      )
                    }
                    onPreviousMonth={() =>
                      setSelectedMonth((date) =>
                        clampMonthDate(
                          addMonths(date, -1),
                          academicYearContext.selectedYear
                            ? new Date(
                                academicYearContext.selectedYear.startDate
                              )
                            : null,
                          academicYearContext.selectedYear
                            ? new Date(academicYearContext.selectedYear.endDate)
                            : null
                        )
                      )
                    }
                    onSelectDay={(date) =>
                      setSelectedEvaluationAgendaDate((current) =>
                        current === date ? null : date
                      )
                    }
                    selectedDate={selectedEvaluationAgendaDate}
                  />
                  <EvaluationDayAgenda
                    date={selectedEvaluationAgendaDate}
                    evaluations={evaluationAgendaItems}
                    onSelectEvaluation={(evaluation) =>
                      setSelectedDayEvaluations([evaluation])
                    }
                  />
                </div>
              </TabsContent>
              <TabsContent className="mt-0" value="list">
                <EvaluationList
                  evaluations={monthEvaluations}
                  onSelectEvaluation={(evaluation) =>
                    setSelectedDayEvaluations([evaluation])
                  }
                />
              </TabsContent>
            </Tabs>
            <FloatingControls align="end">
              <MonthSwitcher
                max={
                  academicYearContext.selectedYear
                    ? new Date(academicYearContext.selectedYear.endDate)
                    : null
                }
                min={
                  academicYearContext.selectedYear
                    ? new Date(academicYearContext.selectedYear.startDate)
                    : null
                }
                onChange={setSelectedMonth}
                onNext={() => setSelectedMonth((date) => addMonths(date, 1))}
                onPrevious={() =>
                  setSelectedMonth((date) => addMonths(date, -1))
                }
                value={selectedMonth}
              />
            </FloatingControls>
            <EvaluationDetailsDrawer
              evaluations={selectedDayEvaluations}
              onOpenChange={(open) => {
                if (!open) setSelectedDayEvaluations([])
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function StudentEvaluations({
  academicYearContext,
  isError,
  isLoading,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  isError: boolean
  isLoading: boolean
  onBack: () => void
  schoolId: string | null
}) {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonthDate(new Date())
  )
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [selectedDayEvaluations, setSelectedDayEvaluations] = useState<
    UpcomingEvaluationPreview[]
  >([])
  const [selectedEvaluationAgendaDate, setSelectedEvaluationAgendaDate] =
    useState<string | null>(null)
  const evaluationsQuery = useQuery({
    queryKey: [
      "student",
      "evaluations-school-year",
      schoolId,
      academicYearContext.selectedYearId ?? "current",
    ],
    queryFn: () =>
      fetchStudentSchoolYearEvaluations(
        schoolId ?? "",
        academicYearContext.selectedYearId ?? undefined
      ),
    enabled: Boolean(schoolId),
    staleTime: 60_000,
  })
  const evaluations = evaluationsQuery.data ?? NO_UPCOMING_EVALUATIONS
  const periodOptions = useMemo(
    () => getAcademicYearPeriodOptions(academicYearContext.selectedYear),
    [academicYearContext.selectedYear]
  )
  const selectedPeriod =
    academicYearContext.selectedYear?.periods.find(
      (period) => period.id === selectedPeriodId
    ) ?? null
  const periodEvaluations = useMemo(
    () => getEvaluationsInPeriod(evaluations, selectedPeriod),
    [evaluations, selectedPeriod]
  )
  const monthEvaluations = useMemo(
    () => getEvaluationsInMonth(periodEvaluations, selectedMonth),
    [periodEvaluations, selectedMonth]
  )
  const evaluationDayRows = useMemo(
    () => getEvaluationCalendarDays(monthEvaluations),
    [monthEvaluations]
  )
  const evaluationAgendaItems = selectedEvaluationAgendaDate
    ? (evaluationDayRows.find(
        (day) => day.date === selectedEvaluationAgendaDate
      )?.evaluations ?? [])
    : monthEvaluations

  useEffect(() => {
    const year = academicYearContext.selectedYear
    if (!year) return
    const period = getDefaultAcademicPeriod(year)
    setSelectedPeriodId(period?.id ?? null)
    setSelectedMonth(
      period
        ? startOfMonthDate(new Date(period.startDate))
        : getInitialMonthForSchoolYear(year)
    )
    setSelectedDayEvaluations([])
    setSelectedEvaluationAgendaDate(null)
  }, [academicYearContext.selectedYear])

  useEffect(() => {
    const period = selectedPeriod
    if (!period) return
    setSelectedMonth(startOfMonthDate(new Date(period.startDate)))
    setSelectedDayEvaluations([])
    setSelectedEvaluationAgendaDate(null)
  }, [selectedPeriod])

  useEffect(() => {
    setSelectedDayEvaluations([])
    setSelectedEvaluationAgendaDate(null)
  }, [selectedMonth])

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_reports_evaluations()}
        title={fmtDate(selectedMonth, "month-year")}
      />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : isLoading ||
          evaluationsQuery.isLoading ||
          academicYearContext.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : isError ||
          evaluationsQuery.isError ||
          academicYearContext.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            onAction={() => void evaluationsQuery.refetch()}
            title={m.mobile_dashboard_error_title()}
          />
        ) : (
          <>
            <PeriodContextSelector
              onSelect={setSelectedPeriodId}
              options={periodOptions}
              selectedId={selectedPeriodId}
            />
            <Tabs
              className="gap-3"
              value={view}
              onValueChange={(value) => setView(value as "calendar" | "list")}
            >
              <TabsList className="h-8 rounded-full border bg-background p-1 shadow-sm">
                <TabsTrigger
                  className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                  value="calendar"
                >
                  <CalendarDays data-icon="inline-start" />
                  {m.mobile_presence_calendar_tab()}
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                  value="list"
                >
                  <ListChecks data-icon="inline-start" />
                  {getRouteLocale() === "fr" ? "Liste" : "List"}
                </TabsTrigger>
              </TabsList>
              <TabsContent className="mt-0" value="calendar">
                <div className="flex flex-col gap-3">
                  <EvaluationCalendar
                    evaluations={monthEvaluations}
                    monthDate={selectedMonth}
                    onNextMonth={() =>
                      setSelectedMonth((date) =>
                        clampMonthDate(
                          addMonths(date, 1),
                          academicYearContext.selectedYear
                            ? new Date(
                                academicYearContext.selectedYear.startDate
                              )
                            : null,
                          academicYearContext.selectedYear
                            ? new Date(academicYearContext.selectedYear.endDate)
                            : null
                        )
                      )
                    }
                    onPreviousMonth={() =>
                      setSelectedMonth((date) =>
                        clampMonthDate(
                          addMonths(date, -1),
                          academicYearContext.selectedYear
                            ? new Date(
                                academicYearContext.selectedYear.startDate
                              )
                            : null,
                          academicYearContext.selectedYear
                            ? new Date(academicYearContext.selectedYear.endDate)
                            : null
                        )
                      )
                    }
                    onSelectDay={(date) =>
                      setSelectedEvaluationAgendaDate((current) =>
                        current === date ? null : date
                      )
                    }
                    selectedDate={selectedEvaluationAgendaDate}
                  />
                  <EvaluationDayAgenda
                    date={selectedEvaluationAgendaDate}
                    evaluations={evaluationAgendaItems}
                    onSelectEvaluation={(evaluation) =>
                      setSelectedDayEvaluations([evaluation])
                    }
                  />
                </div>
              </TabsContent>
              <TabsContent className="mt-0" value="list">
                <EvaluationList
                  evaluations={monthEvaluations}
                  onSelectEvaluation={(evaluation) =>
                    setSelectedDayEvaluations([evaluation])
                  }
                />
              </TabsContent>
            </Tabs>
            <FloatingControls align="end">
              <MonthSwitcher
                max={
                  academicYearContext.selectedYear
                    ? new Date(academicYearContext.selectedYear.endDate)
                    : null
                }
                min={
                  academicYearContext.selectedYear
                    ? new Date(academicYearContext.selectedYear.startDate)
                    : null
                }
                onChange={setSelectedMonth}
                onNext={() => setSelectedMonth((date) => addMonths(date, 1))}
                onPrevious={() =>
                  setSelectedMonth((date) => addMonths(date, -1))
                }
                value={selectedMonth}
              />
            </FloatingControls>
            <EvaluationDetailsDrawer
              evaluations={selectedDayEvaluations}
              onOpenChange={(open) => {
                if (!open) setSelectedDayEvaluations([])
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function useCalendarMonthSwipe({
  onNextMonth,
  onPreviousMonth,
}: {
  onNextMonth?: () => void
  onPreviousMonth?: () => void
}) {
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<"next" | "previous">(
    "next"
  )

  const startSwipe = (x: number, y: number) => {
    swipeStartRef.current = { x, y }
  }

  const endSwipe = (x: number, y: number) => {
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start) return

    const deltaX = x - start.x
    const deltaY = y - start.y
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
      return
    }

    if (deltaX < 0 && onNextMonth) {
      setSwipeDirection("next")
      onNextMonth()
    } else if (deltaX > 0 && onPreviousMonth) {
      setSwipeDirection("previous")
      onPreviousMonth()
    }
  }

  return {
    swipeDirection,
    swipeHandlers: {
      onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
        startSwipe(event.clientX, event.clientY)
      },
      onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
        endSwipe(event.clientX, event.clientY)
      },
      onTouchEnd: (event: ReactTouchEvent<HTMLDivElement>) => {
        const touch = event.changedTouches.item(0)
        if (touch) endSwipe(touch.clientX, touch.clientY)
      },
      onTouchStart: (event: ReactTouchEvent<HTMLDivElement>) => {
        const touch = event.changedTouches.item(0)
        if (touch) startSwipe(touch.clientX, touch.clientY)
      },
    },
  }
}

function EvaluationCalendar({
  evaluations,
  monthDate,
  onNextMonth,
  onSelectDay,
  onPreviousMonth,
  selectedDate,
}: {
  evaluations: UpcomingEvaluationPreview[]
  monthDate: Date
  onNextMonth?: () => void
  onSelectDay: (date: string) => void
  onPreviousMonth?: () => void
  selectedDate: string | null
}) {
  const { swipeDirection, swipeHandlers } = useCalendarMonthSwipe({
    onNextMonth,
    onPreviousMonth,
  })
  const byDay = useMemo(
    () => groupEvaluationsByIsoDate(evaluations),
    [evaluations]
  )
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate()
  const cells: Array<{
    date: Date
    evaluations: UpcomingEvaluationPreview[]
  } | null> = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        index + 1
      )
      return { date, evaluations: byDay.get(localIsoDate(date)) ?? [] }
    }),
  ]

  return (
    <Card className="gap-4 p-4">
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-semibold text-muted-foreground">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div
        className={cn(
          "grid touch-pan-y grid-cols-7 gap-2",
          swipeDirection === "next"
            ? "animate-in duration-150 fade-in-0 slide-in-from-right-4"
            : "animate-in duration-150 fade-in-0 slide-in-from-left-4"
        )}
        key={formatMonthInputValue(monthDate)}
        {...swipeHandlers}
      >
        {cells.map((cell, index) =>
          cell ? (
            (() => {
              const primaryEvaluation = cell.evaluations[0]
              const typeStyle = primaryEvaluation
                ? getEvaluationTypeStyle(primaryEvaluation.type)
                : null
              const isoDate = localIsoDate(cell.date)
              const isSelected = selectedDate === isoDate

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-lg text-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    typeStyle
                      ? typeStyle.calendarClassName
                      : "text-muted-foreground",
                    isSelected &&
                      "ring-2 ring-brand ring-offset-2 ring-offset-background"
                  )}
                  disabled={!cell.evaluations.length}
                  key={isoDate}
                  onClick={() => onSelectDay(isoDate)}
                  type="button"
                >
                  {cell.date.getDate()}
                  {cell.evaluations.length ? (
                    <span className="absolute bottom-1 flex gap-0.5">
                      {cell.evaluations.slice(0, 3).map((evaluation) => (
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            getEvaluationTypeStyle(evaluation.type).dotClassName
                          )}
                          key={evaluation.id}
                        />
                      ))}
                    </span>
                  ) : null}
                </button>
              )
            })()
          ) : (
            <span key={`empty-${index}`} />
          )
        )}
      </div>
      <EvaluationTypeLegend />
    </Card>
  )
}

function EvaluationTypeLegend({ className }: { className?: string }) {
  const styles = getEvaluationTypeLegend(
    MOBILE_EVALUATION_TYPES.map((type) => getEvaluationTypeStyle(type))
  )

  return (
    <div className={cn("flex flex-wrap gap-2 pt-1", className)}>
      <span className="contents">
        {styles.map((style) => (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
            key={style.key}
          >
            <span className={cn("size-2 rounded-full", style.dotClassName)} />
            {formatEvaluationType(style.key)}
          </span>
        ))}
      </span>
    </div>
  )
}

function EvaluationList({
  evaluations,
  onSelectEvaluation,
}: {
  evaluations: UpcomingEvaluationPreview[]
  onSelectEvaluation: (evaluation: UpcomingEvaluationPreview) => void
}) {
  if (!evaluations.length) {
    return (
      <DashboardState
        description={m.mobile_home_upcoming_evaluations_empty_description()}
        kind="empty"
        title={m.mobile_home_upcoming_evaluations_empty_title()}
      />
    )
  }

  return (
    <EvaluationRowsCard
      evaluations={evaluations}
      onSelectEvaluation={onSelectEvaluation}
    />
  )
}

function EvaluationDayAgenda({
  date,
  evaluations,
  onSelectEvaluation,
}: {
  date: string | null
  evaluations: UpcomingEvaluationPreview[]
  onSelectEvaluation: (evaluation: UpcomingEvaluationPreview) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>
        {date
          ? fmtDate(`${date}T00:00:00`, "medium")
          : teacherCopy("Evenements du mois", "Month events")}
      </SectionTitle>
      {evaluations.length ? (
        <EvaluationRowsCard
          evaluations={evaluations}
          onSelectEvaluation={onSelectEvaluation}
        />
      ) : (
        <CalendarAgendaEmptyState
          description={teacherCopy(
            date
              ? "Choisissez une autre date ou revenez aux evaluations du mois."
              : "Les evaluations du mois apparaitront ici.",
            date
              ? "Choose another date or return to the month evaluations."
              : "Month evaluations will appear here."
          )}
          title={teacherCopy(
            date ? "Aucune evaluation ce jour" : "Aucune evaluation ce mois",
            date ? "No evaluation that day" : "No evaluation this month"
          )}
        />
      )}
    </div>
  )
}

function EvaluationRowsCard({
  evaluations,
  onSelectEvaluation,
}: {
  evaluations: UpcomingEvaluationPreview[]
  onSelectEvaluation: (evaluation: UpcomingEvaluationPreview) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {evaluations.map((evaluation) => (
        <Card
          className="gap-0 overflow-hidden rounded-lg p-0"
          key={evaluation.id}
        >
          <button
            className="w-full text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => onSelectEvaluation(evaluation)}
            type="button"
          >
            <EvaluationPreviewRow evaluation={evaluation} />
          </button>
        </Card>
      ))}
    </div>
  )
}

function CalendarAgendaEmptyState({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <Card className="gap-1 rounded-lg border-dashed bg-muted/25 p-4">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="text-xs leading-5 text-muted-foreground">
        {description}
      </div>
    </Card>
  )
}

function EvaluationDetailsDrawer({
  evaluations,
  onOpenChange,
}: {
  evaluations: UpcomingEvaluationPreview[]
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={evaluations.length > 0} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{m.mobile_reports_evaluations()}</DrawerTitle>
          <DrawerDescription>
            {evaluations[0] ? fmtDate(evaluations[0].date, "medium") : ""}
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[55svh] overflow-y-auto px-4">
          <Card className="gap-0 p-0">
            {evaluations.map((evaluation, index) => (
              <div key={evaluation.id}>
                <EvaluationPreviewRow evaluation={evaluation} />
                {index < evaluations.length - 1 && <Separator />}
              </div>
            ))}
          </Card>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{m.mobile_close()}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ParentReports({
  academicYearContext,
  onBack,
  onOpenPayments,
  schoolId,
  schoolName,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  onOpenPayments: () => void
  schoolId: string | null
  schoolName: string | null
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  )

  const dashboardQuery = useQuery({
    ...parentDashboardQueryOptions(schoolId ?? ""),
    enabled: !!schoolId,
  })

  const defaultYearPeriod = getDefaultAcademicPeriod(
    academicYearContext.selectedYear
  )
  const defaultYearPeriodId = defaultYearPeriod?.id ?? undefined
  const activePeriodIdForQuery = selectedPeriodId ?? defaultYearPeriodId

  const gradesQuery = useQuery({
    ...parentChildrenGradesQueryOptions(
      schoolId ?? "",
      activePeriodIdForQuery,
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: !!schoolId,
  })

  useEffect(() => {
    const gradeChildren = gradesQuery.data?.children ?? []
    if (
      gradeChildren[0] &&
      (!selectedChildId ||
        !gradeChildren.some((child) => child.enrollmentId === selectedChildId))
    ) {
      setSelectedChildId(gradeChildren[0].enrollmentId)
    }
  }, [gradesQuery.data?.children, selectedChildId])

  const dashboardChildren = useMemo(
    () => dashboardQuery.data?.children ?? [],
    [dashboardQuery.data?.children]
  )
  const reportSelectorChildren = useMemo(
    () =>
      gradesQuery.data?.children.map((child) =>
        mapGradesChildToSummary(child, dashboardChildren)
      ) ?? dashboardChildren,
    [dashboardChildren, gradesQuery.data?.children]
  )

  const selectedDashboardChild =
    reportSelectorChildren.find(
      (child) => child.enrollmentId === selectedChildId
    ) ??
    reportSelectorChildren[0] ??
    null
  const academicAccessBlockState = getCanonicalAcademicAccessState(
    selectedDashboardChild
  )
  const academicAccessBlocked = academicAccessBlockState.blocked

  const reportCardsQuery = useQuery({
    ...childReportCardsQueryOptions(schoolId ?? "", selectedChildId ?? ""),
    enabled: !!schoolId && !!selectedChildId && !academicAccessBlocked,
  })

  const reportCards = useMemo(
    () =>
      (reportCardsQuery.data ?? []).filter((reportCard) =>
        academicYearContext.selectedYearId
          ? reportCard.schoolYearId === academicYearContext.selectedYearId
          : true
      ),
    [academicYearContext.selectedYearId, reportCardsQuery.data]
  )
  const activeReportCard = useMemo(
    () =>
      selectedPeriodId
        ? (reportCards.find(
            (reportCard) =>
              reportCard.kind === "PERIOD" &&
              reportCard.periodId === selectedPeriodId
          ) ?? null)
        : getLatestPeriodReportCard(reportCards),
    [reportCards, selectedPeriodId]
  )
  const activePeriod = gradesQuery.data?.period ?? null
  const activePeriodId =
    selectedPeriodId ??
    activeReportCard?.periodId ??
    activePeriod?.id ??
    defaultYearPeriod?.id ??
    null
  const activePeriodLabel = activeReportCard
    ? formatReportPeriodShort(activeReportCard)
    : formatAcademicPeriodShort(activePeriod)

  const resolvedPeriodOptions = useMemo(
    () =>
      getAcademicYearPeriodOptions(academicYearContext.selectedYear).length
        ? getAcademicYearPeriodOptions(academicYearContext.selectedYear)
        : getReportPeriodOptions(reportCards, activePeriod),
    [academicYearContext.selectedYear, activePeriod, reportCards]
  )

  const selectedGradesChild =
    gradesQuery.data?.children.find(
      (child) => child.enrollmentId === selectedChildId
    ) ?? null
  const selectedChild = selectedGradesChild ?? selectedDashboardChild
  const subjects = useMemo(
    () => selectedGradesChild?.subjectAverages ?? [],
    [selectedGradesChild?.subjectAverages]
  )

  useEffect(() => {
    setSelectedSubjectId(null)
  }, [activePeriodId, selectedChildId])

  useEffect(() => {
    setSelectedPeriodId(null)
  }, [academicYearContext.selectedYearId, selectedChildId])

  const subjectDetailQueries = useQueries({
    queries: subjects.map((subject) => ({
      ...childSubjectGradesQueryOptions(
        schoolId ?? "",
        selectedChildId ?? "",
        subject.subjectLevelId,
        activePeriodId ?? ""
      ),
      enabled: !!schoolId && !!selectedChildId && !!activePeriodId,
    })),
  })

  const subjectDetailsById = useMemo(() => {
    const details = new Map<string, ParentChildSubjectGrades>()

    subjects.forEach((subject, index) => {
      const detail = subjectDetailQueries[index]?.data
      if (detail) {
        details.set(subject.subjectLevelId, detail)
      }
    })

    return details
  }, [subjectDetailQueries, subjects])

  const selectedSubject =
    subjects.find((subject) => subject.subjectLevelId === selectedSubjectId) ??
    null
  const selectedSubjectDetail = selectedSubject
    ? (subjectDetailsById.get(selectedSubject.subjectLevelId) ?? null)
    : null
  const selectedGradingScale = getReportsChildGradingScale(selectedGradesChild)

  if (selectedSubject && selectedChild) {
    return (
      <ParentSubjectDetail
        childName={formatReportsChildName(selectedChild)}
        detail={selectedSubjectDetail}
        gradingScale={
          selectedSubjectDetail?.gradingScale ?? selectedGradingScale
        }
        isLoading={subjectDetailQueries.some((query) => query.isLoading)}
        paymentBlockReason={academicAccessBlockState.reason}
        onBack={() => setSelectedSubjectId(null)}
        periodLabel={activePeriodLabel}
        subject={selectedSubject}
      />
    )
  }

  const isLoading =
    dashboardQuery.isLoading ||
    academicYearContext.isLoading ||
    reportCardsQuery.isLoading ||
    gradesQuery.isLoading
  const isError =
    dashboardQuery.isError ||
    academicYearContext.isError ||
    reportCardsQuery.isError ||
    gradesQuery.isError

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_reports_eyebrow()}
        title={m.mobile_reports_results_title()}
      />

      <div className="flex flex-col gap-2 px-4 pt-3 pb-3">
        <ChildrenScopeSelector
          children={reportSelectorChildren}
          idType="enrollment"
          mode="single"
          onSelectionChange={(ids) => setSelectedChildId(ids[0] ?? null)}
          selectedIds={selectedChildId ? [selectedChildId] : []}
        />
        <AcademicYearContextSelector context={academicYearContext} />
        <PeriodContextSelector
          onSelect={setSelectedPeriodId}
          options={resolvedPeriodOptions}
          selectedId={activePeriodId}
        />
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {!schoolId ? (
          <DashboardState
            description={m.auth_profile_without_school()}
            kind="empty"
            title={m.mobile_dashboard_error_title()}
          />
        ) : isLoading ? (
          <ParentReportsSkeleton />
        ) : isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            onAction={() => {
              void Promise.all([
                dashboardQuery.refetch(),
                reportCardsQuery.refetch(),
                gradesQuery.refetch(),
              ])
            }}
            title={m.mobile_dashboard_error_title()}
          />
        ) : !selectedChild ? (
          <DashboardState
            description={m.mobile_parent_no_child_description()}
            kind="empty"
            title={m.mobile_parent_no_child_title()}
          />
        ) : (
          <>
            <ParentReportSummaryCard
              child={selectedChild}
              isPaymentBlocked={academicAccessBlocked}
              schoolName={schoolName}
            />

            {academicAccessBlocked &&
            academicAccessBlockState.reason === "card" ? (
              <AcademicAccessBlockedCard
                blockState={academicAccessBlockState}
                onOpenPayments={onOpenPayments}
                periodLabel={activePeriodLabel}
              />
            ) : (
              <ParentReportCardStatus reportCard={activeReportCard} />
            )}

            <div className="flex flex-col gap-2">
              <SectionTitle>
                {m.mobile_reports_subjects_title({
                  period: activePeriodLabel,
                })}
              </SectionTitle>

              {subjects.length > 0 ? (
                <Card className="gap-0 p-0">
                  {subjects.map((subject, index) => {
                    const subjectColor = getSubjectColor(
                      subject.subjectCode || subject.subjectName,
                      subject.subjectColor
                    )

                    return (
                      <div key={subject.subjectLevelId}>
                        <button
                          className="flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          onClick={() =>
                            setSelectedSubjectId(subject.subjectLevelId)
                          }
                          type="button"
                        >
                          <span
                            aria-hidden
                            className="h-9 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: subjectColor.border }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {subject.subjectName}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {m.mobile_reports_subject_meta({
                                coefficient: subject.coefficient,
                              })}
                            </div>
                          </div>
                          <ReportGradeBadge
                            gradingScale={selectedGradingScale}
                            value={
                              academicAccessBlocked ? null : subject.average
                            }
                          />
                        </button>
                        {index < subjects.length - 1 && <Separator />}
                      </div>
                    )
                  })}
                </Card>
              ) : (
                <DashboardState
                  description={
                    activePeriodId
                      ? m.mobile_reports_no_subject_description()
                      : m.mobile_reports_no_period_description()
                  }
                  kind="empty"
                  title={
                    activePeriodId
                      ? m.mobile_reports_no_subject_title()
                      : m.mobile_reports_no_period_title()
                  }
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ParentReportSummaryCard({
  child,
  isPaymentBlocked = false,
  showIdentity = true,
  schoolName,
}: {
  child: ParentChildSummary | ParentGradesChild
  isPaymentBlocked?: boolean
  showIdentity?: boolean
  schoolName: string | null
}) {
  const average = isPaymentBlocked
    ? "-"
    : "periodAverage" in child
      ? formatGradeScore(child.periodAverage)
      : "-"

  return (
    <Card className="gap-0 border-brand-dark bg-brand-soft p-0">
      <div className="flex items-center gap-3 p-4">
        {showIdentity ? (
          <PersonAvatar
            className="size-11"
            name={formatReportsChildName(child)}
            size="lg"
            src={child.photoUrl}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {showIdentity ? (
            <div className="truncate text-sm font-semibold">
              {formatReportsChildName(child)}
            </div>
          ) : null}
          <div className="truncate text-xs font-medium text-brand-dark">
            {formatReportsChildClass(child)}
            {schoolName ? ` - ${schoolName}` : ""}
          </div>
          <div className="mt-0.5 text-xs text-brand-dark">
            {isPaymentBlocked
              ? m.mobile_reports_rank_unavailable()
              : formatReportsRank(child)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {m.mobile_average()}
          </div>
          <div className="font-mono text-3xl leading-none font-bold text-brand-dark">
            {average}
          </div>
        </div>
      </div>
    </Card>
  )
}

function ParentReportCardStatus({
  reportCard,
}: {
  reportCard: ChildReportCard | null
}) {
  if (!reportCard) {
    return (
      <Card className="gap-0 border-warning bg-grade-mid-bg p-0">
        <div className="flex items-center gap-3 p-4">
          <Badge className="size-10 rounded-lg p-0" variant="warning">
            <Clock3 />
          </Badge>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-grade-mid">
              {m.mobile_reports_bulletin_unavailable()}
            </div>
            <div className="text-xs text-grade-mid">
              {m.mobile_reports_bulletin_unavailable_description()}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card category="academic" className="gap-0 p-0">
      <div className="flex items-center gap-3 p-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-role-teacher-bg text-cat-academic">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {m.mobile_reports_bulletin_published({
              period: formatReportPeriodShort(reportCard),
            })}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {m.mobile_reports_available_since({
              date: fmtDate(reportCard.generatedAt, "short"),
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

function AcademicAccessBlockedCard({
  blockState,
  onOpenPayments,
  periodLabel,
}: {
  blockState: AcademicAccessBlockState
  onOpenPayments: () => void
  periodLabel: string | null
}) {
  const isCardBlocked = blockState.reason === "card"

  return (
    <Card className="gap-3 border-warning bg-grade-mid-bg p-4">
      <div className="flex items-start gap-3">
        <Badge className="size-10 rounded-lg p-0" variant="warning">
          <AlertTriangle />
        </Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-grade-mid">
            {isCardBlocked
              ? teacherCopy(
                  "Acces bloque - carte Lernn",
                  "Access blocked - Lernn card"
                )
              : m.mobile_reports_payment_blocked()}
          </p>
          <p className="mt-1 text-xs leading-5 text-grade-mid">
            {isCardBlocked
              ? teacherCopy(
                  "La carte Lernn de cet eleve n'est pas regularisee. Rapprochez-vous de l'administration de l'ecole pour retablir l'acces.",
                  "This student's Lernn card has not been settled. Please contact the school administration to restore access."
                )
              : blockState.amount && blockState.amount > 0
                ? formatAcademicBlockedAmountDescription(
                    blockState.amount,
                    periodLabel
                  )
                : m.mobile_reports_payment_blocked_description()}
          </p>
        </div>
      </div>
      {isCardBlocked ? null : (
        <Button
          className="w-full rounded-full"
          onClick={onOpenPayments}
          type="button"
          variant="outline"
        >
          <WalletCards data-icon="inline-start" />
          {teacherCopy("Voir les paiements", "View payments")}
        </Button>
      )}
    </Card>
  )
}

function formatAcademicBlockedAmountDescription(
  amount: number,
  periodLabel: string | null
) {
  const period = periodLabel?.trim()

  return teacherCopy(
    `La moyenne, le rang, le bulletin et les notes d'examen sont masques. Scolarite restante pour ${period ? `la periode ${period}` : "la periode selectionnee"} : ${fmtFCFA(amount)}.`,
    `The average, rank, report card, and exam grades are hidden. Tuition still due for ${period || "the selected period"}: ${fmtFCFA(amount)}.`
  )
}

function ParentSubjectDetail({
  childName,
  detail,
  gradingScale,
  isLoading,
  onBack,
  paymentBlockReason,
  periodLabel,
  subjectEyebrow,
  subject,
}: {
  childName: string
  detail: ParentChildSubjectGrades | null
  gradingScale: ParentGradingScale
  isLoading: boolean
  onBack: () => void
  paymentBlockReason: AcademicAccessBlockReason | null
  periodLabel: string
  subjectEyebrow?: string
  subject: ParentReportSubjectAverage
}) {
  const evaluations = detail?.grades ?? []
  const classAverage = getSubjectClassAverage(evaluations)
  const isPaymentBlocked = paymentBlockReason !== null
  const isCardBlocked = paymentBlockReason === "card"

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [subject.subjectLevelId])

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Button
          aria-label={m.mobile_back()}
          onClick={onBack}
          size="icon"
          variant="ghost"
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold tracking-[0.14em] text-brand-dark uppercase">
            {subjectEyebrow ??
              m.mobile_reports_subject_eyebrow({
                child: getFirstName(childName),
                period: periodLabel,
              })}
          </p>
          <h1 className="truncate text-xl leading-tight font-bold">
            {subject.subjectName}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {m.mobile_reports_subject_meta({
              coefficient: subject.coefficient,
            })}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        {isPaymentBlocked ? (
          <Card className="gap-2 border-warning bg-grade-mid-bg p-4">
            <div className="flex items-start gap-3">
              <Badge className="size-9 rounded-lg p-0" variant="warning">
                <AlertTriangle />
              </Badge>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-grade-mid">
                  {teacherCopy(
                    "Moyenne de matiere masquee",
                    "Subject average hidden"
                  )}
                </p>
                <p className="mt-1 text-xs leading-5 text-grade-mid">
                  {isCardBlocked
                    ? teacherCopy(
                        "L'acces aux resultats est suspendu car la carte Lernn n'est pas regularisee. Rapprochez-vous de l'administration de l'ecole.",
                        "Access to results is suspended because the Lernn card has not been settled. Please contact the school administration."
                      )
                    : teacherCopy(
                        "L'examen final est masque jusqu'a regularisation de la scolarite. Les autres notes publiees restent visibles.",
                        "The final exam is hidden until tuition is settled. Other published grades remain visible."
                      )}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="gap-0 border-brand-dark bg-brand-soft p-0">
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-brand-dark uppercase">
                  {m.mobile_reports_period_average({
                    period: periodLabel,
                  })}
                </div>
                <div className="font-mono text-4xl leading-none font-bold text-brand-dark">
                  {formatGradeScore(subject.average)}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs leading-6 text-brand-dark">
                <div>
                  {m.mobile_reports_class_average({
                    average: formatGradeScore(classAverage),
                  })}
                </div>
                <div>
                  {m.mobile_reports_evolution({
                    value: "-",
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {!isPaymentBlocked && !isLoading && evaluations.length > 0 ? (
          <SubjectGradesEvolutionChart
            evaluations={evaluations}
            gradingScale={gradingScale}
          />
        ) : null}

        <div className="flex flex-col gap-2">
          <SectionTitle>{m.mobile_reports_evaluations()}</SectionTitle>
          {isLoading ? (
            <Card className="gap-3" size="sm">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ) : evaluations.length > 0 ? (
            <Card className="gap-0 p-0">
              {evaluations.map((evaluation, index) => (
                <div key={evaluation.evaluationId}>
                  <div className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {evaluation.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {formatEvaluationType(evaluation.type)} -{" "}
                        {m.mobile_reports_evaluation_meta({
                          coefficient: evaluation.weight,
                          date: fmtDate(evaluation.date, "short"),
                        })}
                      </div>
                    </div>
                    <ReportGradeBadge
                      gradingScale={gradingScale}
                      value={
                        shouldMaskSubjectEvaluationScore(
                          evaluation,
                          paymentBlockReason
                        )
                          ? null
                          : evaluation.score
                      }
                    />
                  </div>
                  {index < evaluations.length - 1 && <Separator />}
                </div>
              ))}
            </Card>
          ) : (
            <DashboardState
              description={m.mobile_reports_no_evaluation_description()}
              kind="empty"
              title={m.mobile_no_evaluation()}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <SectionTitle>{m.mobile_reports_teacher_appreciation()}</SectionTitle>
          <Card size="sm">
            <CardContent className="px-0">
              <p className="text-sm leading-6 text-muted-foreground">
                {m.mobile_reports_no_appreciation()}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {detail?.teacherName ?? m.mobile_reports_teacher_unavailable()}{" "}
                - {periodLabel}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SubjectGradesEvolutionChart({
  evaluations,
  gradingScale,
}: {
  evaluations: ParentSubjectGrade[]
  gradingScale: ParentGradingScale
}) {
  const scoredEvaluations = evaluations.filter(
    (evaluation) => evaluation.score !== null
  )
  const chartItems = scoredEvaluations.map((evaluation, index) => {
    const score = evaluation.score ?? 0
    const ratio =
      gradingScale.max > gradingScale.min
        ? Math.max(
            0,
            Math.min(
              1,
              (score - gradingScale.min) / (gradingScale.max - gradingScale.min)
            )
          )
        : 0

    return {
      barClassName: getGradeEvolutionBarClassName(score, gradingScale),
      dateLabel: fmtDate(evaluation.date, "short"),
      id: evaluation.evaluationId,
      index,
      ratio,
      score,
      title: evaluation.title,
    }
  })

  if (!chartItems.length) return null

  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>
        {getRouteLocale() === "fr" ? "Evolution des notes" : "Grade evolution"}
      </SectionTitle>
      <Card className="gap-3 p-4">
        <div className="relative h-32">
          <div className="absolute inset-x-0 top-2 bottom-8 flex flex-col justify-between border-y border-border/60">
            {Array.from({ length: 4 }).map((_, index) => (
              <span className="border-t border-border/40" key={index} />
            ))}
          </div>
          <div
            className="absolute inset-x-0 top-2 bottom-8 grid items-end gap-2"
            style={{
              gridTemplateColumns: `repeat(${chartItems.length}, minmax(0, 1fr))`,
            }}
          >
            {chartItems.map((item) => (
              <div
                className="flex h-full min-w-0 flex-col justify-end gap-1"
                key={item.id}
              >
                <span className="text-center font-mono text-[10px] font-semibold text-muted-foreground">
                  {formatGradeScore(item.score)}
                </span>
                <div
                  aria-label={`${item.title}: ${formatGradeScore(item.score)}/${gradingScale.max}`}
                  className={cn(
                    "mx-auto w-full max-w-3 rounded-t-full",
                    item.barClassName
                  )}
                  style={{
                    height: `${Math.max(10, item.ratio * 76)}px`,
                  }}
                  title={`${item.title}: ${formatGradeScore(item.score)}/${gradingScale.max}`}
                />
              </div>
            ))}
          </div>
          <div
            className="absolute inset-x-0 bottom-0 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${chartItems.length}, minmax(0, 1fr))`,
            }}
          >
            {chartItems.map((item) => (
              <span
                className="truncate text-center text-[10px] text-muted-foreground"
                key={item.id}
              >
                {item.dateLabel}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ParentReportsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </Card>
      <Card className="gap-3 p-4">
        <Skeleton className="h-10 w-full" />
      </Card>
      <Card className="gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-2/3" />
      </Card>
    </div>
  )
}

function ParentPresence({
  academicYearContext,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  schoolId: string | null
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] =
    useState<PresenceDayEvents | null>(null)
  const [selectedPresenceAgendaDate, setSelectedPresenceAgendaDate] = useState<
    string | null
  >(null)
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonthDate(new Date())
  )
  const [view, setView] = useState<ParentPresenceView>("calendar")
  const monthRange = useMemo(
    () => getMonthRange(selectedMonth),
    [selectedMonth]
  )
  const dashboardQuery = useQuery({
    ...parentDashboardQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const dashboardChildren = dashboardQuery.data?.children
  const children = dashboardChildren ?? []
  const selectedChild =
    children.find((child) => child.identityId === selectedChildId) ??
    children[0] ??
    null
  const presenceQuery = useQuery({
    ...parentChildPresenceQueryOptions(
      schoolId ?? "",
      selectedChild?.identityId ?? "",
      monthRange.startDate,
      monthRange.endDate
    ),
    enabled: Boolean(schoolId && selectedChild?.identityId),
  })
  const presence = presenceQuery.data
  const presenceDayRows = useMemo(
    () => (presence ? getPresenceDayRows(presence, monthRange) : []),
    [monthRange, presence]
  )
  const presenceAgendaDays = selectedPresenceAgendaDate
    ? presenceDayRows.filter((day) => day.date === selectedPresenceAgendaDate)
    : presenceDayRows
  const openPresenceDayDetails = useCallback((dayEvents: PresenceDayEvents) => {
    setSelectedDayEvents(dayEvents)
  }, [])

  useEffect(() => {
    const currentChildren = dashboardChildren ?? []

    if (!currentChildren.length) {
      setSelectedChildId(null)
      return
    }

    if (
      !selectedChildId ||
      !currentChildren.some((child) => child.identityId === selectedChildId)
    ) {
      setSelectedChildId(currentChildren[0].identityId)
    }
  }, [dashboardChildren, selectedChildId])

  useEffect(() => {
    setSelectedDayEvents(null)
    setSelectedPresenceAgendaDate(null)
  }, [selectedChild?.identityId, monthRange.startDate])

  useEffect(() => {
    const year = academicYearContext.selectedYear
    if (!year) return
    setSelectedMonth(getInitialMonthForSchoolYear(year))
  }, [academicYearContext.selectedYear])

  return (
    <div className="min-h-[calc(100svh-5.5rem)]">
      <PresenceHeader
        onBack={onBack}
        subtitle={
          selectedChild
            ? `${m.mobile_presence()} · ${formatStudentName(selectedChild)}`
            : m.mobile_presence_subtitle()
        }
        title={fmtDate(selectedMonth, "month-year")}
      />
      <div className="flex flex-col gap-2 px-5 pt-2 pb-24">
        {dashboardQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : dashboardQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            kind="error"
            onAction={() => void dashboardQuery.refetch()}
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : !children.length ? (
          <DashboardState
            kind="empty"
            title={m.mobile_presence_no_child_title()}
            description={m.mobile_presence_no_child_description()}
          />
        ) : (
          <>
            <ChildrenScopeSelector
              children={children}
              idType="identity"
              mode="single"
              onSelectionChange={(ids) => setSelectedChildId(ids[0] ?? null)}
              selectedIds={selectedChild ? [selectedChild.identityId] : []}
            />
            <AcademicYearContextSelector context={academicYearContext} />
            {presenceQuery.isLoading ? (
              <DashboardState
                kind="loading"
                title={m.mobile_dashboard_loading()}
              />
            ) : presenceQuery.isError ? (
              <DashboardState
                actionLabel={m.auth_retry()}
                kind="error"
                onAction={() => void presenceQuery.refetch()}
                title={m.mobile_dashboard_error_title()}
                description={m.mobile_dashboard_error_description()}
              />
            ) : presence ? (
              <>
                <Tabs
                  className="gap-3"
                  value={view}
                  onValueChange={(value) =>
                    setView(value as ParentPresenceView)
                  }
                >
                  <PresenceStatsGrid presence={presence} />
                  <TabsList className="h-8 rounded-full border bg-background p-1 shadow-sm">
                    <TabsTrigger
                      className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                      value="calendar"
                    >
                      <CalendarDays data-icon="inline-start" />
                      {m.mobile_presence_calendar_tab()}
                    </TabsTrigger>
                    <TabsTrigger
                      className="rounded-full px-2 text-[11px] data-active:bg-brand-dark data-active:text-white data-active:shadow-none"
                      value="history"
                    >
                      <ListChecks data-icon="inline-start" />
                      {m.mobile_presence_history_tab()}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent className="mt-0" value="calendar">
                    <div className="flex flex-col gap-3">
                      <PresenceCalendar
                        monthDate={selectedMonth}
                        onNextMonth={() =>
                          setSelectedMonth((date) =>
                            clampMonthDate(
                              addMonths(date, 1),
                              academicYearContext.selectedYear
                                ? new Date(
                                    academicYearContext.selectedYear.startDate
                                  )
                                : null,
                              academicYearContext.selectedYear
                                ? new Date(
                                    academicYearContext.selectedYear.endDate
                                  )
                                : null
                            )
                          )
                        }
                        onPreviousMonth={() =>
                          setSelectedMonth((date) =>
                            clampMonthDate(
                              addMonths(date, -1),
                              academicYearContext.selectedYear
                                ? new Date(
                                    academicYearContext.selectedYear.startDate
                                  )
                                : null,
                              academicYearContext.selectedYear
                                ? new Date(
                                    academicYearContext.selectedYear.endDate
                                  )
                                : null
                            )
                          )
                        }
                        onSelectDay={(date) =>
                          setSelectedPresenceAgendaDate((current) =>
                            current === date ? null : date
                          )
                        }
                        presence={presence}
                        range={monthRange}
                        selectedDate={selectedPresenceAgendaDate}
                      />
                      <PresenceDayAgenda
                        date={selectedPresenceAgendaDate}
                        days={presenceAgendaDays}
                        onSelectDay={openPresenceDayDetails}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent className="mt-0" value="history">
                    <PresenceHistory
                      onSelectDay={openPresenceDayDetails}
                      presence={presence}
                      range={monthRange}
                    />
                  </TabsContent>
                </Tabs>

                {presence.plannedAbsences.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <SectionTitle>
                      {m.mobile_presence_planned_absences()}
                    </SectionTitle>
                    <PlannedAbsenceList presence={presence} />
                  </div>
                )}
                <FloatingControls align="end">
                  <MonthSwitcher
                    max={
                      academicYearContext.selectedYear
                        ? new Date(academicYearContext.selectedYear.endDate)
                        : null
                    }
                    min={
                      academicYearContext.selectedYear
                        ? new Date(academicYearContext.selectedYear.startDate)
                        : null
                    }
                    onChange={setSelectedMonth}
                    onNext={() =>
                      setSelectedMonth((date) => addMonths(date, 1))
                    }
                    onPrevious={() =>
                      setSelectedMonth((date) => addMonths(date, -1))
                    }
                    value={selectedMonth}
                  />
                </FloatingControls>
                <PresenceDayDetailsDrawer
                  childName={
                    selectedChild ? formatStudentName(selectedChild) : ""
                  }
                  day={selectedDayEvents}
                  onOpenChange={(open) => {
                    if (!open) setSelectedDayEvents(null)
                  }}
                />
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function PresenceStatsGrid({ presence }: { presence: ParentChildPresence }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <PresenceStatCard
        label={m.mobile_status_present_plural()}
        tone="success"
        value={`${presence.stats.presentDays}`}
      />
      <PresenceStatCard
        label={m.mobile_presence_lates()}
        tone="warning"
        value={`${presence.stats.lateDays}`}
      />
    </div>
  )
}

function PresenceStatCard({
  label,
  tone,
  value,
}: {
  label: string
  tone: "danger" | "success" | "warning"
  value: string
}) {
  return (
    <Card className="h-14 justify-center gap-1 rounded-lg !p-2" size="sm">
      <CardDescription className="text-[9px] font-bold tracking-[0.14em] uppercase">
        {label}
      </CardDescription>
      <div
        className={cn(
          "font-mono text-base font-bold",
          tone === "success" && "text-brand-dark",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive"
        )}
      >
        {value}
      </div>
    </Card>
  )
}

function PresenceCalendar({
  monthDate,
  onNextMonth,
  onSelectDay,
  onPreviousMonth,
  presence,
  range,
  selectedDate,
}: {
  monthDate: Date
  onNextMonth?: () => void
  onSelectDay: (date: string) => void
  onPreviousMonth?: () => void
  presence: ParentChildPresence
  range: MonthRange
  selectedDate: string | null
}) {
  const cells = buildPresenceCalendar(presence, monthDate, range)
  const { swipeDirection, swipeHandlers } = useCalendarMonthSwipe({
    onNextMonth,
    onPreviousMonth,
  })

  return (
    <Card className="gap-3 rounded-lg p-3">
      <div className="grid grid-cols-7 justify-items-center gap-1 text-center text-[8px] font-semibold text-muted-foreground">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
          <span
            className="grid size-6 place-items-center"
            key={`${day}-${index}`}
          >
            {day}
          </span>
        ))}
      </div>
      <div
        className={cn(
          "grid touch-pan-y grid-cols-7 justify-items-center gap-1",
          swipeDirection === "next"
            ? "animate-in duration-150 fade-in-0 slide-in-from-right-4"
            : "animate-in duration-150 fade-in-0 slide-in-from-left-4"
        )}
        key={formatMonthInputValue(monthDate)}
        {...swipeHandlers}
      >
        {cells.map((cell, index) =>
          cell ? (
            (() => {
              const courseDot = getPresenceCourseCalendarDot(cell.dayEvents)
              const canSelect = Boolean(cell.dayEvents)
              const isSelected = selectedDate === cell.isoDate

              return (
                <button
                  aria-label={`${fmtDate(`${cell.isoDate}T00:00:00`, "medium")} ${formatPresenceCalendarStatus(cell.status)}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative grid size-7 place-items-center rounded-[7px] border font-mono text-[10px] font-semibold transition-colors",
                    presenceCalendarCellClass(cell.status),
                    canSelect &&
                      "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isSelected &&
                      "ring-2 ring-brand ring-offset-2 ring-offset-background"
                  )}
                  disabled={!canSelect}
                  key={cell.isoDate}
                  onClick={() => onSelectDay(cell.isoDate)}
                  type="button"
                >
                  {cell.day}
                  {cell.hasJustification ? (
                    <span className="absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full bg-brand ring-1 ring-background" />
                  ) : null}
                  {courseDot ? (
                    <span
                      className={cn(
                        "absolute bottom-0.5 size-1.5 rounded-full ring-1 ring-background",
                        courseDot.className
                      )}
                    />
                  ) : null}
                </button>
              )
            })()
          ) : (
            <div className="size-7" key={`empty-${index}`} />
          )
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] text-muted-foreground">
        <PresenceLegendItem
          shape="cell"
          className="border-transparent bg-brand/10 text-brand"
          label={teacherCopy("Portail OK", "Gate OK")}
        />
        <PresenceLegendItem
          shape="cell"
          className="border-transparent bg-warning/10 text-warning"
          label={teacherCopy("Portail retard", "Gate late")}
        />
        <PresenceLegendItem
          className="bg-brand"
          label={teacherCopy("Cours OK", "Course OK")}
        />
        <PresenceLegendItem
          className="bg-destructive"
          label={teacherCopy("Cours absent", "Course absent")}
        />
        <PresenceLegendItem
          className="bg-warning"
          label={teacherCopy("Cours retard", "Course late")}
        />
        <PresenceLegendItem
          className="bg-info"
          label={teacherCopy("Cours excuse", "Course excused")}
        />
      </div>
    </Card>
  )
}

function PresenceLegendItem({
  className,
  label,
  shape = "dot",
}: {
  className: string
  label: string
  shape?: "cell" | "dot"
}) {
  return (
    <span className="inline-flex items-center gap-1.5 leading-none whitespace-nowrap">
      <span
        className={cn(
          "inline-grid shrink-0 place-items-center align-middle",
          shape === "cell"
            ? "size-3 rounded-[4px] border"
            : "size-2 rounded-full",
          className
        )}
      />
      {label}
    </span>
  )
}

function PresenceDayDetailsDrawer({
  childName,
  day,
  onOpenChange,
  scope = "parent",
}: {
  childName?: string
  day: PresenceDayEvents | null
  onOpenChange: (open: boolean) => void
  scope?: "parent" | "student"
}) {
  const status = day?.status ?? "present"
  const justification =
    day?.events.find((event) => event.justification)?.justification ?? null
  const showStudentIdentity = scope === "parent" && Boolean(childName)
  const courseItems = day?.courseItems ?? []

  return (
    <Drawer open={Boolean(day)} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[82svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle className="truncate text-xl">
            {m.mobile_presence_day_details_title()}
          </DrawerTitle>
          <DrawerDescription className="truncate">
            {day ? fmtDate(`${day.date}T00:00:00`, "medium") : ""}
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {day ? (
            <div className="flex flex-col gap-4">
              {showStudentIdentity ? (
                <>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar
                      initials={getInitials(childName ?? "")}
                      tone="brand"
                    />
                    <div className="min-w-0 flex-1">
                      <CardDescription>
                        {m.mobile_presence_day_students()}
                      </CardDescription>
                      <CardTitle className="truncate text-base">
                        {childName}
                      </CardTitle>
                    </div>
                    <Badge variant={presenceStatusBadgeVariant(status)}>
                      {formatPresenceEventStatus(status)}
                    </Badge>
                  </div>
                  <Separator />
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <CardDescription>
                    {m.mobile_presence_day_status()}
                  </CardDescription>
                  <Badge variant={presenceStatusBadgeVariant(status)}>
                    {formatPresenceEventStatus(status)}
                  </Badge>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <PresenceDetailSectionTitle>
                  {teacherCopy("Portail", "Gate")}
                </PresenceDetailSectionTitle>
                <PresenceDetailRow
                  icon={LogIn}
                  label={m.mobile_presence_entry()}
                  value={
                    day.entry
                      ? fmtTime(day.entry.createdAt)
                      : m.mobile_presence_not_recorded()
                  }
                />
                <PresenceDetailRow
                  icon={LogOut}
                  label={m.mobile_presence_exit()}
                  meta={
                    day.exit?.durationMinutes != null
                      ? `${m.mobile_presence_duration()} ${fmtDuration(day.exit.durationMinutes)}`
                      : undefined
                  }
                  value={
                    day.exit
                      ? fmtTime(day.exit.createdAt)
                      : m.mobile_presence_not_recorded()
                  }
                />
                {day.entry?.flag === "LATE" && day.entry.minutesLate ? (
                  <PresenceDetailRow
                    icon={Clock3}
                    label={m.mobile_status_late()}
                    value={m.mobile_presence_late_minutes({
                      minutes: day.entry.minutesLate,
                    })}
                  />
                ) : null}
                {justification ? (
                  <PresenceDetailRow
                    icon={FileCheck2}
                    label={m.mobile_presence_justification()}
                    meta={justification.status}
                    value={justification.reason}
                  />
                ) : null}
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <PresenceDetailSectionTitle>
                  {teacherCopy("Cours", "Courses")}
                </PresenceDetailSectionTitle>
                {courseItems.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {courseItems.map((item) => (
                      <CourseAttendanceDetailItem
                        item={item}
                        key={item.attendanceId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    {m.mobile_presence_not_recorded()}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="flex-1" variant="outline">
              {m.mobile_close()}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function PresenceDetailRow({
  icon: Icon,
  label,
  meta,
  value,
}: {
  icon: LucideIcon
  label: string
  meta?: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Badge className="size-8 p-0" variant="neutral">
        <Icon />
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {label}
        </div>
        <div className="truncate text-sm font-semibold">{value}</div>
        {meta ? (
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        ) : null}
      </div>
    </div>
  )
}

function PresenceDetailSectionTitle({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </div>
  )
}

function CourseAttendanceDetailItem({
  item,
}: {
  item: StudentCourseAttendanceItem
}) {
  const status = getCourseAttendanceDisplayStatus(item)
  const timeRange = `${formatCourseAttendanceTime(item.startTime)} - ${formatCourseAttendanceTime(item.endTime)}`
  const teacherName =
    item.teacher.name ??
    [item.teacher.firstName, item.teacher.lastName].filter(Boolean).join(" ")

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <Badge
          className="mt-0.5 size-8 p-0"
          variant={presenceStatusBadgeVariant(status)}
        >
          {status === "present" ? (
            <CheckCircle2 />
          ) : status === "late" ? (
            <Clock3 />
          ) : (
            <AlertTriangle />
          )}
        </Badge>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {item.subject.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {timeRange}
                {teacherName ? ` - ${teacherName}` : ""}
              </div>
            </div>
            <Badge variant={presenceStatusBadgeVariant(status)}>
              {formatCourseAttendanceStatus(item.status)}
            </Badge>
          </div>
          {item.lateMinutes != null && item.lateMinutes > 0 ? (
            <div className="mt-2 text-xs text-muted-foreground">
              {m.mobile_presence_late_minutes({ minutes: item.lateMinutes })}
            </div>
          ) : null}
          {item.note ? (
            <div className="mt-2 text-xs text-muted-foreground">
              {item.note}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PresenceDayAgenda({
  date,
  days,
  onSelectDay,
}: {
  date: string | null
  days: PresenceDayEvents[]
  onSelectDay: (day: PresenceDayEvents) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>
        {date
          ? fmtDate(`${date}T00:00:00`, "medium")
          : teacherCopy("Evenements du mois", "Month events")}
      </SectionTitle>
      {days.length ? (
        <div className="flex flex-col gap-2">
          {days.map((dayEvents) => (
            <Card
              className="gap-0 overflow-hidden rounded-lg p-0"
              key={dayEvents.date}
            >
              <PresenceHistoryRow
                dayEvents={dayEvents}
                onSelectDay={onSelectDay}
              />
            </Card>
          ))}
        </div>
      ) : (
        <CalendarAgendaEmptyState
          description={teacherCopy(
            date
              ? "Choisissez une autre date ou revenez aux evenements du mois."
              : "Les evenements du mois apparaitront ici.",
            date
              ? "Choose another date or return to the month events."
              : "Month events will appear here."
          )}
          title={teacherCopy(
            date ? "Aucun evenement ce jour" : "Aucun evenement ce mois",
            date ? "No event that day" : "No event this month"
          )}
        />
      )}
    </div>
  )
}

function PresenceHistory({
  onSelectDay,
  presence,
  range,
}: {
  onSelectDay: (day: PresenceDayEvents) => void
  presence: ParentChildPresence
  range: MonthRange
}) {
  const dayRows = getPresenceDayRows(presence, range)

  if (!dayRows.length) {
    return (
      <DashboardState
        kind="empty"
        title={m.mobile_presence_history_empty_title()}
        description={m.mobile_presence_history_empty_description()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {dayRows.map((dayEvents) => (
        <Card
          className="gap-0 overflow-hidden rounded-lg p-0"
          key={dayEvents.date}
        >
          <PresenceHistoryRow dayEvents={dayEvents} onSelectDay={onSelectDay} />
        </Card>
      ))}
    </div>
  )
}

function PresenceHistoryRow({
  dayEvents,
  onSelectDay,
}: {
  dayEvents: PresenceDayEvents
  onSelectDay: (day: PresenceDayEvents) => void
}) {
  const status = dayEvents.status
  const primaryEvent = dayEvents.events[0]

  return (
    <button
      className="flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={() => {
        onSelectDay(dayEvents)
      }}
      type="button"
    >
      <Badge
        className="size-8 p-0"
        variant={presenceStatusBadgeVariant(status)}
      >
        <PresenceEventIcon status={status} />
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {fmtDate(dayEvents.date, "medium")}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {primaryEvent
            ? formatPresenceEventDescription(primaryEvent)
            : formatCourseAttendanceHistoryDescription(dayEvents.courseItems)}
        </div>
      </div>
      <Badge variant={presenceStatusBadgeVariant(status)}>
        {formatPresenceEventStatus(status)}
      </Badge>
    </button>
  )
}

function PresenceEventIcon({
  status,
}: {
  status: "absent" | "late" | "present" | "unknown"
}) {
  switch (status) {
    case "present":
      return <CheckCircle2 />
    case "late":
      return <Clock3 />
    case "absent":
      return <AlertTriangle />
    case "unknown":
      return <FileCheck2 />
  }
}

function PlannedAbsenceList({ presence }: { presence: ParentChildPresence }) {
  return (
    <Card className="gap-0 p-0">
      {presence.plannedAbsences.map((absence, index) => (
        <div key={absence.id}>
          <div className="flex items-center gap-3 p-4">
            <Badge className="size-8 p-0" variant="warning">
              <CalendarDays />
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {fmtDate(absence.date, "medium")}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {formatPlannedAbsenceReason(absence.reason)}
                {absence.note ? ` - ${absence.note}` : ""}
              </div>
            </div>
            <Badge
              variant={
                absence.status === "ACKNOWLEDGED" ? "success" : "warning"
              }
            >
              {formatPlannedAbsenceStatus(absence.status)}
            </Badge>
          </div>
          {index < presence.plannedAbsences.length - 1 && <Separator />}
        </div>
      ))}
    </Card>
  )
}

function ParentPayments({
  academicYearContext,
  onBack,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  schoolId: string | null
}) {
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>(
    []
  )
  const paymentsQuery = useQuery({
    ...parentPaymentsSummaryQueryOptions(
      schoolId ?? "",
      academicYearContext.selectedYearId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const summary = paymentsQuery.data
  const visibleSummary = useMemo(
    () => getFilteredPaymentSummary(summary, selectedEnrollmentIds),
    [selectedEnrollmentIds, summary]
  )
  const paymentChildren = visibleSummary?.children ?? []
  const upcomingPayments = visibleSummary
    ? getUpcomingPaymentLines(visibleSummary)
    : []
  const receiptPayments =
    visibleSummary?.payments.filter((payment) => payment.receipt) ?? []

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_payments_subtitle()}
        title={m.mobile_nav_payments()}
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        {summary && summary.children.length > 1 ? (
          <ChildrenScopeSelector
            children={summary.children.map((entry) => entry.child)}
            idType="enrollment"
            mode="multiple"
            onSelectionChange={setSelectedEnrollmentIds}
            selectedIds={selectedEnrollmentIds}
          />
        ) : null}
        {paymentsQuery.isLoading || academicYearContext.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : paymentsQuery.isError || academicYearContext.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            kind="error"
            onAction={() => void paymentsQuery.refetch()}
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : summary ? (
          <PaymentOverviewCards
            paymentChildren={paymentChildren}
            receiptPayments={receiptPayments}
            summary={visibleSummary ?? summary}
          />
        ) : null}

        {!paymentsQuery.isLoading &&
        !paymentsQuery.isError &&
        visibleSummary ? (
          <>
            <SectionTitle>{m.mobile_payments_due_tab()}</SectionTitle>
            {upcomingPayments.length ? (
              <Card className="gap-0 p-0">
                {upcomingPayments.map((payment, index) => (
                  <div key={payment.id}>
                    <UpcomingPaymentRow payment={payment} />
                    {index < upcomingPayments.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                kind="empty"
                title={m.mobile_no_balance_title()}
                description={m.mobile_no_balance_description()}
              />
            )}

            <SectionTitle>{m.mobile_payments_history_tab()}</SectionTitle>
            {!visibleSummary.paymentHistoryAvailable ? (
              <DashboardState
                kind="error"
                title={m.mobile_payments_history_limited_title()}
                description={m.mobile_payments_history_limited_description()}
              />
            ) : receiptPayments.length ? (
              <Card className="gap-0 p-0">
                {receiptPayments.map((payment, index) => (
                  <div key={payment.id}>
                    <PaymentReceiptRow payment={payment} />
                    {index < receiptPayments.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                kind="empty"
                title={m.mobile_no_receipt_title()}
                description={m.mobile_no_receipt_description()}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

function PaymentOverviewCards({
  paymentChildren,
  receiptPayments,
  scope = "parent",
  summary,
}: {
  paymentChildren: ParentPaymentChild[]
  receiptPayments: PaymentListItem[]
  scope?: "parent" | "student"
  summary: ParentPaymentsSummary
}) {
  const hasBalance = summary.totalBalance > 0
  const paidProgress = getPaymentPaidProgress(summary)
  const monthlyActivity = getPaymentMonthlyActivity(summary.payments)
  const maxMonthlyAmount = Math.max(
    1,
    ...monthlyActivity.map((item) => item.amount)
  )
  const lastReceipt = getLastReceiptPayment(receiptPayments)
  const topChild = getTopPaidChild(paymentChildren)

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-4 p-4">
        <CardHeader className="px-0">
          <CardDescription>{m.mobile_payment_progress_title()}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <Tabs defaultValue="progress">
            <TabsList className="grid w-full grid-cols-2 rounded-full border bg-background p-1 shadow-sm">
              <TabsTrigger
                className="rounded-full data-active:bg-brand-dark data-active:text-white"
                value="progress"
              >
                {m.mobile_payment_tab_progress()}
              </TabsTrigger>
              <TabsTrigger
                className="rounded-full data-active:bg-brand-dark data-active:text-white"
                value="activity"
              >
                {m.mobile_payment_tab_activity()}
              </TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="progress">
              <div className="flex justify-center py-1">
                <FeeProgressRing
                  centerClassName="size-[7.6rem] rounded-full bg-background"
                  percent={paidProgress}
                  size={144}
                  thickness={5}
                >
                  <div>
                    <div className="font-mono text-2xl leading-none font-bold">
                      {fmtCompactAmount(summary.totalBalance)}
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground">
                      FCFA
                    </div>
                    <div className="mt-1 text-[9px] text-muted-foreground">
                      {m.mobile_payment_progress_percent({
                        percent: paidProgress,
                      })}
                    </div>
                  </div>
                </FeeProgressRing>
              </div>
            </TabsContent>
            <TabsContent className="mt-4" value="activity">
              <div className="grid grid-cols-12 gap-1">
                {monthlyActivity.map((item) => {
                  const height = Math.max(
                    item.amount > 0 ? 14 : 4,
                    Math.round((item.amount / maxMonthlyAmount) * 52)
                  )

                  return (
                    <div
                      className="flex min-w-0 flex-col items-center gap-1"
                      key={item.key}
                    >
                      <span
                        className={cn(
                          "h-3 max-w-full truncate text-[7px] font-semibold",
                          item.amount > 0
                            ? "text-foreground"
                            : "text-muted-foreground/45"
                        )}
                      >
                        {fmtCompactAmount(item.amount)}
                      </span>
                      <div className="flex h-14 w-full items-end justify-center">
                        <div
                          aria-label={`${item.label} ${fmtFCFA(item.amount)}`}
                          className={cn(
                            "w-full max-w-4 rounded-t-[4px] transition-all",
                            item.amount > 0 ? "bg-brand" : "bg-muted"
                          )}
                          style={{ height }}
                        />
                      </div>
                      <span className="text-[8px] font-medium text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex flex-col gap-2 text-xs">
            <PaymentInsightRow
              label={m.mobile_payment_total_billed()}
              value={fmtFCFA(summary.totalFees)}
            />
            <Separator />
            <PaymentInsightRow
              label={m.mobile_payment_remaining_due()}
              value={fmtFCFA(summary.totalBalance)}
              valueClassName={hasBalance ? "text-destructive" : "text-success"}
            />
            <Separator />
            <PaymentInsightRow
              label={teacherCopy(
                "Scolarite bloquante restante",
                "Blocking tuition due"
              )}
              value={fmtFCFA(summary.tuitionBalance)}
              valueClassName={
                summary.tuitionBalance > 0 ? "text-destructive" : "text-success"
              }
            />
            <Separator />
            <PaymentInsightRow
              label={m.mobile_payment_last_receipt()}
              value={
                lastReceipt
                  ? fmtDate(lastReceipt.createdAt, "short")
                  : m.mobile_receipt_unavailable()
              }
            />
            {scope === "parent" ? (
              <>
                <Separator />
                <PaymentInsightRow
                  label={m.mobile_payment_top_child()}
                  value={topChild ? topChild.name : "-"}
                />
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentInsightRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate text-muted-foreground">{label}</span>
      <span className={cn("truncate text-right font-semibold", valueClassName)}>
        {value}
      </span>
    </div>
  )
}

function UpcomingPaymentRow({
  payment,
  scope = "parent",
}: {
  payment: UpcomingPaymentLine
  scope?: "parent" | "student"
}) {
  const Icon = payment.overdue ? AlertTriangle : Clock3
  const date = payment.dueDate ? fmtDate(payment.dueDate, "short") : null
  const subtitle = date
    ? scope === "student"
      ? payment.overdue
        ? m.mobile_payment_overdue_since_short({ date })
        : m.mobile_payment_due_date({ date })
      : payment.overdue
        ? m.mobile_payment_overdue_since({
            child: payment.child.firstName,
            date,
          })
        : m.mobile_payment_due_for_child({
            child: payment.child.firstName,
            date,
          })
    : payment.child.firstName

  return (
    <div className="flex items-center gap-3 p-4">
      <Badge
        className="size-8 rounded-lg p-0"
        variant={payment.overdue ? "destructive" : "warning"}
      >
        <Icon />
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{payment.label}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <span
        className={cn(
          "font-mono text-sm font-semibold",
          payment.overdue ? "text-destructive" : "text-foreground"
        )}
      >
        {fmtFCFA(payment.amount)}
      </span>
    </div>
  )
}

function PaymentReceiptRow({
  payment,
  scope = "parent",
}: {
  payment: PaymentListItem
  scope?: "parent" | "student"
}) {
  const studentName = payment.enrollment
    ? `${payment.enrollment.person.firstName} ${payment.enrollment.person.lastName}`.trim()
    : m.mobile_payment_student_unknown()

  return (
    <div className="flex items-center gap-3 p-4">
      <Badge className="size-8 rounded-lg p-0" variant="success">
        <CheckCircle2 />
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {formatPaymentHistoryTitle(payment)}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {scope === "parent"
            ? `${studentName} - ${fmtDate(payment.createdAt, "medium")}`
            : fmtDate(payment.createdAt, "medium")}
        </div>
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold text-success">
        {fmtFCFA(payment.amount)}
      </span>
    </div>
  )
}

function getPaymentPaidProgress(summary: ParentPaymentsSummary) {
  if (summary.totalFees <= 0) {
    return summary.totalBalance > 0 ? 0 : 100
  }

  const paidAmount = Math.max(summary.totalFees - summary.totalBalance, 0)

  return Math.min(
    100,
    Math.max(0, Math.round((paidAmount / summary.totalFees) * 100))
  )
}

function getFilteredPaymentSummary(
  summary: ParentPaymentsSummary | undefined,
  selectedEnrollmentIds: string[]
): ParentPaymentsSummary | null {
  if (!summary) return null

  const selectedSet = new Set(selectedEnrollmentIds)
  const children =
    selectedEnrollmentIds.length === 0
      ? summary.children
      : summary.children.filter((entry) =>
          selectedSet.has(entry.child.enrollmentId)
        )
  const enrollmentIds = new Set(
    children.map((entry) => entry.child.enrollmentId)
  )
  const payments = summary.payments.filter((payment) =>
    enrollmentIds.has(payment.enrollmentId)
  )

  return {
    ...summary,
    children,
    payments,
    totalBalance: children.reduce(
      (sum, entry) => sum + entry.balance.balance,
      0
    ),
    totalFees: children.reduce(
      (sum, entry) => sum + entry.balance.totalFees,
      0
    ),
    totalPaid: children.reduce(
      (sum, entry) => sum + entry.balance.totalPaid,
      0
    ),
    tuitionBalance: children.reduce(
      (sum, entry) => sum + entry.tuitionBalance,
      0
    ),
    tuitionPaid: children.reduce((sum, entry) => sum + entry.tuitionPaid, 0),
    tuitionTotalFees: children.reduce(
      (sum, entry) => sum + entry.tuitionTotalFees,
      0
    ),
  }
}

function getPaymentMonthlyActivity(
  payments: PaymentListItem[]
): PaymentMonthlyActivity[] {
  const now = new Date()
  const academicStartYear =
    now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(academicStartYear, 8 + index, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const label = fmtMonthShort(date)

    return {
      amount: 0,
      key,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    }
  })
  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const payment of payments) {
    const date = new Date(payment.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const bucket = bucketByKey.get(key)

    if (bucket) {
      bucket.amount += payment.amount
    }
  }

  return buckets
}

function getLastReceiptPayment(payments: PaymentListItem[]) {
  return (
    [...payments].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )[0] ?? null
  )
}

function getTopPaidChild(children: ParentPaymentChild[]) {
  const topChild = [...children].sort(
    (left, right) => right.balance.totalPaid - left.balance.totalPaid
  )[0]

  if (!topChild || topChild.balance.totalPaid <= 0) {
    return null
  }

  return {
    amount: topChild.balance.totalPaid,
    name: topChild.child.firstName,
  }
}

function getUpcomingPaymentLines(
  summary: ParentPaymentsSummary
): UpcomingPaymentLine[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lines: UpcomingPaymentLine[] = []

  for (const entry of summary.children) {
    for (const fee of entry.balance.breakdown) {
      if (fee.remainingAmount <= 0) continue

      const remainingInstallments = fee.installments.filter(
        (installment) => installment.remainingAmount > 0
      )

      if (!remainingInstallments.length) {
        lines.push({
          amount: fee.remainingAmount,
          child: entry.child,
          dueDate: null,
          id: `${entry.child.enrollmentId}-${fee.feeLabel}`,
          label: formatFeeTypeLabel(fee.feeType, fee.feeLabel),
          overdue: false,
        })
        continue
      }

      for (const installment of remainingInstallments) {
        const dueDate = new Date(installment.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        lines.push({
          amount: installment.remainingAmount,
          child: entry.child,
          dueDate: installment.dueDate,
          id: `${entry.child.enrollmentId}-${fee.feeLabel}-${installment.id}`,
          label: formatFeeTypeLabel(fee.feeType, fee.feeLabel),
          overdue: installment.status === "OVERDUE" || dueDate < today,
        })
      }
    }
  }

  return lines.sort((left, right) => {
    if (left.overdue !== right.overdue) return left.overdue ? -1 : 1
    if (!left.dueDate || !right.dueDate) return left.dueDate ? -1 : 1
    return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
  })
}

function formatFeeTypeLabel(type: string | null, fallback?: string | null) {
  switch (type ?? fallback) {
    case "REGISTRATION":
      return teacherCopy("Inscription", "Registration")
    case "TUITION":
      return teacherCopy("Scolarite", "Tuition")
    case "CARD":
      return teacherCopy("Carte", "Card")
    case "OTHER":
      return teacherCopy("Autres frais", "Other fees")
    default:
      return fallback || teacherCopy("Autres frais", "Other fees")
  }
}

function formatPaymentHistoryTitle(payment: PaymentListItem) {
  const labels = [
    ...new Set(payment.allocations.map((allocation) => allocation.feeLabel)),
  ]

  return labels.length
    ? labels.map((label) => formatFeeTypeLabel(null, label)).join(", ")
    : (payment.receipt?.code ?? m.mobile_receipt_unavailable())
}

function NotificationsView() {
  const queryClient = useQueryClient()
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null)
  const notificationsQuery = useQuery(notificationsQueryOptions())
  const unreadQuery = useQuery(unreadNotificationsQueryOptions())
  const notifications = notificationsQuery.data?.data ?? []
  const unreadCount = unreadQuery.data ?? 0

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (notificationId) => {
      const now = new Date().toISOString()

      queryClient.setQueriesData<NotificationsPayload>(
        { queryKey: ["notifications", "list"] },
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((notification) =>
                  notification.id === notificationId
                    ? { ...notification, readAt: notification.readAt ?? now }
                    : notification
                ),
              }
            : current
      )
      queryClient.setQueriesData<number>(
        { queryKey: ["notifications", "unread-count"] },
        (current) =>
          typeof current === "number" ? Math.max(0, current - 1) : current
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => {
      const now = new Date().toISOString()

      queryClient.setQueriesData<NotificationsPayload>(
        { queryKey: ["notifications", "list"] },
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((notification) => ({
                  ...notification,
                  readAt: notification.readAt ?? now,
                })),
              }
            : current
      )
      queryClient.setQueriesData<number>(
        { queryKey: ["notifications", "unread-count"] },
        () => 0
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.error(m.mobile_notifications_mark_all_error())
    },
  })

  function openNotification(notification: AppNotification) {
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id)
    }
    setSelectedNotification(notification)
  }

  return (
    <div className="relative flex min-h-full flex-col bg-background">
      {selectedNotification ? (
        <NotificationDetailOverlay
          notification={selectedNotification}
          onBack={() => setSelectedNotification(null)}
        />
      ) : null}
      <MobileHeader
        subtitle={m.mobile_notifications_subtitle()}
        title={m.mobile_nav_notifications()}
      />
      <div className="flex flex-1 flex-col gap-3 bg-background px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 px-1">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {unreadCount > 0
                ? m.mobile_notifications_unread_count({ count: unreadCount })
                : m.mobile_notifications_all_read()}
            </p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {m.mobile_notifications_description()}
            </p>
          </div>
          {unreadCount > 0 ? (
            <Button
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              size="sm"
              variant="outline"
            >
              {markAllReadMutation.isPending && (
                <Loader2 data-icon="inline-start" />
              )}
              {m.mobile_notifications_mark_all_read()}
            </Button>
          ) : null}
        </div>
        {notificationsQuery.isLoading ? (
          <NotificationsSkeleton />
        ) : notificationsQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            kind="error"
            onAction={() => {
              void Promise.all([
                notificationsQuery.refetch(),
                unreadQuery.refetch(),
              ])
            }}
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : notifications.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <button
                  className="flex w-full items-start gap-3 px-4 py-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-muted/50"
                  onClick={() => openNotification(notification)}
                  type="button"
                >
                  <NotificationIcon type={notification.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-semibold">
                        {notification.title}
                      </span>
                      {!notification.readAt && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={getNotificationBadgeVariant(notification)}
                      >
                        {formatNotificationType(notification.type)}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {fmtDate(notification.createdAt, "short")}
                      </span>
                    </div>
                  </div>
                </button>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </Card>
        ) : (
          <div className="grid flex-1 place-items-center bg-background">
            <Empty className="p-4 text-center">
              <EmptyHeader>
                <EmptyTitle>{m.mobile_notifications_empty_title()}</EmptyTitle>
                <EmptyDescription>
                  {m.mobile_notifications_empty_description()}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationDetailOverlay({
  notification,
  onBack,
}: {
  notification: AppNotification
  onBack: () => void
}) {
  return (
    <div className="mobile-device-shell fixed inset-0 z-[60] mx-auto flex flex-col bg-background">
      <MobileHeader
        onBack={onBack}
        subtitle={formatNotificationType(notification.type)}
        title={notification.title}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center gap-2 border-b pb-4">
          <Badge variant={getNotificationBadgeVariant(notification)}>
            {formatNotificationType(notification.type)}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {fmtDate(notification.createdAt, "medium")}
          </span>
        </div>
        <div className="py-6">
          <p className="text-base leading-7 text-foreground">
            {notification.body}
          </p>
        </div>
      </div>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <Card className="gap-0 p-0">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index}>
          <div className="flex gap-3 p-4">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          {index < 3 && <Separator />}
        </div>
      ))}
    </Card>
  )
}

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  const Icon = notificationIcons[type]

  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl",
        getNotificationIconBackground(type)
      )}
    >
      <Icon className="size-5" />
    </span>
  )
}

function getNotificationIconBackground(type: AppNotification["type"]) {
  if (type === "PRESENCE") return "bg-brand-soft text-brand-dark"
  if (type === "GRADE") return "bg-info-bg text-cat-academic"
  if (type === "PAYMENT") return "bg-role-parent-bg text-cat-finance"
  return "bg-role-teacher-bg text-role-teacher"
}

function getNotificationBadgeVariant(notification: AppNotification) {
  if (notification.readAt) return "neutral"
  if (notification.type === "PAYMENT") return "warning"
  if (notification.type === "PRESENCE") return "success"
  return "teacher"
}

function formatNotificationType(type: AppNotification["type"]) {
  if (type === "PRESENCE") return m.mobile_profile_notification_presence()
  if (type === "GRADE") return m.mobile_profile_notification_grades()
  if (type === "PAYMENT") return m.mobile_profile_notification_payments()
  return m.mobile_profile_notification_system()
}

type ProfileAction =
  | "client-camera"
  | "client-language"
  | "client-notifications"
  | "notifications"
  | "personal"
  | "schools"

type ProfileClientSetting = Extract<
  ProfileAction,
  "client-camera" | "client-language" | "client-notifications"
>

type ProfileClientSettingRow = {
  disabled?: boolean
  hint?: string
  icon: LucideIcon
  key: ProfileClientSetting | "client-install-app"
  label: string
  onSelect?: () => void
  status: PermissionDisplayStatus
  value: React.ReactNode
}

type MobileUserProfile = {
  email: string
  firstName: string | null
  id: string
  lastName: string | null
  phone: string | null
  photoUrl: string | null
}

type NotificationCategory = "grades" | "payments" | "presence" | "system"
type NotificationChannel = "email" | "push"
type NotificationPreferences = Record<
  NotificationCategory,
  Record<NotificationChannel, boolean>
> & {
  quietHoursDays: number[] | null
  quietHoursEnd: string | null
  quietHoursStart: string | null
}

function fetchUserProfile() {
  return apiClient
    .get<{ data: MobileUserProfile }>("/users/profile")
    .then((response) => response.data)
}

function getMobileUserProfilePhotoUrl(profile: MobileUserProfile | undefined) {
  return profile?.photoUrl ?? null
}

function updateUserProfile(input: {
  firstName?: string
  lastName?: string
  phone?: string | null
}) {
  return apiClient
    .patch<{ data: MobileUserProfile }>("/users/profile", input)
    .then((response) => response.data)
}

function uploadUserProfilePhoto(file: File) {
  const formData = new FormData()
  formData.append("photo", file)
  return apiClient
    .post<{ data: MobileUserProfile }>("/users/profile/photo", formData)
    .then((response) => response.data)
}

function deleteUserProfilePhoto() {
  return apiClient
    .delete<{ data: MobileUserProfile }>("/users/profile/photo")
    .then((response) => response.data)
}

function getProfilePhotoCopy(
  key: "change" | "deleted" | "error" | "hint" | "label" | "remove" | "updated"
) {
  const isFrench = getRouteLocale() === "fr"
  const copy = {
    change: isFrench ? "Changer" : "Change",
    deleted: isFrench ? "Photo retiree." : "Photo removed.",
    error: isFrench
      ? "Impossible de mettre a jour la photo."
      : "Unable to update the photo.",
    hint: isFrench
      ? "JPG, PNG ou WebP. 5 Mo maximum."
      : "JPG, PNG, or WebP. 5 MB maximum.",
    label: "Photo",
    remove: isFrench ? "Retirer" : "Remove",
    updated: isFrench ? "Photo mise a jour." : "Photo updated.",
  }

  return copy[key]
}

function getLogoutConfirmationCopy(
  locale: "fr" | "en",
  key: "body" | "cancel" | "confirm" | "description" | "title"
) {
  const isFrench = locale === "fr"
  const copy = {
    body: isFrench
      ? "La session active sera fermee sur cet appareil."
      : "The active session will be closed on this device.",
    cancel: isFrench ? "Rester connecte" : "Stay signed in",
    confirm: isFrench ? "Se deconnecter" : "Sign out",
    description: isFrench
      ? "Vous devrez vous reconnecter pour acceder a votre espace Lernn."
      : "You will need to sign in again to access your Lernn space.",
    title: isFrench ? "Confirmer la deconnexion" : "Confirm sign out",
  }

  return copy[key]
}

function fetchNotificationPreferences() {
  return apiClient
    .get<{ data: NotificationPreferences }>("/users/preferences")
    .then((response) => response.data)
}

function updateNotificationPreferences(
  input: Partial<
    Record<NotificationCategory, Record<NotificationChannel, boolean>>
  >
) {
  return apiClient
    .patch<{ data: NotificationPreferences }>("/users/preferences", input)
    .then((response) => response.data)
}

function ProfileView({
  fallbackPhotoUrl,
}: {
  fallbackPhotoUrl?: string | null
}) {
  const {
    requestCamera,
    requestNotifications,
    settings: clientSettings,
  } = useClientPermissionSettings()
  const queryClient = useQueryClient()
  const [activeAction, setActiveAction] = useState<ProfileAction | null>(null)
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false)
  const currentLocale = getRouteLocale()
  const accountCopy = companionCopy(currentLocale)
  const userProfileQuery = useQuery({
    queryKey: ["users", "profile"],
    queryFn: fetchUserProfile,
  })
  const profilesQuery = useQuery({
    queryKey: ["auth", "profiles"],
    queryFn: () => fetchProfiles("personal"),
  })
  const selectedProfile = getSelectedProfile()
  const syncedSelectedProfile =
    profilesQuery.data?.find((profile) => profile.id === selectedProfile?.id) ??
    selectedProfile
  const userProfile = userProfileQuery.data
  const displayName =
    [userProfile?.firstName, userProfile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    getProfileDisplayName(syncedSelectedProfile) ||
    m.mobile_profile_unknown_name()
  const profileAvatarUrl =
    getMobileUserProfilePhotoUrl(userProfile) ??
    syncedSelectedProfile?.photoUrl ??
    fallbackPhotoUrl ??
    null
  const profileEmail = userProfile?.email ?? m.mobile_profile_no_email()

  const clientSettingRows: ProfileClientSettingRow[] = [
    {
      icon: Bell,
      key: "client-notifications",
      label: m.mobile_profile_push_permission(),
      value: formatPermissionStatus(clientSettings.notifications),
      status: clientSettings.notifications,
    },
    {
      icon: Camera,
      key: "client-camera",
      label: m.mobile_profile_camera_permission(),
      value: formatPermissionStatus(clientSettings.camera),
      status: clientSettings.camera,
    },
    {
      icon: Languages,
      key: "client-language",
      label: m.mobile_profile_app_language(),
      value: <LanguageFlag language={currentLocale} />,
      status: "neutral",
    },
  ]
  const accountRows: Array<{
    icon: LucideIcon
    key: ProfileAction
    label: string
    description: string
  }> = [
    {
      icon: UserRound,
      key: "personal",
      label: m.mobile_profile_personal(),
      description: m.mobile_profile_personal_hint(),
    },
    {
      icon: Bell,
      key: "notifications",
      label: m.mobile_profile_notifications(),
      description: m.mobile_profile_notifications_hint(),
    },
    {
      icon: GraduationCap,
      key: "schools",
      label: accountCopy.companionSpaces,
      description: accountCopy.switchSpacesDescription,
    },
  ]
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearCachedAuthSession()
      setSchoolIdGetter(() => null)
      queryClient.clear()
      window.location.assign(withAppBase(`/${currentLocale}/login`))
    },
  })

  return (
    <div>
      <MobileHeader
        subtitle={m.mobile_profile_subtitle()}
        title={m.mobile_nav_profile()}
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <Card variant="dark">
          <CardContent className="flex flex-col items-center gap-3 px-0 text-center">
            {userProfileQuery.isLoading ? (
              <>
                <Skeleton className="size-11 rounded-full bg-white/15" />
                <div className="flex w-full flex-col items-center gap-2">
                  <Skeleton className="h-4 w-32 bg-white/15" />
                  <Skeleton className="h-3 w-44 bg-white/15" />
                </div>
              </>
            ) : (
              <>
                <PersonAvatar
                  className="size-20"
                  name={displayName}
                  size="lg"
                  src={profileAvatarUrl}
                  tone="brand"
                />
                <div>
                  <div className="font-semibold">{displayName}</div>
                  <div className="text-sm text-white/70">{profileEmail}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="gap-0 p-0">
          {accountRows.map(({ icon: Icon, key, label, description }, index) => (
            <div key={key}>
              <button
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => setActiveAction(key)}
                type="button"
              >
                <Badge className="size-8 p-0" variant="neutral">
                  <Icon />
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{label}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {description}
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </button>
              {index < accountRows.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
        <div className="flex flex-col gap-3">
          <SectionTitle>{m.mobile_profile_client_settings()}</SectionTitle>
          <Card className="gap-0 p-0">
            {clientSettingRows.map(
              (
                {
                  disabled,
                  hint,
                  icon: Icon,
                  key,
                  label,
                  onSelect,
                  value,
                  status,
                },
                index
              ) => (
                <div key={label}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 p-4 text-left",
                      disabled && "cursor-default opacity-55"
                    )}
                    disabled={disabled}
                    onClick={() => {
                      if (onSelect) {
                        onSelect()
                        return
                      }
                      setActiveAction(key as ProfileClientSetting)
                    }}
                    type="button"
                  >
                    <Badge className="size-8 p-0" variant="neutral">
                      <Icon />
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {label}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {hint ?? m.mobile_profile_client_settings_hint()}
                      </div>
                    </div>
                    <Badge
                      className={
                        status === "neutral"
                          ? "rounded-lg px-2 py-1.5"
                          : undefined
                      }
                      variant={permissionBadgeVariant(status)}
                    >
                      {value}
                    </Badge>
                    {disabled ? null : (
                      <ChevronRight className="text-muted-foreground" />
                    )}
                  </button>
                  {index < clientSettingRows.length - 1 && <Separator />}
                </div>
              )
            )}
          </Card>
        </div>
        <Button
          className="min-h-11"
          disabled={logoutMutation.isPending}
          onClick={() => setLogoutConfirmationOpen(true)}
          size="lg"
          variant="outline"
        >
          <LogOut data-icon="inline-start" />
          {m.mobile_profile_logout()}
        </Button>
      </div>
      <LogoutConfirmationDrawer
        currentLocale={currentLocale}
        isPending={logoutMutation.isPending}
        onConfirm={() => logoutMutation.mutate()}
        onOpenChange={setLogoutConfirmationOpen}
        open={logoutConfirmationOpen}
      />
      <PersonalInformationDrawer
        onOpenChange={(open) => {
          if (!open) setActiveAction(null)
        }}
        open={activeAction === "personal"}
        fallbackPhotoUrl={
          syncedSelectedProfile?.photoUrl ?? fallbackPhotoUrl ?? null
        }
        profile={userProfile}
        updateProfile={updateUserProfile}
      />
      <BusinessNotificationsDrawer
        onOpenChange={(open) => {
          if (!open) setActiveAction(null)
        }}
        open={activeAction === "notifications"}
      />
      {activeAction === "schools" && (
        <Suspense fallback={null}>
          <CompanionSpacesDrawer
            currentLocale={currentLocale}
            onOpenChange={(open) => {
              if (!open) setActiveAction(null)
            }}
            open
            profiles={profilesQuery.data ?? []}
            selectedProfile={selectedProfile}
            userProfile={userProfile}
          />
        </Suspense>
      )}
      <ProfileClientSettingsDrawer
        currentLocale={currentLocale}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null)
        }}
        onRequestCamera={requestCamera}
        onRequestNotifications={requestNotifications}
        openSetting={
          activeAction === "client-camera" ||
          activeAction === "client-language" ||
          activeAction === "client-notifications"
            ? activeAction
            : null
        }
        settings={clientSettings}
      />
    </div>
  )
}

function LogoutConfirmationDrawer({
  currentLocale,
  isPending,
  onConfirm,
  onOpenChange,
  open,
}: {
  currentLocale: "fr" | "en"
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen)
      }}
    >
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[80svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle>
            {getLogoutConfirmationCopy(currentLocale, "title")}
          </DrawerTitle>
          <DrawerDescription>
            {getLogoutConfirmationCopy(currentLocale, "description")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <div className="flex items-start gap-3 rounded-xl border bg-background p-4">
            <Badge className="size-8 p-0" variant="destructive">
              <LogOut />
            </Badge>
            <p className="text-sm leading-6 text-muted-foreground">
              {getLogoutConfirmationCopy(currentLocale, "body")}
            </p>
          </div>
        </div>
        <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="flex-1" disabled={isPending} variant="outline">
              {getLogoutConfirmationCopy(currentLocale, "cancel")}
            </Button>
          </DrawerClose>
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={onConfirm}
            variant="destructive"
          >
            {isPending && <Loader2 data-icon="inline-start" />}
            {getLogoutConfirmationCopy(currentLocale, "confirm")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function PersonalInformationDrawer({
  fallbackPhotoUrl,
  onOpenChange,
  open,
  profile,
  updateProfile,
}: {
  fallbackPhotoUrl?: string | null
  onOpenChange: (open: boolean) => void
  open: boolean
  profile: MobileUserProfile | undefined
  updateProfile: typeof updateUserProfile
}) {
  const queryClient = useQueryClient()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    m.mobile_profile_unknown_name()
  const photoUrl =
    getMobileUserProfilePhotoUrl(profile) ?? fallbackPhotoUrl ?? null

  useEffect(() => {
    if (!open) return
    setFirstName(profile?.firstName ?? "")
    setLastName(profile?.lastName ?? "")
    setPhone(profile?.phone ?? "")
  }, [open, profile?.firstName, profile?.lastName, profile?.phone])

  async function syncProfile(updatedProfile: MobileUserProfile) {
    queryClient.setQueryData(["users", "profile"], updatedProfile)
    const currentProfile = getSelectedProfile()
    const updatedPhotoUrl = getMobileUserProfilePhotoUrl(updatedProfile)
    if (currentProfile) {
      setSelectedProfile({
        ...currentProfile,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        photoUrl: updatedPhotoUrl,
      })
    }
    await queryClient.invalidateQueries({ queryKey: ["auth", "profiles"] })
    queryClient.setQueryData<UserProfile[] | undefined>(
      ["auth", "profiles"],
      (profiles) =>
        profiles?.map((profile) =>
          profile.id === currentProfile?.id
            ? {
                ...profile,
                firstName: updatedProfile.firstName,
                lastName: updatedProfile.lastName,
                photoUrl: updatedPhotoUrl,
              }
            : profile
        )
    )
  }

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updatedProfile) => {
      await syncProfile(updatedProfile)
      toast.success(m.mobile_profile_saved())
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : m.mobile_profile_save_error()
      )
    },
  })
  const uploadPhotoMutation = useMutation({
    mutationFn: uploadUserProfilePhoto,
    onSuccess: async (updatedProfile) => {
      await syncProfile(updatedProfile)
      toast.success(getProfilePhotoCopy("updated"))
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : getProfilePhotoCopy("error")
      )
    },
    onSettled: () => {
      if (photoInputRef.current) photoInputRef.current.value = ""
    },
  })
  const deletePhotoMutation = useMutation({
    mutationFn: deleteUserProfilePhoto,
    onSuccess: async (updatedProfile) => {
      await syncProfile(updatedProfile)
      toast.success(getProfilePhotoCopy("deleted"))
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : getProfilePhotoCopy("error")
      )
    },
  })
  const photoPending =
    uploadPhotoMutation.isPending || deletePhotoMutation.isPending

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[88svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle>{m.mobile_profile_personal()}</DrawerTitle>
          <DrawerDescription>
            {m.mobile_profile_personal_drawer_description()}
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone.trim() || null,
            })
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profile-photo">
                  {getProfilePhotoCopy("label")}
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    className="size-24 text-2xl"
                    name={displayName}
                    size="lg"
                    src={photoUrl}
                    tone="brand-soft"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      aria-label={getProfilePhotoCopy("label")}
                      className="sr-only"
                      id="profile-photo"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) uploadPhotoMutation.mutate(file)
                      }}
                      ref={photoInputRef}
                      type="file"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={photoPending}
                        onClick={() => photoInputRef.current?.click()}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Camera data-icon="inline-start" />
                        {getProfilePhotoCopy("change")}
                      </Button>
                      {getMobileUserProfilePhotoUrl(profile) && (
                        <Button
                          disabled={photoPending}
                          onClick={() => deletePhotoMutation.mutate()}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {getProfilePhotoCopy("remove")}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getProfilePhotoCopy("hint")}
                    </p>
                  </div>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-first-name">
                  {m.mobile_profile_first_name()}
                </FieldLabel>
                <Input
                  id="profile-first-name"
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  value={firstName}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-last-name">
                  {m.mobile_profile_last_name()}
                </FieldLabel>
                <Input
                  id="profile-last-name"
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  value={lastName}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-phone">
                  {m.mobile_profile_phone()}
                </FieldLabel>
                <Input
                  id="profile-phone"
                  inputMode="tel"
                  onChange={(event) => setPhone(event.target.value)}
                  value={phone}
                />
              </Field>
            </FieldGroup>
          </div>
          <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <DrawerClose asChild>
              <Button className="flex-1" type="button" variant="outline">
                {m.mobile_cancel()}
              </Button>
            </DrawerClose>
            <Button
              className="flex-1"
              disabled={mutation.isPending}
              type="submit"
            >
              {m.mobile_profile_save()}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

function BusinessNotificationsDrawer({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const queryClient = useQueryClient()
  const preferencesQuery = useQuery({
    queryKey: ["users", "preferences"],
    queryFn: fetchNotificationPreferences,
    enabled: open,
  })
  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(["users", "preferences"], preferences)
      toast.success(m.mobile_profile_preferences_saved())
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : m.mobile_profile_preferences_error()
      )
    },
  })

  const categories: Array<{
    key: NotificationCategory
    label: string
  }> = [
    { key: "presence", label: m.mobile_profile_notification_presence() },
    { key: "grades", label: m.mobile_profile_notification_grades() },
    { key: "payments", label: m.mobile_profile_notification_payments() },
    { key: "system", label: m.mobile_profile_notification_system() },
  ]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[88svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle>{m.mobile_profile_notifications()}</DrawerTitle>
          <DrawerDescription>
            {m.mobile_profile_business_notifications_description()}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4">
          {preferencesQuery.isLoading ? (
            <Card className="gap-3" size="sm">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ) : preferencesQuery.isError ? (
            <DashboardState
              actionLabel={m.auth_retry()}
              onAction={() => {
                void preferencesQuery.refetch()
              }}
              kind="error"
              title={m.mobile_dashboard_error_title()}
              description={m.mobile_dashboard_error_description()}
            />
          ) : (
            categories.map((category, index) => {
              const value = preferencesQuery.data?.[category.key]
              return (
                <div key={category.key}>
                  <div className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {category.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.mobile_profile_notification_channels()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(["push", "email"] as const).map((channel) => (
                        <Field
                          className="w-auto items-center"
                          key={channel}
                          orientation="horizontal"
                        >
                          <FieldLabel
                            className="text-xs"
                            htmlFor={`notification-${category.key}-${channel}`}
                          >
                            {channel === "push"
                              ? m.mobile_profile_channel_push()
                              : m.mobile_profile_channel_email()}
                          </FieldLabel>
                          <Switch
                            aria-label={`${category.label} - ${
                              channel === "push"
                                ? m.mobile_profile_channel_push()
                                : m.mobile_profile_channel_email()
                            }`}
                            checked={value?.[channel] ?? false}
                            disabled={mutation.isPending || !value}
                            id={`notification-${category.key}-${channel}`}
                            onCheckedChange={(checked) => {
                              mutation.mutate({
                                [category.key]: {
                                  ...value,
                                  [channel]: checked,
                                },
                              })
                            }}
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
                  {index < categories.length - 1 && <Separator />}
                </div>
              )
            })
          )}
        </div>
        <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="flex-1" variant="outline">
              {m.mobile_close()}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileClientSettingsDrawer({
  currentLocale,
  onOpenChange,
  onRequestCamera,
  onRequestNotifications,
  openSetting,
  settings,
}: {
  currentLocale: "fr" | "en"
  onOpenChange: (open: boolean) => void
  onRequestCamera: () => Promise<void>
  onRequestNotifications: () => Promise<void>
  openSetting: ProfileClientSetting | null
  settings: ClientPermissionSettings
}) {
  const isNotifications = openSetting === "client-notifications"
  const isCamera = openSetting === "client-camera"
  const isLanguage = openSetting === "client-language"
  const title = isNotifications
    ? m.mobile_profile_push_permission()
    : isCamera
      ? m.mobile_profile_camera_permission()
      : m.mobile_profile_app_language()
  const description = isNotifications
    ? m.mobile_profile_notifications_drawer_description()
    : isCamera
      ? m.mobile_profile_camera_drawer_description()
      : m.mobile_profile_language_drawer_description()
  const status = isNotifications
    ? settings.notifications
    : isCamera
      ? settings.camera
      : "neutral"

  return (
    <Drawer open={Boolean(openSetting)} onOpenChange={onOpenChange}>
      <DrawerContent className="mobile-sheet-shell mx-auto flex max-h-[88svh] rounded-t-2xl p-0">
        <DrawerHeader className="shrink-0 px-5 pt-4 pb-3 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
          {(isNotifications || isCamera) && (
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4">
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {m.mobile_profile_permission_status()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPermissionStatus(status)}
                </div>
              </div>
              <Switch
                aria-label={title}
                checked={status === "granted"}
                disabled={status === "unsupported"}
                onCheckedChange={(checked) => {
                  if (!checked) return
                  void (isNotifications
                    ? onRequestNotifications()
                    : onRequestCamera())
                }}
              />
            </div>
          )}

          {isLanguage && (
            <div className="flex flex-col gap-2">
              {(["fr", "en"] as const).map((locale) => {
                const selected = locale === currentLocale

                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      selected
                        ? "border-brand-dark bg-brand-soft text-brand-dark"
                        : "bg-background"
                    )}
                    key={locale}
                    onClick={() => changeRouteLocale(locale)}
                    type="button"
                  >
                    <LanguageFlag language={locale} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {locale === "fr" ? m.language_fr() : m.language_en()}
                    </span>
                    {selected ? (
                      <CheckCircle2 className="size-4 shrink-0" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}

          {(status === "denied" || status === "unsupported") && !isLanguage && (
            <p className="text-sm text-muted-foreground">
              {status === "denied"
                ? m.mobile_profile_permission_denied_help()
                : m.mobile_profile_permission_unsupported_help()}
            </p>
          )}
        </div>
        <DrawerFooter className="shrink-0 flex-row gap-2 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="flex-1" variant="outline">
              {m.mobile_cancel()}
            </Button>
          </DrawerClose>
          {(isNotifications || isCamera) && (
            <Button
              className="flex-1"
              disabled={status === "granted" || status === "unsupported"}
              onClick={() => {
                void (isNotifications
                  ? onRequestNotifications()
                  : onRequestCamera())
              }}
            >
              {status === "granted"
                ? m.mobile_profile_permission_enabled()
                : m.mobile_profile_permission_enable()}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function TeacherToday({
  onOpenCourseAttendance,
  onOpenClasses,
  onOpenEvaluations,
  onOpenSchedule,
  periodId,
  profilePhotoUrl,
  profileName,
  schoolId,
}: {
  onOpenCourseAttendance: (context: CourseAttendanceRouteContext | null) => void
  onOpenClasses: () => void
  onOpenEvaluations: () => void
  onOpenSchedule: () => void
  periodId: string | null
  profilePhotoUrl: string | null
  profileName: string
  schoolId: string | null
}) {
  const currentDate = useCurrentDate()
  const dashboardQuery = useQuery({
    ...teacherDashboardQueryOptions(schoolId ?? "", periodId ?? undefined),
    enabled: Boolean(schoolId),
  })
  const dashboard = dashboardQuery.data
  const currentCourse = dashboard?.todayCourses[0] ?? null
  const modules: AppModuleLink[] = [
    {
      description: currentCourse
        ? teacherCopy(
            "Faire l'appel du prochain cours",
            "Take attendance for the next course"
          )
        : teacherCopy("Presences aux cours", "Course attendance"),
      illustration: "/module-illustrations/attendance-3d.png",
      label: teacherCopy("Appel", "Attendance"),
      onClick: () =>
        onOpenCourseAttendance(
          currentCourse
            ? getCourseAttendanceContextFromTodayCourse(currentCourse)
            : null
        ),
    },
    {
      description: teacherCopy("Classes rattachees", "Linked classes"),
      illustration: "/module-illustrations/subjects-3d.png",
      label: teacherCopy("Classes", "Classes"),
      onClick: onOpenClasses,
    },
    {
      description: m.mobile_module_teacher_grades_description(),
      illustration: "/module-illustrations/grades-3d.png",
      label: m.mobile_nav_grades(),
      onClick: onOpenEvaluations,
    },
    {
      description: m.mobile_module_schedule_description(),
      illustration: "/module-illustrations/schedule-3d.png",
      label: m.mobile_nav_courses(),
      onClick: onOpenSchedule,
    },
  ]

  return (
    <div>
      <MobileHeader
        right={
          <PersonAvatar
            className="size-10"
            name={profileName || "Prof"}
            src={profilePhotoUrl}
            tone="staff"
          />
        }
        subtitle={
          dashboard?.info.period
            ? `${dashboard.info.period.name} - ${dashboard.info.schoolYear.label}`
            : fmtDate(currentDate, "long")
        }
        title={
          profileName
            ? m.mobile_teacher_greeting_name({
                name: profileName.split(" ")[0],
              })
            : m.mobile_teacher_greeting()
        }
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        {dashboardQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : dashboardQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void dashboardQuery.refetch()
            }}
            kind="error"
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : (
          <TeacherSummaryCard dashboard={dashboard} />
        )}

        <ModuleGrid modules={modules} title={m.mobile_home_modules_title()} />

        <SectionTitle>{m.mobile_nav_today()}</SectionTitle>
        {dashboard?.todayCourses.length ? (
          <Card className="gap-0 p-0">
            {dashboard.todayCourses.map((course, index) => (
              <div key={course.id}>
                <TeacherCourseCard
                  course={course}
                  isCurrent={index === 0}
                  onOpenAttendance={() =>
                    onOpenCourseAttendance(
                      getCourseAttendanceContextFromTodayCourse(course)
                    )
                  }
                />
                {index < dashboard.todayCourses.length - 1 && <Separator />}
              </div>
            ))}
          </Card>
        ) : (
          !dashboardQuery.isLoading &&
          !dashboardQuery.isError && (
            <DashboardState
              kind="empty"
              title={m.mobile_teacher_no_course_title()}
              description={m.mobile_teacher_no_course_description()}
            />
          )
        )}
      </div>
    </div>
  )
}

function TeacherSummaryCard({
  dashboard,
}: {
  dashboard: TeacherDashboard | undefined
}) {
  return (
    <Card variant="dark">
      <CardHeader>
        <CardDescription className="text-brand">
          {m.mobile_teacher_summary()}
        </CardDescription>
        <CardTitle>
          {`${dashboard?.summary.classCount ?? 0} ${m.mobile_teacher_classes()}`}
        </CardTitle>
        <CardDescription className="text-white/70">
          {`${dashboard?.summary.totalStudents ?? 0} ${m.mobile_students_label()} - ${dashboard?.summary.missingGrades ?? 0} ${m.mobile_missing_grades()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
        <TeacherSummaryMetric
          label={teacherCopy("A publier", "Publish")}
          value={String(dashboard?.summary.evaluationsToPublish ?? 0)}
        />
        <TeacherSummaryMetric
          label={teacherCopy("A completer", "Complete")}
          value={String(dashboard?.summary.missingGrades ?? 0)}
        />
        <TeacherSummaryMetric
          label={teacherCopy("Appreciations", "Comments")}
          value={String(dashboard?.summary.pendingAppreciations ?? 0)}
        />
      </CardContent>
    </Card>
  )
}

function TeacherSummaryMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3">
      <div className="min-h-7 text-[9px] leading-tight font-bold tracking-[0.12em] text-white/55 uppercase">
        {label}
      </div>
      <div className="mt-2 font-mono text-xl leading-none font-semibold text-white">
        {value}
      </div>
    </div>
  )
}

function TeacherCourseCard({
  course,
  isCurrent,
  onOpenAttendance,
}: {
  course: TeacherTodayCourse
  isCurrent: boolean
  onOpenAttendance?: () => void
}) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 p-4">
      <div className="flex flex-col items-center border-r pr-3 text-center">
        <span className="font-mono text-sm font-bold">{course.startTime}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {course.endTime}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">
          {course.subjectName}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {course.classGroupCode} - {course.classGroupName}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={isCurrent ? "warning" : "neutral"}>
          {isCurrent ? m.mobile_now() : m.mobile_next()}
        </Badge>
        {onOpenAttendance ? (
          <Button
            aria-label={teacherCopy("Faire l'appel", "Take attendance")}
            onClick={onOpenAttendance}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ListChecks data-icon="icon" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function TeacherClasses({
  academicYearContext,
  onBack,
  onCreateEvaluation,
  onOpenCourseAttendance,
  onOpenSchedule,
  periodId,
  schoolId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  onCreateEvaluation: (classItem?: TeacherClassSummary) => void
  onOpenCourseAttendance: (context: CourseAttendanceRouteContext | null) => void
  onOpenSchedule: (classGroupId: string) => void
  periodId: string | null
  schoolId: string | null
}) {
  const dashboardQuery = useQuery({
    ...teacherDashboardQueryOptions(schoolId ?? "", periodId ?? undefined),
    enabled: Boolean(schoolId),
  })
  const classes = useMemo(
    () => dashboardQuery.data?.classes ?? [],
    [dashboardQuery.data?.classes]
  )
  const classGroups = useMemo(
    () => groupTeacherClassesByClass(classes),
    [classes]
  )

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_reports_subtitle()}
        title={teacherCopy("Classes", "Classes")}
      />
      <div className="flex flex-col gap-3 px-5 pt-4 pb-6">
        <AcademicYearContextSelector context={academicYearContext} />
        {dashboardQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : dashboardQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void dashboardQuery.refetch()
            }}
            kind="error"
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : classGroups.length ? (
          <Accordion className="gap-3" collapsible type="single">
            {classGroups.map((classGroup) => (
              <AccordionItem
                className="rounded-xl border bg-background px-0 shadow-xs not-last:border"
                key={classGroup.id}
                value={classGroup.id}
              >
                <AccordionTrigger className="px-4 py-4">
                  <span className="min-w-0">
                    <span className="block truncate text-base font-semibold">
                      {classGroup.code}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {classGroup.enrollmentCount} {m.mobile_students_label()} -{" "}
                      {classGroup.subjects.length}{" "}
                      {teacherCopy("matiere(s)", "subject(s)")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="flex flex-col gap-3">
                    <Button
                      className="justify-between rounded-lg"
                      onClick={() => onOpenSchedule(classGroup.id)}
                      type="button"
                      variant="outline"
                    >
                      <span>{m.mobile_nav_courses()}</span>
                      <ChevronRight data-icon="inline-end" />
                    </Button>
                    <Card className="gap-0 p-0">
                      {classGroup.subjects.map((classItem, index) => (
                        <div key={classItem.subjectLevelId}>
                          <TeacherClassSubjectRow
                            classItem={classItem}
                            onCreateEvaluation={() =>
                              onCreateEvaluation(classItem)
                            }
                            onOpenCourseAttendance={() =>
                              onOpenCourseAttendance(
                                getCourseAttendanceContextFromClassSummary(
                                  classItem
                                )
                              )
                            }
                          />
                          {index < classGroup.subjects.length - 1 ? (
                            <Separator />
                          ) : null}
                        </div>
                      ))}
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <DashboardState
            kind="empty"
            title={m.mobile_teacher_no_class_title()}
            description={m.mobile_teacher_no_class_description()}
          />
        )}
      </div>
    </div>
  )
}

function TeacherClassSubjectRow({
  classItem,
  onCreateEvaluation,
  onOpenCourseAttendance,
}: {
  classItem: TeacherClassSummary
  onCreateEvaluation: () => void
  onOpenCourseAttendance: () => void
}) {
  const filled = classItem.lastEvaluation?.gradeCount ?? 0
  const total =
    classItem.lastEvaluation?.totalStudents ?? classItem.enrollmentCount
  const subjectColor = getSubjectColor(
    classItem.subjectName,
    classItem.subjectColor
  )

  return (
    <div className="flex items-center gap-3 p-3">
      <span
        aria-hidden="true"
        className="h-14 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: subjectColor.border }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {classItem.subjectName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {classItem.missingGrades} {m.mobile_missing_grades()} - {filled}/
          {total}
        </span>
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          aria-label={teacherCopy("Faire l'appel", "Take attendance")}
          onClick={onOpenCourseAttendance}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ListChecks data-icon="icon" />
        </Button>
        <Button
          aria-label={teacherCopy("Nouvelle evaluation", "New evaluation")}
          onClick={onCreateEvaluation}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Plus data-icon="icon" />
        </Button>
      </div>
    </div>
  )
}

function TeacherEvaluations({
  academicYearContext,
  onBack,
  onCreateEvaluation,
  onEditEvaluation,
  onOpenEvaluation,
  onPeriodChange,
  periodOptions,
  schoolId,
  selectedPeriodId,
}: {
  academicYearContext: AcademicYearContextValue
  onBack: () => void
  onCreateEvaluation: () => void
  onEditEvaluation: (evaluation: TeacherEvaluation) => void
  onOpenEvaluation: (evaluation: TeacherEvaluation) => void
  onPeriodChange: (id: string | null) => void
  periodOptions: ContextPeriodOption[]
  schoolId: string | null
  selectedPeriodId: string | null
}) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [section, setSection] = useState<"appreciations" | "evaluations">(
    "evaluations"
  )
  const [selectedAppreciationKey, setSelectedAppreciationKey] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<
    TeacherEvaluationStatus | "all"
  >("all")
  const [selectedType, setSelectedType] = useState<
    TeacherEvaluationType | "all"
  >("all")
  const [actionEvaluation, setActionEvaluation] =
    useState<TeacherEvaluation | null>(null)
  const [deleteEvaluation, setDeleteEvaluation] =
    useState<TeacherEvaluation | null>(null)
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery({
    ...teacherDashboardQueryOptions(
      schoolId ?? "",
      selectedPeriodId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const evaluationsQuery = useQuery({
    ...teacherEvaluationsQueryOptions(schoolId ?? "", {
      classGroupId: selectedClassId === "all" ? undefined : selectedClassId,
      pageSize: 100,
      periodId: selectedPeriodId ?? undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      type: selectedType === "all" ? undefined : selectedType,
    }),
    enabled: Boolean(schoolId),
  })
  const evaluations = useMemo(
    () => evaluationsQuery.data ?? [],
    [evaluationsQuery.data]
  )
  const classes = useMemo(
    () => dashboardQuery.data?.classes ?? [],
    [dashboardQuery.data?.classes]
  )
  const classFilters = useMemo<TeacherClassFilterOption[]>(() => {
    const byId = new Map<string, TeacherClassFilterOption>()

    for (const classItem of classes) {
      byId.set(classItem.classGroupId, {
        id: classItem.classGroupId,
        label: classItem.classGroupCode,
        meta: classItem.classGroupName,
      })
    }

    for (const evaluation of evaluations) {
      if (!evaluation.classGroupId) continue
      byId.set(evaluation.classGroupId, {
        id: evaluation.classGroupId,
        label:
          evaluation.classGroup?.code ??
          evaluation.classGroup?.name ??
          teacherCopy("Classe", "Class"),
        meta: evaluation.classGroup?.name ?? null,
      })
    }

    return [
      {
        id: "all",
        label: teacherCopy("Toutes les classes", "All classes"),
        meta: null,
      },
      ...Array.from(byId.values()).sort((left, right) =>
        left.label.localeCompare(right.label)
      ),
    ]
  }, [classes, evaluations])
  const appreciationFilters = useMemo<ContextPeriodOption[]>(
    () =>
      classes.map((classItem) => ({
        id: `${classItem.classGroupId}:${classItem.subjectLevelId}`,
        label: `${classItem.classGroupCode} - ${classItem.subjectName}`,
        meta: `${classItem.pendingAppreciations} ${teacherCopy("a completer", "to complete")}`,
      })),
    [classes]
  )
  const activeAppreciationKey =
    selectedAppreciationKey || appreciationFilters[0]?.id || ""
  const selectedAppreciationClass =
    classes.find(
      (classItem) =>
        `${classItem.classGroupId}:${classItem.subjectLevelId}` ===
        activeAppreciationKey
    ) ?? null
  const statusFilters = useMemo<ContextPeriodOption[]>(
    () => [
      {
        id: "all",
        label: teacherCopy("Tous les statuts", "All statuses"),
        meta: null,
      },
      {
        id: "DRAFT",
        label: teacherCopy("Brouillons", "Drafts"),
        meta: null,
      },
      {
        id: "PUBLISHED",
        label: teacherCopy("Publiees", "Published"),
        meta: null,
      },
    ],
    []
  )
  const typeFilters = useMemo<ContextPeriodOption[]>(
    () => [
      {
        id: "all",
        label: teacherCopy("Tous les types", "All types"),
        meta: null,
      },
      ...MOBILE_EVALUATION_TYPES.map((type) => ({
        id: type,
        label: formatEvaluationType(type),
        meta: null,
      })),
    ],
    []
  )
  const deleteMutation = useMutation({
    mutationFn: (evaluation: TeacherEvaluation) => {
      if (!schoolId) throw new Error("Missing school")
      return deleteTeacherEvaluation(schoolId, evaluation.id)
    },
    onSuccess: () => {
      toast.success(teacherCopy("Evaluation supprimee.", "Evaluation deleted."))
      setDeleteEvaluation(null)
      void queryClient.invalidateQueries({ queryKey: ["teacher"] })
    },
    onError: showApiError,
  })

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={`${dashboardQuery.data?.info.period.name ?? m.mobile_reports_subtitle()} - ${evaluations.length} ${m.mobile_reports_evaluations().toLowerCase()}`}
        title={teacherCopy("Notes & appreciations", "Grades & comments")}
      />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        <div className="grid gap-2">
          <AcademicYearContextSelector context={academicYearContext} />
          <PeriodContextSelector
            onSelect={onPeriodChange}
            options={periodOptions}
            selectedId={selectedPeriodId}
          />
          <Tabs
            onValueChange={(value) =>
              setSection(value as "appreciations" | "evaluations")
            }
            value={section}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="evaluations">
                {teacherCopy("Evaluations", "Evaluations")}
              </TabsTrigger>
              <TabsTrigger value="appreciations">
                {teacherCopy("Appreciations", "Comments")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {section === "evaluations" ? (
            <>
              <TeacherClassContextSelector
                onSelect={setSelectedClassId}
                options={classFilters}
                selectedId={selectedClassId}
              />
              <PeriodContextSelector
                description={teacherCopy(
                  "Filtrez les evaluations selon leur statut de publication.",
                  "Filter evaluations by publication status."
                )}
                label={teacherCopy("Statut", "Status")}
                onSelect={(id) =>
                  setSelectedStatus(
                    (id ?? "all") as TeacherEvaluationStatus | "all"
                  )
                }
                options={statusFilters}
                selectedId={selectedStatus}
                title={teacherCopy(
                  "Statut de publication",
                  "Publication status"
                )}
              />
              <PeriodContextSelector
                description={teacherCopy(
                  "Filtrez les evaluations selon la taxonomie academique.",
                  "Filter evaluations by academic type."
                )}
                label={teacherCopy("Type", "Type")}
                onSelect={(id) =>
                  setSelectedType(
                    (id ?? "all") as TeacherEvaluationType | "all"
                  )
                }
                options={typeFilters}
                selectedId={selectedType}
                title={teacherCopy("Type d'evaluation", "Evaluation type")}
              />
            </>
          ) : appreciationFilters.length ? (
            <PeriodContextSelector
              description={teacherCopy(
                "Choisissez la classe et la matiere a commenter.",
                "Choose the class and subject to comment on."
              )}
              label={teacherCopy("Classe et matiere", "Class and subject")}
              onSelect={(id) => setSelectedAppreciationKey(id ?? "")}
              options={appreciationFilters}
              selectedId={activeAppreciationKey}
              title={teacherCopy(
                "Appreciations de la matiere",
                "Subject comments"
              )}
            />
          ) : null}
        </div>
        {section === "appreciations" &&
        selectedAppreciationClass &&
        selectedPeriodId ? (
          <TeacherAppreciationEditor
            classItem={selectedAppreciationClass}
            periodId={selectedPeriodId}
            schoolId={schoolId}
          />
        ) : section === "appreciations" ? (
          <DashboardState
            description={teacherCopy(
              "Aucune classe ou periode n'est disponible.",
              "No class or period is available."
            )}
            kind="empty"
            title={teacherCopy(
              "Appreciations indisponibles",
              "Comments unavailable"
            )}
          />
        ) : evaluationsQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : evaluationsQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void evaluationsQuery.refetch()
            }}
            kind="error"
            title={m.mobile_dashboard_error_title()}
            description={m.mobile_dashboard_error_description()}
          />
        ) : evaluations.length ? (
          <TeacherEvaluationList
            evaluations={evaluations}
            onOpenEvaluation={setActionEvaluation}
          />
        ) : (
          <DashboardState
            kind="empty"
            title={m.mobile_home_upcoming_evaluations_empty_title()}
            description={m.mobile_home_upcoming_evaluations_empty_description()}
          />
        )}
      </div>
      <Drawer
        open={Boolean(actionEvaluation)}
        onOpenChange={(open) => {
          if (!open) setActionEvaluation(null)
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="truncate">
              {actionEvaluation?.title ?? m.mobile_reports_evaluations()}
            </DrawerTitle>
            <DrawerDescription>
              {[
                actionEvaluation?.classGroup?.code,
                actionEvaluation?.subjectLevel?.subject.name,
                actionEvaluation
                  ? fmtDate(actionEvaluation.date, "medium")
                  : null,
              ]
                .filter(Boolean)
                .join(" - ")}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              disabled={!actionEvaluation}
              onClick={() => {
                if (!actionEvaluation) return
                const evaluation = actionEvaluation
                setActionEvaluation(null)
                onEditEvaluation(evaluation)
              }}
              variant="outline"
            >
              <FileText data-icon="inline-start" />
              {teacherCopy("Modifier", "Edit")}
            </Button>
            <Button
              disabled={!actionEvaluation}
              onClick={() => {
                if (!actionEvaluation) return
                const evaluation = actionEvaluation
                setActionEvaluation(null)
                onOpenEvaluation(evaluation)
              }}
            >
              <ListChecks data-icon="inline-start" />
              {teacherCopy("Noter", "Grade")}
            </Button>
            {actionEvaluation?.status === "DRAFT" ? (
              <Button
                disabled={!actionEvaluation}
                onClick={() => {
                  if (!actionEvaluation) return
                  const evaluation = actionEvaluation
                  setActionEvaluation(null)
                  setDeleteEvaluation(evaluation)
                }}
                variant="destructive"
              >
                <Trash2 data-icon="inline-start" />
                {teacherCopy("Supprimer", "Delete")}
              </Button>
            ) : null}
            <DrawerClose asChild>
              <Button variant="ghost">{m.mobile_cancel()}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={Boolean(deleteEvaluation)}
        onOpenChange={(open) => {
          if (!open) setDeleteEvaluation(null)
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {teacherCopy("Supprimer l'evaluation ?", "Delete evaluation?")}
            </DrawerTitle>
            <DrawerDescription>
              {teacherCopy(
                "Cette action est possible uniquement tant que l'evaluation n'est pas publiee.",
                "This is only available while the evaluation is still unpublished."
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              disabled={!deleteEvaluation || deleteMutation.isPending}
              onClick={() => {
                if (deleteEvaluation) deleteMutation.mutate(deleteEvaluation)
              }}
              variant="destructive"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {teacherCopy("Supprimer", "Delete")}
            </Button>
            <DrawerClose asChild>
              <Button disabled={deleteMutation.isPending} variant="outline">
                {m.mobile_cancel()}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {section === "evaluations" ? (
        <FloatingControls>
          <Button
            aria-label={teacherCopy("Nouvelle evaluation", "New evaluation")}
            className="size-14 rounded-full shadow-lg"
            onClick={onCreateEvaluation}
            size="icon"
          >
            <Plus />
          </Button>
        </FloatingControls>
      ) : null}
    </div>
  )
}

function TeacherEvaluationList({
  evaluations,
  onOpenEvaluation,
}: {
  evaluations: TeacherEvaluation[]
  onOpenEvaluation: (evaluation: TeacherEvaluation) => void
}) {
  const sorted = [...evaluations].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime()
  )

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((evaluation) => {
        const subjectName =
          evaluation.subjectLevel?.subject.name ??
          teacherCopy("Matiere", "Subject")
        const classCode = evaluation.classGroup?.code ?? null
        const titleIncludesClass = classCode
          ? evaluation.title.toLowerCase().includes(classCode.toLowerCase())
          : false
        const subjectColor = getSubjectColor(
          evaluation.subjectLevel?.subject.code ?? subjectName,
          evaluation.subjectLevel?.subject.color
        )

        return (
          <button
            className="rounded-xl border bg-background p-4 text-left shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            key={evaluation.id}
            onClick={() => onOpenEvaluation(evaluation)}
            type="button"
          >
            <span className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 h-16 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: subjectColor.border }}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="line-clamp-2 text-sm font-semibold">
                  {evaluation.title}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {[
                    titleIncludesClass ? null : classCode,
                    fmtDate(evaluation.date, "medium"),
                    subjectName,
                    formatEvaluationStatus(evaluation.status),
                    `${evaluation.gradeCount} ${teacherCopy("note(s)", "grade(s)")}`,
                  ]
                    .filter(Boolean)
                    .join(" - ")}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="mt-1 shrink-0 text-muted-foreground"
              />
            </span>
          </button>
        )
      })}
    </div>
  )
}

const TEACHER_APPRECIATION_LABELS = [
  "Excellent",
  "Tres bien",
  "Bien",
  "A consolider",
  "Insuffisant",
] as const

function TeacherAppreciationEditor({
  classItem,
  periodId,
  schoolId,
}: {
  classItem: TeacherClassSummary
  periodId: string
  schoolId: string | null
}) {
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [drafts, setDrafts] = useState<
    Record<string, TeacherAppreciationDraft>
  >({})
  const gridQuery = useQuery({
    ...teacherClassGradeGridQueryOptions(
      schoolId ?? "",
      classItem.classGroupId,
      classItem.subjectLevelId,
      periodId
    ),
    enabled: Boolean(schoolId),
  })
  const appreciationsQuery = useQuery({
    ...teacherAppreciationsQueryOptions(
      schoolId ?? "",
      classItem.classGroupId,
      classItem.subjectLevelId,
      periodId
    ),
    enabled: Boolean(schoolId),
  })
  const students = useMemo(
    () => gridQuery.data?.students ?? [],
    [gridQuery.data?.students]
  )
  const existingByEnrollment = useMemo(
    () =>
      new Map(
        (appreciationsQuery.data ?? []).map((appreciation) => [
          appreciation.studentEnrollmentId,
          appreciation,
        ])
      ),
    [appreciationsQuery.data]
  )

  useEffect(() => {
    if (!gridQuery.data || !appreciationsQuery.data) return
    setCurrentIndex(0)
    setDrafts(
      Object.fromEntries(
        gridQuery.data.students.map((student) => {
          const existing = existingByEnrollment.get(student.studentEnrollmentId)
          return [
            student.studentEnrollmentId,
            {
              comment: existing?.comment ?? "",
              label: existing?.label ?? "",
            },
          ]
        })
      )
    )
  }, [appreciationsQuery.data, existingByEnrollment, gridQuery.data])

  const changedAppreciations = useMemo(
    () =>
      buildChangedTeacherAppreciations({
        drafts,
        existing: existingByEnrollment,
        periodId,
        students,
        subjectLevelId: classItem.subjectLevelId,
      }),
    [classItem.subjectLevelId, drafts, existingByEnrollment, periodId, students]
  )
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!schoolId || !changedAppreciations.length) {
        throw new Error("Missing appreciation changes")
      }
      return saveTeacherAppreciations(schoolId, changedAppreciations)
    },
    onSuccess: () => {
      toast.success(
        teacherCopy("Appreciations enregistrees.", "Comments saved.")
      )
      void queryClient.invalidateQueries({ queryKey: ["teacher"] })
    },
    onError: showApiError,
  })
  const currentStudent = students[currentIndex] ?? null
  const currentDraft = currentStudent
    ? (drafts[currentStudent.studentEnrollmentId] ?? {
        comment: "",
        label: "",
      })
    : null
  const updateCurrentDraft = (update: Partial<TeacherAppreciationDraft>) => {
    if (!currentStudent) return
    setDrafts((current) => ({
      ...current,
      [currentStudent.studentEnrollmentId]: {
        comment: currentDraft?.comment ?? "",
        label: currentDraft?.label ?? "",
        ...update,
      },
    }))
  }

  if (gridQuery.isLoading || appreciationsQuery.isLoading) {
    return (
      <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
    )
  }
  if (gridQuery.isError || appreciationsQuery.isError) {
    return (
      <DashboardState
        actionLabel={m.auth_retry()}
        onAction={() => {
          void Promise.all([gridQuery.refetch(), appreciationsQuery.refetch()])
        }}
        description={m.mobile_dashboard_error_description()}
        kind="error"
        title={m.mobile_dashboard_error_title()}
      />
    )
  }
  if (!currentStudent || !currentDraft) {
    return (
      <DashboardState
        description={teacherCopy(
          "Aucun eleve actif dans cette classe.",
          "There are no active students in this class."
        )}
        kind="empty"
        title={teacherCopy("Aucun eleve", "No students")}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-dark"
            style={{
              width: `${((currentIndex + 1) / students.length) * 100}%`,
            }}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {currentIndex + 1}/{students.length}
        </span>
      </div>
      <Card className="gap-5 p-5">
        <div className="flex items-center gap-3">
          <PersonAvatar
            className="size-12"
            name={`${currentStudent.firstName} ${currentStudent.lastName}`}
            src={currentStudent.photoUrl}
          />
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {currentStudent.firstName} {currentStudent.lastName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {classItem.classGroupCode} - {classItem.subjectName}
            </div>
          </div>
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel>
              {teacherCopy("Appreciation", "Comment label")}
            </FieldLabel>
            <div className="flex flex-wrap gap-2">
              {TEACHER_APPRECIATION_LABELS.map((label) => (
                <Button
                  key={label}
                  onClick={() => updateCurrentDraft({ label })}
                  size="sm"
                  type="button"
                  variant={currentDraft.label === label ? "default" : "outline"}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Input
              maxLength={100}
              onChange={(event) =>
                updateCurrentDraft({ label: event.target.value })
              }
              placeholder={teacherCopy(
                "Ou saisir une appreciation",
                "Or enter a comment label"
              )}
              value={currentDraft.label}
            />
          </Field>
          <Field>
            <FieldLabel>{teacherCopy("Commentaire", "Comment")}</FieldLabel>
            <Textarea
              maxLength={500}
              onChange={(event) =>
                updateCurrentDraft({ comment: event.target.value })
              }
              placeholder={teacherCopy(
                "Commentaire facultatif",
                "Optional comment"
              )}
              value={currentDraft.comment}
            />
          </Field>
        </FieldGroup>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Button
          disabled={currentIndex === 0 || saveMutation.isPending}
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          variant="outline"
        >
          {teacherCopy("Precedent", "Previous")}
        </Button>
        <Button
          disabled={
            currentIndex >= students.length - 1 || saveMutation.isPending
          }
          onClick={() =>
            setCurrentIndex((index) => Math.min(students.length - 1, index + 1))
          }
          variant="outline"
        >
          {teacherCopy("Suivant", "Next")}
        </Button>
      </div>
      <Button
        disabled={!changedAppreciations.length || saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        {saveMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <CheckCircle2 />
        )}
        {teacherCopy("Enregistrer les appreciations", "Save comments")}
      </Button>
    </div>
  )
}

function TeacherEvaluationCreatePage({
  defaultClass,
  evaluation,
  onBack,
  onSaved,
  periodOptions,
  schoolId,
  selectedPeriodId,
}: {
  defaultClass: TeacherClassSummary | null
  evaluation: TeacherEvaluation | null
  onBack: () => void
  onSaved: (evaluation: TeacherEvaluation, mode: "create" | "edit") => void
  periodOptions: ContextPeriodOption[]
  schoolId: string | null
  selectedPeriodId: string | null
}) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(evaluation)
  const dashboardQuery = useQuery({
    ...teacherDashboardQueryOptions(
      schoolId ?? "",
      selectedPeriodId ?? undefined
    ),
    enabled: Boolean(schoolId),
  })
  const classes = useMemo(
    () => dashboardQuery.data?.classes ?? [],
    [dashboardQuery.data?.classes]
  )
  const [selectedClassKey, setSelectedClassKey] = useState(
    defaultClass
      ? `${defaultClass.classGroupId}:${defaultClass.subjectLevelId}`
      : ""
  )
  const [title, setTitle] = useState("")
  const [type, setType] = useState<TeacherEvaluationType>("QUIZ")
  const [date, setDate] = useState(() => localIsoDate(new Date()))
  const [description, setDescription] = useState("")
  const [formPeriodId, setFormPeriodId] = useState<string | null>(
    evaluation?.periodId ?? selectedPeriodId ?? periodOptions[0]?.id ?? null
  )
  const selectedClass =
    classes.find(
      (classItem) =>
        `${classItem.classGroupId}:${classItem.subjectLevelId}` ===
        selectedClassKey
    ) ??
    defaultClass ??
    classes[0] ??
    null
  const mutation = useMutation({
    mutationFn: () => {
      if (!schoolId || !selectedClass) {
        throw new Error("Missing school or class")
      }
      const input = {
        classGroupId: selectedClass.classGroupId,
        date: new Date(`${date}T12:00:00`).toISOString(),
        description: description.trim() || undefined,
        periodId: formPeriodId ?? selectedPeriodId ?? undefined,
        subjectLevelId: selectedClass.subjectLevelId,
        title: title.trim(),
        type,
        weight: 1,
      }

      return isEditing && evaluation
        ? updateTeacherEvaluation(schoolId, evaluation.id, input)
        : createTeacherEvaluation(schoolId, input)
    },
    onSuccess: (savedEvaluation) => {
      void queryClient.invalidateQueries({ queryKey: ["teacher"] })
      toast.success(
        isEditing
          ? teacherCopy("Evaluation modifiee.", "Evaluation updated.")
          : teacherCopy("Evaluation creee.", "Evaluation created.")
      )
      onSaved(savedEvaluation, isEditing ? "edit" : "create")
    },
    onError: showApiError,
  })

  useEffect(() => {
    if (evaluation) {
      setSelectedClassKey(
        `${evaluation.classGroupId}:${evaluation.subjectLevelId}`
      )
      setTitle(evaluation.title)
      setType(evaluation.type)
      setDate(localIsoDate(new Date(evaluation.date)))
      setDescription(evaluation.description ?? "")
      setFormPeriodId(evaluation.periodId ?? selectedPeriodId ?? null)
      return
    }
    if (selectedClassKey) return
    if (defaultClass) {
      setSelectedClassKey(
        `${defaultClass.classGroupId}:${defaultClass.subjectLevelId}`
      )
      return
    }
    if (classes[0]) {
      setSelectedClassKey(
        `${classes[0].classGroupId}:${classes[0].subjectLevelId}`
      )
    }
  }, [classes, defaultClass, evaluation, selectedClassKey, selectedPeriodId])

  useEffect(() => {
    if (formPeriodId) return
    setFormPeriodId(selectedPeriodId ?? periodOptions[0]?.id ?? null)
  }, [formPeriodId, periodOptions, selectedPeriodId])

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_reports_evaluations()}
        title={
          isEditing
            ? teacherCopy("Modifier l'evaluation", "Edit evaluation")
            : teacherCopy("Nouvelle evaluation", "New evaluation")
        }
      />
      <div className="flex flex-col gap-5 px-5 pt-4 pb-28">
        <p className="text-sm text-muted-foreground">
          {teacherCopy(
            "Preparez une evaluation puis saisissez les notes.",
            "Prepare an evaluation, then enter grades."
          )}
        </p>
        {dashboardQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : dashboardQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void dashboardQuery.refetch()
            }}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            title={m.mobile_dashboard_error_title()}
          />
        ) : (
          <FieldGroup>
            <Field>
              <FieldLabel>
                {teacherCopy("Classe et matiere", "Class and subject")}
              </FieldLabel>
              <div className="flex flex-col gap-2">
                {classes.map((classItem) => {
                  const key = `${classItem.classGroupId}:${classItem.subjectLevelId}`
                  const selected = key === selectedClassKey

                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "rounded-xl border p-4 text-left focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected
                          ? "border-brand-dark bg-brand-soft text-brand-dark"
                          : "bg-background"
                      )}
                      key={key}
                      onClick={() => setSelectedClassKey(key)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">
                        {classItem.classGroupCode} - {classItem.subjectName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {classItem.enrollmentCount} {m.mobile_students_label()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field>
              <FieldLabel>{teacherCopy("Titre", "Title")}</FieldLabel>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>
                {getRouteLocale() === "fr" ? "Periode" : "Period"}
              </FieldLabel>
              <PeriodContextSelector
                onSelect={setFormPeriodId}
                options={periodOptions}
                selectedId={formPeriodId}
              />
            </Field>
            <Field>
              <FieldLabel>{m.mobile_date()}</FieldLabel>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{teacherCopy("Type", "Type")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {MOBILE_EVALUATION_TYPES.map((nextType) => (
                  <Button
                    className="rounded-full"
                    key={nextType}
                    onClick={() => setType(nextType)}
                    size="sm"
                    type="button"
                    variant={type === nextType ? "default" : "outline"}
                  >
                    {formatEvaluationType(nextType)}
                  </Button>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel>
                {teacherCopy("Description", "Description")}
              </FieldLabel>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
          </FieldGroup>
        )}
      </div>
      <MobileFloatingBar align="stretch" hideOnScroll={false} variant="bar">
        <Button
          disabled={!title.trim() || !selectedClass || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          {isEditing
            ? teacherCopy("Enregistrer", "Save")
            : teacherCopy("Creer", "Create")}
        </Button>
      </MobileFloatingBar>
    </div>
  )
}

function TeacherGradeEntry({
  evaluation,
  onBack,
  schoolId,
}: {
  evaluation: TeacherEvaluation | null
  onBack: () => void
  schoolId: string | null
}) {
  const queryClient = useQueryClient()
  const [scores, setScores] = useState<Record<string, string>>({})
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const gridQuery = useQuery({
    ...teacherEvaluationGradeGridQueryOptions(
      schoolId ?? "",
      evaluation?.id ?? ""
    ),
    enabled: Boolean(schoolId && evaluation?.id),
  })
  const grid = gridQuery.data
  const currentStudent = grid?.students[currentIndex] ?? null
  const currentScore = currentStudent
    ? (scores[currentStudent.enrollmentId] ?? "")
    : ""
  const stepLabel = grid
    ? `${Math.min(currentIndex + 1, grid.totalStudents)}/${grid.totalStudents}`
    : ""
  const changedGrades = useMemo(
    () => buildChangedTeacherGrades(grid?.students ?? [], scores),
    [grid?.students, scores]
  )

  useEffect(() => {
    if (!grid) return
    setCurrentIndex(0)
    setScores(
      Object.fromEntries(
        grid.students.map((student) => [
          student.enrollmentId,
          student.grade == null ? "" : String(student.grade),
        ])
      )
    )
  }, [grid])

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!schoolId || !evaluation || !grid)
        throw new Error("Missing evaluation")
      return saveTeacherEvaluationGrades(schoolId, evaluation.id, changedGrades)
    },
    onSuccess: () => {
      toast.success(teacherCopy("Notes enregistrees.", "Grades saved."))
      void queryClient.invalidateQueries({ queryKey: ["teacher"] })
    },
    onError: showApiError,
  })
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !evaluation) throw new Error("Missing evaluation")
      if (changedGrades.length) {
        await saveTeacherEvaluationGrades(
          schoolId,
          evaluation.id,
          changedGrades
        )
      }
      return publishTeacherEvaluation(schoolId, evaluation.id)
    },
    onSuccess: () => {
      toast.success(teacherCopy("Evaluation publiee.", "Evaluation published."))
      setConfirmPublish(false)
      void queryClient.invalidateQueries({ queryKey: ["teacher"] })
      onBack()
    },
    onError: showApiError,
  })
  const setCurrentScore = useCallback(
    (nextScore: string) => {
      if (!currentStudent || !grid) return
      const normalized = nextScore.replace(",", ".")
      if (normalized && !/^\d{0,2}(\.\d{0,2})?$/.test(normalized)) return
      const numericScore = Number(normalized)
      if (
        normalized &&
        Number.isFinite(numericScore) &&
        numericScore > grid.maxScore
      ) {
        return
      }
      setScores((current) => ({
        ...current,
        [currentStudent.enrollmentId]: normalized,
      }))
    },
    [currentStudent, grid]
  )
  const goPrevious = () => setCurrentIndex((index) => Math.max(0, index - 1))
  const validateCurrent = () => {
    if (!grid) return
    if (currentIndex < grid.students.length - 1) {
      setCurrentIndex((index) => Math.min(grid.students.length - 1, index + 1))
      return
    }
    saveMutation.mutate()
  }

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={[
          evaluation?.classGroup?.code,
          evaluation?.subjectLevel?.subject.name,
        ]
          .filter(Boolean)
          .join(" - ")}
        title={evaluation?.title ?? m.mobile_reports_evaluations()}
      />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-24">
        {!evaluation ? (
          <DashboardState
            description={teacherCopy(
              "Selectionnez une evaluation depuis la liste.",
              "Select an evaluation from the list."
            )}
            kind="empty"
            title={m.mobile_home_upcoming_evaluations_empty_title()}
          />
        ) : gridQuery.isLoading ? (
          <DashboardState kind="loading" title={m.mobile_dashboard_loading()} />
        ) : gridQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void gridQuery.refetch()
            }}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            title={m.mobile_dashboard_error_title()}
          />
        ) : grid ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-dark"
                  style={{
                    width: grid.totalStudents
                      ? `${((currentIndex + 1) / grid.totalStudents) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {stepLabel}
              </span>
            </div>
            {currentStudent ? (
              <Card className="items-center gap-5 p-5 text-center">
                <Badge
                  className="self-end"
                  variant={grid.status === "PUBLISHED" ? "success" : "neutral"}
                >
                  {formatEvaluationStatus(grid.status)}
                </Badge>
                <PersonAvatar
                  className="size-16"
                  name={currentStudent.studentName}
                  src={currentStudent.photoUrl}
                />
                <div>
                  <div className="font-semibold">
                    {currentStudent.studentName}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {teacherCopy("Note actuelle", "Current grade")} :{" "}
                    {currentScore
                      ? `${currentScore}/${formatGradeDenom(grid.maxScore)}`
                      : "-"}
                  </div>
                </div>
                <div className="flex h-20 w-40 items-center justify-center rounded-xl border bg-background px-4 text-center shadow-xs">
                  <Input
                    aria-label={teacherCopy("Note", "Grade")}
                    className="h-auto min-w-0 border-0 bg-transparent p-0 text-center font-mono text-3xl font-semibold shadow-none focus-visible:ring-0"
                    inputMode="decimal"
                    onChange={(event) => setCurrentScore(event.target.value)}
                    pattern="[0-9]*[.,]?[0-9]*"
                    placeholder="-"
                    type="text"
                    value={currentScore}
                  />
                  <span className="ml-1 shrink-0 text-sm text-muted-foreground">
                    /{formatGradeDenom(grid.maxScore)}
                  </span>
                </div>
              </Card>
            ) : null}
          </>
        ) : null}
      </div>
      {evaluation && grid ? (
        <MobileFloatingBar align="stretch" hideOnScroll={false} variant="bar">
          <Button
            disabled={currentIndex === 0 || saveMutation.isPending}
            onClick={goPrevious}
            variant="outline"
          >
            ← {teacherCopy("Precedent", "Previous")}
          </Button>
          <Button
            disabled={saveMutation.isPending || !changedGrades.length}
            onClick={validateCurrent}
          >
            {saveMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : currentIndex >= grid.students.length - 1 ? (
              <CheckCircle2 />
            ) : null}
            {currentIndex >= grid.students.length - 1
              ? teacherCopy("Enregistrer", "Save")
              : teacherCopy("Valider", "Validate")}
          </Button>
          {evaluation.status === "DRAFT" ? (
            <Button
              disabled={publishMutation.isPending}
              onClick={() => setConfirmPublish(true)}
              variant="outline"
            >
              <Upload data-icon="inline-start" />
              {teacherCopy("Publier", "Publish")}
            </Button>
          ) : null}
        </MobileFloatingBar>
      ) : null}
      <Drawer open={confirmPublish} onOpenChange={setConfirmPublish}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {teacherCopy("Publier les notes ?", "Publish grades?")}
            </DrawerTitle>
            <DrawerDescription>
              {teacherCopy(
                "Les parents et eleves pourront voir les notes publiees.",
                "Parents and students will see published grades."
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
            >
              {publishMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Upload />
              )}
              {teacherCopy("Publier", "Publish")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{m.mobile_cancel()}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function TeacherSchedule({
  initialClassId,
  onBack,
  onOpenCourseAttendance,
  schoolId,
}: {
  initialClassId: string
  onBack: () => void
  onOpenCourseAttendance: (context: CourseAttendanceRouteContext | null) => void
  schoolId: string | null
}) {
  const [selectedDay, setSelectedDay] = useState<StudentScheduleDay>("MONDAY")
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const appliedInitialClassIdRef = useRef<string | null>(null)
  const scheduleQuery = useQuery({
    ...teacherScheduleQueryOptions(schoolId ?? ""),
    enabled: Boolean(schoolId),
  })
  const slots = useMemo(
    () => scheduleQuery.data?.slots ?? [],
    [scheduleQuery.data?.slots]
  )
  const classFilters = useMemo(
    () => getTeacherScheduleClassFilters(slots),
    [slots]
  )
  const filteredSlots = useMemo(
    () =>
      selectedClassId === "all"
        ? slots
        : slots.filter((slot) => slot.classGroup.id === selectedClassId),
    [selectedClassId, slots]
  )
  const slotsByDay = useMemo(
    () => groupTeacherScheduleSlotsByDay(filteredSlots),
    [filteredSlots]
  )
  const selectedSlots = slotsByDay.get(selectedDay) ?? []

  useEffect(() => {
    if (initialClassId && initialClassId !== appliedInitialClassIdRef.current) {
      appliedInitialClassIdRef.current = initialClassId
      setSelectedClassId(initialClassId)
    }
  }, [initialClassId])

  useEffect(() => {
    const firstDayWithSlots = scheduleDays.find(
      (day) => (slotsByDay.get(day)?.length ?? 0) > 0
    )
    if (firstDayWithSlots) setSelectedDay(firstDayWithSlots)
  }, [slotsByDay])

  useEffect(() => {
    if (
      selectedClassId !== "all" &&
      !classFilters.some((classFilter) => classFilter.id === selectedClassId)
    ) {
      setSelectedClassId("all")
    }
  }, [classFilters, selectedClassId])

  return (
    <div>
      <MobileHeader
        onBack={onBack}
        subtitle={m.mobile_schedule_eyebrow()}
        title={formatScheduleDayShort(selectedDay)}
      />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
        {scheduleQuery.isLoading ? (
          <ScheduleSkeleton />
        ) : scheduleQuery.isError ? (
          <DashboardState
            actionLabel={m.auth_retry()}
            onAction={() => {
              void scheduleQuery.refetch()
            }}
            description={m.mobile_dashboard_error_description()}
            kind="error"
            title={m.mobile_dashboard_error_title()}
          />
        ) : !slots.length ? (
          <DashboardState
            description={m.mobile_schedule_empty_description()}
            kind="empty"
            title={m.mobile_schedule_empty_title()}
          />
        ) : (
          <>
            <TeacherClassContextSelector
              onSelect={setSelectedClassId}
              options={classFilters}
              selectedId={selectedClassId}
            />
            <div className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
              {scheduleDays.map((day) => {
                const selected = day === selectedDay
                const count = slotsByDay.get(day)?.length ?? 0

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "flex min-w-16 shrink-0 flex-col items-center gap-1 rounded-xl border bg-background px-3 py-2 text-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      selected
                        ? "border-brand-dark bg-brand-soft text-brand-dark"
                        : "text-muted-foreground"
                    )}
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    type="button"
                  >
                    <span className="text-[10px] font-semibold uppercase">
                      {formatScheduleDayShort(day)}
                    </span>
                    <span className="font-mono text-sm font-bold">{count}</span>
                  </button>
                )
              })}
            </div>
            {selectedSlots.length ? (
              <Card className="gap-0 p-0">
                {selectedSlots.map((slot, index) => (
                  <div key={slot.id}>
                    <TeacherScheduleRow
                      onOpenAttendance={() =>
                        onOpenCourseAttendance(
                          getCourseAttendanceContextFromScheduleSlot(slot)
                        )
                      }
                      slot={slot}
                    />
                    {index < selectedSlots.length - 1 && <Separator />}
                  </div>
                ))}
              </Card>
            ) : (
              <DashboardState
                description={m.mobile_schedule_day_empty_description()}
                kind="empty"
                title={m.mobile_schedule_day_empty_title()}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TeacherScheduleRow({
  onOpenAttendance,
  slot,
}: {
  onOpenAttendance: () => void
  slot: TeacherScheduleSlot
}) {
  const subjectColor = getSubjectColor(
    slot.subjectLevel.subject.code || slot.subjectLevel.subject.name,
    slot.subjectLevel.subject.color
  )
  const teacherName = formatScheduleTeacher(slot)
  const duration = formatScheduleSlotDuration(slot.startTime, slot.endTime)

  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 p-4">
      <div className="flex flex-col items-center justify-center border-r pr-3 text-center">
        <div className="font-mono text-sm font-bold">{slot.startTime}</div>
        <div className="mt-1 font-mono text-xs text-muted-foreground">
          {slot.endTime}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
            style={{ backgroundColor: subjectColor.border }}
          />
          {slot.subjectLevel.subject.name}
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <PersonAvatar
            className="size-8"
            name={teacherName}
            size="sm"
            src={slot.staffAssignment.identity.photoUrl}
            tone="staff"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted-foreground">
              {teacherName}
              {slot.classGroup.code ? ` - ${slot.classGroup.code}` : ""}
            </div>
            <div className="text-xs text-muted-foreground">{duration}</div>
          </div>
        </div>
      </div>
      <Button
        aria-label={teacherCopy("Faire l'appel", "Take attendance")}
        onClick={onOpenAttendance}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <ListChecks data-icon="icon" />
      </Button>
    </div>
  )
}

function BottomNav<T extends string>({
  active,
  items,
  onChange,
}: {
  active: T
  items: Array<{
    badge?: string
    icon: React.ComponentType
    id: T
    label: string
  }>
  onChange: (id: T) => void
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
              {item.badge && (
                <span className="absolute -top-1 -right-2 grid min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[8px] leading-3.5 text-white">
                  {item.badge}
                </span>
              )}
            </span>
            <span className="truncate px-1">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function formatNotificationBadge(count: number) {
  if (count <= 0) return undefined
  return count > 9 ? "9+" : String(count)
}

function DashboardState({
  actionLabel,
  description,
  kind,
  onAction,
  title,
}: {
  actionLabel?: string
  description?: string
  kind: "empty" | "error" | "loading"
  onAction?: () => void
  title: string
}) {
  if (kind === "loading") {
    return (
      <Card className="gap-3" size="sm">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </Card>
    )
  }

  return (
    <Card size="sm">
      <Empty className="p-4">
        {kind === "error" && (
          <AlertTriangle className="size-5 text-destructive" />
        )}
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
        {actionLabel && onAction ? (
          <Button
            className="mt-1 rounded-full"
            onClick={onAction}
            type="button"
            variant="outline"
          >
            {actionLabel}
          </Button>
        ) : null}
      </Empty>
    </Card>
  )
}

function StudentMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3 text-white">
      <div className="text-[10px] font-bold tracking-[0.12em] text-white/60 uppercase">
        {label}
      </div>
      <div className="mt-2 font-mono text-xl leading-none font-semibold text-white">
        {value}
      </div>
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

const DEFAULT_GRADING_SCALE: ParentGradingScale = {
  min: 0,
  max: 20,
  passingGrade: 10,
}

function ReportGradeBadge({
  gradingScale = DEFAULT_GRADING_SCALE,
  value,
}: {
  gradingScale?: ParentGradingScale
  value: number | null | undefined
}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return (
      <Badge className="rounded-[6px] font-mono tabular-nums" variant="neutral">
        -
        <span className="text-[0.7em] font-medium opacity-65">
          /{formatGradeDenom(gradingScale.max)}
        </span>
      </Badge>
    )
  }

  return (
    <GradeCell
      denom={gradingScale.max}
      passingGrade={gradingScale.passingGrade}
      value={value}
    />
  )
}

function getLatestPeriodReportCard(reportCards: ChildReportCard[]) {
  const periodReportCards = reportCards.filter(
    (reportCard) => reportCard.kind === "PERIOD" && reportCard.periodId
  )

  return (
    [...periodReportCards].sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    )[0] ?? null
  )
}

function formatReportPeriodShort(reportCard: ChildReportCard | null) {
  return formatAcademicPeriodDisplay(
    null,
    reportCard?.periodCode ?? reportCard?.periodName ?? null
  )
}

function getReportPeriodOptions(
  reportCards: ChildReportCard[],
  activePeriod: AcademicPeriod | null
): ContextPeriodOption[] {
  const options = new Map<string, ContextPeriodOption>()

  for (const reportCard of reportCards) {
    if (reportCard.kind !== "PERIOD" || !reportCard.periodId) continue

    options.set(reportCard.periodId, {
      id: reportCard.periodId,
      label: formatReportPeriodShort(reportCard),
      meta: reportCard.generatedAt
        ? fmtDate(reportCard.generatedAt, "medium")
        : null,
    })
  }

  if (activePeriod && !options.has(activePeriod.id)) {
    options.set(activePeriod.id, {
      id: activePeriod.id,
      label: formatAcademicPeriodShort(activePeriod),
      meta: formatPeriodDateRange(activePeriod),
    })
  }

  return [...options.values()]
}

function coerceMobileAcademicPeriod(
  period: MobileAcademicPeriod
): AcademicPeriod {
  return {
    closedAt: period.closedAt,
    closedById: period.closedById,
    code: period.code,
    endDate: period.endDate,
    id: period.id,
    name: period.name,
    schoolYearId: period.schoolYearId,
    sequence: period.sequence,
    startDate: period.startDate,
    status: period.status,
    type: period.type,
  }
}

function getAcademicYearPeriodOptions(
  year: MobileSchoolYear | null
): ContextPeriodOption[] {
  return (year?.periods ?? []).map((period) => {
    const academicPeriod = coerceMobileAcademicPeriod(period)
    return {
      id: period.id,
      label: formatAcademicPeriodShort(academicPeriod),
      meta: formatPeriodDateRange(academicPeriod),
    }
  })
}

function getDefaultAcademicPeriod(
  year: MobileSchoolYear | null
): MobileAcademicPeriod | null {
  if (!year?.periods.length) return null

  const now = new Date()
  return (
    year.periods.find((period) => {
      const startDate = new Date(period.startDate)
      const endDate = new Date(period.endDate)
      return startDate <= now && endDate >= now
    }) ??
    year.periods.find((period) => period.status === "OPEN") ??
    year.periods[0] ??
    null
  )
}

function getInitialMonthForSchoolYear(year: MobileSchoolYear | null) {
  if (!year) return startOfMonthDate(new Date())

  const today = new Date()
  const startDate = new Date(year.startDate)
  const endDate = new Date(year.endDate)
  if (startDate <= today && endDate >= today) {
    return startOfMonthDate(today)
  }

  return startOfMonthDate(startDate)
}

function formatSchoolYearRange(year: MobileSchoolYear) {
  return `${fmtDate(year.startDate, "short")} - ${fmtDate(year.endDate, "short")}`
}

function formatPeriodDateRange(period: AcademicPeriod) {
  return `${fmtDate(period.startDate, "short")} - ${fmtDate(period.endDate, "short")}`
}

function formatAcademicPeriodShort(period: AcademicPeriod | null) {
  return formatAcademicPeriodDisplay(period)
}

function formatAcademicPeriodDisplay(
  period: AcademicPeriod | null,
  fallback?: string | null
) {
  if (period) {
    return formatAcademicPeriodName(period.type, period.sequence, period.name)
  }

  const value = fallback?.trim()
  const codeMatch = value?.match(/^([TS])\s*(\d+)$/i)

  if (codeMatch) {
    return formatAcademicPeriodName(
      codeMatch[1]!.toUpperCase() === "S" ? "SEMESTER" : "TRIMESTER",
      Number(codeMatch[2]),
      value ?? m.mobile_reports_period_short()
    )
  }

  return value || m.mobile_reports_period_short()
}

function formatAcademicPeriodName(
  type: string | null | undefined,
  sequence: number,
  fallback: string
) {
  const isFrench = getRouteLocale() === "fr"

  if (type === "TRIMESTER") {
    return isFrench ? `Trimestre ${sequence}` : `Trimester ${sequence}`
  }

  if (type === "SEMESTER") {
    return isFrench ? `Semestre ${sequence}` : `Semester ${sequence}`
  }

  if (sequence) {
    return isFrench ? `Période ${sequence}` : `Period ${sequence}`
  }

  return fallback
}

function formatReportsChildName(child: ParentChildSummary | ParentGradesChild) {
  return `${child.firstName} ${child.lastName}`.trim()
}

type AcademicAccessBlockReason = "card" | "tuition"

interface AcademicAccessBlockState {
  amount: number | null
  blocked: boolean
  reason: AcademicAccessBlockReason | null
}

function mapGradesChildToSummary(
  child: ParentGradesChild,
  fallbackChildren: ParentChildSummary[]
): ParentChildSummary {
  const fallback = fallbackChildren.find(
    (item) => item.identityId === child.identityId
  )

  return {
    academicAccess: fallback?.academicAccess ?? "LOCKED",
    balance: fallback?.balance ?? 0,
    cardAmountDue: fallback?.cardAmountDue ?? 0,
    cardStatus: fallback?.cardStatus ?? null,
    classGroupCode: child.classGroup.code,
    classGroupName: child.classGroup.name,
    enrollmentId: child.enrollmentId,
    firstName: child.firstName,
    lastName: child.lastName,
    latestGrade: fallback?.latestGrade ?? null,
    periodAverage: child.periodAverage,
    photoUrl: child.photoUrl ?? fallback?.photoUrl ?? null,
    presenceToday: fallback?.presenceToday ?? {
      entryTime: null,
      status: "unknown",
    },
    rank: child.rank,
    identityId: child.identityId,
    totalStudents: child.totalStudents,
  }
}

function formatReportsChildClass(
  child: ParentChildSummary | ParentGradesChild
) {
  if ("classGroup" in child) {
    return child.classGroup.code
  }

  return child.classGroupCode
}

function formatReportsRank(child: ParentChildSummary | ParentGradesChild) {
  if (child.rank && child.totalStudents) {
    return m.mobile_reports_rank_line({
      rank: formatOrdinalPosition(child.rank),
      total: child.totalStudents,
    })
  }

  return m.mobile_reports_rank_unavailable()
}

function formatGradeScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-"
  return value.toFixed(1)
}

function getGradeEvolutionBarClassName(
  score: number,
  gradingScale: ParentGradingScale
) {
  const passingGrade =
    gradingScale.passingGrade > gradingScale.min
      ? gradingScale.passingGrade
      : gradingScale.min + (gradingScale.max - gradingScale.min) / 2
  const goodThreshold = passingGrade + (gradingScale.max - passingGrade) / 2

  if (score >= goodThreshold) return "bg-brand"
  if (score >= passingGrade) return "bg-[#EAB308]"
  return "bg-destructive"
}

function formatGradeDenom(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function getReportsChildGradingScale(
  child: ParentChildSummary | ParentGradesChild | null | undefined
): ParentGradingScale {
  if (child && "gradingScale" in child) {
    return child.gradingScale
  }

  return DEFAULT_GRADING_SCALE
}

function getSubjectClassAverage(evaluations: ParentSubjectGrade[]) {
  const classAverages = evaluations
    .map((evaluation) => evaluation.classAverage)
    .filter((value): value is number => typeof value === "number")

  if (classAverages.length === 0) return null

  const total = classAverages.reduce((sum, value) => sum + value, 0)
  return Math.round((total / classAverages.length) * 10) / 10
}

function shouldMaskSubjectEvaluationScore(
  evaluation: ParentSubjectGrade,
  paymentBlockReason: AcademicAccessBlockReason | null
) {
  if (!paymentBlockReason) return false
  if (paymentBlockReason === "card") return true

  return isFinalExamEvaluationType(evaluation.type)
}

function isFinalExamEvaluationType(type: string | null) {
  return type === "EXAM"
}

function getFirstName(name: string) {
  return name.split(" ")[0] ?? name
}

function getStudentDashboardName(info: StudentDashboard["info"]) {
  return `${info.firstName} ${info.lastName}`.trim()
}

function dashboardToReportChild(
  dashboard: StudentDashboard | undefined
): ParentChildSummary | null {
  if (!dashboard) return null

  return {
    academicAccess: dashboard.academicAccess,
    cardAmountDue: dashboard.cardAmountDue,
    cardStatus: dashboard.cardStatus,
    enrollmentId: dashboard.info.enrollmentId,
    identityId: dashboard.info.identityId,
    firstName: dashboard.info.firstName,
    lastName: dashboard.info.lastName,
    photoUrl: dashboard.info.photoUrl,
    classGroupCode: dashboard.info.classGroupCode,
    classGroupName: dashboard.info.classGroupName,
    presenceToday: { entryTime: null, status: "absent" },
    latestGrade: null,
    balance: dashboard.balance,
    periodAverage: dashboard.grades.periodAverage,
    rank: dashboard.grades.rank,
    totalStudents: dashboard.grades.totalStudents,
  }
}

function formatStudentDashboardRank(dashboard: StudentDashboard) {
  if (dashboard.grades.rank && dashboard.grades.totalStudents) {
    return formatRankPosition(
      dashboard.grades.rank,
      dashboard.grades.totalStudents
    )
  }

  return "-"
}

function formatStudentName(child: ParentChildSummary) {
  return `${child.firstName} ${child.lastName}`.trim()
}

function getChildScopeId(
  child: ParentChildSummary,
  idType: "enrollment" | "identity"
) {
  return idType === "identity" ? child.identityId : child.enrollmentId
}

function formatGrade(value: number) {
  return value.toFixed(1).replace(".", ",")
}

function formatRank(child: ParentChildSummary) {
  if (child.rank && child.totalStudents) {
    return formatRankPosition(child.rank, child.totalStudents)
  }

  return "-"
}

function formatChildRank(
  child: ParentChildSummary,
  gradesChild: ParentGradesChild | null
) {
  if (gradesChild) {
    return gradesChild.rank && gradesChild.totalStudents
      ? formatRankPosition(gradesChild.rank, gradesChild.totalStudents)
      : null
  }

  const rank = formatRank(child)
  return rank === "-" ? null : rank
}

function formatRankPosition(rank: number, total: number) {
  return `${formatOrdinalPosition(rank)}/${total}`
}

function formatOrdinalPosition(value: number) {
  if (getRouteLocale() === "en") {
    const mod10 = value % 10
    const mod100 = value % 100
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`
    if (mod10 === 1) return `${value}st`
    if (mod10 === 2) return `${value}nd`
    if (mod10 === 3) return `${value}rd`
    return `${value}th`
  }

  return value === 1 ? "1er" : `${value}e`
}

function formatPresenceStatus(
  status: ParentChildSummary["presenceToday"]["status"]
) {
  switch (status) {
    case "present":
      return m.mobile_status_present()
    case "absent":
      return m.mobile_status_absent()
    case "late":
      return m.mobile_status_late()
    case "unknown":
      return m.mobile_status_unknown()
  }
}

function buildPresenceCalendar(
  presence: ParentChildPresence,
  monthDate: Date,
  range: MonthRange
): Array<PresenceCalendarCell | null> {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const dayCount = new Date(year, month + 1, 0).getDate()
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7
  const todayIso = localIsoDate(new Date())
  const activeDays = new Set(presence.stats.classDays)
  const eventsByDay = groupPresenceDaysInRange(presence, range)

  const cells: Array<PresenceCalendarCell | null> = Array.from(
    { length: leadingEmptyDays },
    () => null
  )

  for (let day = 1; day <= dayCount; day += 1) {
    const date = new Date(year, month, day)
    const isoDate = localIsoDate(date)
    const dayEvents = eventsByDay.get(isoDate) ?? null
    let status: PresenceCalendarStatus

    if (dayEvents) {
      status = getPresencePortalCalendarStatus(dayEvents)
    } else if (!activeDays.has(toApiDayOfWeek(date))) {
      status = "off"
    } else if (isoDate >= todayIso) {
      status = "future"
    } else {
      status = "no-event"
    }

    cells.push({
      day,
      dayEvents,
      hasJustification: Boolean(
        dayEvents?.events.some((event) => event.justification)
      ),
      isoDate,
      status,
    })
  }

  return cells
}

function presenceCalendarCellClass(status: PresenceCalendarStatus) {
  switch (status) {
    case "absent":
      return "border-transparent bg-destructive/10 text-destructive"
    case "present":
      return "border-transparent bg-brand-soft text-brand-dark"
    case "late":
      return "border-transparent bg-grade-mid-bg text-grade-mid"
    case "no-event":
      return "border-transparent bg-muted/40 text-muted-foreground/45"
    case "off":
      return "border-transparent bg-transparent text-muted-foreground/55"
    case "future":
      return "border-border/40 bg-transparent text-muted-foreground/35"
  }
}

function formatPresenceCalendarStatus(status: PresenceCalendarStatus) {
  switch (status) {
    case "absent":
      return m.mobile_status_absent()
    case "present":
      return m.mobile_status_present()
    case "late":
      return m.mobile_status_late()
    case "future":
    case "no-event":
    case "off":
      return m.mobile_status_unknown()
  }
}

function groupPresenceDaysInRange(
  presence: ParentChildPresence,
  range: MonthRange
) {
  return groupPresenceDayEvents(
    getPresenceEventsInRange(presence.history.data, range),
    getCourseAttendanceItemsInRange(presence.courseAttendance?.data, range)
  )
}

function getPresenceDayRows(presence: ParentChildPresence, range: MonthRange) {
  return Array.from(groupPresenceDaysInRange(presence, range).values()).sort(
    (left, right) => right.date.localeCompare(left.date)
  )
}

function groupPresenceDayEvents(
  events: ParentPresenceHistoryEvent[],
  courseItems: StudentCourseAttendanceItem[] = []
) {
  const eventsByDay = new Map<string, PresenceDayEvents>()

  for (const event of events) {
    if (event.flag === "DUPLICATE" || event.flag === "NO_ENTRY") continue

    const date = localIsoDate(new Date(event.createdAt))
    const dayEvents =
      eventsByDay.get(date) ??
      ({
        courseItems: [],
        date,
        entry: null,
        events: [],
        exit: null,
        extraCount: 0,
        status: "present",
      } satisfies PresenceDayEvents)

    dayEvents.events.push(event)

    if (event.type === "ENTRY") {
      if (!dayEvents.entry) {
        dayEvents.entry = event
      } else if (event.flag === "LATE" && dayEvents.entry.flag !== "LATE") {
        dayEvents.entry = event
      } else {
        dayEvents.extraCount += 1
      }

      if (event.flag === "LATE") {
        dayEvents.status = "late"
      }
    } else if (event.type === "EXIT") {
      if (!dayEvents.exit) {
        dayEvents.exit = event
      } else {
        dayEvents.extraCount += 1
      }
    }

    eventsByDay.set(date, dayEvents)
  }

  for (const item of courseItems) {
    const dayEvents =
      eventsByDay.get(item.date) ??
      ({
        courseItems: [],
        date: item.date,
        entry: null,
        events: [],
        exit: null,
        extraCount: 0,
        status: "present",
      } satisfies PresenceDayEvents)

    dayEvents.courseItems.push(item)
    eventsByDay.set(item.date, dayEvents)
  }

  for (const dayEvents of eventsByDay.values()) {
    dayEvents.events.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    dayEvents.courseItems.sort((left, right) =>
      left.startTime.localeCompare(right.startTime)
    )
    dayEvents.status = getPresenceDayStatus(dayEvents)
  }

  return eventsByDay
}

function getPresenceDayStatus(
  dayEvents: Pick<PresenceDayEvents, "courseItems" | "events">
): "absent" | "late" | "present" {
  const courseStatus = getCourseAttendanceDayStatus(dayEvents.courseItems)

  if (courseStatus === "absent") return "absent"
  if (
    courseStatus === "late" ||
    dayEvents.events.some((event) => event.flag === "LATE")
  ) {
    return "late"
  }

  return "present"
}

function getPresencePortalCalendarStatus(
  dayEvents: Pick<PresenceDayEvents, "events">
): PresenceCalendarStatus {
  if (!dayEvents.events.length) return "no-event"
  if (dayEvents.events.some((event) => event.flag === "LATE")) return "late"
  return "present"
}

function getPresenceEventsInRange(
  events: ParentPresenceHistoryEvent[],
  range: MonthRange
) {
  return events.filter((event) => {
    const eventDate = localIsoDate(new Date(event.createdAt))
    return eventDate >= range.startDate && eventDate < range.endDate
  })
}

function getCourseAttendanceItemsInRange(
  items: StudentCourseAttendanceItem[] | undefined,
  range: MonthRange
) {
  return (items ?? []).filter(
    (item) => item.date >= range.startDate && item.date < range.endDate
  )
}

function getPresenceCourseCalendarDot(dayEvents: PresenceDayEvents | null) {
  const items = dayEvents?.courseItems ?? []
  if (!items.length) return null

  if (items.some((item) => item.status === "ABSENT")) {
    return { className: "bg-destructive" }
  }

  if (items.some((item) => item.status === "LATE")) {
    return { className: "bg-warning" }
  }

  if (items.some((item) => item.status === "EXCUSED")) {
    return { className: "bg-info" }
  }

  if (items.some((item) => item.status === "PENDING")) {
    return { className: "bg-muted-foreground" }
  }

  return { className: "bg-brand" }
}

function getCourseAttendanceDayStatus(
  items: StudentCourseAttendanceItem[]
): "absent" | "late" | "present" {
  if (
    items.some((item) => item.status === "ABSENT" || item.status === "EXCUSED")
  ) {
    return "absent"
  }
  if (items.some((item) => item.status === "LATE")) return "late"
  return "present"
}

function getCourseAttendanceDisplayStatus(
  item: StudentCourseAttendanceItem
): "absent" | "late" | "present" | "unknown" {
  switch (item.status) {
    case "PRESENT":
      return "present"
    case "LATE":
      return "late"
    case "ABSENT":
    case "EXCUSED":
      return "absent"
    case "PENDING":
      return "unknown"
  }
}

function formatCourseAttendanceStatus(
  status: StudentCourseAttendanceItem["status"]
) {
  switch (status) {
    case "PRESENT":
      return m.mobile_status_present()
    case "ABSENT":
      return m.mobile_status_absent()
    case "LATE":
      return m.mobile_status_late()
    case "EXCUSED":
      return teacherCopy("Excuse", "Excused")
    case "PENDING":
      return teacherCopy("En attente", "Pending")
  }
}

function formatCourseAttendanceHistoryDescription(
  items: StudentCourseAttendanceItem[]
) {
  if (!items.length) return m.mobile_presence_not_recorded()

  const first = items[0]
  const extraCount = items.length - 1
  const subjectLabel =
    extraCount > 0
      ? `${first.subject.name} + ${extraCount}`
      : first.subject.name

  return `${subjectLabel} - ${formatCourseAttendanceStatus(first.status)}`
}

function formatCourseAttendanceTime(value: string) {
  return value.slice(0, 5)
}

function presenceStatusBadgeVariant(
  status: "absent" | "late" | "present" | "unknown"
): "destructive" | "neutral" | "success" | "warning" {
  switch (status) {
    case "present":
      return "success"
    case "late":
      return "warning"
    case "absent":
      return "destructive"
    case "unknown":
      return "neutral"
  }
}

function formatPresenceEventStatus(
  status: "absent" | "late" | "present" | "unknown"
) {
  switch (status) {
    case "present":
      return m.mobile_status_present()
    case "late":
      return m.mobile_status_late()
    case "absent":
      return m.mobile_status_absent()
    case "unknown":
      return m.mobile_status_unknown()
  }
}

function formatPresenceEventDescription(event: ParentPresenceHistoryEvent) {
  const direction =
    event.type === "ENTRY"
      ? m.mobile_presence_entry()
      : m.mobile_presence_exit()

  return `${direction} - ${fmtTime(event.createdAt)}`
}

function formatPlannedAbsenceReason(
  reason: ParentChildPresence["plannedAbsences"][number]["reason"]
) {
  switch (reason) {
    case "SICK":
      return m.mobile_presence_reason_sick()
    case "FAMILY":
      return m.mobile_presence_reason_family()
    case "OTHER":
      return m.mobile_presence_reason_other()
  }
}

function formatPlannedAbsenceStatus(
  status: ParentChildPresence["plannedAbsences"][number]["status"]
) {
  return status === "ACKNOWLEDGED"
    ? m.mobile_presence_acknowledged()
    : m.mobile_presence_pending()
}

function groupScheduleSlotsByDay(slots: StudentScheduleSlot[]) {
  const slotsByDay = new Map<StudentScheduleDay, StudentScheduleSlot[]>()

  for (const slot of slots) {
    const current = slotsByDay.get(slot.dayOfWeek) ?? []
    current.push(slot)
    slotsByDay.set(slot.dayOfWeek, current)
  }

  for (const daySlots of slotsByDay.values()) {
    daySlots.sort((left, right) =>
      left.startTime.localeCompare(right.startTime)
    )
  }

  return slotsByDay
}

function groupTeacherScheduleSlotsByDay(slots: TeacherScheduleSlot[]) {
  const slotsByDay = new Map<StudentScheduleDay, TeacherScheduleSlot[]>()

  for (const slot of slots) {
    const current = slotsByDay.get(slot.dayOfWeek) ?? []
    current.push(slot)
    slotsByDay.set(slot.dayOfWeek, current)
  }

  for (const daySlots of slotsByDay.values()) {
    daySlots.sort((left, right) =>
      left.startTime.localeCompare(right.startTime)
    )
  }

  return slotsByDay
}

function getCourseAttendanceContextFromTodayCourse(
  course: TeacherTodayCourse
): CourseAttendanceRouteContext {
  return {
    classGroupCode: course.classGroupCode,
    classGroupId: course.classGroupId,
    classGroupName: course.classGroupName,
    date: localIsoDate(new Date()),
    endTime: course.endTime,
    scheduleSlotId: course.id,
    startTime: course.startTime,
    subjectLevelId: course.subjectLevelId,
    subjectName: course.subjectName,
  }
}

function getCourseAttendanceContextFromScheduleSlot(
  slot: TeacherScheduleSlot
): CourseAttendanceRouteContext {
  return {
    classGroupCode: slot.classGroup.code,
    classGroupId: slot.classGroup.id,
    classGroupName: slot.classGroup.name,
    date: getNextIsoDateForScheduleDay(slot.dayOfWeek),
    endTime: slot.endTime,
    scheduleSlotId: slot.id,
    startTime: slot.startTime,
    subjectLevelId: slot.subjectLevel.id,
    subjectName: slot.subjectLevel.subject.name,
  }
}

function getCourseAttendanceContextFromClassSummary(
  classItem: TeacherClassSummary
): CourseAttendanceRouteContext {
  return {
    classGroupCode: classItem.classGroupCode,
    classGroupId: classItem.classGroupId,
    classGroupName: classItem.classGroupName,
    date: localIsoDate(new Date()),
    subjectLevelId: classItem.subjectLevelId,
    subjectName: classItem.subjectName,
  }
}

function getNextIsoDateForScheduleDay(day: StudentScheduleDay) {
  const targetDay = getScheduleDayIndex(day)
  const date = new Date()
  const currentDay = date.getDay()
  const delta = (targetDay - currentDay + 7) % 7

  date.setDate(date.getDate() + delta)
  return localIsoDate(date)
}

function getScheduleDayIndex(day: StudentScheduleDay) {
  switch (day) {
    case "MONDAY":
      return 1
    case "TUESDAY":
      return 2
    case "WEDNESDAY":
      return 3
    case "THURSDAY":
      return 4
    case "FRIDAY":
      return 5
    case "SATURDAY":
      return 6
  }
}

function groupTeacherClassesByClass(classes: TeacherClassSummary[]) {
  const groups = new Map<
    string,
    {
      code: string
      enrollmentCount: number
      id: string
      name: string
      subjects: TeacherClassSummary[]
    }
  >()

  for (const classItem of classes) {
    const current = groups.get(classItem.classGroupId) ?? {
      code: classItem.classGroupCode,
      enrollmentCount: classItem.enrollmentCount,
      id: classItem.classGroupId,
      name: classItem.classGroupName,
      subjects: [],
    }

    current.enrollmentCount = Math.max(
      current.enrollmentCount,
      classItem.enrollmentCount
    )
    current.subjects.push(classItem)
    groups.set(classItem.classGroupId, current)
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      subjects: group.subjects.sort((left, right) =>
        left.subjectName.localeCompare(right.subjectName)
      ),
    }))
    .sort((left, right) => left.code.localeCompare(right.code))
}

function getTeacherScheduleClassFilters(
  slots: TeacherScheduleSlot[]
): TeacherClassFilterOption[] {
  const classes = new Map<string, TeacherClassFilterOption>()

  for (const slot of slots) {
    classes.set(slot.classGroup.id, {
      id: slot.classGroup.id,
      label: slot.classGroup.code ?? slot.classGroup.name,
      meta: slot.classGroup.name,
    })
  }

  return [
    {
      id: "all",
      label: teacherCopy("Toutes les classes", "All classes"),
      meta: null,
    },
    ...Array.from(classes.values()).sort((left, right) =>
      left.label.localeCompare(right.label)
    ),
  ]
}

function getSubjectTeachersFromSchedule(slots: StudentScheduleSlot[]) {
  const teachers = new Map<
    string,
    {
      photoUrl?: string | null
      subjectCode: string
      subjectColor?: string | null
      subjectName: string
      staffAssignmentId: string
      teacherName: string
    }
  >()

  for (const slot of slots) {
    const teacherName = formatScheduleTeacher(slot)
    const key = `${slot.staffAssignment.id}-${slot.subjectLevel.id}`

    if (!teachers.has(key)) {
      teachers.set(key, {
        photoUrl: slot.staffAssignment.identity.photoUrl ?? null,
        subjectCode: slot.subjectLevel.subject.code,
        subjectColor: null,
        subjectName: slot.subjectLevel.subject.name,
        staffAssignmentId: slot.staffAssignment.id,
        teacherName,
      })
    }
  }

  return Array.from(teachers.values()).sort((left, right) =>
    left.subjectName.localeCompare(right.subjectName)
  )
}

function formatScheduleDayShort(day: StudentScheduleDay) {
  switch (day) {
    case "MONDAY":
      return "Lun."
    case "TUESDAY":
      return "Mar."
    case "WEDNESDAY":
      return "Mer."
    case "THURSDAY":
      return "Jeu."
    case "FRIDAY":
      return "Ven."
    case "SATURDAY":
      return "Sam."
  }
}

function formatScheduleTeacher(slot: {
  staffAssignment: {
    identity: { firstName: string | null; lastName: string | null }
  }
}) {
  return (
    `${slot.staffAssignment.identity.firstName ?? ""} ${slot.staffAssignment.identity.lastName ?? ""}`.trim() ||
    m.mobile_reports_teacher_unavailable()
  )
}

function formatEvaluationStatus(status: TeacherEvaluation["status"]) {
  return status === "PUBLISHED"
    ? teacherCopy("Publiee", "Published")
    : teacherCopy("Brouillon", "Draft")
}

function teacherCopy(fr: string, en: string) {
  return getRouteLocale() === "fr" ? fr : en
}

function formatScheduleSlotDuration(startTime: string, endTime: string) {
  const start = parseScheduleTimeMinutes(startTime)
  const end = parseScheduleTimeMinutes(endTime)

  if (start == null || end == null || end <= start) {
    return `${startTime} - ${endTime}`
  }

  return fmtDuration(end - start)
}

function parseScheduleTimeMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  return hours * 60 + minutes
}

function startOfMonthDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function compareMonth(left: Date, right: Date) {
  return (
    left.getFullYear() * 12 +
    left.getMonth() -
    (right.getFullYear() * 12 + right.getMonth())
  )
}

function clampMonthDate(date: Date, min?: Date | null, max?: Date | null) {
  if (min && compareMonth(date, min) < 0) return min
  if (max && compareMonth(date, max) > 0) return max
  return date
}

function formatMonthInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function parseMonthInputValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!year || month < 1 || month > 12) return null

  return new Date(year, month - 1, 1)
}

function getMonthRange(date: Date): MonthRange {
  const start = startOfMonthDate(date)
  const end = addMonths(start, 1)

  return {
    endDate: localIsoDate(end),
    startDate: localIsoDate(start),
  }
}

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toApiDayOfWeek(date: Date) {
  return [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][date.getDay()]
}

type PermissionDisplayStatus =
  | PermissionState
  | "unsupported"
  | "neutral"
  | "unknown"

type ClientPermissionSettings = {
  camera: PermissionDisplayStatus
  notifications: PermissionDisplayStatus
  systemLanguage: string
}

async function readClientPermissionSettings(): Promise<ClientPermissionSettings> {
  const notificationPermission =
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission
  const notifications: PermissionDisplayStatus =
    notificationPermission === "default" ? "prompt" : notificationPermission
  let camera: PermissionDisplayStatus = "unsupported"

  if ("permissions" in navigator && navigator.permissions?.query) {
    camera = await navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((status) => status.state)
      .catch(() => "unknown" as const)
  }

  return {
    camera,
    notifications,
    systemLanguage: navigator.language || "",
  }
}

function useClientPermissionSettings() {
  const [settings, setSettings] = useState<ClientPermissionSettings>({
    camera: "unknown",
    notifications: "unknown",
    systemLanguage: "",
  })

  const readSettings = useCallback(async () => {
    setSettings(await readClientPermissionSettings())
  }, [])

  useEffect(() => {
    let mounted = true

    void readClientPermissionSettings().then((nextSettings) => {
      if (mounted) setSettings(nextSettings)
    })

    return () => {
      mounted = false
    }
  }, [readSettings])

  const requestNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") {
      toast.error(m.mobile_profile_permission_unsupported_help())
      await readSettings()
      return
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission()
    }
    await readSettings()
  }, [readSettings])

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(m.mobile_profile_permission_unsupported_help())
      await readSettings()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch {
      toast.error(m.mobile_profile_camera_permission_error())
    } finally {
      await readSettings()
    }
  }, [readSettings])

  return { requestCamera, requestNotifications, settings }
}

function formatPermissionStatus(status: PermissionDisplayStatus) {
  switch (status) {
    case "granted":
      return m.mobile_permission_granted()
    case "denied":
      return m.mobile_permission_denied()
    case "prompt":
      return m.mobile_permission_prompt()
    case "unsupported":
      return m.mobile_permission_unsupported()
    case "neutral":
    case "unknown":
      return m.mobile_permission_unknown()
  }
}

function LanguageFlag({ language }: { language: string }) {
  const flagUrl = getLanguageFlagUrl(language)

  if (!flagUrl) {
    return m.mobile_permission_unknown()
  }

  return (
    <img
      alt={m.mobile_profile_system_language()}
      className="inline-block h-[15px] w-5 rounded-[2px] object-cover"
      src={flagUrl}
      title={language}
    />
  )
}

function getLanguageFlagUrl(language: string) {
  const locale = language.toLowerCase()
  const baseLanguage = locale.split("-")[0]
  const region = locale.split("-")[1]

  if (baseLanguage === "fr") return frFlagUrl
  if (baseLanguage === "en") return region === "us" ? enUsFlagUrl : enGbFlagUrl
  return null
}

function permissionBadgeVariant(
  status: PermissionDisplayStatus
): "success" | "destructive" | "warning" | "neutral" {
  switch (status) {
    case "granted":
      return "success"
    case "denied":
      return "destructive"
    case "prompt":
      return "warning"
    default:
      return "neutral"
  }
}

function getRouteLocale(): "fr" | "en" {
  return withoutAppBase(window.location.pathname).startsWith("/en")
    ? "en"
    : "fr"
}

async function fetchParentUpcomingEvaluations(
  schoolId: string
): Promise<UpcomingEvaluationPreview[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const response = await apiClient.get<{ data: ApiEvaluationListItem[] }>(
    `/schools/${schoolId}/evaluations/parent/children/upcoming`
  )

  return response.data
    .filter((evaluation) => {
      const evaluationDate = new Date(evaluation.date)
      evaluationDate.setHours(0, 0, 0, 0)
      return evaluationDate >= today && (evaluation.gradeCount ?? 0) === 0
    })
    .map((evaluation) => ({
      classGroupCode: evaluation.classGroup?.code ?? null,
      date: evaluation.date,
      id: evaluation.id,
      periodId: evaluation.periodId ?? null,
      subjectColor: evaluation.subjectLevel?.subject.color ?? null,
      subjectName: evaluation.subjectLevel?.subject.name ?? null,
      title: evaluation.title,
      type: evaluation.type,
    }))
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    )
    .slice(0, 8)
}

async function fetchStudentUpcomingEvaluations(
  schoolId: string,
  schoolYearId?: string
): Promise<UpcomingEvaluationPreview[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const response = await apiClient.get<{ data: ApiEvaluationListItem[] }>(
    `/schools/${schoolId}/evaluations/student/me/upcoming`,
    { params: schoolYearId ? { schoolYearId } : undefined }
  )

  return response.data
    .filter((evaluation) => {
      const evaluationDate = new Date(evaluation.date)
      evaluationDate.setHours(0, 0, 0, 0)
      return evaluationDate >= today && (evaluation.gradeCount ?? 0) === 0
    })
    .map((evaluation) => ({
      classGroupCode: evaluation.classGroup?.code ?? null,
      date: evaluation.date,
      id: evaluation.id,
      periodId: evaluation.periodId ?? null,
      subjectColor: evaluation.subjectLevel?.subject.color ?? null,
      subjectName: evaluation.subjectLevel?.subject.name ?? null,
      title: evaluation.title,
      type: evaluation.type,
    }))
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    )
    .slice(0, 8)
}

async function fetchParentSchoolYearEvaluations(
  schoolId: string,
  schoolYearId?: string
): Promise<UpcomingEvaluationPreview[]> {
  const response = await apiClient.get<{ data: ApiEvaluationListItem[] }>(
    `/schools/${schoolId}/evaluations/parent/children/school-year`,
    { params: schoolYearId ? { schoolYearId } : undefined }
  )

  return response.data
    .map((evaluation) => ({
      classGroupCode: evaluation.classGroup?.code ?? null,
      date: evaluation.date,
      id: evaluation.id,
      periodId: evaluation.periodId ?? null,
      subjectColor: evaluation.subjectLevel?.subject.color ?? null,
      subjectName: evaluation.subjectLevel?.subject.name ?? null,
      title: evaluation.title,
      type: evaluation.type,
    }))
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    )
}

async function fetchStudentSchoolYearEvaluations(
  schoolId: string,
  schoolYearId?: string
): Promise<UpcomingEvaluationPreview[]> {
  const response = await apiClient.get<{ data: ApiEvaluationListItem[] }>(
    `/schools/${schoolId}/evaluations/student/me/school-year`,
    { params: schoolYearId ? { schoolYearId } : undefined }
  )

  return response.data
    .map((evaluation) => ({
      classGroupCode: evaluation.classGroup?.code ?? null,
      date: evaluation.date,
      id: evaluation.id,
      periodId: evaluation.periodId ?? null,
      subjectColor: evaluation.subjectLevel?.subject.color ?? null,
      subjectName: evaluation.subjectLevel?.subject.name ?? null,
      title: evaluation.title,
      type: evaluation.type,
    }))
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime()
    )
}

function getEvaluationsInMonth(
  evaluations: UpcomingEvaluationPreview[],
  monthDate: Date
) {
  return evaluations.filter((evaluation) => {
    const date = new Date(evaluation.date)
    return (
      date.getFullYear() === monthDate.getFullYear() &&
      date.getMonth() === monthDate.getMonth()
    )
  })
}

function getEvaluationsInPeriod(
  evaluations: UpcomingEvaluationPreview[],
  period: MobileAcademicPeriod | null
) {
  if (!period) return evaluations

  const startDate = new Date(period.startDate)
  const endDate = new Date(period.endDate)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return evaluations.filter((evaluation) => {
    if (evaluation.periodId) return evaluation.periodId === period.id
    const date = new Date(evaluation.date)
    return date >= startDate && date <= endDate
  })
}

function groupEvaluationsByIsoDate(evaluations: UpcomingEvaluationPreview[]) {
  const grouped = new Map<string, UpcomingEvaluationPreview[]>()

  for (const evaluation of evaluations) {
    const key = localIsoDate(new Date(evaluation.date))
    const current = grouped.get(key) ?? []
    current.push(evaluation)
    grouped.set(key, current)
  }

  return grouped
}

function getEvaluationCalendarDays(
  evaluations: UpcomingEvaluationPreview[]
): EvaluationCalendarDay[] {
  return Array.from(groupEvaluationsByIsoDate(evaluations).entries())
    .map(([date, dayEvaluations]) => ({
      date,
      evaluations: dayEvaluations,
    }))
    .sort((left, right) => left.date.localeCompare(right.date))
}

type EvaluationTypeStyle = {
  badgeClassName: string
  barClassName: string
  calendarClassName: string
  dotClassName: string
  key: TeacherEvaluationType
}

function getEvaluationTypeStyle(
  type: TeacherEvaluationType
): EvaluationTypeStyle {
  switch (type) {
    case "EXAM":
      return {
        badgeClassName: "bg-[#DCEEFF] text-[#0875C9]",
        barClassName: "bg-[#0875C9]",
        calendarClassName: "bg-[#DCEEFF] font-semibold text-[#0875C9]",
        dotClassName: "bg-[#0875C9]",
        key: "EXAM",
      }
    case "QUIZ":
      return {
        badgeClassName: "bg-[#E3FCF7] text-[#007A62]",
        barClassName: "bg-[#00A889]",
        calendarClassName: "bg-[#E3FCF7] font-semibold text-[#007A62]",
        dotClassName: "bg-[#00A889]",
        key: "QUIZ",
      }
    case "ORAL":
      return {
        badgeClassName: "bg-[#E5F7F9] text-[#16727A]",
        barClassName: "bg-[#278D96]",
        calendarClassName: "bg-[#E5F7F9] font-semibold text-[#16727A]",
        dotClassName: "bg-[#278D96]",
        key: "ORAL",
      }
    case "HOMEWORK":
      return {
        badgeClassName: "bg-[#FEF5E8] text-[#C76C17]",
        barClassName: "bg-[#D9761F]",
        calendarClassName: "bg-[#FEF5E8] font-semibold text-[#C76C17]",
        dotClassName: "bg-[#D9761F]",
        key: "HOMEWORK",
      }
    case "PROJECT":
      return {
        badgeClassName: "bg-[#F1E9FF] text-[#7440C8]",
        barClassName: "bg-[#7440C8]",
        calendarClassName: "bg-[#F1E9FF] font-semibold text-[#7440C8]",
        dotClassName: "bg-[#7440C8]",
        key: "PROJECT",
      }
  }
}

function getEvaluationTypeLegend(styles: EvaluationTypeStyle[]) {
  const seen = new Set<string>()
  return styles.filter((style) => {
    if (seen.has(style.key)) return false
    seen.add(style.key)
    return true
  })
}

function formatEvaluationType(type: TeacherEvaluationType) {
  switch (type) {
    case "HOMEWORK":
      return teacherCopy("Travail maison", "Home assignment")
    case "QUIZ":
      return teacherCopy("Quiz", "Quiz")
    case "ORAL":
      return teacherCopy("Oral", "Oral")
    case "PROJECT":
      return teacherCopy("Projet", "Project")
    case "EXAM":
      return teacherCopy("Examen final", "Final exam")
  }
}

function changeRouteLocale(locale: "fr" | "en") {
  const pathWithoutBase = withoutAppBase(window.location.pathname)
  const nextPath = pathWithoutBase.replace(/^\/(fr|en)(?=\/|$)/, "")
  window.location.assign(
    withAppBase(`/${locale}${nextPath || "/app/home"}${window.location.search}`)
  )
}

function InitialsAvatar({
  initials,
  src,
  tone = "student",
}: {
  initials: string
  src?: string | null
  tone?: "brand" | "dark" | "staff" | "student"
}) {
  return (
    <PersonAvatar
      className="size-11"
      fallback={initials}
      name={initials}
      size="lg"
      src={src}
      tone={tone}
    />
  )
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function LocalePill({
  locale,
  currentLocale,
}: {
  locale: "fr" | "en"
  currentLocale: "fr" | "en"
}) {
  const active = locale === currentLocale

  return (
    <a
      aria-current={active ? "true" : undefined}
      aria-label={m.language_label()}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        active
          ? "bg-brand-soft text-brand-dark"
          : "bg-muted text-muted-foreground"
      )}
      href={withAppBase(`/${locale}/login`)}
    >
      {locale === "fr" ? m.language_fr() : m.language_en()}
    </a>
  )
}

export default MobileLanding
