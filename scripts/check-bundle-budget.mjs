import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const maxEntryChunkKb = Number(process.env.MAX_ENTRY_CHUNK_KB ?? 700)
const assetsDir = join(process.cwd(), 'dist', 'assets')

const files = await readdir(assetsDir)
const entryChunks = files.filter((file) => /^index-[\w-]+\.js$/.test(file))

if (entryChunks.length === 0) {
  throw new Error('Bundle budget check failed: no index-*.js entry chunk found.')
}

let largestEntry = { file: '', sizeKb: 0 }
for (const file of entryChunks) {
  const sizeKb = (await stat(join(assetsDir, file))).size / 1024
  if (sizeKb > largestEntry.sizeKb) largestEntry = { file, sizeKb }
}

if (largestEntry.sizeKb > maxEntryChunkKb) {
  throw new Error(
    `Bundle budget exceeded: ${largestEntry.file} is ${largestEntry.sizeKb.toFixed(
      1,
    )} KiB, max is ${maxEntryChunkKb} KiB.`,
  )
}

console.log(
  `Bundle budget ok: ${largestEntry.file} is ${largestEntry.sizeKb.toFixed(
    1,
  )} KiB (max ${maxEntryChunkKb} KiB).`,
)
