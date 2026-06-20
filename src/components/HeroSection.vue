<template>
  <section id="intro" class="section intro-section">
    <div class="container">
      <p class="eyebrow reveal" ref="eyebrowEl">Intro</p>

      <h1 class="display-head reveal" ref="headEl">
        Simply put, I believe <span class="hi">good engineering</span> isn't just
        writing code. It's a combination of problem solving and
        <span class="hi">systems thinking</span> — and more over, work done right,
        <span class="hi-warm">has impact.</span> It shapes products, informs
        scale, and inspires trust. And let me tell you, <span class="hi">I do it right.</span>
      </h1>

      <div class="two-col reveal" ref="bodyEl">
        <p class="body-para">
          Our mission is to put the inherent power of solid architecture to work.
          I am an action-oriented engineer, and my clients find a fellow builder who
          doesn't shy away from a challenge. I am nimble, knowledgeable, and put my
          passion to work by taking systems to the next level.
        </p>
        <p class="body-para">
          We know code doesn't count for much if it doesn't produce measurable results.
          For me, the ultimate technical pursuit is business goals. I never settle
          for less. Which in turn, means my clients never have to either. I look
          forward to the prospect of working with you.
        </p>
      </div>
    </div>
  </section>

  <!-- Full bleed image just like the reference -->
  <img
    src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=70&auto=format&fit=crop"
    alt="City skyline"
    class="img-bleed reveal"
    ref="imgEl"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
defineProps({ personal: Object })

const eyebrowEl = ref(null)
const headEl    = ref(null)
const bodyEl    = ref(null)
const imgEl     = ref(null)

onMounted(() => {
  const els = [eyebrowEl, headEl, bodyEl, imgEl]
  els.forEach((el, i) => {
    if (!el.value) return
    setTimeout(() => el.value.classList.add('visible'), 100 + i * 150)
  })
})
</script>

<style scoped>
.intro-section {
  padding-top: 140px;
  border-top: none;
}
</style>
