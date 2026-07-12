/**
 * ============================================================
 *  PORTFOLIO CONFIG — edit this file to update your portfolio
 * ============================================================
 *  No Vue knowledge required. Just update the values below.
 *  All sections are driven by this single file.
 */

export const personal = {
  name: 'Kurt Axl Saludo',
  handle: '@yourhandle',
  title: 'Cloud Engineer & Developer',
  tagline: 'Building reliable systems in the cloud and beyond.',
  bio: `I design and deploy cloud-native infrastructure, automate workflows, and ship personal projects that scratch my own itches. Obsessed with clean architecture, reproducible environments, and tools that just work.`,
  location: 'Manila, Philippines',
  email: 'you@example.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/yourhandle' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/yourhandle' },
    { label: 'Credly', url: 'https://www.credly.com/users/yourhandle' },
  ],
}

export const experience = [
  {
    id: 'ex-01',
    company: 'Acme Cloud Corp',
    role: 'Senior Cloud Engineer',
    period: 'Jan 2023 — Present',
    location: 'Remote',
    bullets: [
      'Designed and maintained multi-account AWS landing zone for 200+ workloads.',
      'Led migration of legacy monolith to containerized microservices on EKS.',
      'Authored IaC modules (Terraform) used across 5 product teams.',
      'Reduced monthly cloud spend by 35% through right-sizing and reserved instances.',
    ],
  },
  {
    id: 'ex-02',
    company: 'StartupXYZ',
    role: 'DevOps Engineer',
    period: 'Jun 2021 — Dec 2022',
    location: 'Hybrid',
    bullets: [
      'Built CI/CD pipelines with GitHub Actions for 12 services.',
      'Implemented observability stack: Prometheus, Grafana, Loki.',
      'Managed GCP infra including Cloud Run, Cloud SQL, and Pub/Sub.',
    ],
  },
]
