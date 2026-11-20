import type { PlayableCase, Scene } from '../content/schema'

export interface StageProgress {
  chosen: string[]
  revealed: boolean
}

export interface Session {
  position: 'intro' | number | 'ceremony'
  progress: Partial<Record<string, StageProgress>>
  openedDocuments: string[]
  approved: boolean
}

export type Action =
  | { type: 'advance' | 'back' | 'reveal' | 'approve' | 'restart' | 'resetStage' }
  | { type: 'select' | 'openDocument'; id: string }

export const initialProgress: StageProgress = { chosen: [], revealed: false }
export const enabledScenes = (profile: PlayableCase) => profile.scenes.filter(scene => scene.enabled)
export const createSession = (): Session => ({ position: 'intro', progress: {}, openedDocuments: [], approved: false })

export function currentScene(profile: PlayableCase, session: Session): Scene | undefined {
  return typeof session.position === 'number' ? enabledScenes(profile)[session.position] : undefined
}

export function choices(scene: Scene): string[] {
  switch (scene.type) {
    case 'facts': return scene.factIds
    case 'incident': return scene.options.map(item => item.id)
    case 'witness': return scene.evidenceIds
    case 'discussion':
    case 'verdict': return []
  }
}

export function canReveal(scene: Scene, progress: StageProgress) {
  if (progress.revealed || scene.type === 'verdict') return false
  if (scene.type === 'discussion') return true
  return progress.chosen.length === (scene.type === 'witness' ? 2 : 1)
}

export function reduceRound(profile: PlayableCase, session: Session, action: Action): Session {
  const { position } = session
  const scene = currentScene(profile, session)
  const progress = (scene && session.progress[scene.id]) ?? initialProgress
  const updateProgress = (next: StageProgress) => scene
    ? { ...session, progress: { ...session.progress, [scene.id]: next } }
    : session

  switch (action.type) {
    case 'restart': return createSession()
    case 'resetStage': {
      if (!scene) return session
      const next = { ...session.progress }
      delete next[scene.id]
      return { ...session, progress: next, approved: false }
    }
    case 'advance': {
      if (position === 'intro') return { ...session, position: 0 }
      if (typeof position !== 'number' || !scene || (!progress.revealed && scene.type !== 'verdict')) return session
      const next = position + 1
      return { ...session, position: next < enabledScenes(profile).length ? next : 'ceremony' }
    }
    case 'back': {
      if (position === 'intro') return session
      if (position === 'ceremony') return { ...session, position: enabledScenes(profile).length - 1 }
      return { ...session, position: position === 0 ? 'intro' : position - 1 }
    }
    case 'approve':
      return position === 'ceremony' && !session.approved ? { ...session, approved: true } : session
    case 'reveal':
      return scene && canReveal(scene, progress) ? updateProgress({ ...progress, revealed: true }) : session
    case 'openDocument':
      if (!scene?.documentIds.includes(action.id) || session.openedDocuments.includes(action.id)) return session
      return { ...session, openedDocuments: [...session.openedDocuments, action.id] }
    case 'select': {
      if (!scene || progress.revealed || !choices(scene).includes(action.id)) return session
      if (scene.type !== 'witness') return updateProgress({ ...progress, chosen: [action.id] })
      if (progress.chosen.includes(action.id)) {
        return updateProgress({ ...progress, chosen: progress.chosen.filter(id => id !== action.id) })
      }
      return progress.chosen.length === 2 ? session : updateProgress({ ...progress, chosen: [...progress.chosen, action.id] })
    }
  }
}
