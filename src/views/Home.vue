<template>
  <div class="home-page">
    <div class="container">

      <!-- ── Hero ─────────────────────────────── -->
      <section class="hero reveal" ref="heroEl">
        <div class="hero-inner">

          <!-- Left: text content -->
          <div class="hero-text">
            <h1 class="hero-headline">
              <span class="headline-regular">Cloud Developer</span><br>
              <em class="headline-italic">&amp; AI Engineer</em>
            </h1>

            <p class="hero-sub">
              Building resilient cloud infrastructure and AI-powered systems.
              Based in the Philippines, working worldwide.
            </p>

            <div class="hero-ctas">
              <a :href="`mailto:${personal?.email}`" class="cta-primary">
                Get in touch <span class="arrow">→</span>
              </a>
              <a v-for="s in personal?.socials?.slice(0,2)" :key="s.label"
                 :href="s.url" target="_blank" rel="noopener" class="text-arrow-link">
                <span class="tal-text">{{ s.label }}</span>
                <span class="tal-arrow">↗</span>
              </a>
            </div>
          </div>

          <!-- Right: Roman Columns Illustration -->
          <div
            class="hero-columns-wrap"
            ref="columnsEl"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
          >
            <div class="columns-frame" :style="tiltStyle">
              <img
                src="/roman-columns.png"
                alt="Classical Roman Columns"
                class="columns-img"
                loading="eager"
              />
              <div class="columns-overlay-gradient"></div>
            </div>
          </div>

        </div>
      </section>

      <!-- Divider -->
      <div class="h-divider"></div>

      <!-- ── About / Body ──────────────────────── -->
      <section class="body-section reveal" ref="bodyEl">
        <div class="body-grid">

          <!-- Col left: statement -->
          <div class="col-statement">
            <p class="label statement-label">About</p>
            <p class="statement-text">
              With <span class="hi">{{ experienceDuration }}</span> of experience, I've always had a passion for building things.
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
              <div class="role-card">
                <span class="role-title">{{ currentJob.role }}</span>
                <span class="role-company">{{ currentJob.company }} · {{ currentJob.period }}</span>
              </div>
            </div>

            <!-- Certifications -->
            <div class="detail-block" style="margin-top: 32px;">
              <p class="label detail-label">Certifications</p>
              <div v-if="loading" class="loading-text">Fetching from Credly...</div>
              <div v-else-if="error" class="loading-text" style="color: #663333;">Unavailable</div>
              <div v-else class="certs-list">
                <a
                  v-for="badge in topBadges"
                  :key="badge.id"
                  :href="personal?.socials?.find(s => s.label === 'Credly')?.url"
                  target="_blank"
                  class="cert-row"
                >
                  <img v-if="badge.image_url" :src="badge.image_url" alt="" class="cert-img" />
                  <span class="cert-name">{{ badge.badge_template.name }}</span>
                  <span class="cert-arrow">→</span>
                </a>
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

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { experience } from '../portfolio.config.js'
import { useCredly } from '../composables/useCredly.js'

defineProps({ personal: Object })

const currentJob = experience[0]
const { badges, loading, error, fetchBadges } = useCredly()
const topBadges = computed(() => badges.value.slice(0, 3))

const startDate = new Date('2025-10-01')
const experienceDuration = computed(() => {
  const now = new Date()
  const diffMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  if (diffMonths < 12) {
    const m = Math.max(1, diffMonths)
    return `${m} month${m !== 1 ? 's' : ''}`
  }
  const diffYears = (diffMonths / 12).toFixed(1).replace('.0', '')
  return `${diffYears} year${diffYears !== '1' ? 's' : ''}`
})

const heroEl    = ref(null)
const bodyEl    = ref(null)
const columnsEl = ref(null)

// ── Interactive Subtle 3D Tilt Effect ──────────────────────
const tiltX = ref(0)
const tiltY = ref(0)
const isHovering = ref(false)

const tiltStyle = computed(() => {
  if (!isHovering.value) {
    return {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 300ms ease'
    }
  }
  return {
    transform: `perspective(1000px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) scale3d(1.025, 1.025, 1.025)`,
    transition: 'transform 80ms ease-out, filter 300ms ease'
  }
})

const onMouseMove = (e) => {
  if (!columnsEl.value) return
  isHovering.value = true
  const rect = columnsEl.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tiltX.value = +( -y * 8 ).toFixed(2)
  tiltY.value = +( x * 10 ).toFixed(2)
}

const onMouseLeave = () => {
  isHovering.value = false
  tiltX.value = 0
  tiltY.value = 0
}

onMounted(() => {
  fetchBadges()
  ;[heroEl, bodyEl].forEach((el, i) => {
    if (!el.value) return
    setTimeout(() => el.value.classList.add('visible'), 80 + i * 140)
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 130px 0 80px;
}

/* ── Divider ──────────────────────────── */
.h-divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ── Hero layout — text left, columns right ─ */
.hero {
  padding: 56px 0 64px;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 48px;
  align-items: center;
}

/* ── Hero text ────────────────────────── */
.hero-text {
  z-index: 2;
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
}

.headline-regular {
  display: block;
}

.hero-sub {
  font-family: var(--font-sans);
  font-size: 14.5px;
  color: var(--ink-mid);
  line-height: 1.7;
  max-width: 420px;
  margin-bottom: 34px;
}

/* ── CTA row ──────────────────────────── */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* Primary pill button */
.cta-primary {
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

/* Sliding underline links */
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

/* ── Roman Columns Graphic ────────────── */
.hero-columns-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  perspective: 1000px;
}

.columns-frame {
  position: relative;
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: crosshair;
}

.columns-img {
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: contain;
  filter: contrast(1.08) brightness(0.95);
  opacity: 0.85;
  transition: opacity 300ms ease, filter 300ms ease;
  pointer-events: none;
}

.columns-frame:hover .columns-img {
  opacity: 1;
  filter: contrast(1.15) brightness(1.08) drop-shadow(0 0 20px rgba(255, 255, 255, 0.08));
}

/* Seamless blend gradient at the bottom */
.columns-overlay-gradient {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 25%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 80%, #000000 100%);
  pointer-events: none;
}

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
.statement-text strong {
  color: var(--ink);
  font-weight: 500;
}

.detail-label { margin-bottom: 12px; }

/* Role card — lifts on hover */
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

/* Cert row — slides right, badge scales */
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

/* ── Responsive & Mobile Friendly ──────── */
@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 44px;
  }
  .columns-frame {
    max-width: 320px;
  }
  .columns-img {
    max-height: 360px;
  }
}

@media (max-width: 768px) {
  .home-page { padding: 110px 0 60px; }
  .hero { padding: 36px 0 36px; }
  .hero-headline { font-size: clamp(2rem, 9vw, 2.8rem); }
  .body-grid { grid-template-columns: 1fr; gap: 40px; }
  .body-section { padding: 48px 0; }

  /* Mobile columns treatment: centered, elegant height, no overflow */
  .hero-columns-wrap {
    margin-top: 8px;
    width: 100%;
  }
  .columns-frame {
    max-width: 260px;
  }
  .columns-img {
    max-height: 270px;
    opacity: 0.75;
  }
}

@media (max-width: 480px) {
  .hero-headline { font-size: clamp(1.8rem, 10vw, 2.3rem); }
  .columns-frame {
    max-width: 210px;
  }
  .columns-img {
    max-height: 230px;
  }
}
</style>
