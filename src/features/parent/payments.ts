import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { normalizeParentChild } from "./dashboard"

import type { ApiParentChildSummary } from "./dashboard"
import type { ParentChildSummary } from "./types"

export type FeeType = "REGISTRATION" | "TUITION" | "CARD" | "OTHER"
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER"
export type InstallmentStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL"

export interface BreakdownInstallment {
  id: string
  sequence: number
  dueDate: string
  amount: number
  paidAmount: number
  remainingAmount: number
  status: InstallmentStatus
}

export interface StudentBalanceDetail {
  enrollmentId: string
  studentName: string
  totalFees: number
  totalPaid: number
  balance: number
  breakdown: Array<{
    feeType: FeeType
    feeLabel: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    installments: BreakdownInstallment[]
  }>
}

export interface PaymentListItem {
  id: string
  amount: number
  method: PaymentMethod
  reference: string | null
  enrollmentId: string
  schoolId: string
  receivedById: string
  receipt: { id: string; code: string } | null
  allocations: Array<{
    id: string
    chargeInstallmentId: string
    amount: number
    feeLabel: string
  }>
  createdAt: string
  enrollment?: {
    person: {
      id: string
      firstName: string
      lastName: string
      photoUrl: string | null
    }
    classGroup: {
      id: string
      name: string
      code: string
    } | null
  }
}

export interface ParentPaymentChild {
  child: ParentChildSummary
  balance: StudentBalanceDetail
  payments: PaymentListItem[]
  paymentHistoryAvailable: boolean
  tuitionBalance: number
  tuitionPaid: number
  tuitionTotalFees: number
}

export interface ParentPaymentsSummary {
  children: ParentPaymentChild[]
  totalFees: number
  totalPaid: number
  totalBalance: number
  tuitionBalance: number
  tuitionPaid: number
  tuitionTotalFees: number
  payments: PaymentListItem[]
  paymentHistoryAvailable: boolean
}

interface ApiPaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    timestamp: string
  }
}

export const parentPaymentsSummaryQueryOptions = (
  schoolId: string,
  schoolYearId?: string
) =>
  queryOptions({
    queryKey: ["parent", "payments", schoolId, schoolYearId ?? "current"],
    queryFn: async () => {
      const dashboard = await apiClient
        .get<{
          data: {
            children: ApiParentChildSummary[]
            familyTotalBalance: number
          }
        }>(`/schools/${schoolId}/dashboards/parent`, {
          params: schoolYearId ? { schoolYearId } : undefined,
        })
        .then((response) => ({
          ...response.data,
          children: response.data.children.map(normalizeParentChild),
        }))

      const children = await Promise.all(
        dashboard.children
          .filter((child) => child.enrollmentId)
          .map(async (child) => {
            const balance = await apiClient
              .get<{
                data: StudentBalanceDetail
              }>(
                `/schools/${schoolId}/payments/balance/student-enrollments/${child.enrollmentId}`,
                { params: schoolYearId ? { schoolYearId } : undefined }
              )
              .then((response) => response.data)

            return {
              child,
              balance,
              payments: [],
              paymentHistoryAvailable: false,
              ...getTuitionBalanceTotals(balance),
            }
          })
      )

      const history = await apiClient
        .get<ApiPaginatedResponse<PaymentListItem>>(
          `/schools/${schoolId}/payments/parent/history`,
          {
            params: {
              page: 1,
              pageSize: 50,
              ...(schoolYearId ? { schoolYearId } : {}),
            },
          }
        )
        .catch(() => null)

      const payments = history?.data ?? []
      const paymentsByEnrollment = new Map<string, PaymentListItem[]>()
      for (const payment of payments) {
        const items = paymentsByEnrollment.get(payment.enrollmentId) ?? []
        items.push(payment)
        paymentsByEnrollment.set(payment.enrollmentId, items)
      }

      const childrenWithPayments = children.map((entry) => ({
        ...entry,
        payments: paymentsByEnrollment.get(entry.child.enrollmentId) ?? [],
        paymentHistoryAvailable: Boolean(history),
      }))

      return {
        children: childrenWithPayments,
        totalFees: childrenWithPayments.reduce(
          (sum, entry) => sum + entry.balance.totalFees,
          0
        ),
        totalPaid: childrenWithPayments.reduce(
          (sum, entry) => sum + entry.balance.totalPaid,
          0
        ),
        totalBalance: childrenWithPayments.reduce(
          (sum, entry) => sum + entry.balance.balance,
          0
        ),
        tuitionBalance: childrenWithPayments.reduce(
          (sum, entry) => sum + entry.tuitionBalance,
          0
        ),
        tuitionPaid: childrenWithPayments.reduce(
          (sum, entry) => sum + entry.tuitionPaid,
          0
        ),
        tuitionTotalFees: childrenWithPayments.reduce(
          (sum, entry) => sum + entry.tuitionTotalFees,
          0
        ),
        payments,
        paymentHistoryAvailable: Boolean(history),
      } satisfies ParentPaymentsSummary
    },
    staleTime: 60_000,
  })

export function getTuitionBalanceTotals(balance: StudentBalanceDetail) {
  const tuitionLines = balance.breakdown.filter(
    (line) => line.feeType === "TUITION"
  )

  return {
    tuitionBalance: tuitionLines.reduce(
      (sum, line) => sum + line.remainingAmount,
      0
    ),
    tuitionPaid: tuitionLines.reduce((sum, line) => sum + line.paidAmount, 0),
    tuitionTotalFees: tuitionLines.reduce(
      (sum, line) => sum + line.totalAmount,
      0
    ),
  }
}
