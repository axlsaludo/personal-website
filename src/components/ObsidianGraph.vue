<template>
  <div class="obsidian-container" ref="containerEl">
    <!-- Graph Header (Clean Obsidian Minimalist) -->
    <div class="graph-header">
      <div class="graph-meta">
        <h3 class="graph-title">Skill Architecture</h3>
      </div>

      <div class="graph-controls">
        <TooltipProvider :delay-duration="220">
          <div class="zoom-btn-group">
            <TooltipRoot>
              <TooltipTrigger as-child>
                <button type="button" class="ctrl-btn" aria-label="Zoom in" @click="zoomIn">+</button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent class="graph-tooltip" :side-offset="6">Zoom in</TooltipContent>
              </TooltipPortal>
            </TooltipRoot>

            <TooltipRoot>
              <TooltipTrigger as-child>
                <button type="button" class="ctrl-btn" aria-label="Zoom out" @click="zoomOut">−</button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent class="graph-tooltip" :side-offset="6">Zoom out</TooltipContent>
              </TooltipPortal>
            </TooltipRoot>

            <TooltipRoot>
              <TooltipTrigger as-child>
                <button type="button" class="ctrl-btn" aria-label="Reset view" @click="resetGraph(true)">↺ Reset</button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent class="graph-tooltip" :side-offset="6">Reset view</TooltipContent>
              </TooltipPortal>
            </TooltipRoot>
          </div>
        </TooltipProvider>
      </div>
    </div>

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
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
} from 'reka-ui'
import { toast } from 'vue-sonner'
import { nodesData, edgesData } from '../data/skills.js'

const containerEl = ref(null)
const viewportEl = ref(null)
const svgEl = ref(null)

// ═════════════════════════════════════════════════════════════════════════════
// ⚙ GRAPH PHYSICS & SIZING CONFIGURATION (Set via Backend / Code)
// Node Size: 4px | Repellant Force: 320 | Link Distance: 75px | Center Gravity: 0.05
// ═════════════════════════════════════════════════════════════════════════════
const config = {
  baseNodeRadius: 4,          // Node Size: 4px
  nodeScaleMultiplier: 1.6,   // Subtle scaling for hubs
  repulsionStrength: -320,    // Repellant Force: 320
  linkDistance: 75,           // Link Distance: 75px
  centerStrength: 0.05,       // Center Gravity: 0.05
  collisionPadding: 12        // Buffer between nodes
}

let simulation = null
let zoomBehavior = null
let gContainer = null
let nodeSel = null
let textSel = null
let linkSel = null
let currentNodes = []
let currentLinks = []

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

  // Force simulation matching Hellyom Obsidian graph with configured values
  simulation = d3.forceSimulation(currentNodes)
    .force('link', d3.forceLink(currentLinks)
      .id(d => d.id)
      .distance(d => {
        const sourceLinks = d.source.linkCount || 1
        const targetLinks = d.target.linkCount || 1
        return Math.min(config.linkDistance * 1.5, Math.max(config.linkDistance * 0.7, (sourceLinks + targetLinks) * (config.linkDistance * 0.09)))
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

  linkSel = link
  nodeSel = node
  textSel = text

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
      highlightNodeById(d.id)
    })
    .on('mouseleave', () => {
      clearHighlight()
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

function highlightNodeById(nodeId) {
  if (!nodeSel || !textSel || !linkSel) return
  const neighborIds = new Set([nodeId])
  currentLinks.forEach(l => {
    const sId = typeof l.source === 'object' ? l.source.id : l.source
    const tId = typeof l.target === 'object' ? l.target.id : l.target
    if (sId === nodeId) neighborIds.add(tId)
    if (tId === nodeId) neighborIds.add(sId)
  })

  nodeSel
    .attr('opacity', n => neighborIds.has(n.id) ? 1 : 0.15)
    .attr('fill', n => n.id === nodeId ? '#ffffff' : (neighborIds.has(n.id) ? '#e4e4e7' : '#52525b'))

  textSel
    .attr('opacity', n => neighborIds.has(n.id) ? 1 : 0.15)
    .attr('fill', n => n.id === nodeId ? '#ffffff' : (neighborIds.has(n.id) ? '#f4f4f5' : '#71717a'))

  linkSel
    .attr('stroke', l => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source
      const tId = typeof l.target === 'object' ? l.target.id : l.target
      return (sId === nodeId || tId === nodeId) ? '#ffffff' : '#27272a'
    })
    .attr('stroke-opacity', l => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source
      const tId = typeof l.target === 'object' ? l.target.id : l.target
      return (sId === nodeId || tId === nodeId) ? 0.9 : 0.08
    })
    .attr('stroke-width', l => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source
      const tId = typeof l.target === 'object' ? l.target.id : l.target
      return (sId === nodeId || tId === nodeId) ? 1.6 : 0.8
    })
}

function clearHighlight() {
  if (!nodeSel || !textSel || !linkSel) return
  nodeSel
    .attr('opacity', 1)
    .attr('fill', d => {
      if (d.linkCount >= 6) return '#f4f4f5'
      if (d.linkCount >= 3) return '#a1a1aa'
      return '#71717a'
    })

  textSel
    .attr('opacity', 1)
    .attr('fill', '#a1a1aa')

  linkSel
    .attr('stroke', '#38383e')
    .attr('stroke-opacity', 0.55)
    .attr('stroke-width', 1)
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

const resetGraph = (notify = false) => {
  clearHighlight()
  if (!svgEl.value || !zoomBehavior) return
  d3.select(svgEl.value).transition().duration(350).call(zoomBehavior.transform, d3.zoomIdentity)
  if (simulation) simulation.alpha(0.6).restart()
  if (notify) toast('Skill graph reset')
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

.obsidian-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: -30%;
  width: 30%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  pointer-events: none;
  animation: border-beam-sweep 8s ease-in-out infinite;
  z-index: 3;
}

@keyframes border-beam-sweep {
  0%, 15% { left: -30%; opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  85%, 100% { left: 100%; opacity: 0; }
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
  .graph-hint { font-size: 9px; left: 14px; bottom: 8px; }
}

:global(.graph-tooltip) {
  z-index: 150;
  padding: 5px 9px;
  border-radius: 5px;
  background: #111111;
  border: 1px solid #2a2a2a;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 11px;
  line-height: 1.2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.65);
  animation: tooltip-in 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(2px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-container::after {
    display: none;
    animation: none;
  }
  :global(.graph-tooltip) {
    animation: none;
  }
}
</style>
