interface LoginApiProblem {
  code: string
  status: number
}

function isLoginApiProblem(error: unknown): error is LoginApiProblem {
  if (typeof error !== "object" || error === null) return false

  const problem = error as Record<string, unknown>
  return typeof problem.code === "string" && typeof problem.status === "number"
}

function isCredentialRejection(error: unknown) {
  return (
    isLoginApiProblem(error) &&
    (error.code === "UNAUTHORIZED" || error.status === 401)
  )
}

/**
 * Login errors are always rendered from product-owned client copy. The API
 * response remains useful for control flow and diagnostics, never as UI text.
 */
export function getCredentialLoginErrorMessage(
  error: unknown,
  invalidCredentialsMessage: string
) {
  if (!isLoginApiProblem(error)) return invalidCredentialsMessage
  if (isCredentialRejection(error)) return invalidCredentialsMessage
  return invalidCredentialsMessage
}
