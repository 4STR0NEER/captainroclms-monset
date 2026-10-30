// Pure unlock and access rules. No data access here, so it can be checked with plain Node
// (npm run check) and later mirrored in Supabase row-level security.

export const TIERS = ['free', 'taster', 'home', 'member']

// Does owning `ownedTier` give access to content that needs `requiredTier`?
// Free is open to everyone with an account; membership includes everything.
export function tierIncludes(ownedTier, requiredTier) {
  return requiredTier === 'free' || ownedTier === requiredTier || ownedTier === 'member'
}

export function hasAccess(ownedTiers, requiredTier) {
  return requiredTier === 'free' || ownedTiers.some((t) => tierIncludes(t, requiredTier))
}

// Tiers a student owns, from their active enrolments.
export function ownedTiers(enrolments, products) {
  return enrolments
    .filter((e) => e.status === 'active')
    .map((e) => products.find((p) => p.id === e.productId)?.accessTier)
    .filter(Boolean)
}

/**
 * Works out the state of every module and island for one student.
 * progress: [{ lessonId, status }], lessons: all lessons, modules: all modules.
 * Module states: 'locked-tier' (needs a course), 'locked-path' (finish an earlier module first),
 * 'not started', 'in progress', 'complete'.
 */
export function buildMapState({ islands, modules, lessons, progress, owned }) {
  const statusOf = new Map(progress.map((p) => [p.lessonId, p.status]))
  const moduleInfo = new Map()

  for (const m of modules) {
    const ls = lessons.filter((l) => l.moduleId === m.id)
    const done = ls.filter((l) => statusOf.get(l.id) === 'complete').length
    const touched = ls.some((l) => statusOf.has(l.id) && statusOf.get(l.id) !== 'not started')
    moduleInfo.set(m.id, { lessonCount: ls.length, completeCount: done, touched })
  }

  const isComplete = (id) => {
    const info = moduleInfo.get(id)
    return info && info.lessonCount > 0 && info.completeCount === info.lessonCount
  }

  const moduleState = (m) => {
    const info = moduleInfo.get(m.id)
    if (!hasAccess(owned, m.accessTier)) return 'locked-tier'
    if (m.unlockRule?.type === 'completeModule' && !isComplete(m.unlockRule.moduleId)) return 'locked-path'
    if (isComplete(m.id)) return 'complete'
    return info.touched ? 'in progress' : 'not started'
  }

  return islands.map((island) => {
    const ims = modules
      .filter((m) => m.islandId === island.id)
      .sort((a, b) => a.order - b.order)
      .map((m) => ({ ...m, ...moduleInfo.get(m.id), state: moduleState(m) }))
    const lessonCount = ims.reduce((n, m) => n + m.lessonCount, 0)
    const completeCount = ims.reduce((n, m) => n + m.completeCount, 0)

    let state
    if (!ims.length) state = hasAccess(owned, island.accessTier) ? 'open' : 'locked'
    else if (ims.every((m) => m.state.startsWith('locked'))) state = 'locked'
    else if (ims.every((m) => m.state === 'complete')) state = 'complete'
    else if (ims.some((m) => m.state === 'complete' || m.state === 'in progress')) state = 'in progress'
    else state = 'not started'

    return { ...island, modules: ims, lessonCount, completeCount, state }
  })
}
