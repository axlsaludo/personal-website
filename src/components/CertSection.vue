<template>
  <section id="certs" class="section">
    <div class="container">
      <p class="eyebrow">Credentials</p>
      
      <div class="certs-wrap">
        <h2 class="display-head" style="text-align: center; margin-bottom: 48px;">
          Certifications <span class="hi" style="font-size: 0.6em; vertical-align: middle;">({{ certifications.length }})</span>
        </h2>

        <!-- Always visible: latest 2 certs -->
        <div class="certs-list">
          <div v-for="cert in visibleCerts" :key="cert.id" class="cert-item">
            <div class="cert-header">
              <span class="cert-name">{{ cert.name }}</span>
              <span class="label-sc">{{ cert.date }}</span>
            </div>
            <div class="cert-footer">
              <span class="cert-issuer"><em>{{ cert.issuer }}</em></span>
              <a v-if="cert.verifyUrl" :href="cert.verifyUrl" target="_blank" rel="noopener" class="text-link">Verify ↗</a>
            </div>
          </div>
        </div>

        <!-- Expandable remaining certs -->
        <div v-if="hiddenCerts.length > 0" class="expand-wrap">
          <transition name="expand">
            <div v-if="expanded" class="certs-list hidden-certs">
              <div v-for="cert in hiddenCerts" :key="cert.id" class="cert-item">
                <div class="cert-header">
                  <span class="cert-name">{{ cert.name }}</span>
                  <span class="label-sc">{{ cert.date }}</span>
                </div>
                <div class="cert-footer">
                  <span class="cert-issuer"><em>{{ cert.issuer }}</em></span>
                  <a v-if="cert.verifyUrl" :href="cert.verifyUrl" target="_blank" rel="noopener" class="text-link">Verify ↗</a>
                </div>
              </div>
            </div>
          </transition>
          
          <div style="text-align: center; margin-top: 32px;">
            <button class="expand-btn" @click="expanded = !expanded">
              <span class="label-sc">{{ expanded ? '— Show less' : `+ Show ${hiddenCerts.length} more` }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ certifications: Array, personal: Object })
const expanded = ref(false)

const VISIBLE_COUNT = 2
const visibleCerts = computed(() => props.certifications.slice(0, VISIBLE_COUNT))
const hiddenCerts = computed(() => props.certifications.slice(VISIBLE_COUNT))
</script>

<style scoped>
.certs-wrap {
  max-width: 680px;
  margin: 0 auto;
}

.certs-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-dim);
}

.cert-item {
  padding: 24px 0;
  border-bottom: 1px solid var(--border-dim);
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.cert-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--ink);
  font-family: var(--font-display);
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

.expand-enter-active,
.expand-leave-active {
  transition: max-height 350ms ease, opacity 350ms ease;
  max-height: 800px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-btn {
  border-bottom: 1px solid var(--border);
  padding-bottom: 2px;
  transition: border-color var(--transition);
}

.expand-btn:hover {
  border-color: var(--ink);
}
</style>
