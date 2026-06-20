import { ref } from 'vue'

export function useCredly() {
  const badges = ref([])
  const loading = ref(true)
  const error = ref(null)

  const fetchBadges = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/badges')
      if (!res.ok) throw new Error(`API failed with status ${res.status}`)
      const json = await res.json()

      const rawBadges = json.data || []
      badges.value = rawBadges.sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at))
    } catch (err) {
      error.value = err.message
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { badges, loading, error, fetchBadges }
}

export function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
