import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

const appSource = readFileSync(
  new URL("../src/App.tsx", import.meta.url),
  "utf8"
)
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)

test("keeps report cards and receipts informational in mobile workspaces", () => {
  assert.doesNotMatch(appSource, /ReportCardPreviewDrawer/)
  assert.doesNotMatch(appSource, /ReceiptPreviewDrawer/)
  assert.doesNotMatch(appSource, /fetch(?:Child|Student)ReportCardPdf/)
  assert.doesNotMatch(appSource, /fetchReceiptHtml/)
})

test("does not ship the retired client-side PDF stack", () => {
  assert.equal(packageJson.dependencies["html2canvas-pro"], undefined)
  assert.equal(packageJson.dependencies["pdf-lib"], undefined)
  assert.equal(packageJson.dependencies["pdfjs-dist"], undefined)
  assert.equal(
    existsSync(new URL("../src/lib/pdf-utils.ts", import.meta.url)),
    false
  )
  assert.equal(
    existsSync(new URL("../src/lib/receipt-pdf.ts", import.meta.url)),
    false
  )
})
