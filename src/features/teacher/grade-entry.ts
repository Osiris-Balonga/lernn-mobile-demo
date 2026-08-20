import type { TeacherGradeGridStudent } from "./types"

export type TeacherGradeMutationRow = {
  absent: boolean
  enrollmentId: string
  score: number | null
}

export function buildChangedTeacherGrades(
  students: TeacherGradeGridStudent[],
  scores: Record<string, string>
): TeacherGradeMutationRow[] {
  return students.flatMap((student) => {
    const scoreText = scores[student.enrollmentId]?.trim() ?? ""
    const nextScore = scoreText ? Number(scoreText) : null
    const previousScore = student.grade

    if (nextScore === previousScore) return []
    if (nextScore === null && student.status !== "absent") return []

    return [
      {
        absent: student.status === "absent",
        enrollmentId: student.enrollmentId,
        score: student.status === "absent" ? null : nextScore,
      },
    ]
  })
}
