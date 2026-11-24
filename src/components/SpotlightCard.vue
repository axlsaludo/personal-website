<template>
  <component
    :is="as"
    class="spotlight-card"
    :style="spotStyle"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <slot />
  </component>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  as: {
    type: String,
    default: 'div',
  },
})

const mx = ref('50%')
const my = ref('50%')
const active = ref(false)

const spotStyle = computed(() => ({
  '--mx': mx.value,
  '--my': my.value,
  '--spot-opacity': active.value ? '1' : '0',
}))

function onMove(event) {
  const rect = event.currentTarget?.getBoundingClientRect()
  if (!rect) return
  mx.value = `${event.clientX - rect.left}px`
  my.value = `${event.clientY - rect.top}px`
  active.value = true
}

function onLeave() {
  active.value = false
}
</script>

<style scoped>
.spotlight-card {
  position: relative;
  overflow: hidden;
}

.spotlight-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: var(--spot-opacity, 0);
  background: radial-gradient(
    240px circle at var(--mx, 50%) var(--my, 50%),
    rgba(255, 255, 255, 0.065),
    transparent 70%
  );
  transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.spotlight-card > :deep(*) {
  position: relative;
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .spotlight-card::before {
    transition: none;
    opacity: 0;
  }
}
</style>
