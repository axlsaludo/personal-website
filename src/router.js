import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'

const DEFAULT_TITLE = 'Portfolio — Cloud Engineer & Developer'

const routes = [
  { path: '/', component: Home },
  {
    path: '/contact-card',
    name: 'contact-card',
    component: () => import('./views/ContactCard.vue'),
    meta: { standalone: true, title: 'Kurt Axl Saludo — Contact Card' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.afterEach((to) => {
  if (typeof document === 'undefined') return
  document.title = to.meta?.title || DEFAULT_TITLE

  const existing = document.querySelector('meta[name="robots"]')
  if (to.meta?.standalone) {
    if (existing) {
      existing.setAttribute('content', 'noindex, nofollow')
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      meta.setAttribute('content', 'noindex, nofollow')
      document.head.appendChild(meta)
    }
  } else if (existing) {
    existing.remove()
  }
})
