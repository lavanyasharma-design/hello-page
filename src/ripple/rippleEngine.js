const RADIUS = 80
const MAX_PUSH = 7
const CELL_SIZE = RADIUS

let enabledCache = null

export function isRippleEnabled() {
  if (enabledCache !== null) return enabledCache
  if (typeof window === 'undefined' || !window.matchMedia) {
    enabledCache = false
    return enabledCache
  }
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  enabledCache = hasFinePointer && !reducedMotion
  return enabledCache
}

const letters = new Set()
let grid = new Map()
let mouseX = -Infinity
let mouseY = -Infinity
let rafId = null
let rebuildScheduled = false
const active = new Set()
let started = false

function cellKeyFor(x, y) {
  return `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`
}

function rebuildGrid() {
  rebuildScheduled = false
  grid = new Map()
  for (const letter of letters) {
    const rect = letter.el.getBoundingClientRect()
    letter.x = rect.left + rect.width / 2
    letter.y = rect.top + rect.height / 2
    const key = cellKeyFor(letter.x, letter.y)
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key).push(letter)
  }
}

function scheduleRebuild() {
  if (rebuildScheduled) return
  rebuildScheduled = true
  requestAnimationFrame(rebuildGrid)
}

function resetLetter(letter) {
  letter.el.style.transform = ''
  active.delete(letter)
}

function tick() {
  rafId = null
  const touched = new Set()
  const cx = Math.floor(mouseX / CELL_SIZE)
  const cy = Math.floor(mouseY / CELL_SIZE)

  for (let gx = cx - 1; gx <= cx + 1; gx++) {
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      const bucket = grid.get(`${gx},${gy}`)
      if (!bucket) continue
      for (const letter of bucket) {
        const dx = letter.x - mouseX
        const dy = letter.y - mouseY
        const dist = Math.hypot(dx, dy)
        if (dist < RADIUS && dist > 0.01) {
          const strength = (1 - dist / RADIUS) * MAX_PUSH
          const tx = (dx / dist) * strength
          const ty = (dy / dist) * strength
          letter.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
          active.add(letter)
          touched.add(letter)
        }
      }
    }
  }

  for (const letter of active) {
    if (!touched.has(letter)) resetLetter(letter)
  }
}

function requestTick() {
  if (!rafId) rafId = requestAnimationFrame(tick)
}

function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
  requestTick()
}

function onMouseLeave() {
  mouseX = -Infinity
  mouseY = -Infinity
  for (const letter of Array.from(active)) resetLetter(letter)
}

function onResize() {
  scheduleRebuild()
}

function onScroll() {
  scheduleRebuild()
}

function ensureStarted() {
  if (started) return
  started = true
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseleave', onMouseLeave, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
}

if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.addEventListener('loadingdone', () => scheduleRebuild())
  document.fonts.ready.then(() => scheduleRebuild())
}

export function registerLetters(els) {
  if (!isRippleEnabled() || !els || els.length === 0) return () => {}
  ensureStarted()

  const entries = els.map((el) => ({ el, x: 0, y: 0 }))
  entries.forEach((entry) => letters.add(entry))
  rebuildGrid()

  return () => {
    entries.forEach((entry) => {
      resetLetter(entry)
      letters.delete(entry)
    })
    rebuildGrid()
  }
}
