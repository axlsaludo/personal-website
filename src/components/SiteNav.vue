<template>
  <nav class="nav">
    <!-- Logo — small italic initial, like reference -->
    <router-link to="/" class="logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="4" fill="var(--ink)"/>
        <text x="7" y="20" font-family="Georgia,serif" font-size="14"
              font-style="italic" fill="var(--bg)">axl-saludo</text>
      </svg>
    </router-link>

    <!-- Nav items — router links -->
    <ul class="nav-links">
      <li><router-link to="/"            class="nav-item" active-class="nav-pill" exact>Intro</router-link></li>
      <li><router-link to="/experience"  class="nav-item" active-class="nav-pill">Experience</router-link></li>
      <li><router-link to="/credentials" class="nav-item" active-class="nav-pill">Credentials</router-link></li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({ personal: Object })
</script>

<style scoped>
.nav {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 44px;
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

/* Vue router sets active-class automatically */
.nav-pill {
  background: var(--ink);
  color: var(--bg);
}
.nav-pill:hover { color: var(--bg); }

@media (max-width: 480px) {
  .nav { padding: 20px 20px; }
}
</style>
