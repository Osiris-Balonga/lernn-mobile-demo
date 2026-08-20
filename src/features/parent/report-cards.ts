import { queryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { EvaluationType } from "@/features/evaluations/types"
import { normalizeParentChildrenGrades } from "./report-card-utils"

export interface ChildReportCard {
  id: string
  code: string
  kind: "PERIOD" | "FINAL"
  schoolYearId: string
  periodId: string | null
  periodCode: string | null
  periodName: string | null
  periodAverage: number | null
  annualAverage: number | null
  classAverage: number | null
  rank: number | null
  totalStudents: number
  generatedAt: string
}

export interface ParentReportSubjectAverage {
  subjectLevelId: string
  subjectCode: string
  subjectColor?: string | null
  subjectName: string
  coefficient: number
  average: number | null
  gradeCount: number
  min: number | null
  max: number | null
}

export interface ParentGradingScale {
  min: number
  max: number
  passingGrade: number
}

export interface ParentGradesChild {
  identityId: string
  firstName: string
  lastName: string
  photoUrl: string | null
  classGroup: {
    id: string
    code: string
    name: string
  }
  enrollmentId: string
  periodAverage: number | null
  rank: number | null
  totalStudents: number
  classAverage: number | null
  gradingScale: ParentGradingScale
  subjectAverages: ParentReportSubjectAverage[]
}

export interface ParentChildrenGrades {
  schoolYear: {
    id: string
    label: string
  }
  period: AcademicPeriod
  children: ParentGradesChild[]
}

export interface ParentSubjectGrade {
  evaluationId: string
  title: string
  type: EvaluationType
  date: string
  weight: number
  score: number | null
  absent: boolean
  comment: string | null
  classAverage: number | null
}

export interface ParentChildSubjectGrades {
  enrollmentId: string
  identityId: string
  firstName: string
  lastName: string
  subjectCode: string
  subjectColor?: string | null
  subjectName: string
  coefficient: number
  teacherName?: string | null
  schoolYear: {
    id: string
    label: string
  }
  period: AcademicPeriod
  gradingScale: ParentGradingScale
  grades: ParentSubjectGrade[]
}

export interface AcademicPeriod {
  id: string
  code: string
  name: string
  type: string
  sequence: number
  startDate: string
  endDate: string
  status: string
  closedAt: string | null
  closedById: string | null
  schoolYearId: string
  createdAt?: string
  updatedAt?: string
}

export const parentChildrenGradesQueryOptions = (
  schoolId: string,
  periodId?: string,
  schoolYearId?: string
) =>
  queryOptions({
    queryKey: [
      "parent",
      "children",
      "grades",
      schoolId,
      periodId ?? "active",
      schoolYearId ?? "current",
    ],
    queryFn: () =>
      apiClient
        .get<{
          data: ParentChildrenGrades
        }>(`/schools/${schoolId}/evaluations/parent/children`, {
          params:
            periodId || schoolYearId
              ? {
                  ...(periodId ? { periodId } : {}),
                  ...(schoolYearId ? { schoolYearId } : {}),
                }
              : undefined,
        })
        .then((response) => normalizeParentChildrenGrades(response.data)),
    staleTime: 120_000,
  })

export const childSubjectGradesQueryOptions = (
  schoolId: string,
  enrollmentId: string,
  subjectLevelId: string,
  periodId: string
) =>
  queryOptions({
    queryKey: [
      "parent",
      "children",
      enrollmentId,
      "subjects",
      subjectLevelId,
      periodId,
      schoolId,
    ],
    queryFn: () =>
      apiClient
        .get<{
          data: ParentChildSubjectGrades
        }>(
          `/schools/${schoolId}/evaluations/parent/children/${enrollmentId}/subjects/${subjectLevelId}`,
          { params: { periodId } }
        )
        .then((response) => response.data),
    staleTime: 120_000,
  })

export const childReportCardsQueryOptions = (
  schoolId: string,
  enrollmentId: string
) =>
  queryOptions({
    queryKey: ["parent", "children", enrollmentId, "report-cards", schoolId],
    queryFn: () =>
      apiClient
        .get<{
          data: ChildReportCard[]
        }>(
          `/schools/${schoolId}/evaluations/parent/children/${enrollmentId}/report-cards`
        )
        .then((response) => response.data),
    staleTime: 300_000,
  })
