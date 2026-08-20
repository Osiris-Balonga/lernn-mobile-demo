import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const outputDirectory = path.join(projectRoot, "public", "teacher-photos")

const teachers = [
  ["alain-boukaka", "men", 5],
  ["armand-bakala", "men", 16],
  ["cedric-mouanda", "men", 30],
  ["junior-mpassi", "men", 38],
  ["lucien-moukoko", "men", 49],
  ["patrick-loufoua", "men", 53],
  ["serge-kimbembe", "men", 54],
  ["chantal-nkoua", "women", 13],
  ["estelle-ngoma", "women", 16],
  ["esther-mavoungou", "women", 24],
  ["grace-mayembo", "women", 30],
  ["marie-okemba", "women", 36],
  ["nadine-mvouama", "women", 62],
  ["pauline-kodia", "women", 69],
]

await mkdir(outputDirectory, { recursive: true })

await Promise.all(
  teachers.map(async ([slug, gender, portraitIndex]) => {
    const portraitUrl = `https://randomuser.me/api/portraits/${gender}/${portraitIndex}.jpg`
    const portraitResponse = await fetch(portraitUrl)
    if (!portraitResponse.ok) {
      throw new Error(`Téléchargement impossible pour ${slug}`)
    }

    await writeFile(
      path.join(outputDirectory, `${slug}.jpg`),
      Buffer.from(await portraitResponse.arrayBuffer())
    )
  })
)

console.log(`Avatars enseignants synchronisés dans ${outputDirectory}`)
