import { useEffect, useMemo, useRef, useState } from "react"
import type {
  ComponentProps,
  CSSProperties,
  PointerEvent,
  ReactNode,
} from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { MobileFloatingBar } from "@/components/mobile"
import {
  PersonAvatar,
  resolveAvatarSrc,
} from "@/components/shared/person-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  openTeacherCourseAttendanceSession,
  patchTeacherCourseAttendanceAttendances,
  submitTeacherCourseAttendanceSession,
  teacherCourseAttendanceSessionQueryOptions,
  teacherCourseAttendanceSessionsQueryOptions,
  type TeacherPatchCourseAttendanceInput,
} from "@/features/teacher/queries"
import type {
  CourseAttendanceStatus,
  TeacherCourseAttendancePortalContext,
  TeacherCourseAttendanceSessionDetails,
  TeacherCourseAttendanceSessionSummary,
  TeacherCourseAttendanceStudent,
} from "@/features/teacher/types"
import { getApiErrorMessage } from "@/lib/api-client"
import { fmtDate, fmtTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export type CourseAttendanceRouteContext = {
  classGroupCode?: string | null
  classGroupId?: string | null
  classGroupName?: string | null
  date?: string | null
  endTime?: string | null
  scheduleSlotId?: string | null
  startTime?: string | null
  subjectLevelId?: string | null
  subjectName?: string | null
}

type AttendanceStatusAction = Exclude<CourseAttendanceStatus, "PENDING">

type AttendanceHistoryItem = {
  key: string
  previousStatus: CourseAttendanceStatus
}

type AttendanceMarkDetails = {
  lateMinutes: number | null
  note: string
}

const attendanceStatuses: CourseAttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
  "PENDING",
]

export function CourseAttendancePage({
  context,
  onBack,
  schoolId,
}: {
  context: CourseAttendanceRouteContext | null
  onBack: () => void
  schoolId: string | null
}) {
  const [date, setDate] = useState(
    () => context?.date ?? localIsoDate(new Date())
  )
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeContext, setActiveContext] =
    useState<CourseAttendanceRouteContext | null>(null)

  useEffect(() => {
    setDate(context?.date ?? localIsoDate(new Date()))
    setActiveSessionId(null)
    setActiveContext(null)
  }, [
    context?.classGroupId,
    context?.date,
    context?.scheduleSlotId,
    context?.subjectLevelId,
  ])

  if (!schoolId) {
    return (
      <CourseAttendanceFrame
        onBack={onBack}
        subtitle={attendanceCopy("Presence aux cours", "Course attendance")}
        title={attendanceCopy("Appel", "Roll call")}
      >
        <div className="px-5 pt-4">
          <CourseAttendanceEmptyState
            description={attendanceCopy(
              "Selectionne un espace ecole avant de faire l'appel.",
              "Select a school workspace before taking attendance."
            )}
            kind="empty"
            title={attendanceCopy("Ecole indisponible", "School unavailable")}
          />
        </div>
      </CourseAttendanceFrame>
    )
  }

  return (
    <CourseAttendanceFrame
      onBack={
        activeSessionId
          ? () => {
              setActiveSessionId(null)
              setActiveContext(null)
            }
          : onBack
      }
      subtitle={formatContextHeaderSubtitle(activeContext ?? context)}
      title={formatContextHeaderTitle(activeContext ?? context)}
    >
      {activeSessionId ? (
        <CourseAttendanceDetails
          onClose={onBack}
          onSessionClosed={() => setActiveSessionId(null)}
          schoolId={schoolId}
          sessionId={activeSessionId}
        />
      ) : (
        <CourseAttendanceSetup
          context={context}
          date={date}
          onDateChange={setDate}
          onSessionSelected={(sessionId, nextContext) => {
            setActiveSessionId(sessionId)
            setActiveContext(nextContext ?? null)
          }}
          schoolId={schoolId}
        />
      )}
    </CourseAttendanceFrame>
  )
}

function CourseAttendanceFrame({
  children,
  onBack,
  subtitle,
  title,
}: {
  children: ReactNode
  onBack: () => void
  subtitle: string
  title: string
}) {
  return (
    <div>
      <header className="sticky top-0 z-10 flex min-h-16 items-center gap-2.5 border-b bg-background/95 px-4 py-2 backdrop-blur">
        <Button
          aria-label={attendanceCopy("Retour", "Back")}
          className="size-8 shrink-0 rounded-full"
          onClick={onBack}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ArrowLeft data-icon="icon" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {subtitle}
          </p>
          <h1 className="truncate text-lg leading-tight font-bold tracking-normal">
            {title}
          </h1>
        </div>
      </header>
      {children}
    </div>
  )
}

export function CourseAttendanceSetup({
  context,
  date,
  onDateChange,
  onSessionSelected,
  schoolId,
}: {
  context: CourseAttendanceRouteContext | null
  date: string
  onDateChange: (date: string) => void
  onSessionSelected: (
    sessionId: string,
    context?: CourseAttendanceRouteContext | null
  ) => void
  schoolId: string
}) {
  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="course-attendance-date">
            {attendanceCopy("Date", "Date")}
          </FieldLabel>
          <Input
            className="h-11 bg-background"
            id="course-attendance-date"
            onChange={(event) => onDateChange(event.target.value)}
            onInput={(event) => onDateChange(event.currentTarget.value)}
            type="date"
            value={date}
          />
        </Field>
      </FieldGroup>

      <SessionPicker
        context={context}
        date={date}
        onSessionSelected={onSessionSelected}
        schoolId={schoolId}
      />
    </div>
  )
}

export function SessionPicker({
  context,
  date,
  onSessionSelected,
  schoolId,
}: {
  context: CourseAttendanceRouteContext | null
  date: string
  onSessionSelected: (
    sessionId: string,
    context?: CourseAttendanceRouteContext | null
  ) => void
  schoolId: string
}) {
  const queryClient = useQueryClient()
  const sessionsQuery = useQuery({
    ...teacherCourseAttendanceSessionsQueryOptions(schoolId, date),
    enabled: Boolean(date),
  })
  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data])
  const sortedSessions = useMemo(
    () => sortSessionsForContext(sessions, context),
    [context, sessions]
  )
  const canOpenSession = canOpenCourseSessionFromContext(context)
  const openSessionMutation = useMutation({
    mutationFn: (
      selectedSession?: TeacherCourseAttendanceSessionSummary | null
    ) =>
      openTeacherCourseAttendanceSession(schoolId, {
        classGroupId: selectedSession?.classGroupId ?? context?.classGroupId,
        date: selectedSession?.date ?? date,
        endTime: selectedSession?.endTime ?? context?.endTime,
        scheduleSlotId:
          selectedSession?.scheduleSlotId ??
          context?.scheduleSlotId ??
          undefined,
        startTime: selectedSession?.startTime ?? context?.startTime,
        subjectLevelId:
          selectedSession?.subjectLevelId ?? context?.subjectLevelId,
      }),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({
        queryKey: ["teacher", "course-attendance"],
      })
      if (session.id) {
        onSessionSelected(
          session.id,
          getCourseAttendanceContextFromSession(session)
        )
        return
      }

      toast.error(
        attendanceCopy(
          "La session a ete creee, mais son identifiant est absent.",
          "The session was created but its identifier is missing."
        )
      )
    },
    onError: () => {
      toast.error(
        attendanceCopy(
          "Impossible d'ouvrir la session d'appel.",
          "Unable to open the attendance session."
        )
      )
    },
  })

  if (sessionsQuery.isLoading) {
    return <CourseAttendanceSkeleton />
  }

  if (sessionsQuery.isError) {
    return (
      <CourseAttendanceEmptyState
        description={attendanceCopy(
          "Les sessions d'appel ne sont pas disponibles pour cette date.",
          "Attendance sessions are not available for this date."
        )}
        kind="error"
        title={attendanceCopy("Chargement impossible", "Unable to load")}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {attendanceCopy("Sessions", "Sessions")}
        </h2>
        <span className="text-xs text-muted-foreground">
          {fmtDate(date, "medium")}
        </span>
      </div>

      {sortedSessions.length ? (
        <Card className="gap-0 p-0">
          {sortedSessions.map((session, index) => (
            <div key={session.id}>
              <SessionListItem
                onOpen={() => {
                  if (session.sessionId) {
                    onSessionSelected(
                      session.sessionId,
                      getCourseAttendanceContextFromSession(session)
                    )
                    return
                  }

                  openSessionMutation.mutate(session)
                }}
                session={session}
              />
              {index < sortedSessions.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
      ) : (
        <CourseAttendanceEmptyState
          description={
            canOpenSession
              ? attendanceCopy(
                  "Aucune session n'existe encore pour ce cours. Ouvre-la au moment de faire l'appel.",
                  "No session exists for this course yet. Open it when you are ready."
                )
              : attendanceCopy(
                  "Choisis un cours planifie depuis l'emploi du temps ou une classe avant d'ouvrir l'appel.",
                  "Choose a scheduled course from the schedule or a class before opening attendance."
                )
          }
          kind="empty"
          title={attendanceCopy("Aucune session", "No session")}
        />
      )}

      {canOpenSession ? (
        <Button
          className="w-full"
          disabled={openSessionMutation.isPending}
          onClick={() => openSessionMutation.mutate(null)}
          size="lg"
          type="button"
        >
          {openSessionMutation.isPending ? (
            <Loader2 data-icon="inline-start" />
          ) : (
            <CalendarDays data-icon="inline-start" />
          )}
          {attendanceCopy("Ouvrir l'appel", "Open roll call")}
        </Button>
      ) : null}
    </div>
  )
}

function SessionListItem({
  onOpen,
  session,
}: {
  onOpen: () => void
  session: TeacherCourseAttendanceSessionSummary
}) {
  return (
    <button
      className="flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={onOpen}
      type="button"
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
        <CalendarDays />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {formatSessionTitle(session)}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {formatSessionMeta(session)}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={getSessionBadgeVariant(session.status)}>
          {formatSessionStatus(session.status)}
        </Badge>
        <ChevronRight className="text-muted-foreground" />
      </div>
    </button>
  )
}

export function CourseAttendanceDetails({
  onClose,
  onSessionClosed,
  schoolId,
  sessionId,
}: {
  onClose: () => void
  onSessionClosed: () => void
  schoolId: string
  sessionId: string
}) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<"swipe" | "recap">("swipe")
  const [statuses, setStatuses] = useState<
    Record<string, CourseAttendanceStatus>
  >({})
  const [markDetails, setMarkDetails] = useState<
    Record<string, AttendanceMarkDetails>
  >({})
  const sessionQuery = useQuery({
    ...teacherCourseAttendanceSessionQueryOptions(schoolId, sessionId),
    enabled: Boolean(sessionId),
  })
  const session = sessionQuery.data
  const rows = useMemo(() => normalizeAttendanceRows(session), [session])
  const counts = useMemo(
    () => getAttendanceCounts(rows, statuses),
    [rows, statuses]
  )
  const draftMutation = useMutation({
    mutationFn: () =>
      patchTeacherCourseAttendanceAttendances(
        schoolId,
        sessionId,
        buildAttendancePatch(rows, statuses, markDetails)
      ),
    onSuccess: () => {
      toast.success(
        attendanceCopy("Brouillon enregistre.", "Draft attendance saved.")
      )
      void queryClient.invalidateQueries({
        queryKey: ["teacher", "course-attendance"],
      })
    },
    onError: (error) => {
      showCourseAttendanceMutationError(
        error,
        "Impossible d'enregistrer le brouillon.",
        "Unable to save the draft attendance."
      )
    },
  })
  const submitMutation = useMutation({
    mutationFn: async () => {
      await patchTeacherCourseAttendanceAttendances(
        schoolId,
        sessionId,
        buildAttendancePatch(rows, statuses, markDetails)
      )

      return submitTeacherCourseAttendanceSession(schoolId, sessionId)
    },
    onSuccess: () => {
      toast.success(attendanceCopy("Appel valide.", "Attendance submitted."))
      void queryClient.invalidateQueries({ queryKey: ["teacher"] })
      void queryClient.invalidateQueries({
        queryKey: ["teacher", "course-attendance"],
      })
      onClose()
    },
    onError: (error) => {
      showCourseAttendanceMutationError(
        error,
        "Impossible de valider l'appel.",
        "Unable to submit attendance."
      )
    },
  })

  useEffect(() => {
    setStatuses((current) => {
      const next: Record<string, CourseAttendanceStatus> = {}

      for (const row of rows) {
        const key = getStudentKey(row)
        next[key] = current[key] ?? normalizeAttendanceStatus(row.status)
      }

      return next
    })
  }, [rows])

  useEffect(() => {
    setMarkDetails((current) => {
      const next: Record<string, AttendanceMarkDetails> = {}

      for (const row of rows) {
        const key = getStudentKey(row)
        next[key] = current[key] ?? getAttendanceMarkDetails(row)
      }

      return next
    })
  }, [rows])

  useEffect(() => {
    if (session?.status === "SUBMITTED" || session?.status === "LOCKED") {
      setMode("recap")
    }
  }, [session?.status])

  if (sessionQuery.isLoading) {
    return (
      <div className="px-5 pt-4">
        <CourseAttendanceSkeleton />
      </div>
    )
  }

  if (sessionQuery.isError) {
    return (
      <div className="px-5 pt-4">
        <CourseAttendanceEmptyState
          description={attendanceCopy(
            "Le detail de cette session n'est pas disponible.",
            "This session detail is not available."
          )}
          kind="error"
          title={attendanceCopy("Session introuvable", "Session not found")}
        />
      </div>
    )
  }

  if (!session || rows.length === 0) {
    return (
      <div className="px-5 pt-4">
        <CourseAttendanceEmptyState
          description={attendanceCopy(
            "Aucun eleve n'est rattache a cette session d'appel.",
            "No student is linked to this attendance session."
          )}
          kind="empty"
          title={attendanceCopy("Liste vide", "Empty list")}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      {mode === "swipe" ? (
        <StudentSwipeStack
          onComplete={() => setMode("recap")}
          onOpenRecap={() => setMode("recap")}
          onStatusChange={(row, status) => {
            setStatuses((current) => ({
              ...current,
              [getStudentKey(row)]: status,
            }))
          }}
          rows={rows}
          session={session}
          statuses={statuses}
        />
      ) : (
        <>
          <AttendanceSessionSummary session={session} counts={counts} />
          <CourseAttendanceRecap
            counts={counts}
            isSavingDraft={draftMutation.isPending}
            isSubmitting={submitMutation.isPending}
            markDetails={markDetails}
            onBackToStack={() => setMode("swipe")}
            onCloseSession={onSessionClosed}
            onMarkDetailsChange={(row, detail) => {
              setMarkDetails((current) => ({
                ...current,
                [getStudentKey(row)]: detail,
              }))
            }}
            onSaveDraft={() => draftMutation.mutate()}
            onStatusChange={(row, status) => {
              setStatuses((current) => ({
                ...current,
                [getStudentKey(row)]: status,
              }))
            }}
            onSubmit={() => submitMutation.mutate()}
            rows={rows}
            sessionStatus={session.status}
            statuses={statuses}
          />
        </>
      )}
    </div>
  )
}

function AttendanceSessionSummary({
  counts,
  session,
}: {
  counts: AttendanceCounts
  session: TeacherCourseAttendanceSessionDetails
}) {
  return (
    <Card className="gap-3" size="sm">
      <CardHeader className="px-0">
        <CardDescription>{formatSessionMeta(session)}</CardDescription>
        <CardTitle>{formatSessionTitle(session)}</CardTitle>
      </CardHeader>
      <CardFooter className="-mx-4 -mb-4 grid grid-cols-4 gap-2 border-t bg-muted/40 p-3">
        <SummaryMetric
          label={attendanceCopy("Presents", "Present")}
          value={counts.present}
        />
        <SummaryMetric
          label={attendanceCopy("Absents", "Absent")}
          value={counts.absent}
        />
        <SummaryMetric
          label={attendanceCopy("Retards", "Late")}
          value={counts.late}
        />
        <SummaryMetric
          label={attendanceCopy("En attente", "Pending")}
          value={counts.pending}
        />
      </CardFooter>
    </Card>
  )
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg bg-background px-2 py-2 text-center">
      <div className="font-mono text-lg leading-none font-semibold">
        {value}
      </div>
      <div className="mt-1 truncate text-[9px] font-semibold text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  )
}

export function StudentSwipeStack({
  onComplete,
  onOpenRecap,
  onStatusChange,
  rows,
  session,
  statuses,
}: {
  onComplete: () => void
  onOpenRecap: () => void
  onStatusChange: (
    row: TeacherCourseAttendanceStudent,
    status: CourseAttendanceStatus
  ) => void
  rows: TeacherCourseAttendanceStudent[]
  session: TeacherCourseAttendanceSessionDetails
  statuses: Record<string, CourseAttendanceStatus>
}) {
  const [drag, setDrag] = useState({ active: false, x: 0, y: 0 })
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([])
  const pointerRef = useRef<{
    pointerId: number
    rowKey: string
    startX: number
    startY: number
  } | null>(null)
  const pendingRows = rows.filter(
    (row) => (statuses[getStudentKey(row)] ?? row.status) === "PENDING"
  )
  const activeRow = pendingRows[0] ?? null
  const stackRows = pendingRows.slice(0, 3)
  const handledCount = rows.length - pendingRows.length
  const dragIntent = getDragIntent(drag.x, drag.y)

  function markRow(
    row: TeacherCourseAttendanceStudent,
    status: AttendanceStatusAction
  ) {
    const key = getStudentKey(row)
    const previousStatus = statuses[key] ?? row.status
    onStatusChange(row, status)
    setHistory((current) => [...current, { key, previousStatus }].slice(-20))
    setDrag({ active: false, x: 0, y: 0 })

    if (pendingRows.length <= 1) {
      window.setTimeout(onComplete, 180)
    }
  }

  function undoLast() {
    const last = history.at(-1)
    if (!last) return

    const row = rows.find((item) => getStudentKey(item) === last.key)
    if (!row) return

    onStatusChange(row, last.previousStatus)
    setHistory((current) => current.slice(0, -1))
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!activeRow || !event.isPrimary) return

    pointerRef.current = {
      pointerId: event.pointerId,
      rowKey: getStudentKey(activeRow),
      startX: event.clientX,
      startY: event.clientY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ active: true, x: 0, y: 0 })
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (!pointer || pointer.pointerId !== event.pointerId) return

    setDrag({
      active: true,
      x: event.clientX - pointer.startX,
      y: event.clientY - pointer.startY,
    })
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (!pointer || pointer.pointerId !== event.pointerId || !activeRow) return

    pointerRef.current = null
    const intent = getDragIntent(drag.x, drag.y)

    if (intent && pointer.rowKey === getStudentKey(activeRow)) {
      markRow(activeRow, intent)
      return
    }

    setDrag({ active: false, x: 0, y: 0 })
  }

  if (!activeRow) {
    return (
      <Card className="gap-3 text-center" size="sm">
        <CardHeader>
          <CardTitle>
            {attendanceCopy(
              "Tous les eleves sont traites",
              "All students handled"
            )}
          </CardTitle>
          <CardDescription>
            {attendanceCopy(
              "Verifie le recapitulatif avant validation.",
              "Review the recap before submission."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onOpenRecap} type="button">
            <CheckCircle2 data-icon="inline-start" />
            {attendanceCopy("Voir le recap", "View recap")}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative -mx-5 -mt-4 flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-foreground px-5 pt-4 pb-28 text-background">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-150",
          dragIntent && "opacity-100"
        )}
        style={getDeckIntentGlowStyle(dragIntent)}
      />
      <div className="flex items-center justify-between gap-3">
        <Button
          aria-label={attendanceCopy("Annuler", "Undo")}
          className="size-11 rounded-full border-background/10 bg-background/10 text-background disabled:opacity-35"
          disabled={!history.length}
          onClick={undoLast}
          size="icon"
          type="button"
          variant="ghost"
        >
          <RotateCcw data-icon="icon" />
        </Button>
        <div className="min-w-0 text-center">
          <div className="font-mono text-2xl leading-none font-semibold">
            {handledCount} / {rows.length}
          </div>
          <div className="mt-2 truncate text-xs font-semibold text-background/60">
            {formatSessionTitle(session)}
          </div>
        </div>
        <Button
          className="size-11 rounded-full border-background/10 bg-background/10 text-background"
          onClick={onOpenRecap}
          size="icon"
          type="button"
          variant="ghost"
        >
          <CheckCircle2 data-icon="icon" />
        </Button>
      </div>

      <div className="relative z-10 mt-2 min-h-[27rem] flex-1 shrink-0">
        {stackRows
          .map((row, index) => ({ index, row }))
          .reverse()
          .map(({ index, row }) => {
            const isTop = index === 0
            const style: CSSProperties = isTop
              ? {
                  touchAction: "none",
                  transform: `translate(${drag.x}px, calc(-50% + ${drag.y}px)) rotate(${drag.x / 28}deg)`,
                  zIndex: 30,
                }
              : {
                  transform: `translateY(calc(-50% + ${index * 11}px)) scale(${1 - index * 0.035})`,
                  zIndex: 30 - index,
                }

            return (
              <StudentSwipeCard
                dragIntent={isTop ? dragIntent : null}
                isTop={isTop}
                key={getStudentKey(row)}
                onPointerCancel={handlePointerEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                row={row}
                session={session}
                style={style}
              />
            )
          })}
      </div>

      <p className="pointer-events-none fixed inset-x-6 bottom-[5.9rem] z-20 mx-auto max-w-[20rem] text-center text-sm leading-relaxed text-background/70">
        {attendanceCopy(
          "Monte pour present, gauche pour absent, droite pour retard.",
          "Swipe up for present, left for absent, right for late."
        )}
      </p>

      <MobileFloatingBar
        aria-label={attendanceCopy("Actions d'appel", "Attendance actions")}
        className="z-20 grid grid-cols-3 gap-1 rounded-[1.35rem] border-background/10 bg-background/10 p-1 shadow-none backdrop-blur-xl"
        hideOnScroll={false}
        variant="bar"
      >
        <Button
          className="h-10 min-w-0 rounded-[1.05rem] border-destructive bg-destructive px-1 text-xs text-white"
          onClick={() => markRow(activeRow, "ABSENT")}
          type="button"
          variant="outline"
        >
          {attendanceCopy("Absent", "Absent")}
        </Button>
        <Button
          className="h-10 min-w-0 rounded-[1.05rem] px-2 text-xs"
          onClick={() => markRow(activeRow, "PRESENT")}
          type="button"
        >
          {attendanceCopy("Present", "Present")}
        </Button>
        <Button
          className="h-10 min-w-0 rounded-[1.05rem] border-warning bg-warning px-1 text-xs text-white"
          onClick={() => markRow(activeRow, "LATE")}
          type="button"
          variant="secondary"
        >
          {attendanceCopy("Retard", "Late")}
        </Button>
      </MobileFloatingBar>
    </div>
  )
}

function StudentSwipeCard({
  dragIntent,
  isTop,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  row,
  session,
  style,
}: {
  dragIntent: AttendanceStatusAction | null
  isTop: boolean
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  row: TeacherCourseAttendanceStudent
  session: TeacherCourseAttendanceSessionDetails
  style: CSSProperties
}) {
  const classLabel = session.classGroupCode ?? session.classGroupName ?? "-"
  const subjectLabel = session.subjectName ?? attendanceCopy("Cours", "Course")

  return (
    <div
      aria-label={attendanceCopy("Eleve a pointer", "Student to mark")}
      className={cn(
        "absolute inset-x-0 top-1/2 mx-auto flex h-[22rem] max-w-[20rem] flex-col overflow-hidden rounded-[1.75rem] border border-background/10 bg-card text-card-foreground shadow-2xl transition-[transform,border-color] duration-150 select-none",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
        !isTop && "brightness-75",
        getCardIntentClass(dragIntent)
      )}
      onPointerCancel={isTop ? onPointerCancel : undefined}
      onPointerDown={isTop ? onPointerDown : undefined}
      onPointerMove={isTop ? onPointerMove : undefined}
      onPointerUp={isTop ? onPointerUp : undefined}
      role="group"
      style={style}
    >
      <div className="relative z-10 flex shrink-0 justify-end px-5 pt-5">
        {dragIntent ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-bold tracking-wide uppercase",
              dragIntent === "PRESENT" &&
                "border-brand bg-brand-soft text-brand-dark",
              dragIntent === "ABSENT" &&
                "border-destructive/70 bg-destructive/5 text-destructive",
              dragIntent === "LATE" &&
                "border-warning/70 bg-warning/5 text-warning"
            )}
          >
            {formatAttendanceStatus(dragIntent)}
          </div>
        ) : (
          <Badge variant="outline">
            {attendanceCopy("En attente", "Pending")}
          </Badge>
        )}
      </div>

      <div className="relative z-10 mx-auto mt-3 size-32 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm">
        <StudentCardPhoto name={getStudentName(row)} src={row.photoUrl} />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pt-3 pb-5">
        <h2 className="shrink-0 truncate text-center text-2xl leading-tight font-extrabold tracking-normal">
          {getStudentName(row)}
        </h2>

        <div className="mt-4 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border bg-muted/30 px-4 py-3 text-center">
          <div className="min-w-0">
            <span className="mb-1 block text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              {attendanceCopy("Classe", "Class")}
            </span>
            <span className="block truncate text-base font-extrabold text-brand-dark">
              {classLabel}
            </span>
          </div>
          <div className="h-9 w-px bg-border" />
          <div className="min-w-0">
            <span className="mb-1 block text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              {attendanceCopy("Appel", "Roll call")}
            </span>
            <span className="block truncate text-base font-extrabold">
              {subjectLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentCardPhoto({
  name,
  src,
}: {
  name: string
  src?: string | null
}) {
  const imageSrc = resolveAvatarSrc(src)

  if (imageSrc) {
    return (
      <img
        alt={name}
        className="size-full object-cover object-[center_12%]"
        draggable={false}
        src={imageSrc}
      />
    )
  }

  return (
    <div className="grid size-full place-items-center bg-role-student-bg text-3xl font-bold text-role-student">
      {getPersonInitials(name)}
    </div>
  )
}

export function CourseAttendanceRecap({
  counts,
  isSavingDraft,
  isSubmitting,
  markDetails,
  onBackToStack,
  onCloseSession,
  onMarkDetailsChange,
  onSaveDraft,
  onStatusChange,
  onSubmit,
  rows,
  sessionStatus,
  statuses,
}: {
  counts: AttendanceCounts
  isSavingDraft: boolean
  isSubmitting: boolean
  markDetails: Record<string, AttendanceMarkDetails>
  onBackToStack: () => void
  onCloseSession: () => void
  onMarkDetailsChange: (
    row: TeacherCourseAttendanceStudent,
    detail: AttendanceMarkDetails
  ) => void
  onSaveDraft: () => void
  onStatusChange: (
    row: TeacherCourseAttendanceStudent,
    status: CourseAttendanceStatus
  ) => void
  onSubmit: () => void
  rows: TeacherCourseAttendanceStudent[]
  sessionStatus?: string | null
  statuses: Record<string, CourseAttendanceStatus>
}) {
  const [selectedRow, setSelectedRow] =
    useState<TeacherCourseAttendanceStudent | null>(null)
  const submitted = sessionStatus === "SUBMITTED" || sessionStatus === "LOCKED"
  const busy = isSavingDraft || isSubmitting
  const groupedRows = useMemo(
    () => groupRowsByStatus(rows, statuses),
    [rows, statuses]
  )
  const selectedKey = selectedRow ? getStudentKey(selectedRow) : null
  const selectedStatus =
    selectedRow && selectedKey
      ? (statuses[selectedKey] ?? selectedRow.status)
      : null
  const selectedDetails =
    selectedRow && selectedKey
      ? (markDetails[selectedKey] ?? getAttendanceMarkDetails(selectedRow))
      : null

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Card className="gap-3" size="sm">
        <CardHeader className="px-0">
          <CardDescription>
            {submitted
              ? attendanceCopy("Recapitulatif valide", "Submitted recap")
              : attendanceCopy("Recapitulatif obligatoire", "Required recap")}
          </CardDescription>
          <CardTitle>
            {submitted
              ? attendanceCopy(
                  "Appel deja valide",
                  "Attendance already submitted"
                )
              : counts.pending > 0
                ? attendanceCopy(
                    "Des statuts restent a corriger",
                    "Some statuses need review"
                  )
                : attendanceCopy("Pret a valider", "Ready to submit")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 px-0">
          <StatusCountCard
            label={attendanceCopy("Absents", "Absent")}
            value={counts.absent}
            variant="destructive"
          />
          <StatusCountCard
            label={attendanceCopy("Retards", "Late")}
            value={counts.late}
            variant="warning"
          />
          <StatusCountCard
            label={attendanceCopy("Pending", "Pending")}
            value={counts.pending}
            variant="neutral"
          />
        </CardContent>
      </Card>

      {attendanceStatuses.map((status) => {
        const statusRows = groupedRows[status]
        if (statusRows.length === 0 && !shouldAlwaysShowRecapStatus(status)) {
          return null
        }

        return (
          <StatusSection
            key={status}
            onSelectRow={submitted ? undefined : setSelectedRow}
            rows={statusRows}
            status={status}
          />
        )
      })}

      <Drawer
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedRow
                ? getStudentName(selectedRow)
                : attendanceCopy("Correction", "Correction")}
            </DrawerTitle>
            <DrawerDescription>
              {attendanceCopy(
                "Choisis le statut final pour le recapitulatif.",
                "Choose the final status for the recap."
              )}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-2">
            {attendanceStatuses.map((status) => {
              if (!selectedRow) return null
              const selected =
                (statuses[getStudentKey(selectedRow)] ?? selectedRow.status) ===
                status

              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border bg-background p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected &&
                      "border-brand-dark bg-brand-soft text-brand-dark"
                  )}
                  key={status}
                  onClick={() => {
                    onStatusChange(selectedRow, status)
                    if (status !== "LATE") setSelectedRow(null)
                  }}
                  type="button"
                >
                  <span className="font-semibold">
                    {formatAttendanceStatus(status)}
                  </span>
                  {selected ? <CheckCircle2 /> : null}
                </button>
              )
            })}
            {selectedRow && selectedDetails && selectedStatus === "LATE" ? (
              <Field className="mt-2">
                <FieldLabel htmlFor="course-attendance-late-minutes">
                  {attendanceCopy("Minutes de retard", "Late minutes")}
                </FieldLabel>
                <Input
                  id="course-attendance-late-minutes"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) =>
                    onMarkDetailsChange(selectedRow, {
                      ...selectedDetails,
                      lateMinutes: parseLateMinutes(event.currentTarget.value),
                    })
                  }
                  placeholder="0"
                  type="number"
                  value={selectedDetails.lateMinutes ?? ""}
                />
              </Field>
            ) : null}
            {selectedRow && selectedDetails ? (
              <Field className="mt-2">
                <FieldLabel htmlFor="course-attendance-note">
                  {attendanceCopy("Note", "Note")}
                </FieldLabel>
                <Input
                  id="course-attendance-note"
                  maxLength={500}
                  onChange={(event) =>
                    onMarkDetailsChange(selectedRow, {
                      ...selectedDetails,
                      note: event.currentTarget.value,
                    })
                  }
                  placeholder={attendanceCopy(
                    "Commentaire optionnel",
                    "Optional note"
                  )}
                  value={selectedDetails.note}
                />
              </Field>
            ) : null}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                {attendanceCopy("Fermer", "Close")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <MobileFloatingBar
        aria-label={attendanceCopy(
          "Validation de l'appel",
          "Attendance submission"
        )}
        hideOnScroll={false}
      >
        <Button
          className="flex-1"
          disabled={busy}
          onClick={submitted ? onCloseSession : onBackToStack}
          type="button"
          variant="outline"
        >
          {submitted
            ? attendanceCopy("Retour sessions", "Back to sessions")
            : attendanceCopy("Corriger", "Edit")}
        </Button>
        <Button
          className="flex-1"
          disabled={submitted || busy}
          onClick={onSaveDraft}
          type="button"
          variant="outline"
        >
          {isSavingDraft ? (
            <Loader2 data-icon="inline-start" />
          ) : (
            <Check data-icon="inline-start" />
          )}
          {attendanceCopy("Enregistrer", "Save")}
        </Button>
        <Button
          className="flex-1"
          disabled={submitted || counts.pending > 0 || busy}
          onClick={onSubmit}
          type="button"
        >
          {isSubmitting ? (
            <Loader2 data-icon="inline-start" />
          ) : submitted ? (
            <Check data-icon="inline-start" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          {submitted
            ? attendanceCopy("Valide", "Submitted")
            : attendanceCopy("Valider", "Submit")}
        </Button>
      </MobileFloatingBar>
    </div>
  )
}

function StatusCountCard({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant: "destructive" | "neutral" | "warning"
}) {
  return (
    <div className="rounded-xl border bg-background p-3 text-center">
      <Badge variant={variant}>{label}</Badge>
      <div className="mt-3 font-mono text-2xl leading-none font-semibold">
        {value}
      </div>
    </div>
  )
}

function StatusSection({
  onSelectRow,
  rows,
  status,
}: {
  onSelectRow?: (row: TeacherCourseAttendanceStudent) => void
  rows: TeacherCourseAttendanceStudent[]
  status: CourseAttendanceStatus
}) {
  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {formatAttendanceStatus(status)}
          </div>
          <div className="text-xs text-muted-foreground">
            {rows.length} {attendanceCopy("eleve(s)", "student(s)")}
          </div>
        </div>
        <Badge variant={getAttendanceBadgeVariant(status)}>{rows.length}</Badge>
      </div>
      {rows.length ? <Separator /> : null}
      {rows.map((row, index) => (
        <div key={getStudentKey(row)}>
          <button
            className="flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default"
            disabled={!onSelectRow}
            onClick={() => onSelectRow?.(row)}
            type="button"
          >
            <PersonAvatar
              className="size-10"
              name={getStudentName(row)}
              size="sm"
              src={row.photoUrl}
              tone="student"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {getStudentName(row)}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {formatPortalContext(row.portalContext ?? null)}
              </div>
            </div>
            {onSelectRow ? (
              <ChevronRight className="text-muted-foreground" />
            ) : null}
          </button>
          {index < rows.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </Card>
  )
}

export function CourseAttendanceSkeleton() {
  return (
    <Card className="gap-4" size="sm">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </Card>
  )
}

export function CourseAttendanceEmptyState({
  description,
  kind,
  title,
}: {
  description: string
  kind: "empty" | "error"
  title: string
}) {
  return (
    <Card size="sm">
      <Empty className="p-4">
        {kind === "error" ? (
          <AlertTriangle className="text-destructive" />
        ) : (
          <XCircle className="text-muted-foreground" />
        )}
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  )
}

type AttendanceCounts = {
  absent: number
  excused: number
  late: number
  pending: number
  present: number
  total: number
}

function getAttendanceCounts(
  rows: TeacherCourseAttendanceStudent[],
  statuses: Record<string, CourseAttendanceStatus>
): AttendanceCounts {
  const counts: AttendanceCounts = {
    absent: 0,
    excused: 0,
    late: 0,
    pending: 0,
    present: 0,
    total: rows.length,
  }

  for (const row of rows) {
    const status = statuses[getStudentKey(row)] ?? row.status

    if (status === "PRESENT") counts.present += 1
    if (status === "ABSENT") counts.absent += 1
    if (status === "LATE") counts.late += 1
    if (status === "EXCUSED") counts.excused += 1
    if (status === "PENDING") counts.pending += 1
  }

  return counts
}

function groupRowsByStatus(
  rows: TeacherCourseAttendanceStudent[],
  statuses: Record<string, CourseAttendanceStatus>
) {
  const grouped: Record<
    CourseAttendanceStatus,
    TeacherCourseAttendanceStudent[]
  > = {
    ABSENT: [],
    EXCUSED: [],
    LATE: [],
    PENDING: [],
    PRESENT: [],
  }

  for (const row of rows) {
    grouped[statuses[getStudentKey(row)] ?? row.status].push(row)
  }

  return grouped
}

function normalizeAttendanceRows(
  session: TeacherCourseAttendanceSessionDetails | undefined
): TeacherCourseAttendanceStudent[] {
  const rows = session?.students ?? []

  return rows
    .filter((row) => Boolean(row.enrollmentId))
    .map((row) => ({
      ...row,
      status: normalizeAttendanceStatus(row.status),
      studentName: getStudentName(row),
    }))
}

function buildAttendancePatch(
  rows: TeacherCourseAttendanceStudent[],
  statuses: Record<string, CourseAttendanceStatus>,
  markDetails: Record<string, AttendanceMarkDetails>
): TeacherPatchCourseAttendanceInput {
  return {
    attendances: rows.map((row) => {
      const key = getStudentKey(row)
      const status = statuses[key] ?? row.status
      const details = markDetails[key] ?? getAttendanceMarkDetails(row)

      return {
        attendanceId: row.attendanceId,
        enrollmentId: row.enrollmentId,
        identityId: row.identityId,
        lateMinutes: status === "LATE" ? details.lateMinutes : null,
        note: normalizeAttendanceNote(details.note),
        status,
      }
    }),
  }
}

function getAttendanceMarkDetails(
  row: TeacherCourseAttendanceStudent
): AttendanceMarkDetails {
  return {
    lateMinutes: row.lateMinutes ?? null,
    note: row.note ?? "",
  }
}

function normalizeAttendanceNote(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ""
  return trimmed ? trimmed : null
}

function parseLateMinutes(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.floor(parsed)
}

function showCourseAttendanceMutationError(
  error: unknown,
  fallbackFr: string,
  fallbackEn: string
) {
  toast.error(
    error ? getApiErrorMessage(error) : attendanceCopy(fallbackFr, fallbackEn)
  )
}

function normalizeAttendanceStatus(status: unknown): CourseAttendanceStatus {
  return attendanceStatuses.includes(status as CourseAttendanceStatus)
    ? (status as CourseAttendanceStatus)
    : "PENDING"
}

function sortSessionsForContext(
  sessions: TeacherCourseAttendanceSessionSummary[],
  context: CourseAttendanceRouteContext | null
) {
  return [...sessions].sort((left, right) => {
    const leftScore = getSessionContextScore(left, context)
    const rightScore = getSessionContextScore(right, context)

    if (leftScore !== rightScore) return rightScore - leftScore
    return (left.startTime ?? "").localeCompare(right.startTime ?? "")
  })
}

function getSessionContextScore(
  session: TeacherCourseAttendanceSessionSummary,
  context: CourseAttendanceRouteContext | null
) {
  if (!context) return 0

  let score = 0
  const contextScheduleSlotId = context.scheduleSlotId
  const sessionScheduleSlotId = session.scheduleSlotId

  if (
    contextScheduleSlotId &&
    sessionScheduleSlotId === contextScheduleSlotId
  ) {
    score += 4
  }
  if (context.classGroupId && session.classGroupId === context.classGroupId) {
    score += 2
  }
  if (
    context.subjectLevelId &&
    session.subjectLevelId === context.subjectLevelId
  ) {
    score += 2
  }

  return score
}

function getDragIntent(x: number, y: number): AttendanceStatusAction | null {
  const absX = Math.abs(x)
  const absY = Math.abs(y)

  if (y < -76 && absY > absX * 0.8) return "PRESENT"
  if (x < -84 && absX > absY * 0.6) return "ABSENT"
  if (x > 84 && absX > absY * 0.6) return "LATE"
  return null
}

function getCardIntentClass(intent: AttendanceStatusAction | null) {
  switch (intent) {
    case "PRESENT":
      return "border-brand"
    case "ABSENT":
      return "border-destructive/70"
    case "LATE":
      return "border-warning/70"
    default:
      return null
  }
}

function getDeckIntentGlowStyle(
  intent: AttendanceStatusAction | null
): CSSProperties {
  switch (intent) {
    case "PRESENT":
      return {
        background:
          "linear-gradient(180deg, rgba(0, 209, 101, 0.36) 0%, rgba(0, 209, 101, 0.28) 42%, transparent 68%)",
      }
    case "ABSENT":
      return {
        background:
          "linear-gradient(90deg, rgba(207, 74, 34, 0.48) 0%, rgba(207, 74, 34, 0.36) 45%, transparent 68%)",
      }
    case "LATE":
      return {
        background:
          "linear-gradient(270deg, rgba(199, 108, 23, 0.48) 0%, rgba(199, 108, 23, 0.36) 45%, transparent 68%)",
      }
    default:
      return {}
  }
}

function shouldAlwaysShowRecapStatus(status: CourseAttendanceStatus) {
  return status === "ABSENT" || status === "LATE" || status === "PENDING"
}

function getStudentKey(row: TeacherCourseAttendanceStudent) {
  return row.enrollmentId
}

function getStudentName(row: TeacherCourseAttendanceStudent) {
  const name =
    row.studentName ||
    `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() ||
    row.studentNumber ||
    attendanceCopy("Eleve", "Student")

  return name
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

function canOpenCourseSessionFromContext(
  context: CourseAttendanceRouteContext | null
) {
  if (!context) return false
  if (context.scheduleSlotId) return true

  return Boolean(
    context.classGroupId &&
    context.subjectLevelId &&
    context.startTime &&
    context.endTime
  )
}

function getCourseAttendanceContextFromSession(
  session: TeacherCourseAttendanceSessionSummary
): CourseAttendanceRouteContext {
  return {
    classGroupCode: session.classGroupCode,
    classGroupId: session.classGroupId,
    classGroupName: session.classGroupName,
    date: session.date,
    endTime: session.endTime,
    scheduleSlotId: session.scheduleSlotId,
    startTime: session.startTime,
    subjectLevelId: session.subjectLevelId,
    subjectName: session.subjectName,
  }
}

function formatContextHeaderTitle(
  context: CourseAttendanceRouteContext | null
) {
  if (!context) {
    return attendanceCopy("Appel", "Roll call")
  }

  const classLabel = context.classGroupCode ?? context.classGroupName

  return classLabel ?? attendanceCopy("Appel", "Roll call")
}

function formatContextHeaderSubtitle(
  context: CourseAttendanceRouteContext | null
) {
  const parts = [attendanceCopy("Presence aux cours", "Course attendance")]

  if (context?.subjectName) {
    parts.push(context.subjectName)
  }

  if (context?.startTime || context?.endTime) {
    parts.push(`${context.startTime ?? "?"} - ${context.endTime ?? "?"}`)
  }

  return parts.join(" - ")
}

function formatSessionTitle(session: TeacherCourseAttendanceSessionSummary) {
  const classLabel = session.classGroupCode ?? session.classGroupName
  const subjectLabel = session.subjectName

  if (classLabel && subjectLabel) return `${classLabel} - ${subjectLabel}`
  return (
    classLabel ??
    subjectLabel ??
    attendanceCopy("Session d'appel", "Attendance session")
  )
}

function formatSessionMeta(session: TeacherCourseAttendanceSessionSummary) {
  const parts = [fmtDate(session.date, "medium")]

  if (session.startTime || session.endTime) {
    parts.push(`${session.startTime ?? "?"} - ${session.endTime ?? "?"}`)
  }

  return parts.join(" - ")
}

function formatPortalContext(
  context?: TeacherCourseAttendancePortalContext | null
) {
  if (!context) {
    return attendanceCopy(
      "contexte portail indisponible",
      "gate context unavailable"
    )
  }

  if (context.entry || context.exit) {
    const parts = []
    if (context.entry?.createdAt) {
      parts.push(
        `${attendanceCopy("Entree", "Entry")} - ${fmtTime(context.entry.createdAt)}`
      )
    }
    if (context.exit?.createdAt) {
      parts.push(
        `${attendanceCopy("Sortie", "Exit")} - ${fmtTime(context.exit.createdAt)}`
      )
    }

    if (parts.length) return parts.join(" / ")
  }

  const status =
    context.currentStatus ??
    context.entryStatus ??
    context.exitStatus ??
    context.lastScanType ??
    null
  const scanAt = context.lastScanAt ?? context.lastEntryAt ?? context.lastExitAt

  if (status && scanAt) {
    return `${formatPortalStatus(status)} - ${fmtTime(scanAt)}`
  }

  if (scanAt) return fmtTime(scanAt)
  if (status) return formatPortalStatus(status)

  return attendanceCopy("aucun passage recent", "no recent gate scan")
}

function formatPortalStatus(status: string) {
  switch (status) {
    case "ENTRY":
      return attendanceCopy("Entree", "Entry")
    case "EXIT":
      return attendanceCopy("Sortie", "Exit")
    case "INSIDE":
      return attendanceCopy("Dans l'ecole", "Inside school")
    case "OUTSIDE":
      return attendanceCopy("Hors portail", "Outside gate")
    default:
      return status
  }
}

function formatSessionStatus(status?: string | null) {
  switch (status) {
    case "SUBMITTED":
      return attendanceCopy("Valide", "Submitted")
    case "LOCKED":
      return attendanceCopy("Verrouille", "Locked")
    case "DRAFT":
      return attendanceCopy("Brouillon", "Draft")
    case null:
    case undefined:
      return attendanceCopy("A ouvrir", "To open")
    default:
      return attendanceCopy("Ouvert", "Open")
  }
}

function getSessionBadgeVariant(
  status?: string | null
): ComponentProps<typeof Badge>["variant"] {
  if (status === "SUBMITTED") return "success"
  if (status === "LOCKED") return "secondary"
  if (status === "DRAFT") return "neutral"
  return "warning"
}

function formatAttendanceStatus(status: CourseAttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return attendanceCopy("Present", "Present")
    case "ABSENT":
      return attendanceCopy("Absent", "Absent")
    case "LATE":
      return attendanceCopy("Retard", "Late")
    case "EXCUSED":
      return attendanceCopy("Excuse", "Excused")
    case "PENDING":
      return attendanceCopy("En attente", "Pending")
  }
}

function getAttendanceBadgeVariant(
  status: CourseAttendanceStatus
): ComponentProps<typeof Badge>["variant"] {
  switch (status) {
    case "PRESENT":
      return "success"
    case "ABSENT":
      return "destructive"
    case "LATE":
      return "warning"
    case "EXCUSED":
      return "secondary"
    case "PENDING":
      return "neutral"
  }
}

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function attendanceCopy(fr: string, en: string) {
  return window.location.pathname.startsWith("/en") ? en : fr
}
