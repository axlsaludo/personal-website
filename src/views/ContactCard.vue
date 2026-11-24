<template>
  <main class="card-viewport">
    <div class="ambient-glow" aria-hidden="true"></div>

    <div
      class="card-stage"
      @pointerdown="maybeRequestGyroPermission"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <div
        class="card-tilt"
        :style="tiltStyle"
      >
        <div
          class="card-flipper"
          :class="{ 'is-flipped': flipped }"
          role="button"
          tabindex="0"
          :aria-label="flipped ? 'Flip card to front' : 'Flip card to QR code'"
          @click="toggleFlip"
          @keydown.enter.self="toggleFlip"
          @keydown.space.self.prevent="toggleFlip"
        >
          <!-- ── Front Face ───────────────────────────── -->
          <section
            class="card-face card-face-front"
            :aria-hidden="flipped"
          >
            <div class="card-glare" :style="glareStyle" aria-hidden="true"></div>

            <!-- Top ID Portrait -->
            <div class="id-photo-wrap">
              <img
                src="/contact-card.png"
                :alt="displayName"
                class="id-photo"
              />
            </div>

            <!-- Front Card Body -->
            <div class="card-front-body">
              <div class="identity-text">
                <h1 class="card-name">{{ displayName }}</h1>
                <p class="card-subtitle">Cloud Developer &amp; AI Engineer</p>
                <p v-if="currentJob" class="card-role">
                  {{ currentJob.role }} · {{ currentJob.company }}
                </p>
              </div>

              <div class="contact-stack">
                <div class="contact-row email-row">
                  <div class="contact-row-main">
                    <span class="row-label">Email</span>
                    <a
                      :href="`mailto:${email}`"
                      class="row-value mono"
                      @click.stop
                    >
                      {{ email }}
                    </a>
                  </div>
                  <button
                    type="button"
                    class="mini-copy-btn"
                    @click.stop="handleCopyEmail"
                  >
                    {{ copied ? 'Copied' : 'Copy' }}
                  </button>
                </div>

                <a
                  v-for="s in socials"
                  :key="s.label"
                  :href="s.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="contact-row social-row"
                  @click.stop
                >
                  <div class="contact-row-main">
                    <span class="row-label">{{ s.label }}</span>
                    <span class="row-value">{{ formatHandle(s.url) }}</span>
                  </div>
                  <span class="row-arrow" aria-hidden="true">↗</span>
                </a>
              </div>

              <div class="card-bottom-strip">
                <div class="qr-preview-hint">
                  <span class="qr-mini-frame">
                    <img
                      v-if="qrDataUrl"
                      :src="qrDataUrl"
                      alt="Contact QR code preview"
                      class="qr-mini-img"
                    />
                  </span>
                  <span class="qr-preview-copy">
                    <span class="qr-preview-title">Scan QR</span>
                    <span class="qr-preview-sub">Click card to flip</span>
                  </span>
                </div>

                <button
                  type="button"
                  class="save-vcf-btn"
                  @click.stop="downloadVCard"
                >
                  Save .vcf
                </button>
              </div>
            </div>
          </section>

          <!-- ── Back Face ────────────────────────────── -->
          <section
            class="card-face card-face-back"
            :aria-hidden="!flipped"
          >
            <div class="card-glare" :style="glareStyle" aria-hidden="true"></div>

            <div class="back-qr-wrap">
              <div class="qr-large-frame">
                <img
                  v-if="qrDataUrl"
                  :src="qrDataUrl"
                  :alt="qrMode === 'vcard' ? 'vCard QR code' : 'Contact card link QR code'"
                  class="qr-large-img"
                />
              </div>

              <div class="qr-mode-switch" role="group" aria-label="QR payload mode">
                <button
                  type="button"
                  class="mode-pill"
                  :class="{ active: qrMode === 'vcard' }"
                  @click.stop="qrMode = 'vcard'"
                >
                  Save Contact
                </button>
                <button
                  type="button"
                  class="mode-pill"
                  :class="{ active: qrMode === 'url' }"
                  @click.stop="qrMode = 'url'"
                >
                  Card Link
                </button>
              </div>

              <div class="back-identity">
                <p class="back-name">{{ displayName }}</p>
                <p class="back-email">{{ email }}</p>
              </div>
            </div>

            <div class="back-actions">
              <button type="button" class="back-btn" @click.stop="handleCopyEmail">
                {{ copied ? 'Copied ✓' : 'Copy email' }}
              </button>
              <button type="button" class="back-btn back-btn-primary" @click.stop="downloadVCard">
                Download .vcf
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>

    <p class="stage-caption">Move to tilt · Click card to flip</p>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import QRCode from 'qrcode'
import { toast } from 'vue-sonner'
import { experience } from '../portfolio.config.js'
import { copyEmail } from '../composables/useUI.js'

const props = defineProps({
  personal: Object,
})

const currentJob = experience[0]
const email = computed(() => props.personal?.email || '0xffxa@gmail.com')
const displayName = computed(() => props.personal?.name || 'Kurt Axl Saludo')
const locationLabel = computed(() => props.personal?.location || 'Manila, Philippines')
const socials = computed(() => props.personal?.socials || [])

const flipped = ref(false)
const qrMode = ref('vcard')
const qrDataUrl = ref('')
const copied = ref(false)

let copyTimer = null
let rafId = null
let reduceMotion = false
let gyroActive = false
let gyroRequested = false
let baseBeta = null
let baseGamma = null
let isPointerHovering = false

const targetTiltX = ref(0)
const targetTiltY = ref(0)
const tiltX = ref(0)
const tiltY = ref(0)
const glareX = ref(50)
const glareY = ref(50)
const glareOpacity = ref(0)

function toggleFlip() {
  maybeRequestGyroPermission()
  flipped.value = !flipped.value
}

function formatHandle(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

const vCardString = computed(() => {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${displayName.value}`,
    'N:Saludo;Kurt Axl;;;',
    `TITLE:${currentJob?.role || 'Cloud Developer & AI Engineer'}`,
    currentJob?.company ? `ORG:${currentJob.company}` : '',
    `EMAIL;TYPE=INTERNET:${email.value}`,
    `ADR;TYPE=HOME:;;${locationLabel.value};;;;`,
    ...socials.value.map((s) => `URL:${s.url}`),
    'END:VCARD',
  ].filter(Boolean)
  return lines.join('\r\n')
})

const qrPayload = computed(() => {
  if (qrMode.value === 'url' && typeof window !== 'undefined') {
    return window.location.href
  }
  return vCardString.value
})

async function generateQr() {
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrPayload.value, {
      width: 440,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0a0a0a',
        light: '#ffffff',
      },
    })
  } catch (err) {
    console.error('QR generation failed:', err)
  }
}

watch(qrPayload, generateQr)

async function handleCopyEmail() {
  const ok = await copyEmail(email.value)
  if (!ok) return
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 1800)
}

function downloadVCard() {
  const blob = new Blob([vCardString.value], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'kurt-axl-saludo.vcf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success('Contact card saved', { description: 'kurt-axl-saludo.vcf' })
}

function animateTilt() {
  const ease = 0.1
  tiltX.value += (targetTiltX.value - tiltX.value) * ease
  tiltY.value += (targetTiltY.value - tiltY.value) * ease

  const settled =
    Math.abs(targetTiltX.value - tiltX.value) < 0.02 &&
    Math.abs(targetTiltY.value - tiltY.value) < 0.02

  if (settled) {
    tiltX.value = targetTiltX.value
    tiltY.value = targetTiltY.value
    rafId = null
    return
  }

  rafId = requestAnimationFrame(animateTilt)
}

function scheduleTiltFrame() {
  if (rafId === null) {
    rafId = requestAnimationFrame(animateTilt)
  }
}

function onPointerMove(event) {
  if (reduceMotion || event.pointerType === 'touch') return
  const rect = event.currentTarget?.getBoundingClientRect()
  if (!rect) return

  isPointerHovering = true
  const px = (event.clientX - rect.left) / rect.width
  const py = (event.clientY - rect.top) / rect.height
  const clampedX = Math.max(0, Math.min(1, px))
  const clampedY = Math.max(0, Math.min(1, py))

  const maxDeg = 5.5
  targetTiltY.value = (clampedX - 0.5) * 2 * maxDeg
  targetTiltX.value = -(clampedY - 0.5) * 2 * maxDeg
  glareX.value = clampedX * 100
  glareY.value = clampedY * 100
  glareOpacity.value = 1
  scheduleTiltFrame()
}

function onPointerLeave() {
  isPointerHovering = false
  targetTiltX.value = 0
  targetTiltY.value = 0
  glareOpacity.value = 0
  scheduleTiltFrame()
}

function onDeviceOrientation(event) {
  if (reduceMotion || isPointerHovering) return
  if (event.beta == null || event.gamma == null) return

  if (baseBeta === null || baseGamma === null) {
    baseBeta = event.beta
    baseGamma = event.gamma
  }

  const maxGyroDeg = 6
  const dy = Math.max(-maxGyroDeg, Math.min(maxGyroDeg, (event.gamma - baseGamma) * 0.22))
  const dx = Math.max(-maxGyroDeg, Math.min(maxGyroDeg, -(event.beta - baseBeta) * 0.22))

  targetTiltY.value = dy
  targetTiltX.value = dx
  glareX.value = 50 + (dy / maxGyroDeg) * 35
  glareY.value = 50 - (dx / maxGyroDeg) * 35
  glareOpacity.value = 0.75
  scheduleTiltFrame()
}

function attachGyroListener() {
  if (gyroActive || typeof window === 'undefined') return
  window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true })
  gyroActive = true
}

function enableGyro() {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window) || reduceMotion) return
  if (typeof DeviceOrientationEvent.requestPermission === 'function') return
  attachGyroListener()
}

async function maybeRequestGyroPermission() {
  if (gyroActive || gyroRequested || reduceMotion) return
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
    attachGyroListener()
    return
  }

  gyroRequested = true
  try {
    const res = await DeviceOrientationEvent.requestPermission()
    if (res === 'granted') {
      attachGyroListener()
    }
  } catch {}
}

const tiltStyle = computed(() => ({
  transform: `rotateX(${tiltX.value.toFixed(2)}deg) rotateY(${tiltY.value.toFixed(2)}deg)`,
}))

const glareStyle = computed(() => ({
  '--gx': `${glareX.value.toFixed(1)}%`,
  '--gy': `${glareY.value.toFixed(1)}%`,
  '--glare-opacity': glareOpacity.value,
}))

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  enableGyro()
  generateQr()
})

onUnmounted(() => {
  clearTimeout(copyTimer)
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (gyroActive && typeof window !== 'undefined') {
    window.removeEventListener('deviceorientation', onDeviceOrientation)
  }
})
</script>

<style scoped>
.card-viewport {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #000000;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.045) 0%, transparent 66%);
  pointer-events: none;
  z-index: 0;
}

.card-stage {
  position: relative;
  z-index: 1;
  perspective: 1200px;
  padding: 12px;
}

.card-tilt {
  width: min(400px, calc(100vw - 32px));
  height: 644px;
  transform-style: preserve-3d;
  will-change: transform;
}

.card-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 680ms cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
}

.card-flipper.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #242424;
  background: linear-gradient(160deg, #111111 0%, #09090b 55%, #050505 100%);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  transform-style: preserve-3d;
}

.card-face-front {
  padding: 0;
  pointer-events: auto;
}

.card-flipper.is-flipped .card-face-front {
  pointer-events: none;
}

.card-face-back {
  padding: 24px 22px;
  justify-content: space-between;
  transform: rotateY(180deg);
  pointer-events: none;
}

.card-flipper.is-flipped .card-face-back {
  pointer-events: auto;
}

.card-glare {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: var(--glare-opacity, 0);
  background: radial-gradient(
    280px circle at var(--gx, 50%) var(--gy, 50%),
    rgba(255, 255, 255, 0.085),
    transparent 65%
  );
  transition: opacity 260ms ease;
  z-index: 4;
}

/* ── Top ID Portrait ──────────────────────────── */
.id-photo-wrap {
  position: relative;
  width: 100%;
  height: 232px;
  flex-shrink: 0;
  background: #000000;
  border-bottom: 1px solid #1b1b1e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.id-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

/* ── Front Body ───────────────────────────────── */
.card-front-body {
  position: relative;
  z-index: 3;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 22px 20px;
}

.identity-text {
  transform: translateZ(14px);
}

.card-name {
  font-family: var(--font-sans);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--ink);
}

.card-subtitle {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 15px;
  color: #e4e4e7;
  line-height: 1.3;
  margin-top: 2px;
}

.card-role {
  font-family: var(--font-sans);
  font-size: 11.5px;
  color: var(--ink-mid);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Contact Info Stack ───────────────────────── */
.contact-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid #1b1b1e;
  background: rgba(255, 255, 255, 0.025);
  transition: border-color var(--transition), background var(--transition), transform var(--transition);
}

.contact-row:hover {
  border-color: #2f2f35;
  background: rgba(255, 255, 255, 0.05);
}

.social-row:hover {
  transform: translateX(2px);
}

.contact-row-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.row-label {
  font-family: var(--font-sans);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-light);
}

.row-value {
  font-size: 12.5px;
  color: #e4e4e7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-value.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.mini-copy-btn {
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-mid);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid #2b2b30;
  background: #141416;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}

.mini-copy-btn:hover {
  color: var(--ink);
  border-color: #4a4a52;
  background: #1d1d21;
}

.row-arrow {
  font-size: 12px;
  color: var(--ink-light);
  transition: transform var(--transition), color var(--transition);
}

.social-row:hover .row-arrow {
  color: var(--ink);
  transform: translate(2px, -2px);
}

/* ── Bottom QR & Save Strip ───────────────────── */
.card-bottom-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #1b1b1e;
}

.qr-preview-hint {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qr-mini-frame {
  width: 52px;
  height: 52px;
  padding: 3px;
  border-radius: 6px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-mini-img {
  width: 100%;
  height: 100%;
  display: block;
}

.qr-preview-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.qr-preview-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink);
}

.qr-preview-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-light);
}

.save-vcf-btn {
  padding: 8px 15px;
  border-radius: var(--radius-pill);
  background: #ffffff;
  color: #000000;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: background var(--transition), transform var(--transition);
}

.save-vcf-btn:hover {
  background: #e5e5e5;
  transform: translateY(-1px);
}

/* ── Back Face ────────────────────────────────── */
.back-qr-wrap {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: auto 0;
}

.qr-large-frame {
  width: 220px;
  height: 220px;
  padding: 12px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.7);
}

.qr-large-img {
  width: 100%;
  height: 100%;
  display: block;
}

.qr-mode-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: var(--radius-pill);
  border: 1px solid #222226;
  background: #0d0d0f;
}

.mode-pill {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-mid);
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  transition: color var(--transition), background var(--transition);
}

.mode-pill.active {
  background: #ffffff;
  color: #000000;
}

.back-identity {
  text-align: center;
}

.back-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

.back-email {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-mid);
  margin-top: 2px;
}

.back-actions {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.back-btn {
  padding: 10px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid #2b2b30;
  background: #121214;
  color: var(--ink-mid);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}

.back-btn:hover {
  color: var(--ink);
  border-color: #4a4a52;
  background: #1a1a1d;
}

.back-btn-primary {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
}

.back-btn-primary:hover {
  background: #e5e5e5;
  color: #000000;
  border-color: #e5e5e5;
}

.stage-caption {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--ink-light);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .card-flipper {
    transition: none;
  }
  .card-glare {
    display: none;
  }
}

@media (max-width: 440px) {
  .card-tilt {
    height: 606px;
  }
  .id-photo-wrap {
    height: 204px;
  }
  .card-front-body {
    padding: 14px 18px 18px;
  }
}
</style>
