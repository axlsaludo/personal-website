// Composable: scroll-reveal using IntersectionObserver
// Usage: pass a ref to observe(el) and bind .reveal class on the element
import { onMounted, onUnmounted } from 'vue'

export function useIntersect(options = {}) {
  let observer = null

  function observe(el) {
    if (!el) return
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options }
      )
    }
    observer.observe(el)
  }

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return { observe }
}
