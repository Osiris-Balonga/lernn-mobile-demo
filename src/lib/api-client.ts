import { toast } from "sonner"
import * as m from "@/paraglide/messages"
import { requestDemo } from "@/demo/repository"
import { DemoRepositoryError } from "@/demo/types"

export interface ApiFieldError {
  path: string
  code: string
  params?: Record<string, unknown>
}

export interface ApiProblemDetails {
  type: string
  code: string
  title: string
  status: number
  detail: string
  instance: string
  traceId: string
  params?: Record<string, unknown>
  errors?: ApiFieldError[]
}

export class ApiError extends Error {
  readonly status: number
  readonly detail: string
  readonly type: string
  readonly code: string
  readonly instance: string
  readonly traceId: string
  readonly params?: Record<string, unknown>
  readonly errors?: ApiFieldError[]

  constructor(problemDetails: ApiProblemDetails) {
    super(problemDetails.title)
    this.name = "ApiError"
    this.status = problemDetails.status
    this.detail = problemDetails.detail
    this.type = problemDetails.type
    this.code = problemDetails.code
    this.instance = problemDetails.instance
    this.traceId = problemDetails.traceId
    this.params = problemDetails.params
    this.errors = problemDetails.errors
  }
}

export interface UnauthorizedContext {
  error: ApiError
  method: string
  path: string
}

let onUnauthorized: ((context: UnauthorizedContext) => void) | null = null

export function registerUnauthorizedHandler(
  handler: (context: UnauthorizedContext) => void
) {
  onUnauthorized = handler

  return () => {
    if (onUnauthorized === handler) {
      onUnauthorized = null
    }
  }
}

export function isUnauthorizedApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401
}

export function isApiErrorCode(
  error: unknown,
  code: string | readonly string[]
): error is ApiError {
  const codes = Array.isArray(code) ? code : [code]
  return error instanceof ApiError && codes.includes(error.code)
}

export function isApiNetworkOrTimeoutError(error: unknown) {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "AbortError" || error.name === "TimeoutError"
  }

  if (error instanceof TypeError) {
    return /abort|failed|fetch|load|network|timeout/i.test(error.message)
  }

  if (error instanceof Error) {
    return /abort|failed|fetch|load|network|timed out|timeout/i.test(
      error.message
    )
  }

  return false
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; pageCount: number }
}

interface RequestOptions {
  params?: Record<string, unknown>
  /** Query locale for generated documents only. */
  documentLocale?: "fr" | "en"
  headers?: Record<string, string>
  schoolId?: string
  signal?: AbortSignal
}

export function buildApiUrl(
  path: string,
  params?: Record<string, unknown>,
  documentLocale?: "fr" | "en"
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`/api/v1${normalizedPath}`, "https://demo.lernn.local")
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key === "locale") continue
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    }
  }
  if (documentLocale) url.searchParams.set("locale", documentLocale)
  return `${url.pathname}${url.search}`
}

export function setSchoolIdGetter(_getter: () => string | null) {
  // Conservé pour compatibilité avec le shell original. Le dépôt statique ne
  // transmet jamais de contexte d'établissement à un serveur.
  void _getter
}

function toProblemDetails(
  error: DemoRepositoryError,
  path: string
): ApiProblemDetails {
  return {
    type: `https://lernn.app/problems/${error.code.toLowerCase().replaceAll("_", "-")}`,
    code: error.code,
    title: error.message,
    status: error.status,
    detail: error.message,
    instance: path,
    traceId: "static-demo",
  }
}

async function requestStatic<T>(
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT",
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  if (options?.signal?.aborted) {
    throw new DOMException("The operation was aborted", "AbortError")
  }

  try {
    return await requestDemo<T>({ method, path, body, params: options?.params })
  } catch (cause) {
    if (!(cause instanceof DemoRepositoryError)) throw cause
    const error = new ApiError(toProblemDetails(cause, path))
    if (error.status === 401 && onUnauthorized) {
      onUnauthorized({ method, path, error })
    }
    throw error
  }
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return requestStatic<T>("GET", path, undefined, options)
  },

  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return requestStatic<T>("POST", path, body, options)
  },

  async put<T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return requestStatic<T>("PUT", path, body, options)
  },

  async patch<T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return requestStatic<T>("PATCH", path, body, options)
  },

  async delete<T = void>(path: string, options?: RequestOptions): Promise<T> {
    return requestStatic<T>("DELETE", path, undefined, options)
  },
}

export function showApiError(error: unknown) {
  toast.error(getApiErrorMessage(error))
}

function problemParam(
  params: Record<string, unknown> | undefined,
  key: string
): string {
  const value = params?.[key]
  if (Array.isArray(value)) return value.join(", ")
  return value === undefined || value === null ? "" : String(value)
}

export function getApiFieldErrorMessage(error: ApiFieldError): string {
  switch (error.code) {
    case "INVALID_TYPE":
      return m.api_field_invalid_type()
    case "TOO_SMALL":
      return m.api_field_too_small()
    case "TOO_BIG":
      return m.api_field_too_big()
    case "INVALID_FORMAT":
      return m.api_field_invalid_format()
    case "UNRECOGNIZED_KEYS":
      return m.api_field_unrecognized_keys()
    case "REQUIRED":
      return m.api_field_required()
    default:
      return m.api_field_invalid_value()
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return m.api_error_unexpected_detail()

  const p = error.params
  switch (error.code) {
    case "BAD_REQUEST":
      return m.api_problem_bad_request()
    case "UNAUTHORIZED":
      return m.api_problem_unauthorized()
    case "FORBIDDEN":
      return m.api_problem_forbidden()
    case "NOT_FOUND":
      return m.api_problem_not_found()
    case "CONFLICT":
      return m.api_problem_conflict()
    case "VALIDATION_FAILED":
      return m.api_problem_validation_failed()
    case "RATE_LIMITED":
      return m.api_problem_rate_limited()
    case "INTERNAL_SERVER_ERROR":
      return m.api_problem_internal_server_error()
    case "AUTH_FLOW_DISABLED":
      return m.api_problem_auth_flow_disabled()
    case "INVITATION_NOT_VALID":
      return m.api_problem_invitation_not_valid()
    case "INVITATION_EXPIRED":
      return m.api_problem_invitation_expired()
    case "INVITATION_TARGET_IDENTITY_NOT_FOUND":
      return m.api_problem_invitation_target_identity_not_found()
    case "ENROLLMENT_CASE_NOT_FOUND":
      return m.api_problem_enrollment_case_not_found()
    case "ENROLLMENT_CASE_INVALID_STATE":
      return m.api_problem_enrollment_case_invalid_state()
    case "ENROLLMENT_CASE_REVISION_CONFLICT":
      return m.api_problem_enrollment_case_revision_conflict()
    case "ENROLLMENT_CANDIDATE_NOT_FOUND":
      return m.api_problem_enrollment_candidate_not_found()
    case "ACTIVE_ENROLLMENT_ALREADY_EXISTS":
      return m.api_problem_active_enrollment_already_exists()
    case "CLASS_GROUP_CAPACITY_EXCEEDED":
      return m.api_problem_class_group_capacity_exceeded()
    case "CARD_ACCESS_LOCKED":
      return m.api_problem_card_access_locked()
    case "IDEMPOTENCY_CONFLICT":
      return m.api_problem_idempotency_conflict()
    case "IDEMPOTENCY_KEY_REQUIRED":
      return m.api_problem_idempotency_key_required()
    case "PARENT_IDENTITY_NOT_FOUND":
      return m.api_problem_parent_identity_not_found()
    case "SCHOOL_CONTEXT_AUTHENTICATION_REQUIRED":
      return m.api_problem_school_context_authentication_required()
    case "SCHEDULE_SCHOOL_YEAR_CLOSED":
      return m.api_problem_schedule_school_year_closed()
    case "USER_PROFILE_NOT_FOUND":
      return m.api_problem_user_profile_not_found()
    case "PERIOD_ID_REQUIRED":
      return m.api_problem_period_id_required()
    case "CARD_NOT_FOUND":
      return m.api_problem_card_not_found()
    case "CARD_INVALID":
      return m.api_problem_card_invalid({ status: problemParam(p, "status") })
    case "PRESENCE_ALREADY_RECORDED":
      return m.api_problem_presence_already_recorded({
        recordedAt: problemParam(p, "recordedAt"),
      })
    case "NO_ENTRY_RECORDED":
      return m.api_problem_no_entry_recorded()
    case "PRESENCE_EVENT_NOT_FOUND":
      return m.api_problem_presence_event_not_found()
    case "PRESENCE_EVENT_IDENTITY_MISSING":
      return m.api_problem_presence_event_identity_missing()
    case "PICKUP_IDENTITY_REQUIRED":
      return m.api_problem_pickup_identity_required()
    case "PICKUP_IDENTITY_NOT_FOUND":
      return m.api_problem_pickup_identity_not_found()
    case "PICKUP_OVERRIDE_REASON_REQUIRED":
      return m.api_problem_pickup_override_reason_required()
    case "COMPANION_SESSION_NOT_FOUND":
      return m.api_problem_companion_session_not_found()
    case "COMPANION_SESSION_FORBIDDEN":
      return m.api_problem_companion_session_forbidden()
    case "COMPANION_SESSION_INVALID_TOKEN":
      return m.api_problem_companion_session_invalid_token()
    case "COMPANION_SESSION_INVALID_TARGET":
      return m.api_problem_companion_session_invalid_target()
    case "COMPANION_SESSION_BOUND":
      return m.api_problem_companion_session_bound()
    case "COMPANION_SESSION_GONE":
      return m.api_problem_companion_session_gone()
    case "IDENTITY_ENROLLMENT_NOT_FOUND":
      return m.api_problem_identity_enrollment_not_found()
    case "DATE_RANGE_TOO_LARGE":
      return m.api_problem_date_range_too_large()
    case "JUSTIFICATION_ALREADY_SUBMITTED":
      return m.api_problem_justification_already_submitted()
    case "JUSTIFICATION_NOT_FOUND":
      return m.api_problem_justification_not_found()
    case "COURSE_ATTENDANCE_SESSION_NOT_FOUND":
      return m.api_problem_course_attendance_session_not_found()
    case "SCHEDULE_SLOT_NOT_FOUND":
      return m.api_problem_schedule_slot_not_found()
    case "SUBJECT_LEVEL_NOT_FOUND":
      return m.api_problem_subject_level_not_found()
    case "INVALID_STATUS_FILTER":
      return m.api_problem_invalid_status_filter({
        status: problemParam(p, "status"),
      })
    case "INVALID_STATUS_TRANSITION":
      return m.api_problem_invalid_status_transition({
        status: problemParam(p, "status"),
      })
    case "INVALID_STUDENT_ENROLLMENTS":
      return m.api_problem_invalid_student_enrollments({
        enrollmentIds: problemParam(p, "enrollmentIds"),
      })
    case "INVALID_GRADE":
      return m.api_problem_invalid_grade({
        min: problemParam(p, "min"),
        max: problemParam(p, "max"),
      })
    case "IMPORT_ENROLLMENT_NOT_FOUND":
      return m.api_problem_import_enrollment_not_found({
        studentName: problemParam(p, "studentName"),
      })
    case "IMPORT_SCORE_REQUIRED":
      return m.api_problem_import_score_required({
        studentName: problemParam(p, "studentName"),
      })
    case "IMPORT_SCORE_OUT_OF_RANGE":
      return m.api_problem_import_score_out_of_range({
        studentName: problemParam(p, "studentName"),
        min: problemParam(p, "min"),
        max: problemParam(p, "max"),
      })
    case "IMPORT_COMMENT_TOO_LONG":
      return m.api_problem_import_comment_too_long({
        studentName: problemParam(p, "studentName"),
        maxLength: problemParam(p, "maxLength"),
      })
    case "CLASS_GROUP_CODE_DUPLICATE":
      return m.api_problem_class_group_code_duplicate({
        code: problemParam(p, "code"),
      })
    case "INSTALLMENTS_SUM_MISMATCH":
      return m.api_problem_installments_sum_mismatch({
        installmentsSum: problemParam(p, "installmentsSum"),
        amount: problemParam(p, "amount"),
      })
    case "NO_OUTSTANDING_BALANCE":
      return m.api_problem_no_outstanding_balance()
    case "OVERPAYMENT":
      return m.api_problem_overpayment({
        amount: problemParam(p, "amount"),
        totalOwed: problemParam(p, "totalOwed"),
      })
    case "PAYMENT_NOT_FOUND":
      return m.api_problem_payment_not_found({
        paymentId: problemParam(p, "paymentId"),
      })
    case "RECEIPT_NOT_FOUND":
      return m.api_problem_receipt_not_found({
        paymentId: problemParam(p, "paymentId"),
      })
    case "RECEIPT_CODE_NOT_FOUND":
      return m.api_problem_receipt_code_not_found({
        code: problemParam(p, "code"),
      })
    case "SCHEDULE_CRITICAL_CONFLICTS":
      return m.api_problem_schedule_critical_conflicts({
        count: problemParam(p, "count"),
      })
    case "SCHEDULE_WARNINGS":
      return m.api_problem_schedule_warnings({
        count: problemParam(p, "count"),
      })
    case "SCHOOL_DATA":
      return m.api_problem_school_data({ summary: problemParam(p, "summary") })
    case "SCHOOL_CODE_COLLISION":
      return m.api_problem_school_code_collision({
        code: problemParam(p, "code"),
      })
    default:
      return m.api_error_unexpected_detail()
  }
}
