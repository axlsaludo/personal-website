<template>
  <div class="app-layout">
    <SiteNav :personal="personal" />
    
    <!-- Route transitions -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :personal="personal" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import SiteNav from './components/SiteNav.vue'
import { personal } from './portfolio.config.js'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
