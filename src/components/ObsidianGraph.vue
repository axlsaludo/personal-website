<template>
  <div class="obsidian-container" ref="containerEl">
    <!-- Graph HUD Header (Clean Obsidian Minimalist) -->
    <div class="graph-header">
      <div class="graph-meta">
        <span class="graph-tag">// KNOWLEDGE GRAPH</span>
        <h3 class="graph-title">Skill Architecture</h3>
      </div>

      <div class="graph-controls">
        <span class="graph-stat">{{ nodesData.length }} NODES</span>
        <span class="graph-stat">{{ edgesData.length }} EDGES</span>
        <div class="zoom-btn-group">
          <button class="ctrl-btn" @click="zoomIn" title="Zoom in">+</button>
          <button class="ctrl-btn" @click="zoomOut" title="Zoom out">−</button>
          <button class="ctrl-btn" @click="resetGraph" title="Reset view">↺ Reset</button>
        </div>
      </div>
    </div>

    <!-- Graph Viewport (SVG rendered via D3) -->
    <div class="svg-viewport" ref="viewportEl">
      <svg ref="svgEl" class="graph-svg"></svg>

      <!-- Bottom HUD Hint -->
      <div class="graph-hint">
        <span>Click &amp; drag nodes · Scroll or pinch to zoom</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const containerEl = ref(null)
const viewportEl = ref(null)
const svgEl = ref(null)

let simulation = null
let zoomBehavior = null
let gContainer = null
let currentTransform = d3.zoomIdentity

// ── Skills & Architecture Data ─────────────────────
// Based on Credly certifications & Cloud/AI skill set
const nodesData = [
  { id: 'gcp', label: 'Google Cloud (GCP)' },
  { id: 'cloud-arch', label: 'Cloud Architecture' },
  { id: 'terraform', label: 'Terraform & IaC' },
  { id: 'cdl', label: 'Cloud Digital Leader' },
  { id: 'gccf', label: 'Cloud Computing Foundations' },
  { id: 'gemini', label: 'Gemini Enterprise' },
  { id: 'agents', label: 'AI Agent Development' },
  { id: 'genai', label: 'Generative AI Leader' },
  { id: 'google-ai', label: 'Google AI Professional' },
  { id: 'adk', label: 'ADK Builder' },
  { id: 'python', label: 'Python & Tooling' },
  { id: 'k8s', label: 'Kubernetes (GKE)' },
  { id: 'docker', label: 'Docker Containers' },
  { id: 'cicd', label: 'CI/CD Pipelines' },
  { id: 'linux', label: 'Linux & Shell Scripting' },
  { id: 'infra-auto', label: 'Infra Automation' },
  { id: 'ccna', label: 'CCNA Routing & Switching' },
  { id: 'networking', label: 'VPC & Hybrid Mesh' },
  { id: 'security', label: 'Cloud IAM & Security' },
  { id: 'wireless', label: 'Wireless Essentials' }
]

const edgesData = [
  // GCP Core
  { source: 'gcp', target: 'cloud-arch' },
  { source: 'gcp', target: 'terraform' },
  { source: 'gcp', target: 'k8s' },
  { source: 'gcp', target: 'networking' },
  { source: 'gcp', target: 'security' },
  { source: 'gcp', target: 'cdl' },
  { source: 'gcp', target: 'gccf' },

  // AI & Gemini Core
  { source: 'gemini', target: 'agents' },
  { source: 'gemini', target: 'genai' },
  { source: 'gemini', target: 'google-ai' },
  { source: 'agents', target: 'adk' },
  { source: 'agents', target: 'python' },
  { source: 'google-ai', target: 'genai' },
  { source: 'python', target: 'infra-auto' },

  // DevOps & Containers
  { source: 'k8s', target: 'docker' },
  { source: 'k8s', target: 'cloud-arch' },
  { source: 'docker', target: 'cicd' },
  { source: 'docker', target: 'linux' },
  { source: 'cicd', target: 'infra-auto' },
  { source: 'terraform', target: 'infra-auto' },
  { source: 'linux', target: 'infra-auto' },

  // Networking & Security
  { source: 'ccna', target: 'networking' },
  { source: 'ccna', target: 'wireless' },
  { source: 'networking', target: 'security' },
  { source: 'security', target: 'cloud-arch' },

  // Cross-domain links (Obsidian knowledge web)
  { source: 'gcp', target: 'gemini' },
  { source: 'cdl', target: 'genai' },
  { source: 'adk', target: 'gcp' }
]

// ── Graph Initialization (Hellyom-based Obsidian logic) ─────
const initGraph = () => {
  if (!svgEl.value || !viewportEl.value) return

  const width = viewportEl.value.clientWidth
  const height = Math.max(420, Math.min(width * 0.62, 540))

  // Clean existing SVG elements
  d3.select(svgEl.value).selectAll('*').remove()

  const svg = d3.select(svgEl.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Count connections for each node (matches Hellyom generator)
  const linkCount = {}
  nodesData.forEach(n => { linkCount[n.id] = 0 })
  edgesData.forEach(e => {
    linkCount[typeof e.source === 'object' ? e.source.id : e.source] =
      (linkCount[typeof e.source === 'object' ? e.source.id : e.source] || 0) + 1
    linkCount[typeof e.target === 'object' ? e.target.id : e.target] =
      (linkCount[typeof e.target === 'object' ? e.target.id : e.target] || 0) + 1
  })

  // Deep clone data for D3 mutation
  const nodes = nodesData.map(d => ({
    ...d,
    linkCount: linkCount[d.id] || 1,
    r: Math.max(5, 4.5 + Math.sqrt(linkCount[d.id] || 1) * 2.2)
  }))

  const links = edgesData.map(d => ({ ...d }))

  // Main Zoom container
  gContainer = svg.append('g').attr('class', 'graph-root')

  zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 3.5])
    .on('zoom', (event) => {
      currentTransform = event.transform
      gContainer.attr('transform', event.transform)
    })

  svg.call(zoomBehavior)

  // Force simulation (D3 force physics matching Hellyom Obsidian graph)
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links)
      .id(d => d.id)
      .distance(d => {
        const sourceLinks = d.source.linkCount || 1
        const targetLinks = d.target.linkCount || 1
        return Math.min(130, Math.max(55, (sourceLinks + targetLinks) * 8.5))
      })
    )
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => d.r + 14).iterations(2))
    .alphaDecay(0.022)
    .alphaMin(0.001)

  // 1. Draw Links
  const link = gContainer.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('class', 'graph-link')
    .attr('stroke', '#38383e')
    .attr('stroke-opacity', 0.55)
    .attr('stroke-width', 1)

  // 2. Draw Nodes
  const node = gContainer.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'graph-node')
    .attr('r', d => d.r)
    .attr('fill', d => {
      // Obsidian-style subtle luminance based on connectivity
      if (d.linkCount >= 5) return '#e4e4e7' // Hubs: brighter
      if (d.linkCount >= 3) return '#a1a1aa' // Mid: light gray
      return '#71717a'                      // Leaves: subtle slate
    })
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    )

  // 3. Draw Labels (positioned next to nodes, clean Obsidian style)
  const text = gContainer.append('g')
    .attr('class', 'texts')
    .selectAll('text')
    .data(nodes)
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

  // Hover highlighting (Obsidian graph neighborhood spotlight)
  node
    .on('mouseenter', (event, d) => {
      const neighborIds = new Set([d.id])
      links.forEach(l => {
        if (l.source.id === d.id) neighborIds.add(l.target.id)
        if (l.target.id === d.id) neighborIds.add(l.source.id)
      })

      // Dim non-neighbors
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
          if (d.linkCount >= 5) return '#e4e4e7'
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

  // Drag handlers (Hellyom Obsidian drag implementation)
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

// ── Resize handler ─────────────────────────────────
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

/* ── Obsidian HUD Header ─────────────────────────── */
.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  flex-wrap: wrap;
  gap: 12px;
}

.graph-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--ink-light);
  display: block;
}

.graph-title {
  font-family: var(--font-sans);
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.graph-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.graph-stat {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--ink-light);
  padding: 3px 8px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.zoom-btn-group {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: 4px;
}

.ctrl-btn {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--ink-mid);
  padding: 4px 9px;
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
  .graph-stat { display: none; }
}
</style>
