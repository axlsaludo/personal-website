<template>
  <section id="exp" class="section">
    <div class="container">
      <p class="eyebrow">Experience</p>

      <h2 class="display-head" style="max-width: 700px; margin: 0 auto 64px; text-align: center;">
        Years of proof that <span class="hi">I ship</span> — not just plan.
      </h2>

      <div class="exp-list">
        <div v-for="(job, i) in experience" :key="job.id" class="job-item">
          <div class="job-header">
            <div>
              <h3 class="job-role">{{ job.role }}</h3>
              <p class="job-meta">
                <em>{{ job.company }}</em>
                <span class="mid-dot">·</span>
                {{ job.location }}
              </p>
            </div>
            <div class="job-period-wrap">
              <span class="label-sc">{{ job.period }}</span>
            </div>
          </div>
          
          <ul class="job-bullets">
            <li v-for="b in job.bullets" :key="b">{{ b }}</li>
          </ul>
          
          <div class="orn-rule" v-if="i < experience.length - 1">✦</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ experience: Array })
</script>

<style scoped>
.exp-list {
  max-width: 800px;
  margin: 0 auto;
}

.job-item {
  margin-bottom: 24px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.job-role {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}

.job-meta {
  font-size: 0.95rem;
  color: var(--ink-mid);
}

.mid-dot {
  margin: 0 6px;
  color: var(--ink-dim);
}

.job-bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.job-bullets li {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--ink-mid);
  padding-left: 20px;
  position: relative;
}

.job-bullets li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--ink-dim);
}
</style>
