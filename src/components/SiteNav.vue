<template>
  <nav class="nav">
    <!-- Logo -->
    <router-link to="/" class="logo">0xffxa</router-link>

    <!-- Nav links — artsandiego style: minimal, right-aligned -->
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
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #111;
}

.logo {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ink);
  transition: opacity var(--transition);
}
.logo:hover { opacity: 0.6; }

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
  .nav { padding: 16px 20px; }
}
</style>
