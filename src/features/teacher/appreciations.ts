import type { TeacherAppreciation, TeacherClassGradeGridStudent } from "./types"

export type TeacherAppreciationDraft = {
  comment: string
  label: string
}

export function buildChangedTeacherAppreciations({
  drafts,
  existing,
  periodId,
  students,
  subjectLevelId,
}: {
  drafts: Record<string, TeacherAppreciationDraft>
  existing: Map<string, TeacherAppreciation>
  periodId: string
  students: TeacherClassGradeGridStudent[]
  subjectLevelId: string
}) {
  return students.flatMap((student) => {
    const draft = drafts[student.studentEnrollmentId]
    const label = draft?.label.trim() ?? ""
    const comment = draft?.comment.trim() ?? ""
    const current = existing.get(student.studentEnrollmentId)

    if (!label) return []
    if (current?.label === label && (current.comment ?? "") === comment) {
      return []
    }

    return [
      {
        comment: comment || undefined,
        label,
        periodId,
        studentEnrollmentId: student.studentEnrollmentId,
        subjectLevelId,
      },
    ]
  })
}
