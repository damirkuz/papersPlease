import { existsSync, readdirSync } from 'node:fs'
import { manifest } from '../src/content/manifest'
import { parseCases } from '../src/content/schema'

try {
  const files = readdirSync(new URL('../src/content/characters/', import.meta.url))
    .filter(file => file.endsWith('.json'))
  for (const file of files) {
    if (!(file in manifest)) throw new Error(`${file}: добавьте файл в src/content/manifest.ts`)
  }
  const profiles = parseCases(manifest)
  for (const profile of profiles) {
    if (profile.status === 'placeholder') continue
    const images = new Set([
      profile.portrait, profile.award.image, ...profile.documents.map(item => item.image),
      ...profile.scenes.map(item => 'route' in item ? item.route?.image : undefined),
    ])
    for (const path of images) {
      if (path && !existsSync(new URL(`../public/${path}`, import.meta.url))) {
        console.warn(`• ${profile.displayName}: ${path} отсутствует, будет использована заглушка`)
      }
    }
  }
  console.log(`Проверено дел: ${profiles.length}.`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
