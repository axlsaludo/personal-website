<template>
  <nav class="nav" :class="{ scrolled }">
    <!-- Logo — small italic initial, like reference -->
    <a href="#" class="logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="4" fill="var(--ink)"/>
        <text x="7" y="20" font-family="Georgia,serif" font-size="14"
              font-style="italic" fill="var(--bg)">P</text>
      </svg>
    </a>

    <!-- Nav items — exactly like reference -->
    <ul class="nav-links">
      <li><a href="#intro"   class="nav-item" :class="{ 'nav-pill': active === 'intro'   }">Intro</a></li>
      <li><a href="#exp"     class="nav-item" :class="{ 'nav-pill': active === 'exp'     }">Experience</a></li>
      <li><a href="#certs"   class="nav-item" :class="{ 'nav-pill': active === 'certs'   }">Credentials</a></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
defineProps({ personal: Object })

const scrolled = ref(false)
const active   = ref('intro')

function onScroll() { scrolled.value = window.scrollY > 50 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  const ids = ['intro', 'exp', 'certs']
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) active.value = e.target.id }),
    { threshold: 0.35 }
  )
  ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
  onUnmounted(() => { window.removeEventListener('scroll', onScroll); obs.disconnect() })
})
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 44px;
  border-bottom: 1px solid transparent;
  transition: background 220ms ease, border-color 220ms ease;
}

.scrolled {
  background: rgba(240, 236, 228, 0.93);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-color: var(--border);
}

.logo { display: flex; align-items: center; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mid);
  padding: 5px 14px;
  border-radius: 4px;
  transition: color var(--transition);
}
.nav-item:hover { color: var(--ink); }

@media (max-width: 480px) {
  .nav { padding: 12px 20px; }
}
</style>
