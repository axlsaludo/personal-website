<template>
  <div class="obsidian-container" ref="containerEl">
    <!-- Graph Header (Clean Obsidian Minimalist) -->
    <div class="graph-header">
      <div class="graph-meta">
        <h3 class="graph-title">Skill Architecture</h3>
      </div>

      <div class="graph-controls">
        <div class="zoom-btn-group">
          <button
            class="ctrl-btn"
            :class="{ active: showSettings }"
            @click="showSettings = !showSettings"
            title="Adjust Physics &amp; Node Sizes"
          >
            ⚙ Settings
          </button>
          <button class="ctrl-btn" @click="zoomIn" title="Zoom in">+</button>
          <button class="ctrl-btn" @click="zoomOut" title="Zoom out">−</button>
          <button class="ctrl-btn" @click="resetGraph" title="Reset view">↺ Reset</button>
        </div>
      </div>
    </div>

    <!-- Obsidian Physics & Sizing Drawer (Collapsible) -->
    <transition name="slide-fade">
      <div v-if="showSettings" class="settings-drawer">
        <div class="settings-grid">
          <!-- Node Size -->
          <div class="setting-item">
            <div class="setting-label-row">
              <span class="setting-label">Node Size</span>
              <span class="setting-value">{{ config.baseNodeRadius }}px</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              v-model.number="config.baseNodeRadius"
              @input="onConfigChange"
              class="setting-slider"
            />
          </div>

          <!-- Repellant / Repulsion -->
          <div class="setting-item">
            <div class="setting-label-row">
              <span class="setting-label">Repellant Force</span>
              <span class="setting-value">{{ Math.abs(config.repulsionStrength) }}</span>
            </div>
            <input
              type="range"
              min="-800"
              max="-100"
              step="20"
              v-model.number="config.repulsionStrength"
              @input="onConfigChange"
              class="setting-slider"
            />
          </div>

          <!-- Link Distance -->
          <div class="setting-item">
            <div class="setting-label-row">
              <span class="setting-label">Link Distance</span>
              <span class="setting-value">{{ config.linkDistance }}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="5"
              v-model.number="config.linkDistance"
              @input="onConfigChange"
              class="setting-slider"
            />
          </div>

          <!-- Center Gravity -->
          <div class="setting-item">
            <div class="setting-label-row">
              <span class="setting-label">Center Gravity</span>
              <span class="setting-value">{{ config.centerStrength }}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.25"
              step="0.01"
              v-model.number="config.centerStrength"
              @input="onConfigChange"
              class="setting-slider"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- Graph Viewport (SVG rendered via D3) -->
    <div class="svg-viewport" ref="viewportEl">
      <svg ref="svgEl" class="graph-svg"></svg>

      <!-- Bottom Hint -->
      <div class="graph-hint">
        <span>Click &amp; drag nodes to explore skills · Scroll to zoom</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const containerEl = ref(null)
const viewportEl = ref(null)
const svgEl = ref(null)
const showSettings = ref(false)

// ═════════════════════════════════════════════════════════════════════════════
// ⚙ GRAPH PHYSICS & SIZING CONFIGURATION
// You can adjust these default numbers right here in code:
// ═════════════════════════════════════════════════════════════════════════════
const config = reactive({
  // 1. NODE SIZES:
  // Base radius in pixels (default 5.5). Range: 3 to 14
  baseNodeRadius: 5.5,

  // Node scale scaling factor based on number of connections (default 2.2)
  nodeScaleMultiplier: 2.2,

  // 2. REPELLANT / REPULSION FORCE:
  // Negative charge between nodes. More negative = nodes push further apart
  // (default -300). Range: -100 (close together) to -800 (very wide spread)
  repulsionStrength: -300,

  // 3. LINK DISTANCE:
  // Base spring length between connected skill nodes (default 80px)
  linkDistance: 80,

  // 4. CENTER GRAVITY:
  // Pull towards center of viewport (default 0.05). Range: 0.01 to 0.25
  centerStrength: 0.05,

  // 5. COLLISION PADDING:
  // Extra buffer to prevent overlapping node circles & text (default 15px)
  collisionPadding: 15
})

let simulation = null
let zoomBehavior = null
let gContainer = null
let currentNodes = []
let currentLinks = []

// ── Skills Data Structured by Credly Credentials ──
const nodesData = [
  // Primary Domain Hubs
  { id: 'gcp', label: 'Google Cloud (GCP)' },
  { id: 'ai', label: 'Artificial Intelligence' },
  { id: 'networking', label: 'Networking & Systems' },

  // Skills under Google Cloud (ACE, CDL, GCCF, K8s badges)
  { id: 'gke', label: 'Kubernetes (GKE)' },
  { id: 'compute', label: 'Compute Engine & VMs' },
  { id: 'cloud-iam', label: 'Cloud IAM & Security' },
  { id: 'cloud-vpc', label: 'VPC & Cloud Networking' },
  { id: 'terraform', label: 'Terraform & IaC' },
  { id: 'cloud-arch', label: 'Cloud Architecture' },
  { id: 'storage-db', label: 'Cloud Storage & Databases' },
  { id: 'monitoring', label: 'Cloud Monitoring & Ops' },

  // Skills under Artificial Intelligence (Gemini Specialist, GenAI Leader, ADK)
  { id: 'gemini', label: 'Gemini Enterprise' },
  { id: 'agents', label: 'AI Agent Development' },
  { id: 'adk', label: 'Agent Development Kit (ADK)' },
  { id: 'prompt-eng', label: 'Prompt Engineering & LLMs' },
  { id: 'ai-workflows', label: 'AI Workflow Automation' },
  { id: 'python', label: 'Python & Scripting' },

  // Skills under Networking & Systems (CCNA Routing, Switching & Wireless)
  { id: 'ccna', label: 'CCNA Routing & Switching' },
  { id: 'tcp-ip', label: 'TCP/IP & DNS Architecture' },
  { id: 'firewalls', label: 'Firewalls & Network Security' },
  { id: 'wireless', label: 'Wireless Essentials' },
  { id: 'linux', label: 'Linux Administration' },
  { id: 'docker', label: 'Docker & Containers' },
  { id: 'cicd', label: 'CI/CD Automation' }
]

const edgesData = [
  // ── Under Google Cloud (GCP) ─────────────────────
  { source: 'gcp', target: 'gke' },
  { source: 'gcp', target: 'compute' },
  { source: 'gcp', target: 'cloud-iam' },
  { source: 'gcp', target: 'cloud-vpc' },
  { source: 'gcp', target: 'terraform' },
  { source: 'gcp', target: 'cloud-arch' },
  { source: 'gcp', target: 'storage-db' },
  { source: 'gcp', target: 'monitoring' },

  // ── Under Artificial Intelligence ────────────────
  { source: 'ai', target: 'gemini' },
  { source: 'ai', target: 'agents' },
  { source: 'ai', target: 'adk' },
  { source: 'ai', target: 'prompt-eng' },
  { source: 'ai', target: 'ai-workflows' },
  { source: 'ai', target: 'python' },

  // ── Under Networking & Systems ───────────────────
  { source: 'networking', target: 'ccna' },
  { source: 'networking', target: 'tcp-ip' },
  { source: 'networking', target: 'firewalls' },
  { source: 'networking', target: 'wireless' },
  { source: 'networking', target: 'linux' },
  { source: 'networking', target: 'docker' },
  { source: 'networking', target: 'cicd' },

  // ── Cross-Domain Structural Links (Interconnected Web) ──
  { source: 'gcp', target: 'ai' },
  { source: 'gcp', target: 'networking' },
  { source: 'gke', target: 'docker' },
  { source: 'docker', target: 'cicd' },
  { source: 'terraform', target: 'cicd' },
  { source: 'agents', target: 'gemini' },
  { source: 'agents', target: 'adk' },
  { source: 'agents', target: 'python' },
  { source: 'cloud-vpc', target: 'ccna' },
  { source: 'cloud-iam', target: 'firewalls' },
  { source: 'compute', target: 'linux' }
]

// ── Graph Initialization (D3 Force Simulation) ─────
const initGraph = () => {
  if (!svgEl.value || !viewportEl.value) return

  const width = viewportEl.value.clientWidth
  const height = Math.max(440, Math.min(width * 0.62, 560))

  d3.select(svgEl.value).selectAll('*').remove()

  const svg = d3.select(svgEl.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Count connections for each node
  const linkCount = {}
  nodesData.forEach(n => { linkCount[n.id] = 0 })
  edgesData.forEach(e => {
    linkCount[typeof e.source === 'object' ? e.source.id : e.source] =
      (linkCount[typeof e.source === 'object' ? e.source.id : e.source] || 0) + 1
    linkCount[typeof e.target === 'object' ? e.target.id : e.target] =
      (linkCount[typeof e.target === 'object' ? e.target.id : e.target] || 0) + 1
  })

  // Deep clone data for D3 mutation
  currentNodes = nodesData.map(d => ({
    ...d,
    linkCount: linkCount[d.id] || 1,
    r: Math.max(config.baseNodeRadius, config.baseNodeRadius * 0.75 + Math.sqrt(linkCount[d.id] || 1) * config.nodeScaleMultiplier)
  }))

  currentLinks = edgesData.map(d => ({ ...d }))

  gContainer = svg.append('g').attr('class', 'graph-root')

  zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 3.5])
    .on('zoom', (event) => {
      gContainer.attr('transform', event.transform)
    })

  svg.call(zoomBehavior)

  // Force simulation matching Hellyom Obsidian graph
  simulation = d3.forceSimulation(currentNodes)
    .force('link', d3.forceLink(currentLinks)
      .id(d => d.id)
      .distance(d => {
        const sourceLinks = d.source.linkCount || 1
        const targetLinks = d.target.linkCount || 1
        return Math.min(config.linkDistance * 1.6, Math.max(config.linkDistance * 0.65, (sourceLinks + targetLinks) * (config.linkDistance * 0.1)))
      })
    )
    .force('charge', d3.forceManyBody().strength(config.repulsionStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => d.r + config.collisionPadding).iterations(2))
    .alphaDecay(0.022)
    .alphaMin(0.001)

  // 1. Draw Links
  const link = gContainer.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(currentLinks)
    .enter().append('line')
    .attr('class', 'graph-link')
    .attr('stroke', '#38383e')
    .attr('stroke-opacity', 0.55)
    .attr('stroke-width', 1)

  // 2. Draw Nodes
  const node = gContainer.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(currentNodes)
    .enter().append('circle')
    .attr('class', 'graph-node')
    .attr('r', d => d.r)
    .attr('fill', d => {
      if (d.linkCount >= 6) return '#f4f4f5'
      if (d.linkCount >= 3) return '#a1a1aa'
      return '#71717a'
    })
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    )

  // 3. Draw Labels
  const text = gContainer.append('g')
    .attr('class', 'texts')
    .selectAll('text')
    .data(currentNodes)
    .enter().append('text')
    .attr('class', 'graph-label')
    .attr('font-size', '10.5px')
    .attr('font-family', 'Inter, system-ui, -apple-system, sans-serif')
    .attr('fill', '#a1a1aa')
    .attr('pointer-events', 'none')
    .text(d => d.label)

  // Tick update loop
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    text
      .attr('x', d => d.x + d.r + 5)
      .attr('y', d => d.y + 3.5)
  })

  // Hover highlighting
  node
    .on('mouseenter', (event, d) => {
      const neighborIds = new Set([d.id])
      currentLinks.forEach(l => {
        if (l.source.id === d.id) neighborIds.add(l.target.id)
        if (l.target.id === d.id) neighborIds.add(l.source.id)
      })

      node
        .attr('opacity', n => neighborIds.has(n.id) ? 1 : 0.15)
        .attr('fill', n => n.id === d.id ? '#ffffff' : (neighborIds.has(n.id) ? '#e4e4e7' : '#52525b'))

      text
        .attr('opacity', n => neighborIds.has(n.id) ? 1 : 0.15)
        .attr('fill', n => n.id === d.id ? '#ffffff' : (neighborIds.has(n.id) ? '#f4f4f5' : '#71717a'))

      link
        .attr('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? '#ffffff' : '#27272a')
        .attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.08)
        .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? 1.6 : 0.8)
    })
    .on('mouseleave', () => {
      node
        .attr('opacity', 1)
        .attr('fill', d => {
          if (d.linkCount >= 6) return '#f4f4f5'
          if (d.linkCount >= 3) return '#a1a1aa'
          return '#71717a'
        })

      text
        .attr('opacity', 1)
        .attr('fill', '#a1a1aa')

      link
        .attr('stroke', '#38383e')
        .attr('stroke-opacity', 0.55)
        .attr('stroke-width', 1)
    })

  // Drag handlers
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}

// ── Live Slider Adjustments (Updates Physics in Real-Time) ──
const onConfigChange = () => {
  if (!simulation || !gContainer) return

  // 1. Update node radii
  currentNodes.forEach(d => {
    d.r = Math.max(config.baseNodeRadius, config.baseNodeRadius * 0.75 + Math.sqrt(d.linkCount || 1) * config.nodeScaleMultiplier)
  })

  gContainer.selectAll('.graph-node')
    .attr('r', d => d.r)

  gContainer.selectAll('.graph-label')
    .attr('x', d => d.x + d.r + 5)

  // 2. Update forces
  simulation.force('charge', d3.forceManyBody().strength(config.repulsionStrength))
  simulation.force('collide', d3.forceCollide().radius(d => d.r + config.collisionPadding))
  simulation.force('link', d3.forceLink(currentLinks)
    .id(d => d.id)
    .distance(d => {
      const sourceLinks = d.source.linkCount || 1
      const targetLinks = d.target.linkCount || 1
      return Math.min(config.linkDistance * 1.6, Math.max(config.linkDistance * 0.65, (sourceLinks + targetLinks) * (config.linkDistance * 0.1)))
    })
  )

  // 3. Gentle reheat to settle into new positions
  simulation.alpha(0.35).restart()
}

// ── Controls: Zoom & Reset ─────────────────────────
const zoomIn = () => {
  if (!svgEl.value || !zoomBehavior) return
  d3.select(svgEl.value).transition().duration(250).call(zoomBehavior.scaleBy, 1.3)
}

const zoomOut = () => {
  if (!svgEl.value || !zoomBehavior) return
  d3.select(svgEl.value).transition().duration(250).call(zoomBehavior.scaleBy, 0.77)
}

const resetGraph = () => {
  if (!svgEl.value || !zoomBehavior) return
  d3.select(svgEl.value).transition().duration(350).call(zoomBehavior.transform, d3.zoomIdentity)
  if (simulation) simulation.alpha(0.6).restart()
}

const handleResize = () => {
  initGraph()
}

onMounted(() => {
  initGraph()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (simulation) simulation.stop()
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
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

/* ── Obsidian Header ─────────────────────────────── */
.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.graph-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.graph-controls {
  display: flex;
  align-items: center;
}

.zoom-btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ctrl-btn {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--ink-mid);
  padding: 4px 10px;
  border-radius: 3px;
  border: 1px solid var(--border-hover);
  background: transparent;
  cursor: pointer;
  transition: all 180ms ease;
  line-height: 1.2;
}
.ctrl-btn:hover {
  color: var(--ink);
  border-color: #555;
  background: rgba(255, 255, 255, 0.06);
}
.ctrl-btn.active {
  color: #ffffff;
  border-color: #666;
  background: rgba(255, 255, 255, 0.12);
}

/* ── Settings Drawer (Live Sliders) ───────────────── */
.settings-drawer {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(14, 14, 18, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--ink-light);
  text-transform: uppercase;
}

.setting-value {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-mid);
}

.setting-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #27272a;
  outline: none;
  cursor: pointer;
}
.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0,0,0,0.5);
  transition: transform 120ms ease;
}
.setting-slider::-webkit-slider-thumb:hover {
  transform: scale(1.25);
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── SVG Viewport ─────────────────────────────────── */
.svg-viewport {
  position: relative;
  width: 100%;
  background: radial-gradient(circle at 50% 50%, #0d0d12 0%, #000000 100%);
  cursor: grab;
  overflow: hidden;
  user-select: none;
}
.svg-viewport:active {
  cursor: grabbing;
}

.graph-svg {
  display: block;
  width: 100%;
  height: 100%;
}

:deep(.graph-node) {
  cursor: move;
  transition: opacity 180ms ease, fill 180ms ease;
}

:deep(.graph-link) {
  transition: stroke 180ms ease, stroke-opacity 180ms ease;
}

:deep(.graph-label) {
  user-select: none;
  font-weight: 400;
  transition: opacity 180ms ease, fill 180ms ease;
}

/* ── Bottom HUD Hint ──────────────────────────────── */
.graph-hint {
  position: absolute;
  bottom: 12px;
  left: 20px;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--ink-light);
  opacity: 0.65;
}

@media (max-width: 640px) {
  .graph-header { padding: 12px 14px; }
  .settings-drawer { padding: 12px 14px; }
  .settings-grid { grid-template-columns: 1fr; gap: 12px; }
  .graph-hint { font-size: 9px; left: 14px; bottom: 8px; }
}
</style>
