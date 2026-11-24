<template>
  <DrawerRoot v-model:open="contactOpen">
    <DrawerPortal>
      <DrawerOverlay class="drawer-overlay" />
      <DrawerContent class="drawer-content">
        <div class="drawer-handle-wrap">
          <div class="drawer-handle" aria-hidden="true"></div>
        </div>

        <div class="drawer-body">
          <p class="label drawer-eyebrow">Get in touch</p>
          <DrawerTitle class="drawer-title">Let's connect.</DrawerTitle>
          <DrawerDescription class="drawer-desc">
            Direct email or find me across the web.
          </DrawerDescription>

          <div class="email-card">
            <span class="email-address">{{ email }}</span>
            <div class="email-actions">
              <button type="button" class="drawer-btn" @click="handleCopy">
                {{ copied ? 'Copied ✓' : 'Copy' }}
              </button>
              <a :href="`mailto:${email}`" class="drawer-btn drawer-btn-primary">
                Open mail <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div v-if="personal?.socials?.length" class="drawer-socials">
            <a
              v-for="s in personal.socials"
              :key="s.label"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="drawer-social-row"
            >
              <span class="social-label">{{ s.label }}</span>
              <span class="social-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import {
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from 'vaul-vue'
import { contactOpen, copyEmail } from '../composables/useUI.js'

const props = defineProps({
  personal: Object,
})

const email = computed(() => props.personal?.email || '0xffxa@gmail.com')
const copied = ref(false)
let copyTimer = null

async function handleCopy() {
  const ok = await copyEmail(email.value)
  if (!ok) return
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 1800)
}

onUnmounted(() => {
  clearTimeout(copyTimer)
})
</script>

<style scoped>
:global(.drawer-overlay) {
  position: fixed;
  inset: 0;
  z-index: 210;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

:global(.drawer-content) {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 211;
  margin: 0 auto;
  width: 100%;
  max-width: 520px;
  background: #0a0a0a;
  border: 1px solid #222222;
  border-bottom: none;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.85);
  outline: none;
}

.drawer-handle-wrap {
  display: flex;
  justify-content: center;
  padding: 12px 0 6px;
}

.drawer-handle {
  width: 36px;
  height: 4px;
  border-radius: 99px;
  background: #2c2c2e;
}

.drawer-body {
  padding: 12px 24px 28px;
}

.drawer-eyebrow {
  margin-bottom: 8px;
}

.drawer-title {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 4px;
}

.drawer-desc {
  font-size: 13px;
  color: var(--ink-mid);
  margin-bottom: 20px;
}

.email-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-sm);
  background: #111111;
  margin-bottom: 14px;
}

.email-address {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--ink);
  word-break: break-all;
}

.email-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-hover);
  background: transparent;
  color: var(--ink-mid);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}

.drawer-btn:hover {
  color: var(--ink);
  border-color: #444444;
  background: rgba(255, 255, 255, 0.05);
}

.drawer-btn-primary {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}

.drawer-btn-primary:hover {
  background: #e5e5e5;
  color: var(--bg);
  border-color: #e5e5e5;
}

.drawer-socials {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer-social-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--ink-mid);
  font-size: 13px;
  transition: border-color var(--transition), background var(--transition), color var(--transition), transform var(--transition);
}

.drawer-social-row:hover {
  border-color: #2a2a2a;
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink);
  transform: translateX(3px);
}

.social-arrow {
  font-size: 12px;
  color: var(--ink-light);
  transition: transform var(--transition), color var(--transition);
}

.drawer-social-row:hover .social-arrow {
  color: var(--ink);
  transform: translate(2px, -2px);
}

@media (max-width: 480px) {
  .drawer-body {
    padding: 10px 18px 24px;
  }
}
</style>
