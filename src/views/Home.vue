<template>
  <div class="home-page">
    <div class="container h-full">
      <div class="intro-content">
        
        <!-- ASCII Hero Art -->
        <div class="reveal hero-ascii" ref="heroEl">
          <div class="hero-meta">
            <h1 class="hero-title">{{ personal?.title }}</h1>
            <p class="hero-tagline">{{ personal?.tagline }}</p>
          </div>
        </div>

        <div class="two-col reveal" ref="bodyEl">
          <!-- Column 1: Philosophy -->
          <div class="col-left">
            <h2 class="body-para tech-statement">
              Simply put, I believe <span class="hi">good engineering</span> isn't just
              writing code. Having worked in the field for <span class="hi">{{ experienceDuration }}</span>, I've seen that it's a combination of problem solving and
              <span class="hi">systems thinking</span> — and more over, work done right,
              <span class="hi-warm">has impact.</span> It shapes products, informs
              scale, and inspires trust. And let me tell you, <span class="hi">I do it right.</span>
            </h2>
            
            <div class="contact-links">
              <span class="label-sc detail-label">links</span>
              <ul class="social-links-list">
                <li><a :href="`mailto:${personal?.email}`" class="text-link social-link">Email ↗</a></li>
                <li v-for="s in personal?.socials" :key="s.label">
                  <a :href="s.url" target="_blank" rel="noopener" class="text-link social-link">{{ s.label }} ↗</a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Column 2: Live Details -->
          <div class="col-right">
            
            <!-- Current Experience -->
            <div class="current-exp" v-if="currentJob">
              <span class="label-sc detail-label">current role</span>
              <div class="compact-job">
                <span class="job-title">{{ currentJob.role }}</span>
                <span class="job-company"><em>{{ currentJob.company }}</em></span>
              </div>
            </div>

            <!-- Top Certifications -->
            <div class="top-certs" style="margin-top: 36px;">
              <span class="label-sc detail-label">latest certifications</span>
              
              <div v-if="loading" class="body-para" style="font-size: 12px;">Fetching from Credly...</div>
              <div v-else-if="error" class="body-para" style="font-size: 12px; color: #665555;">Unavailable</div>
              <div v-else class="compact-certs">
                <div v-for="badge in topBadges" :key="badge.id" class="mini-cert cert-card">
                  <img v-if="badge.image_url" :src="badge.image_url" alt="" class="mini-badge-img" />
                  <span class="mini-cert-name">{{ badge.badge_template.name }}</span>
                </div>
              </div>
              
              <a :href="personal?.socials?.find(s => s.label === 'Credly')?.url" target="_blank" rel="noopener" class="text-link sm-link" style="margin-top: 10px; display: inline-block;">
                view all badges on Credly ↗
              </a>
            </div>

          </div>
        </div>
      </div>
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

const heroEl = ref(null)
const bodyEl = ref(null)

onMounted(() => {
  fetchBadges()
  
  const els = [heroEl, bodyEl]
  els.forEach((el, i) => {
    if (!el.value) return
    setTimeout(() => el.value.classList.add('visible'), 100 + i * 150)
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
}

.h-full { width: 100%; }

/* ── ASCII Hero ─────────────────────── */
.hero-ascii {
  margin-bottom: 56px;
}

.ascii-art {
  font-family: var(--font-mono);
  font-size: clamp(6px, 1.1vw, 11px);
  line-height: 1.3;
  color: var(--ink-dim);
  margin-bottom: 24px;
  user-select: none;
  overflow: hidden;
}

.hero-meta {
  max-width: 600px;
}

.meta-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--ink-dim);
  display: block;
  margin-bottom: 8px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 600;
  font-variation-settings: 'opsz' 72;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 12px;
}

.hero-tagline {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--ink-mid);
  line-height: 1.6;
}

/* ── Tech Statement ─────────────────── */
.tech-statement {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  line-height: 2;
  color: var(--ink);
  font-weight: 500;
  font-variation-settings: 'opsz' 24;
  letter-spacing: -0.01em;
}

/* ── Columns ────────────────────────── */
.col-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.col-right {
  padding-left: 28px;
  border-left: 1px solid var(--border);
}

.detail-label {
  margin-bottom: 10px;
  color: var(--ink-light);
}

.compact-job {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.job-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  font-variation-settings: 'opsz' 18;
  color: var(--ink);
  line-height: 1.3;
}

.job-company {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-mid);
  margin-top: 3px;
}

.sm-link {
  font-size: 11px;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.social-links-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  list-style: none;
  padding: 0;
}

.compact-certs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
}

.mini-cert {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cert-card {
  background: var(--bg-card);
  padding: 10px 14px;
  border-radius: 4px;
  border: 1px solid var(--border);
  transition: border-color var(--transition), background var(--transition);
}
.cert-card:hover {
  border-color: var(--border-hover);
  background: rgba(255,255,255,0.05);
}

.mini-badge-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: grayscale(100%) brightness(1.2);
}

.mini-cert-name {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 400;
  line-height: 1.3;
  color: var(--ink-mid);
}

.contact-links {
  margin-top: 44px;
}

.social-link {
  font-size: 0.9rem;
  font-family: var(--font-mono);
  font-weight: 400;
  transition: color var(--transition);
}
.social-link:hover { color: var(--ink); }


@media (max-width: 768px) {
  .home-page {
    padding-top: 120px;
    padding-bottom: 64px;
  }
  .col-right {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-top: 32px;
    margin-top: 16px;
  }
  .ascii-art {
    font-size: 5px;
  }
}
</style>
