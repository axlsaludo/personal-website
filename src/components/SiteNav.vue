<template>
  <nav class="nav">
    <!-- Logo — monospace terminal style -->
    <router-link to="/" class="logo">
      <span class="logo-bracket">[</span><span class="logo-text">0xffxa</span><span class="logo-bracket">]</span>
    </router-link>
  </nav>
</template>

<script setup>
defineProps({ personal: Object })
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(10,10,15,0.6);
  border-bottom: 1px solid var(--border);
}

.logo {
  display: flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05em;
  transition: opacity var(--transition);
}
.logo:hover { opacity: 0.7; }
.logo-bracket { color: var(--ink-light); }
.logo-text { color: var(--ink); }

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-light);
  padding: 6px 14px;
  border-radius: 3px;
  border: 1px solid transparent;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}
.nav-item:hover {
  color: var(--ink-mid);
  border-color: var(--border);
}

.nav-pill {
  background: var(--ink);
  color: var(--bg) !important;
  border-color: var(--ink) !important;
}
.nav-pill:hover { color: var(--bg) !important; }

@media (max-width: 480px) {
  .nav { padding: 18px 20px; }
  .nav-item { font-size: 10px; padding: 5px 10px; }
}
</style>
