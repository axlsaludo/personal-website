<template>
  <div class="obsidian-container" ref="containerEl">
    <!-- Graph HUD Header -->
    <div class="graph-header">
      <div class="graph-meta">
        <span class="graph-tag">// KNOWLEDGE GRAPH</span>
        <h3 class="graph-title">Skill Architecture</h3>
      </div>
      <div class="graph-badges">
        <span class="badge-count">{{ nodes.length }} NODES</span>
        <span class="badge-count">{{ edges.length }} CONNECTIONS</span>
        <button class="reset-btn" @click="resetSimulation" title="Reset layout">
          <span>↺</span> Reset
        </button>
      </div>
    </div>

    <!-- Filter Group Pills -->
    <div class="filter-pills">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="filter-pill"
        :class="{ active: activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <span class="dot" :style="{ background: cat.color }"></span>
        {{ cat.label }}
      </button>
    </div>

    <!-- Canvas viewport -->
    <div class="canvas-wrap">
      <canvas
        ref="canvasEl"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      ></canvas>

      <div class="graph-hint">
        <span>Click &amp; drag nodes to explore relationships</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerEl = ref(null)
const canvasEl = ref(null)

const categories = [
  { id: 'all', label: 'All Domains', color: '#ffffff' },
  { id: 'cloud', label: 'Cloud Architecture', color: '#60a5fa' },
  { id: 'ai', label: 'AI & Agents', color: '#c084fc' },
  { id: 'devops', label: 'DevOps & Containers', color: '#4ade80' },
  { id: 'net', label: 'Networking & Security', color: '#f59e0b' }
]

const activeCategory = ref('all')

const selectCategory = (id) => {
  activeCategory.value = id
  wakeSimulation()
}

// ── Graph Data Definition ──────────────────────────
const initialNodes = [
  // Hubs
  { id: 'cloud-hub', label: 'Cloud Infrastructure', cat: 'cloud', r: 12, isHub: true },
  { id: 'ai-hub', label: 'Generative AI & Agents', cat: 'ai', r: 12, isHub: true },
  { id: 'devops-hub', label: 'DevOps & Systems', cat: 'devops', r: 12, isHub: true },
  { id: 'net-hub', label: 'Networking & Core', cat: 'net', r: 11, isHub: true },

  // Cloud Nodes
  { id: 'gcp', label: 'Google Cloud (GCP)', cat: 'cloud', r: 9 },
  { id: 'terraform', label: 'Terraform & IaC', cat: 'cloud', r: 7 },
  { id: 'arch', label: 'Cloud Architecture', cat: 'cloud', r: 7 },
  { id: 'cdl', label: 'Cloud Digital Leader', cat: 'cloud', r: 6 },

  // AI Nodes
  { id: 'gemini', label: 'Gemini Enterprise', cat: 'ai', r: 9 },
  { id: 'agents', label: 'AI Agent Systems', cat: 'ai', r: 8 },
  { id: 'genai-lead', label: 'Generative AI Leader', cat: 'ai', r: 7 },
  { id: 'python', label: 'Python & Tooling', cat: 'ai', r: 7 },

  // DevOps Nodes
  { id: 'k8s', label: 'Kubernetes (GKE)', cat: 'devops', r: 9 },
  { id: 'docker', label: 'Docker Containers', cat: 'devops', r: 7 },
  { id: 'cicd', label: 'CI/CD Automation', cat: 'devops', r: 7 },
  { id: 'linux', label: 'Linux & Shell', cat: 'devops', r: 6 },

  // Networking Nodes
  { id: 'ccna', label: 'CCNA Routing/Switching', cat: 'net', r: 8 },
  { id: 'vpc', label: 'VPC & Hybrid Mesh', cat: 'net', r: 7 },
  { id: 'security', label: 'Cloud IAM & Security', cat: 'net', r: 7 }
]

const edges = [
  // Cloud Hub links
  { source: 'cloud-hub', target: 'gcp' },
  { source: 'cloud-hub', target: 'terraform' },
  { source: 'cloud-hub', target: 'arch' },
  { source: 'cloud-hub', target: 'cdl' },
  { source: 'cloud-hub', target: 'security' },

  // AI Hub links
  { source: 'ai-hub', target: 'gemini' },
  { source: 'ai-hub', target: 'agents' },
  { source: 'ai-hub', target: 'genai-lead' },
  { source: 'ai-hub', target: 'python' },

  // DevOps Hub links
  { source: 'devops-hub', target: 'k8s' },
  { source: 'devops-hub', target: 'docker' },
  { source: 'devops-hub', target: 'cicd' },
  { source: 'devops-hub', target: 'linux' },

  // Net Hub links
  { source: 'net-hub', target: 'ccna' },
  { source: 'net-hub', target: 'vpc' },
  { source: 'net-hub', target: 'security' },

  // Cross-domain interconnections (Obsidian knowledge web)
  { source: 'gcp', target: 'k8s' },
  { source: 'k8s', target: 'docker' },
  { source: 'docker', target: 'cicd' },
  { source: 'gemini', target: 'agents' },
  { source: 'agents', target: 'python' },
  { source: 'gcp', target: 'vpc' },
  { source: 'vpc', target: 'ccna' },
  { source: 'terraform', target: 'gcp' },
  { source: 'genai-lead', target: 'cdl' },
  { source: 'cloud-hub', target: 'devops-hub' },
  { source: 'cloud-hub', target: 'ai-hub' }
]

// ── Physics State ───────────────────────────────────
let nodes = []
let animFrameId = null
let draggedNode = null
let hoveredNode = null
let width = 0
let height = 0
let isRunning = true
let idleCounter = 0

const getCategoryColor = (cat) => {
  switch (cat) {
    case 'cloud': return '#60a5fa'
    case 'ai': return '#c084fc'
    case 'devops': return '#4ade80'
    case 'net': return '#f59e0b'
    default: return '#e4e4e7'
  }
}

const wakeSimulation = () => {
  idleCounter = 0
  if (!isRunning) {
    isRunning = true
    loop()
  }
}

const initPositions = () => {
  if (!width || !height) return
  const cx = width / 2
  const cy = height / 2

  nodes = initialNodes.map((n, i) => {
    // Arrange in loose clusters
    let angle = (i / initialNodes.length) * Math.PI * 2
    let dist = n.isHub ? Math.min(width, height) * 0.22 : Math.min(width, height) * 0.38
    dist += (Math.random() - 0.5) * 40

    return {
      ...n,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: getCategoryColor(n.cat)
    }
  })
  wakeSimulation()
}

const resetSimulation = () => {
  initPositions()
}

// ── Force-Directed Physics Step ────────────────────
const stepPhysics = () => {
  const cx = width / 2
  const cy = height / 2

  let maxVelocity = 0

  // 1. Center gravity & boundary soft bounce
  for (const n of nodes) {
    if (n === draggedNode) continue
    const dx = cx - n.x
    const dy = cy - n.y
    n.vx += dx * 0.0004
    n.vy += dy * 0.0004
  }

  // 2. Coulomb node-node repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i]
      const n2 = nodes[j]
      const dx = n2.x - n1.x
      const dy = n2.y - n1.y
      const distSq = dx * dx + dy * dy + 100
      const dist = Math.sqrt(distSq)

      const force = (n1.r * n2.r * 180) / distSq
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      if (n1 !== draggedNode) {
        n1.vx -= fx
        n1.vy -= fy
      }
      if (n2 !== draggedNode) {
        n2.vx += fx
        n2.vy += fy
      }
    }
  }

  // 3. Hooke's spring force along edges
  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source)
    const t = nodes.find(n => n.id === e.target)
    if (!s || !t) continue

    const dx = t.x - s.x
    const dy = t.y - s.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const targetDist = (s.isHub || t.isHub) ? 75 : 90
    const springForce = (dist - targetDist) * 0.012

    const fx = (dx / dist) * springForce
    const fy = (dy / dist) * springForce

    if (s !== draggedNode) {
      s.vx += fx
      s.vy += fy
    }
    if (t !== draggedNode) {
      t.vx -= fx
      t.vy -= fy
    }
  }

  // 4. Update positions with damping
  const damping = 0.88
  for (const n of nodes) {
    if (n === draggedNode) continue
    n.vx *= damping
    n.vy *= damping
    n.x += n.vx
    n.y += n.vy

    // Keep comfortably inside canvas
    const pad = n.r + 20
    if (n.x < pad) { n.x = pad; n.vx *= -0.5 }
    if (n.x > width - pad) { n.x = width - pad; n.vx *= -0.5 }
    if (n.y < pad) { n.y = pad; n.vy *= -0.5 }
    if (n.y > height - pad) { n.y = height - pad; n.vy *= -0.5 }

    const speed = Math.abs(n.vx) + Math.abs(n.vy)
    if (speed > maxVelocity) maxVelocity = speed
  }

  // If movements settle, let simulation sleep to save CPU
  if (maxVelocity < 0.03 && !draggedNode) {
    idleCounter++
    if (idleCounter > 120) {
      isRunning = false
    }
  } else {
    idleCounter = 0
  }
}

// ── Render Frame ───────────────────────────────────
const render = () => {
  if (!canvasEl.value) return
  const ctx = canvasEl.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  const active = activeCategory.value
  const hasFilter = active !== 'all'

  // Connected nodes set when hovering
  const connectedIds = new Set()
  if (hoveredNode) {
    connectedIds.add(hoveredNode.id)
    edges.forEach(e => {
      if (e.source === hoveredNode.id) connectedIds.add(e.target)
      if (e.target === hoveredNode.id) connectedIds.add(e.source)
    })
  }

  // 1. Draw Edges
  for (const e of edges) {
    const s = nodes.find(n => n.id === e.source)
    const t = nodes.find(n => n.id === e.target)
    if (!s || !t) continue

    const isConnected = hoveredNode && (
      (e.source === hoveredNode.id && connectedIds.has(e.target)) ||
      (e.target === hoveredNode.id && connectedIds.has(e.source))
    )

    const matchesFilter = !hasFilter || (s.cat === active || t.cat === active)

    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(t.x, t.y)

    if (isConnected) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.4
      ctx.globalAlpha = 0.8
    } else if (hasFilter && !matchesFilter) {
      ctx.strokeStyle = '#27272a'
      ctx.lineWidth = 0.6
      ctx.globalAlpha = 0.1
    } else if (hoveredNode) {
      ctx.strokeStyle = '#27272a'
      ctx.lineWidth = 0.6
      ctx.globalAlpha = 0.15
    } else {
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 0.8
      ctx.globalAlpha = 0.35
    }

    ctx.stroke()
  }

  // 2. Draw Nodes
  for (const n of nodes) {
    const isHovered = hoveredNode && hoveredNode.id === n.id
    const isNeighbor = hoveredNode && connectedIds.has(n.id)
    const matchesFilter = !hasFilter || n.cat === active

    let nodeAlpha = 1.0
    if (hoveredNode && !isHovered && !isNeighbor) {
      nodeAlpha = 0.18
    } else if (hasFilter && !matchesFilter) {
      nodeAlpha = 0.22
    }

    ctx.save()
    ctx.globalAlpha = nodeAlpha

    // Outer glow ring
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r + (isHovered ? 8 : 4), 0, Math.PI * 2)
    ctx.fillStyle = n.color
    ctx.globalAlpha = isHovered ? 0.35 : nodeAlpha * 0.12
    ctx.fill()

    // Main Node circle
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fillStyle = isHovered ? '#ffffff' : n.color
    ctx.globalAlpha = nodeAlpha
    ctx.fill()

    // Node outline
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Label
    const showLabel = isHovered || isNeighbor || n.isHub || (!hoveredNode && (n.r >= 8 || width > 600))
    if (showLabel) {
      ctx.font = n.isHub ? '600 11px Inter, sans-serif' : '400 10.5px Inter, sans-serif'
      ctx.fillStyle = isHovered ? '#ffffff' : (n.isHub ? '#e4e4e7' : '#a1a1aa')
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = isHovered ? 1.0 : (isNeighbor ? 0.9 : nodeAlpha * 0.85)

      // Slight label background badge for legibility
      const text = n.label
      const textWidth = ctx.measureText(text).width
      const textX = n.x + n.r + 6
      const textY = n.y

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
      ctx.fillRect(textX - 2, textY - 7, textWidth + 4, 14)

      ctx.fillStyle = isHovered ? '#ffffff' : (n.isHub ? '#f4f4f5' : '#d4d4d8')
      ctx.fillText(text, textX, textY)
    }

    ctx.restore()
  }
}

const loop = () => {
  if (!isRunning) return
  stepPhysics()
  render()
  animFrameId = requestAnimationFrame(loop)
}

// ── Interactive Events ─────────────────────────────
const findNodeAt = (clientX, clientY) => {
  if (!canvasEl.value) return null
  const rect = canvasEl.value.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top

  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    const dx = n.x - x
    const dy = n.y - y
    const hitRadius = Math.max(n.r + 8, 18)
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      return n
    }
  }
  return null
}

const onMouseDown = (e) => {
  const n = findNodeAt(e.clientX, e.clientY)
  if (n) {
    draggedNode = n
    wakeSimulation()
  }
}

const onMouseMove = (e) => {
  const rect = canvasEl.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  if (draggedNode) {
    draggedNode.x = mouseX
    draggedNode.y = mouseY
    draggedNode.vx = 0
    draggedNode.vy = 0
    wakeSimulation()
  } else {
    const n = findNodeAt(e.clientX, e.clientY)
    if (n !== hoveredNode) {
      hoveredNode = n
      render()
    }
  }
}

const onMouseUp = () => {
  draggedNode = null
}

const onMouseLeave = () => {
  draggedNode = null
  if (hoveredNode) {
    hoveredNode = null
    render()
  }
}

const onTouchStart = (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0]
    const n = findNodeAt(touch.clientX, touch.clientY)
    if (n) {
      draggedNode = n
      hoveredNode = n
      wakeSimulation()
    }
  }
}

const onTouchMove = (e) => {
  if (draggedNode && e.touches.length > 0) {
    const touch = e.touches[0]
    const rect = canvasEl.value.getBoundingClientRect()
    draggedNode.x = touch.clientX - rect.left
    draggedNode.y = touch.clientY - rect.top
    draggedNode.vx = 0
    draggedNode.vy = 0
    wakeSimulation()
  }
}

const onTouchEnd = () => {
  draggedNode = null
  hoveredNode = null
  wakeSimulation()
}

// ── Window Resize & Setup ──────────────────────────
const resizeCanvas = () => {
  if (!containerEl.value || !canvasEl.value) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = containerEl.value.getBoundingClientRect()

  width = rect.width
  height = Math.max(420, Math.min(width * 0.65, 540))

  canvasEl.value.width = width * dpr
  canvasEl.value.height = height * dpr
  canvasEl.value.style.width = `${width}px`
  canvasEl.value.style.height = `${height}px`

  const ctx = canvasEl.value.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)

  if (nodes.length === 0) {
    initPositions()
  } else {
    // Re-center nodes proportionally if resized
    wakeSimulation()
  }
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<style scoped>
.obsidian-container {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #09090b;
  overflow: hidden;
  position: relative;
  box-shadow: 0 12px 36px rgba(0,0,0,0.4);
}

/* ── Header HUD ─────────────────────────────────── */
.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.4);
  flex-wrap: wrap;
  gap: 12px;
}

.graph-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--ink-light);
  display: block;
}

.graph-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.graph-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-count {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-light);
  padding: 3px 8px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.reset-btn {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--ink-mid);
  padding: 4px 10px;
  border-radius: 3px;
  border: 1px solid var(--border-hover);
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 180ms ease;
  cursor: pointer;
}
.reset-btn:hover {
  color: var(--ink);
  border-color: #555;
  background: rgba(255, 255, 255, 0.06);
}

/* ── Filter Pills ───────────────────────────────── */
.filter-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  overflow-x: auto;
  white-space: nowrap;
}

.filter-pill {
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 400;
  color: var(--ink-light);
  padding: 4px 11px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 160ms ease;
}
.filter-pill:hover {
  color: var(--ink-mid);
  background: rgba(255, 255, 255, 0.04);
}
.filter-pill.active {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

/* ── Canvas Area ────────────────────────────────── */
.canvas-wrap {
  position: relative;
  width: 100%;
  background: radial-gradient(circle at 50% 50%, #0d0d10 0%, #000000 100%);
  cursor: grab;
}
.canvas-wrap:active {
  cursor: grabbing;
}

canvas {
  display: block;
  width: 100%;
}

.graph-hint {
  position: absolute;
  bottom: 12px;
  left: 20px;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--ink-light);
  opacity: 0.6;
}

@media (max-width: 640px) {
  .graph-header { padding: 12px 14px; }
  .filter-pills { padding: 8px 14px; }
  .graph-hint { font-size: 9px; left: 14px; bottom: 8px; }
}
</style>
