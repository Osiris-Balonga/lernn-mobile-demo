import type { ParentChildrenGrades } from "./report-cards"

/** Missing evaluations are not grades and must never be presented as zeroes. */
export function normalizeParentChildrenGrades(
  grades: ParentChildrenGrades
): ParentChildrenGrades {
  return {
    ...grades,
    children: grades.children.map((child) => {
      const subjectAverages = child.subjectAverages.map((subject) =>
        subject.gradeCount > 0
          ? subject
          : { ...subject, average: null, min: null, max: null }
      )
      const hasEnteredGrade = subjectAverages.some(
        (subject) => subject.gradeCount > 0
      )

      return {
        ...child,
        periodAverage: hasEnteredGrade ? child.periodAverage : null,
        rank: hasEnteredGrade ? child.rank : null,
        subjectAverages,
      }
    }),
  }
}
