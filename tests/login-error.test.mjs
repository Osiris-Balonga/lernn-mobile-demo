import assert from "node:assert/strict"
import test from "node:test"

import { getCredentialLoginErrorMessage } from "../src/lib/login-error.ts"

const translatedCredentialError =
  "Connexion impossible. Verifiez vos identifiants."

test("maps the stable UNAUTHORIZED problem code to the credential error", () => {
  assert.equal(
    getCredentialLoginErrorMessage(
      {
        code: "UNAUTHORIZED",
        detail: "Veuillez vous authentifier pour continuer.",
        status: 401,
      },
      translatedCredentialError
    ),
    translatedCredentialError
  )
})

test("maps every 401 response to the product-owned credential message", () => {
  assert.equal(
    getCredentialLoginErrorMessage(
      {
        code: "AUTHENTICATION_REQUIRED",
        detail: "Authentification requise",
        status: 401,
      },
      translatedCredentialError
    ),
    translatedCredentialError
  )
})

test("never renders non-credential API diagnostics", () => {
  assert.equal(
    getCredentialLoginErrorMessage(
      {
        code: "RATE_LIMITED",
        detail: "Veuillez patienter avant de reessayer.",
        status: 429,
      },
      translatedCredentialError
    ),
    translatedCredentialError
  )
})

test("uses the safe credential message for unknown client failures", () => {
  assert.equal(
    getCredentialLoginErrorMessage(
      new Error("Authentication required"),
      translatedCredentialError
    ),
    translatedCredentialError
  )
})
