<template>
  <div class="home-page">
    <div class="container">

      <!-- ── Hero Section with Background Roman Columns ─ -->
      <section id="hero" class="hero reveal" ref="heroEl">

        <!-- Background Roman Columns (static atmospheric backdrop, no hover animations) -->
        <div class="hero-bg-columns" aria-hidden="true">
          <img
            src="/roman-columns.png"
            alt=""
            class="bg-columns-img"
            loading="eager"
          />
          <div class="bg-columns-fade"></div>
        </div>

        <!-- Hero Content Foreground -->
        <div class="hero-content">

          <!-- Prominent Name Highlight -->
          <div class="hero-intro">
            <span class="hi name-highlight">
              <span class="shiny-text">{{ personal?.name || 'Kurt Axl Saludo' }}</span>
            </span>
          </div>

          <!-- Headline -->
          <h1 class="hero-headline">
            <span class="headline-regular">Cloud Developer</span>
            <em class="headline-italic">&amp; AI Engineer</em>
          </h1>

          <!-- Tagline (without "Based in the Philippines...") -->
          <p class="hero-sub">
            Building resilient cloud infrastructure, automating workflows, and designing AI-powered systems.
          </p>

          <!-- CTAs -->
          <div class="hero-ctas">
            <button type="button" class="cta-primary" @click="openContact">
              Get in touch <span class="arrow">→</span>
            </button>
            <a v-for="s in personal?.socials?.slice(0,2)" :key="s.label"
               :href="s.url" target="_blank" rel="noopener" class="text-arrow-link">
              <span class="tal-text">{{ s.label }}</span>
              <span class="tal-arrow">↗</span>
            </a>
          </div>

        </div>
      </section>

      <!-- Divider -->
      <div class="h-divider"></div>

      <!-- ── About / Experience / Certs ────────── -->
      <section id="about" class="body-section reveal" ref="bodyEl">
        <div class="body-grid">

          <!-- Col left: statement with name & experience -->
          <div class="col-statement">
            <p class="label statement-label">About</p>
            <p class="statement-text">
              I'm <strong class="name-mention">{{ personal?.name || 'Kurt Axl Saludo' }}</strong>.
              With <span class="hi exp-hi"><NumberFlow :value="displayedExp" :format="expNumberFormat" /> {{ expData.unit }}</span> of experience, I've always had a passion for building things.
              Whether it's crafting resilient infrastructure, automating workflows, or designing clean architectures,
              I believe that <strong>good engineering</strong> is about solving real problems —
              it shapes products, informs scale, and inspires trust.
            </p>
          </div>

          <!-- Col right: live details -->
          <div class="col-details">

            <!-- Current role -->
            <div class="detail-block" v-if="currentJob">
              <p class="label detail-label">Current Role</p>
              <SpotlightCard class="role-card">
                <span class="role-title">{{ currentJob.role }}</span>
                <span class="role-company">{{ currentJob.company }} · {{ currentJob.period }}</span>
              </SpotlightCard>
            </div>

            <!-- Certifications -->
            <div class="detail-block" style="margin-top: 32px;">
              <p class="label detail-label">Certifications</p>
              <div v-if="loading" class="certs-list" aria-label="Loading certifications">
                <div v-for="n in 3" :key="n" class="cert-row cert-skeleton">
                  <span class="skeleton skel-icon"></span>
                  <span class="skeleton skel-line"></span>
                </div>
              </div>
              <div v-else-if="error" class="loading-text" style="color: #663333;">Unavailable</div>
              <div v-else class="certs-list">
                <SpotlightCard
                  as="a"
                  v-for="badge in topBadges"
                  :key="badge.id"
                  :href="personal?.socials?.find(s => s.label === 'Credly')?.url"
                  target="_blank"
                  rel="noopener"
                  class="cert-row"
                >
                  <img v-if="badge.image_url" :src="badge.image_url" alt="" class="cert-img" />
                  <span class="cert-name">{{ badge.badge_template.name }}</span>
                  <span class="cert-arrow">→</span>
                </SpotlightCard>
              </div>
              <a
                :href="personal?.socials?.find(s => s.label === 'Credly')?.url"
                target="_blank" rel="noopener"
                class="text-arrow-link"
                style="margin-top: 14px;"
              >
                <span class="tal-text">All badges on Credly</span>
                <span class="tal-arrow">↗</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="h-divider"></div>

      <!-- ── Obsidian Skill Graph View ─────────── -->
      <section id="skill-graph" class="graph-section reveal" ref="graphEl">
        <ObsidianGraph />
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NumberFlow from '@number-flow/vue'
import { experience } from '../portfolio.config.js'
import { useCredly } from '../composables/useCredly.js'
import { openContact } from '../composables/useUI.js'
import ObsidianGraph from '../components/ObsidianGraph.vue'
import SpotlightCard from '../components/SpotlightCard.vue'

defineProps({ personal: Object })

const currentJob = experience[0]
const { badges, loading, error, fetchBadges } = useCredly()
const topBadges = computed(() => badges.value.slice(0, 3))

const startDate = new Date('2025-10-01')
const expData = computed(() => {
  const now = new Date()
  const diffMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  if (diffMonths < 12) {
    const m = Math.max(1, diffMonths)
    return { value: m, unit: `month${m !== 1 ? 's' : ''}` }
  }
  const y = Number((diffMonths / 12).toFixed(1))
  return { value: y, unit: `year${y !== 1 ? 's' : ''}` }
})

const expNumberFormat = { maximumFractionDigits: 1 }
const displayedExp = ref(0)

const heroEl  = ref(null)
const bodyEl  = ref(null)
const graphEl = ref(null)

onMounted(() => {
  fetchBadges()
  ;[heroEl, bodyEl, graphEl].forEach((el, i) => {
    if (!el.value) return
    setTimeout(() => {
      el.value.classList.add('visible')
      if (el === bodyEl) {
        displayedExp.value = expData.value.value
      }
    }, 80 + i * 140)
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 130px 0 90px;
}

/* ── Divider ──────────────────────────── */
.h-divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ── Hero section ─────────────────────── */
.hero {
  position: relative;
  padding: 64px 0 76px;
  overflow: hidden;
}

/* ── Background Roman Columns ─────────── */
/* Pure static background graphic — NO HOVER ANIMATIONS */
.hero-bg-columns {
  position: absolute;
  top: 0;
  right: -10px;
  bottom: 0;
  width: 480px;
  max-width: 50%;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.bg-columns-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom right;
  opacity: 0.32;
  filter: contrast(1.1) brightness(0.9);
}

.bg-columns-fade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, #000000 0%, rgba(0,0,0,0.6) 20%, transparent 60%),
    linear-gradient(to bottom, transparent 65%, #000000 100%);
  pointer-events: none;
}

/* ── Hero content foreground ──────────── */
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 620px;
}

.hero-intro {
  margin-bottom: 18px;
}

.name-highlight {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 4px;
}

.shiny-text {
  display: inline-block;
  background: linear-gradient(110deg, #bdbdbd 35%, #ffffff 50%, #bdbdbd 65%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shiny-sweep 6s ease-in-out infinite;
}

@keyframes shiny-sweep {
  0%, 100% { background-position: 180% 0; }
  50% { background-position: -80% 0; }
}

.hero-headline {
  font-family: var(--font-sans);
  font-size: clamp(2.4rem, 5.5vw, 4.4rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 20px;
}

.headline-italic {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: #f4f4f5;
}

.headline-regular {
  display: block;
}

.hero-sub {
  font-family: var(--font-sans);
  font-size: 14.5px;
  color: var(--ink-mid);
  line-height: 1.7;
  max-width: 460px;
  margin-bottom: 34px;
}

/* ── CTA row ──────────────────────────── */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.cta-primary {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-radius: var(--radius-pill);
  background: var(--ink);
  color: var(--bg);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  transition: background 200ms ease, transform 200ms ease, box-shadow 200ms ease;
}
.cta-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 520ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}
.cta-primary:hover::before {
  transform: translateX(120%);
}
.cta-primary:hover {
  background: #e5e5e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(255,255,255,0.08);
}
.cta-primary .arrow {
  display: inline-block;
  transition: transform 200ms ease;
}
.cta-primary:hover .arrow { transform: translateX(4px); }

.text-arrow-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--ink-mid);
  padding-bottom: 2px;
  transition: color 200ms ease;
  overflow: hidden;
}
.text-arrow-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%;
  height: 1px;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1);
}
.text-arrow-link:hover { color: var(--ink); }
.text-arrow-link:hover::after { transform: scaleX(1); }
.tal-arrow {
  display: inline-block;
  transition: transform 200ms ease;
}
.text-arrow-link:hover .tal-arrow { transform: translate(2px, -2px); }

/* ── Body section ─────────────────────── */
.body-section {
  padding: 64px 0;
}

.body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
}

.statement-label { margin-bottom: 16px; }

.statement-text {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.85;
  color: var(--ink-mid);
}
.exp-hi {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}
.name-mention {
  color: var(--ink);
  font-weight: 600;
}
.statement-text strong {
  color: var(--ink);
  font-weight: 500;
}

.detail-label { margin-bottom: 12px; }

.role-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
}
.role-card:hover {
  border-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.role-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}
.role-company { font-size: 12px; color: var(--ink-mid); }

.loading-text { font-size: 12px; color: var(--ink-light); }

.certs-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cert-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  transition: border-color 200ms ease, background 200ms ease, transform 200ms ease;
  cursor: pointer;
}
.cert-row:hover {
  border-color: #2a2a2a;
  background: rgba(255,255,255,0.04);
  transform: translateX(3px);
}

.cert-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
  transition: transform 200ms ease;
}
.cert-row:hover .cert-img { transform: scale(1.08); }

.cert-name {
  font-size: 12px;
  color: var(--ink-mid);
  flex: 1;
  line-height: 1.3;
  transition: color 200ms ease;
}
.cert-row:hover .cert-name { color: var(--ink); }

.cert-arrow {
  font-size: 12px;
  color: var(--ink-light);
  transition: transform 200ms ease, color 200ms ease;
}
.cert-row:hover .cert-arrow {
  transform: translateX(4px);
  color: var(--ink-mid);
}

.cert-skeleton {
  cursor: default;
}
.cert-skeleton:hover {
  transform: none;
  background: var(--bg-card);
  border-color: var(--border);
}
.skel-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}
.skel-line {
  height: 12px;
  flex: 1;
  max-width: 72%;
}

@media (prefers-reduced-motion: reduce) {
  .shiny-text {
    animation: none;
    background: none;
    color: var(--ink);
  }
  .cta-primary::before {
    display: none;
  }
}

/* ── Graph Section ────────────────────── */
.graph-section {
  padding: 64px 0;
}

/* ── Responsive ───────────────────────── */
@media (max-width: 900px) {
  .hero-bg-columns {
    width: 360px;
    opacity: 0.22;
  }
}

@media (max-width: 768px) {
  .home-page { padding: 110px 0 60px; }
  .hero { padding: 40px 0 44px; }
  .hero-headline { font-size: clamp(2rem, 9vw, 2.8rem); }
  .body-grid { grid-template-columns: 1fr; gap: 40px; }
  .body-section { padding: 48px 0; }
  .graph-section { padding: 48px 0; }

  .hero-bg-columns {
    width: 280px;
    max-width: 80%;
    right: -40px;
    opacity: 0.18;
  }
}

@media (max-width: 480px) {
  .hero-headline { font-size: clamp(1.8rem, 10vw, 2.3rem); }
  .hero-bg-columns {
    width: 220px;
    opacity: 0.14;
  }
}
</style>
