import type { ParentChildSummary } from "./types"

export interface CanonicalAcademicAccessState {
  amount: number | null
  blocked: boolean
  reason: "card" | null
}

export function getCanonicalAcademicAccessState(
  child:
    | Pick<ParentChildSummary, "academicAccess" | "cardAmountDue">
    | null
    | undefined
): CanonicalAcademicAccessState {
  if (!child || child.academicAccess === "GRANTED") {
    return { amount: null, blocked: false, reason: null }
  }
  return {
    amount: child.cardAmountDue > 0 ? child.cardAmountDue : null,
    blocked: true,
    reason: "card",
  }
}
