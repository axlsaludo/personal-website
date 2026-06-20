<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-left">
          <h2 class="display-head" style="margin-bottom: 12px;">{{ personal.name }}</h2>
          <p class="footer-role"><em>{{ personal.title }}</em></p>
          <a :href="`mailto:${personal.email}`" class="text-link" style="font-size: 1.1rem; margin-top: 24px; display: inline-block;">
            {{ personal.email }}
          </a>
        </div>
        
        <div class="footer-right">
          <p class="label-sc" style="margin-bottom: 16px;">Socials</p>
          <ul class="socials-list">
            <li v-for="s in personal.socials" :key="s.label">
              <a :href="s.url" target="_blank" rel="noopener" class="text-link">
                {{ s.label }} ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <span class="label-sc">© {{ year }} {{ personal.name }}</span>
        <span class="label-sc">Built with Vue 3 · Vercel</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
defineProps({ personal: Object })
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--bg-section);
  padding: 80px 0 40px;
  border-top: 1px solid var(--border-dim);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 48px;
  margin-bottom: 80px;
}

.footer-role {
  font-size: 1.1rem;
  color: var(--ink-mid);
}

.socials-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

@media (max-width: 600px) {
  .footer-inner { flex-direction: column; }
}
</style>
