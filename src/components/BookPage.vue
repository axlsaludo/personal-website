<template>
  <div class="book-wrap">
    <div class="book-page">

      <!-- ══ Running header ══════════════════════════════════ -->
      <header class="running-head">
        <span class="sc">{{ personal.name }}</span>
        <span class="running-dots">· · ·</span>
        <span class="sc">{{ personal.title }}</span>
      </header>
      <div class="page-rule"></div>

      <!-- ══ Spread ══════════════════════════════════════════ -->
      <div class="spread">

        <!-- ── LEFT PAGE: Identity + Contact ─────────────── -->
        <div class="page-left">

          <!-- Name display -->
          <h1 class="book-name">{{ personal.name }}</h1>
          <p class="book-role">
            <em>{{ personal.title }}</em>
          </p>

          <div class="ornament">✦</div>

          <!-- Bio — drop cap on first letter -->
          <p class="bio-text drop-cap">{{ personal.bio }}</p>

          <!-- Highlighted tagline -->
          <p class="tagline">
            <span class="hi">{{ personal.tagline }}</span>
          </p>

          <div class="ornament">◆</div>

          <!-- Contact -->
          <section class="contact-section">
            <h2 class="section-head sc">Contact</h2>
            <div class="contact-list">
              <div class="contact-row">
                <span class="contact-key sc">Location</span>
                <span>{{ personal.location }}</span>
              </div>
              <div class="contact-row">
                <span class="contact-key sc">Email</span>
                <a :href="`mailto:${personal.email}`" class="ink-link">{{ personal.email }}</a>
              </div>
              <div
                v-for="s in personal.socials"
                :key="s.label"
                class="contact-row"
              >
                <span class="contact-key sc">{{ s.label }}</span>
                <a :href="s.url" target="_blank" rel="noopener" class="ink-link">
                  {{ s.url.replace('https://', '') }} ↗
                </a>
              </div>
            </div>
          </section>

        </div>

        <!-- ── Gutter / spine ─────────────────────────────── -->
        <div class="gutter">
          <div class="gutter-line"></div>
        </div>

        <!-- ── RIGHT PAGE: Experience + Certs ────────────── -->
        <div class="page-right">

          <!-- Experience -->
          <section class="exp-section">
            <h2 class="section-head sc">Experience</h2>

            <div
              v-for="(job, i) in experience"
              :key="job.id"
              class="job-entry"
              :class="{ 'job-entry--last': i === experience.length - 1 }"
            >
              <div class="job-header">
                <div class="job-title-block">
                  <h3 class="job-role">{{ job.role }}</h3>
                  <p class="job-meta">
                    <em>{{ job.company }}</em>
                    <span class="mid-dot">·</span>
                    {{ job.location }}
                  </p>
                </div>
                <span class="job-period sc">{{ job.period }}</span>
              </div>
              <ul class="job-bullets">
                <li v-for="b in job.bullets" :key="b">{{ b }}</li>
              </ul>
            </div>
          </section>

          <div class="ornament">✦</div>

          <!-- Certifications -->
          <section class="certs-section">
            <h2 class="section-head sc">
              Certifications
              <span class="cert-count sc">({{ certifications.length }})</span>
            </h2>

            <!-- Always visible: latest (first in config) -->
            <div
              v-for="cert in visibleCerts"
              :key="cert.id"
              class="cert-entry"
            >
              <div class="cert-main">
                <span class="cert-name">{{ cert.name }}</span>
                <span class="cert-date sc">{{ cert.date }}</span>
              </div>
              <p class="cert-issuer">{{ cert.issuer }}</p>
              <a
                v-if="cert.verifyUrl"
                :href="cert.verifyUrl"
                target="_blank"
                rel="noopener"
                class="cert-verify sc"
              >Verify ↗</a>
            </div>

            <!-- Expandable: remaining certs -->
            <div v-if="hiddenCerts.length > 0">
              <transition name="expand">
                <div v-if="certsExpanded" class="hidden-certs">
                  <div
                    v-for="cert in hiddenCerts"
                    :key="cert.id"
                    class="cert-entry"
                  >
                    <div class="cert-main">
                      <span class="cert-name">{{ cert.name }}</span>
                      <span class="cert-date sc">{{ cert.date }}</span>
                    </div>
                    <p class="cert-issuer">{{ cert.issuer }}</p>
                    <a
                      v-if="cert.verifyUrl"
                      :href="cert.verifyUrl"
                      target="_blank"
                      rel="noopener"
                      class="cert-verify sc"
                    >Verify ↗</a>
                  </div>
                </div>
              </transition>

              <button class="expand-btn sc" @click="certsExpanded = !certsExpanded">
                {{ certsExpanded
                    ? '— Show less'
                    : `+ ${hiddenCerts.length} more certification${hiddenCerts.length > 1 ? 's' : ''}` }}
              </button>
            </div>

            <!-- Link to Credly -->
            <a
              v-if="credlyUrl"
              :href="credlyUrl"
              target="_blank"
              rel="noopener"
              class="credly-link sc"
            >
              View all badges on Credly ↗
            </a>
          </section>

        </div>
      </div>

      <!-- ══ Page footer ══════════════════════════════════════ -->
      <div class="page-rule"></div>
      <footer class="page-footer">
        <span class="sc footer-copy">© {{ year }} {{ personal.name }}</span>
        <span class="footer-ornament">◆</span>
        <span class="sc footer-built">Vue 3 · Vercel</span>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  personal,
  experience,
  certifications,
} from '../portfolio.config.js'

const year = new Date().getFullYear()
const certsExpanded = ref(false)

// Show 2 certs by default (most recent = first in config)
const VISIBLE_COUNT = 2
const visibleCerts = computed(() => certifications.slice(0, VISIBLE_COUNT))
const hiddenCerts  = computed(() => certifications.slice(VISIBLE_COUNT))

const credlyUrl = personal.socials.find(s => s.label === 'Credly')?.url
</script>

<style scoped>
/* ── Book wrapper (outside the page, the "desk") ─────── */
.book-wrap {
  width: 100%;
  max-width: 1020px;
}

/* ── The book page itself ────────────────────────────── */
.book-page {
  background: var(--paper);
  padding: 48px 56px 36px;
  box-shadow:
    0 2px  4px rgba(40,32,15,0.08),
    0 8px 24px rgba(40,32,15,0.12),
    0 24px 64px rgba(40,32,15,0.10),
    inset 0 0 0 1px rgba(200,188,168,0.4);
  position: relative;
}

/* Subtle inner paper vignette */
.book-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(40,32,15,0.04) 100%);
  pointer-events: none;
}

/* ── Running header ──────────────────────────────────── */
.running-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 10px;
  color: var(--ink-light);
  letter-spacing: 0.12em;
  margin-bottom: 14px;
}

.running-dots { color: var(--ink-dim); }

/* ── Page horizontal rule ────────────────────────────── */
.page-rule {
  height: 1px;
  background: var(--rule);
  margin: 0 0;
}

/* ── Spread (two-column book) ────────────────────────── */
.spread {
  display: grid;
  grid-template-columns: 1fr 32px 1fr;
  gap: 0;
  padding: 40px 0 32px;
  min-height: 680px;
}

/* ── Left page ───────────────────────────────────────── */
.page-left {
  padding-right: 40px;
}

/* Name */
.book-name {
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 72;
  font-size: clamp(2.2rem, 4.5vw, 3.4rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.0;
  color: var(--ink);
  margin-bottom: 8px;
}

/* Role — italic Lora */
.book-role {
  font-size: 1rem;
  font-style: italic;
  color: var(--ink-mid);
  margin-bottom: 0;
}

/* Ornament */
.ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ink-dim);
  font-size: 10px;
  margin: 20px 0;
}
.ornament::before,
.ornament::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rule);
}

/* Bio — Lora body with drop cap */
.bio-text {
  font-size: 0.93rem;
  line-height: 1.8;
  color: var(--ink-mid);
  text-align: justify;
  hyphens: auto;
  margin-bottom: 16px;
}

.drop-cap::first-letter {
  font-family: var(--font-display);
  font-size: 3.2em;
  font-weight: 700;
  float: left;
  line-height: 0.78;
  padding-right: 6px;
  padding-top: 4px;
  color: var(--ink);
}

/* Tagline highlight */
.tagline {
  font-size: 0.88rem;
  line-height: 1.7;
  font-style: italic;
}

/* Contact */
.contact-section { }

.section-head {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-light);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.contact-list {
  display: flex;
  flex-direction: column;
}

.contact-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 7px 0;
  border-bottom: 1px solid var(--paper-shadow);
  font-size: 0.85rem;
}

.contact-key {
  color: var(--ink-light);
  min-width: 68px;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.ink-link {
  color: var(--ink-mid);
  border-bottom: 1px solid var(--ink-dim);
  padding-bottom: 1px;
  transition: color var(--transition), border-color var(--transition);
  word-break: break-all;
}
.ink-link:hover { color: var(--ink); border-color: var(--ink); }

/* ── Gutter / spine ──────────────────────────────────── */
.gutter {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.gutter-line {
  width: 1px;
  background: linear-gradient(to bottom, transparent 0%, var(--rule) 10%, var(--rule) 90%, transparent 100%);
  height: 100%;
}

/* ── Right page ──────────────────────────────────────── */
.page-right {
  padding-left: 40px;
}

/* Experience */
.exp-section {
  margin-bottom: 0;
}

.job-entry {
  padding: 14px 0;
  border-bottom: 1px solid var(--paper-shadow);
}

.job-entry--last {
  border-bottom: none;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.job-role {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 2px;
  font-variation-settings: 'opsz' 18;
}

.job-meta {
  font-size: 0.82rem;
  font-style: italic;
  color: var(--ink-mid);
}

.mid-dot {
  margin: 0 4px;
  color: var(--ink-dim);
}

.job-period {
  font-size: 0.75rem;
  color: var(--ink-light);
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--rule);
  padding: 2px 8px;
}

.job-bullets {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.job-bullets li {
  font-size: 0.84rem;
  line-height: 1.65;
  color: var(--ink-mid);
  padding-left: 14px;
  position: relative;
  text-align: justify;
  hyphens: auto;
}

.job-bullets li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--ink-dim);
  font-size: 0.75rem;
  top: 1px;
}

/* Certifications */
.certs-section { }

.cert-count {
  color: var(--ink-light);
  font-weight: 400;
  margin-left: 4px;
}

.cert-entry {
  padding: 12px 0;
  border-bottom: 1px solid var(--paper-shadow);
}

.cert-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.cert-name {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.4;
}

.cert-date {
  font-size: 0.75rem;
  color: var(--ink-light);
  white-space: nowrap;
}

.cert-issuer {
  font-size: 0.8rem;
  font-style: italic;
  color: var(--ink-light);
  margin-bottom: 4px;
}

.cert-verify {
  font-size: 0.75rem;
  color: var(--ink-light);
  border-bottom: 1px solid var(--ink-dim);
  padding-bottom: 1px;
  transition: color var(--transition);
}
.cert-verify:hover { color: var(--ink); }

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 250ms ease, max-height 350ms ease;
  max-height: 600px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-btn {
  margin-top: 12px;
  font-size: 0.78rem;
  color: var(--ink-light);
  border-bottom: 1px solid var(--ink-dim);
  padding-bottom: 1px;
  cursor: pointer;
  letter-spacing: 0.08em;
  transition: color var(--transition);
  display: block;
}
.expand-btn:hover { color: var(--ink); }

.credly-link {
  display: block;
  margin-top: 14px;
  font-size: 0.78rem;
  color: var(--ink-light);
  border-bottom: 1px solid var(--ink-dim);
  padding-bottom: 1px;
  width: fit-content;
  transition: color var(--transition);
}
.credly-link:hover { color: var(--ink); }

/* ── Page footer ─────────────────────────────────────── */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding-top: 14px;
  font-size: 9.5px;
  color: var(--ink-dim);
  letter-spacing: 0.1em;
}

.footer-ornament { font-size: 7px; }

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 760px) {
  body { padding: 16px 8px 32px; }
  .book-page { padding: 32px 24px 24px; }
  .spread { grid-template-columns: 1fr; }
  .gutter { display: none; }
  .page-left { padding-right: 0; padding-bottom: 32px; border-bottom: 1px solid var(--rule); margin-bottom: 32px; }
  .page-right { padding-left: 0; }
  .spread { min-height: unset; }
}

@media (max-width: 480px) {
  .book-page { padding: 24px 16px 20px; }
  .book-name { font-size: 2rem; }
}
</style>
