<template>
  <div class="page-layout">
    <div class="container" style="max-width: 680px; padding-top: 140px;">
      <p class="eyebrow">Credentials</p>
      
      <h2 class="display-head" style="text-align: center; margin-bottom: 48px;">
        Live Certifications
        <span v-if="!loading" class="hi" style="font-size: 0.6em; vertical-align: middle;">({{ badges.length }})</span>
      </h2>

      <div v-if="loading" style="text-align: center; padding: 40px 0;">
        <span class="label-sc">Fetching from Credly...</span>
      </div>

      <div v-else-if="error" style="text-align: center; padding: 40px 0; color: #a05050;">
        <p class="body-para">Unable to load badges from Credly.</p>
        <p class="label-sc" style="margin-top: 8px;">{{ error }}</p>
      </div>

      <div v-else class="certs-list">
        <div v-for="badge in badges" :key="badge.id" class="cert-item cert-card">
          <div style="display: flex; gap: 20px; align-items: center;">
            <img v-if="badge.image_url" :src="badge.image_url" alt="Badge Image" class="badge-img" />
            
            <div style="flex: 1;">
              <div class="cert-header">
                <span class="cert-name">{{ badge.badge_template.name }}</span>
                <span class="label-sc">{{ formatDate(badge.issued_at) }}</span>
              </div>
              <div class="cert-footer">
                <span class="cert-issuer"><em>{{ badge.issuer.summary }}</em></span>
                <a :href="badge.badge_template.url" target="_blank" rel="noopener" class="text-link">View ↗</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 64px; padding-bottom: 64px;">
        <router-link to="/" class="text-link">← Back to Intro</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCredly, formatDate } from '../composables/useCredly.js'

const { badges, loading, error, fetchBadges } = useCredly()

onMounted(() => {
  fetchBadges()
})
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  overflow-y: auto;
}

.certs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid var(--border-dim);
  padding-top: 24px;
}

.cert-card {
  background: var(--border-dim); /* matching Home view */
  padding: 20px;
  border-radius: 8px;
  transition: transform var(--transition);
}
.cert-card:hover {
  transform: translateY(-2px);
}

.badge-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 4px;
}

.cert-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--ink);
  font-family: var(--font-display);
  line-height: 1.3;
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cert-issuer {
  font-size: 0.95rem;
  color: var(--ink-mid);
}
</style>
