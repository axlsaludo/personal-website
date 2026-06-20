<template>
  <div class="home-page">
    <div class="container h-full">
      <div class="intro-content">
        
        <!-- 3D WebGL Hero Component -->
        <div class="reveal" ref="eyebrowEl">
          <RaspberryPi3D />
        </div>

        <div class="two-col reveal" ref="bodyEl" style="margin-top: -20px;">
          <!-- Column 1: Philosophy -->
          <div class="col-left">
            <h2 class="body-para tech-statement">
              Simply put, I believe <span class="hi">good engineering</span> isn't just
              writing code. It's a combination of problem solving and
              <span class="hi">systems thinking</span> — and more over, work done right,
              <span class="hi-warm">has impact.</span> It shapes products, informs
              scale, and inspires trust. And let me tell you, <span class="hi">I do it right.</span>
            </h2>
            
            <div class="contact-links">
              <span class="label-sc detail-label">Links</span>
              <ul class="compact-certs">
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
              <span class="label-sc detail-label">Current Role</span>
              <div class="compact-job">
                <span class="job-title">{{ currentJob.role }}</span>
                <span class="job-company"><em>{{ currentJob.company }}</em></span>
              </div>
              <router-link to="/experience" class="text-link sm-link">View all experience ↗</router-link>
            </div>

            <!-- Top Certifications -->
            <div class="top-certs" style="margin-top: 32px;">
              <span class="label-sc detail-label">Latest Certifications</span>
              
              <div v-if="loading" class="body-para" style="font-size: 12px;">Fetching from Credly...</div>
              <div v-else-if="error" class="body-para" style="font-size: 12px; color: #a05050;">Unavailable</div>
              <div v-else class="compact-certs">
                <div v-for="badge in topBadges" :key="badge.id" class="mini-cert cert-card">
                  <img v-if="badge.image_url" :src="badge.image_url" alt="" class="mini-badge-img" />
                  <span class="mini-cert-name">{{ badge.badge_template.name }}</span>
                </div>
              </div>
              
              <router-link to="/credentials" class="text-link sm-link" style="margin-top: 8px; display: inline-block;">
                View all {{ badges.length }} credentials ↗
              </router-link>
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
import RaspberryPi3D from '../components/RaspberryPi3D.vue'

defineProps({ personal: Object })

const currentJob = experience[0] // First item is the current role

const { badges, loading, error, fetchBadges } = useCredly()
const topBadges = computed(() => badges.value.slice(0, 3))

const eyebrowEl = ref(null)
const bodyEl    = ref(null)

onMounted(() => {
  fetchBadges()
  
  const els = [eyebrowEl, bodyEl]
  els.forEach((el, i) => {
    if (!el.value) return
    setTimeout(() => el.value.classList.add('visible'), 50 + i * 100)
  })
})
</script>

<style scoped>
.tech-statement {
  font-family: var(--font-display);
  font-size: 1.3rem;
  line-height: 1.95;
  color: var(--ink);
  font-weight: 500;
  letter-spacing: -0.02em;
}

.home-page {
  height: 100vh;
  min-height: 800px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.h-full { width: 100%; }

.col-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.col-right {
  padding-left: 24px;
  border-left: 1px solid var(--border-dim);
}

.detail-label {
  margin-bottom: 8px;
  color: var(--ink-light);
}

.compact-job {
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
}

.job-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.3;
}

.job-company {
  font-size: 0.9rem;
  color: var(--ink-mid);
}

.sm-link {
  font-size: 12px;
  font-style: italic;
  font-family: var(--font-display);
}

.compact-certs {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
}

.mini-cert {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cert-card {
  background: var(--border-dim); /* subtle darker cream */
  padding: 10px 14px;
  border-radius: 6px;
  transition: transform var(--transition);
}
.cert-card:hover {
  transform: translateY(-2px);
}

.mini-badge-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.mini-cert-name {
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink-mid);
}

.contact-links {
  margin-top: 40px;
}

.social-link {
  font-size: 1.05rem;
  font-family: var(--font-display);
  font-weight: 500;
}


@media (max-width: 768px) {
  .home-page {
    height: auto;
    overflow: visible;
    padding-top: 120px;
    padding-bottom: 64px;
  }
  .col-right {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border-dim);
    padding-top: 32px;
    margin-top: 16px;
  }
}
</style>
