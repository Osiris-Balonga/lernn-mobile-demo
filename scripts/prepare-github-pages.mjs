import { access, copyFile, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const repositoryBase = "/lernn-mobile-demo/"
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const distDirectory = path.join(projectRoot, "dist")
const indexPath = path.join(distDirectory, "index.html")
const fallbackPath = path.join(distDirectory, "404.html")
const noJekyllPath = path.join(distDirectory, ".nojekyll")
const checkOnly = process.argv.includes("--check")

async function validateArtifact() {
  await Promise.all([
    access(indexPath),
    access(fallbackPath),
    access(noJekyllPath),
  ])

  const [indexHtml, fallbackHtml] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(fallbackPath, "utf8"),
  ])

  if (!indexHtml.includes(repositoryBase)) {
    throw new Error(
      `Le build n'utilise pas la base GitHub Pages ${repositoryBase}.`
    )
  }

  const rootResourceUrls = [
    ...indexHtml.matchAll(/\b(?:href|src)="(\/[^"]+)"/g),
  ].map(([, url]) => url)
  const invalidResourceUrls = rootResourceUrls.filter(
    (url) => !url.startsWith(repositoryBase)
  )

  if (invalidResourceUrls.length > 0) {
    throw new Error(
      `Ressources incompatibles avec GitHub Pages : ${invalidResourceUrls.join(", ")}`
    )
  }

  if (fallbackHtml !== indexHtml) {
    throw new Error("dist/404.html doit être identique à dist/index.html.")
  }
}

if (!checkOnly) {
  await access(indexPath)
  await Promise.all([
    copyFile(indexPath, fallbackPath),
    writeFile(noJekyllPath, "", "utf8"),
  ])
}

await validateArtifact()
console.log(
  checkOnly
    ? "Artefact GitHub Pages valide."
    : "Artefact GitHub Pages préparé et validé."
)
