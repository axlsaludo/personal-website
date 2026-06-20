<template>
  <div>
    <SiteNav     :personal="personal" />
    <HeroSection :personal="personal" />
    <ExpSection  :experience="experience" />
    <CertSection :certifications="certifications" :personal="personal" />
    <SiteFooter  :personal="personal" />
  </div>
</template>

<script setup>
import SiteNav     from './components/SiteNav.vue'
import HeroSection from './components/HeroSection.vue'
import ExpSection  from './components/ExpSection.vue'
import CertSection from './components/CertSection.vue'
import SiteFooter  from './components/SiteFooter.vue'

import { personal, experience, certifications } from './portfolio.config.js'
</script>
