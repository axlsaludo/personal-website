import { ref } from 'vue'
import { toast } from 'vue-sonner'

export const contactOpen = ref(false)

export function openContact() {
  contactOpen.value = true
}

export function closeContact() {
  contactOpen.value = false
}

export async function copyEmail(email) {
  if (!email) return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = email
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!ok) throw new Error('Clipboard copy failed')
    }
    toast.success('Email copied to clipboard', { description: email })
    return true
  } catch (err) {
    toast.error('Unable to copy email', { description: email })
    return false
  }
}
