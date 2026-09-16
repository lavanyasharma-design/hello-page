import { useEffect, useRef } from 'react'

const MAX_DROPS = 18
const DROP_LIFETIME = 1.5
const INTERACTIVE_AMPLITUDE = 0.007
const AMBIENT_AMPLITUDE = 0.002
const INTERACTIVE_MIN_INTERVAL = 0.045
const AMBIENT_INTERVAL = 1.1

// Cycled through for the idle ambient ripple so the corners/edges of the
// photo get their own occasional wave instead of only ever rippling out
// (and fading away) from the center.
const AMBIENT_POINTS = [
  [0.5, 0.5],
  [0.12, 0.12],
  [0.88, 0.15],
  [0.5, 0.9],
  [0.15, 0.85],
  [0.9, 0.9],
  [0.9, 0.5],
  [0.1, 0.5],
]

const VERTEX_SRC = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SRC = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform float uTime;
uniform float uAspect;
uniform vec2 uCoverScale;
uniform float uCoverOffsetX;
uniform vec2 uDropPos[${MAX_DROPS}];
uniform vec2 uDropDir[${MAX_DROPS}];
uniform float uDropStart[${MAX_DROPS}];
uniform float uDropAmp[${MAX_DROPS}];

const float LIFETIME = ${DROP_LIFETIME.toFixed(2)};
const float TIME_DECAY = 3.5;
const float RADIUS = 0.15;

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 displacement = vec2(0.0);
  float weightSum = 0.0;

  for (int i = 0; i < ${MAX_DROPS}; i++) {
    float age = uTime - uDropStart[i];
    if (age < 0.0 || age > LIFETIME) continue;

    vec2 dropP = vec2(uDropPos[i].x * uAspect, uDropPos[i].y);
    float d = distance(p, dropP);
    float envelope = exp(-age * TIME_DECAY) * exp(-(d * d) / (2.0 * RADIUS * RADIUS)) * smoothstep(0.0, 0.04, age);
    float weight = envelope * uDropAmp[i];

    displacement += uDropDir[i] * weight;
    weightSum += weight;
  }

  vec2 distortedUv = vUv + displacement;
  distortedUv = clamp(distortedUv, 0.0, 1.0);
  vec2 texUv = vec2(uCoverOffsetX + distortedUv.x * uCoverScale.x, distortedUv.y * uCoverScale.y);

  vec3 color = texture2D(uImage, texUv).rgb;
  float highlight = clamp(weightSum * 4.0, 0.0, 0.08);
  color += highlight;

  gl_FragColor = vec4(color, 1.0);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(info || 'Shader compile failed')
  }
  return shader
}

function createProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(info || 'Program link failed')
  }
  return program
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasFinePointerHover() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export default function WaterImage({ src, alt, className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl = canvas.getContext('webgl', { alpha: false, premultipliedAlpha: false })
    if (!gl) return undefined

    let program
    try {
      program = createProgram(gl)
    } catch {
      return undefined
    }
    gl.useProgram(program)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)
    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uAspect = gl.getUniformLocation(program, 'uAspect')
    const uCoverScale = gl.getUniformLocation(program, 'uCoverScale')
    const uCoverOffsetX = gl.getUniformLocation(program, 'uCoverOffsetX')
    const uDropPos = gl.getUniformLocation(program, 'uDropPos[0]')
    const uDropDir = gl.getUniformLocation(program, 'uDropDir[0]')
    const uDropStart = gl.getUniformLocation(program, 'uDropStart[0]')
    const uDropAmp = gl.getUniformLocation(program, 'uDropAmp[0]')
    const uImage = gl.getUniformLocation(program, 'uImage')

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([250, 254, 255, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(uImage, 0)

    const dropPositions = new Float32Array(MAX_DROPS * 2)
    const dropDirs = new Float32Array(MAX_DROPS * 2)
    const dropStarts = new Float32Array(MAX_DROPS).fill(-1000)
    const dropAmps = new Float32Array(MAX_DROPS)
    let nextDrop = 0
    let clock = 0
    let lastInteractiveDrop = -1000
    let lastAmbientDrop = -1000
    let ambientIndex = 0

    const addDrop = (x, y, dirX, dirY, amplitude) => {
      const idx = nextDrop
      dropPositions[idx * 2] = x
      dropPositions[idx * 2 + 1] = y
      dropDirs[idx * 2] = dirX
      dropDirs[idx * 2 + 1] = dirY
      dropStarts[idx] = clock
      dropAmps[idx] = amplitude
      nextDrop = (nextDrop + 1) % MAX_DROPS
    }

    let imageAspect = 1
    let imageReady = false
    let disposed = false

    const image = new Image()
    image.onload = () => {
      if (disposed) return
      imageAspect = image.naturalWidth / image.naturalHeight
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      imageReady = true
      updateCover()
    }
    image.src = src

    let coverScaleX = 1
    let coverScaleY = 1
    let coverOffsetX = 0
    let canvasAspect = 1

    const updateCover = () => {
      canvasAspect = canvas.clientWidth / canvas.clientHeight || 1
      if (imageAspect > canvasAspect) {
        coverScaleY = 1
        coverScaleX = canvasAspect / imageAspect
      } else {
        coverScaleX = 1
        coverScaleY = imageAspect / canvasAspect
      }
      coverOffsetX = (1 - coverScaleX) / 2
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      updateCover()
    }
    resize()

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    resizeObserver?.observe(canvas)
    window.addEventListener('resize', resize)

    const toLocalUv = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const y = 1 - (clientY - rect.top) / rect.height
      return [x, y]
    }

    // The displacement direction always follows wherever the pointer is
    // currently heading, so the warp reads as a single push in the
    // cursor's direction of travel rather than a ring spreading around it.
    let lastDirX = 1
    let lastDirY = 0
    const directionFrom = (dx, dy) => {
      const len = Math.hypot(dx, dy)
      if (len < 0.001) return [lastDirX, lastDirY]
      lastDirX = dx / len
      lastDirY = dy / len
      return [lastDirX, lastDirY]
    }

    const interactive = hasFinePointerHover()
    let lastPointerX = null
    let lastPointerY = null

    const onPointerMove = (e) => {
      if (clock - lastInteractiveDrop < INTERACTIVE_MIN_INTERVAL) return
      lastInteractiveDrop = clock
      const [x, y] = toLocalUv(e.clientX, e.clientY)
      const [dirX, dirY] =
        lastPointerX === null ? [lastDirX, lastDirY] : directionFrom(x - lastPointerX, y - lastPointerY)
      lastPointerX = x
      lastPointerY = y
      addDrop(x, y, dirX, dirY, INTERACTIVE_AMPLITUDE)
    }

    let lastTouchX = null
    let lastTouchY = null

    const onTouch = (e) => {
      if (clock - lastInteractiveDrop < INTERACTIVE_MIN_INTERVAL) return
      lastInteractiveDrop = clock
      const touch = e.touches[0]
      if (!touch) return
      const [x, y] = toLocalUv(touch.clientX, touch.clientY)
      const [dirX, dirY] = lastTouchX === null ? [lastDirX, lastDirY] : directionFrom(x - lastTouchX, y - lastTouchY)
      lastTouchX = x
      lastTouchY = y
      addDrop(x, y, dirX, dirY, INTERACTIVE_AMPLITUDE)
    }

    const onPointerLeave = () => {
      lastPointerX = null
      lastPointerY = null
    }

    const onTouchEnd = () => {
      lastTouchX = null
      lastTouchY = null
    }

    if (interactive) {
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerleave', onPointerLeave)
    }
    canvas.addEventListener('touchstart', onTouch, { passive: true })
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: true })

    let rafId = null
    let lastFrameTime = performance.now()

    const frame = (now) => {
      rafId = requestAnimationFrame(frame)
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05)
      lastFrameTime = now
      clock += dt

      if (clock - lastAmbientDrop > AMBIENT_INTERVAL) {
        lastAmbientDrop = clock
        const [ax, ay] = AMBIENT_POINTS[ambientIndex % AMBIENT_POINTS.length]
        ambientIndex += 1
        const jitterX = (Math.random() - 0.5) * 0.08
        const jitterY = (Math.random() - 0.5) * 0.08
        const angle = clock * 0.3
        addDrop(ax + jitterX, ay + jitterY, Math.cos(angle), Math.sin(angle), AMBIENT_AMPLITUDE)
      }

      if (!imageReady) return

      gl.uniform1f(uTime, clock)
      gl.uniform1f(uAspect, canvasAspect)
      gl.uniform2f(uCoverScale, coverScaleX, coverScaleY)
      gl.uniform1f(uCoverOffsetX, coverOffsetX)
      gl.uniform2fv(uDropPos, dropPositions)
      gl.uniform2fv(uDropDir, dropDirs)
      gl.uniform1fv(uDropStart, dropStarts)
      gl.uniform1fv(uDropAmp, dropAmps)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [src])

  if (prefersReducedMotion()) {
    return <img src={src} alt={alt} className={`${className} object-cover object-bottom`} />
  }

  return <canvas ref={canvasRef} role="img" aria-label={alt} className={className} />
}
