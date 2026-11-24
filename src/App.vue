<template>
  <div class="app-layout">
    <SiteNav v-if="!isStandalone" :personal="personal" />
    
    <!-- Route transitions -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :personal="personal" />
      </transition>
    </router-view>

    <ContactDrawer v-if="!isStandalone" :personal="personal" />
    <Toaster position="bottom-right" theme="dark" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import SiteNav from './components/SiteNav.vue'
import ContactDrawer from './components/ContactDrawer.vue'
import { personal } from './portfolio.config.js'

const route = useRoute()
const isStandalone = computed(() => Boolean(route.meta?.standalone))
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(14px);
}
</style>
