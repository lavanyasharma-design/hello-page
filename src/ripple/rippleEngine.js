const RADIUS = 80
const MAX_PUSH = 7
const CELL_SIZE = RADIUS

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasFinePointerHover() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

let enabledCache = null

// Desktop-only gate: fine pointer + hover capability, no reduced motion.
// Used by effects that are still mouse-move driven (e.g. DitherReveal).
export function isRippleEnabled() {
  if (enabledCache !== null) return enabledCache
  if (typeof window === 'undefined' || !window.matchMedia) {
    enabledCache = false
    return enabledCache
  }
  enabledCache = hasFinePointerHover() && !prefersReducedMotion()
  return enabledCache
}

let splittingCache = null

// Device-agnostic gate: only reduced motion disables it. Drives whether
// RippleText splits into letters (both desktop hover-ripple and touch drag-ripple).
export function isSplittingEnabled() {
  if (splittingCache !== null) return splittingCache
  if (typeof window === 'undefined' || !window.matchMedia) {
    splittingCache = false
    return splittingCache
  }
  splittingCache = !prefersReducedMotion()
  return splittingCache
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

// Scroll shifts every letter by the same delta, so re-derive cached positions
// with plain arithmetic instead of forcing a getBoundingClientRect() layout
// read per letter on every scroll frame (that read-during-scroll is what was
// stalling touch scrolling on mobile).
let lastScrollX = 0
let lastScrollY = 0
let scrollShiftScheduled = false
let pendingDX = 0
let pendingDY = 0

function applyScrollShift() {
  scrollShiftScheduled = false
  const dx = pendingDX
  const dy = pendingDY
  pendingDX = 0
  pendingDY = 0
  if (dx === 0 && dy === 0) return
  grid = new Map()
  for (const letter of letters) {
    letter.x -= dx
    letter.y -= dy
    const key = cellKeyFor(letter.x, letter.y)
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key).push(letter)
  }
}

function scheduleScrollShift() {
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  pendingDX += scrollX - lastScrollX
  pendingDY += scrollY - lastScrollY
  lastScrollX = scrollX
  lastScrollY = scrollY
  if (scrollShiftScheduled) return
  scrollShiftScheduled = true
  requestAnimationFrame(applyScrollShift)
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

// Touch/pen: pointerdown seeds the ripple at the initial contact point (so a
// plain tap still produces a pulse), pointermove keeps it following the
// finger while dragging — same tick()/radius/strength as the desktop path.
function onTouchPointerActive(e) {
  if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return
  mouseX = e.clientX
  mouseY = e.clientY
  requestTick()
}

function onTouchPointerEnd(e) {
  if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return
  onMouseLeave()
}

function onResize() {
  scheduleRebuild()
}

function onScroll() {
  scheduleScrollShift()
}

function ensureStarted() {
  if (started) return
  started = true
  lastScrollX = window.scrollX
  lastScrollY = window.scrollY
  if (hasFinePointerHover()) {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave, { passive: true })
  }
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointerdown', onTouchPointerActive, { passive: true })
  window.addEventListener('pointermove', onTouchPointerActive, { passive: true })
  window.addEventListener('pointerup', onTouchPointerEnd, { passive: true })
  window.addEventListener('pointercancel', onTouchPointerEnd, { passive: true })
}

if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.addEventListener('loadingdone', () => scheduleRebuild())
  document.fonts.ready.then(() => scheduleRebuild())
}

export function registerLetters(els) {
  if (!isSplittingEnabled() || !els || els.length === 0) return () => {}
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
