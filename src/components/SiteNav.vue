<template>
  <nav class="nav">
    <!-- Logo with Kurt Axl Saludo -->
    <router-link to="/" class="logo">
      <span class="logo-name">Kurt Axl Saludo</span>
      <span class="logo-handle">0xffxa</span>
    </router-link>

    <!-- Nav links — minimal, right-aligned -->
    <div class="nav-links">
      <a href="mailto:0xffxa@gmail.com" class="nav-item">Contact</a>
    </div>
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
  padding: 18px 40px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #141414;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  text-decoration: none;
  transition: opacity var(--transition);
}
.logo:hover { opacity: 0.7; }

.logo-name {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.logo-handle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-light);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 400;
  color: var(--ink-mid);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}
.nav-item:hover {
  color: var(--ink);
  border-color: var(--border-hover);
  background: rgba(255,255,255,0.04);
}

@media (max-width: 480px) {
  .nav { padding: 14px 20px; }
  .logo-handle { display: none; }
}
</style>
