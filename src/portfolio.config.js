/**
 * ============================================================
 *  PORTFOLIO CONFIG — edit this file to update your portfolio
 * ============================================================
 *  No Vue knowledge required. Just update the values below.
 *  All sections are driven by this single file.
 */

export const personal = {
  name: 'YOUR NAME',
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

// ─── CLOUD PROJECTS ──────────────────────────────────────────
export const cloudProjects = [
  {
    id: 'cp-01',
    title: 'Serverless ETL Pipeline',
    description:
      'Event-driven data pipeline on AWS Lambda + S3 + Glue. Processes 10M+ records daily with zero ops overhead.',
    tags: ['AWS', 'Lambda', 'Terraform', 'Python'],
    repoUrl: 'https://github.com/yourhandle/etl-pipeline',
    liveUrl: '',
    date: '2024',
    status: 'LIVE', // LIVE | WIP | ARCHIVED
  },
  {
    id: 'cp-02',
    title: 'Kubernetes GitOps Platform',
    description:
      'Internal developer platform with ArgoCD, Helm, and automated rollbacks. Reduced deploy time by 70%.',
    tags: ['Kubernetes', 'ArgoCD', 'Helm', 'GCP'],
    repoUrl: 'https://github.com/yourhandle/k8s-gitops',
    liveUrl: '',
    date: '2023',
    status: 'LIVE',
  },
  {
    id: 'cp-03',
    title: 'Multi-Region Failover Setup',
    description:
      'Active-passive disaster recovery across 3 AWS regions using Route 53, Aurora Global, and Lambda warmers.',
    tags: ['AWS', 'Route 53', 'Aurora', 'CDK'],
    repoUrl: '',
    liveUrl: '',
    date: '2023',
    status: 'ARCHIVED',
  },
]

// ─── PERSONAL PROJECTS ───────────────────────────────────────
export const personalProjects = [
  {
    id: 'pp-01',
    title: 'This Portfolio',
    description:
      'Brutalist minimal portfolio site built with Vue 3 + Vite. Deployed to Vercel. Content driven by a single config file.',
    tags: ['Vue 3', 'Vite', 'Vercel', 'CSS'],
    repoUrl: 'https://github.com/yourhandle/portfolio',
    liveUrl: 'https://yourportfolio.vercel.app',
    date: '2025',
    status: 'LIVE',
  },
  {
    id: 'pp-02',
    title: 'CLI Budget Tracker',
    description:
      'Terminal-first personal finance tracker with SQLite storage, envelope budgeting, and CSV export.',
    tags: ['Python', 'SQLite', 'Click', 'Rich'],
    repoUrl: 'https://github.com/yourhandle/budget-cli',
    liveUrl: '',
    date: '2024',
    status: 'LIVE',
  },
  {
    id: 'pp-03',
    title: 'Homelab NAS Automation',
    description:
      'Ansible playbooks to provision and maintain a TrueNAS homelab with Wireguard, Nextcloud, and Jellyfin.',
    tags: ['Ansible', 'TrueNAS', 'Wireguard', 'Docker'],
    repoUrl: 'https://github.com/yourhandle/homelab',
    liveUrl: '',
    date: '2023',
    status: 'WIP',
  },
]

// ─── EXPERIENCE ──────────────────────────────────────────────
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

// ─── CERTIFICATIONS ──────────────────────────────────────────
// To use Credly embed: set credlyBadgeId to the badge ID from your Credly share URL.
// e.g. if share URL is https://www.credly.com/badges/abc-123-def, set credlyBadgeId: 'abc-123-def'
// Leave credlyBadgeId: '' to show a plain styled card instead.
export const certifications = [
  {
    id: 'cert-01',
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    date: 'Mar 2024',
    credlyBadgeId: '', // e.g. 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    verifyUrl: 'https://www.credly.com/badges/your-badge-id',
  },
  {
    id: 'cert-02',
    name: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation',
    date: 'Sep 2023',
    credlyBadgeId: '',
    verifyUrl: 'https://www.credly.com/badges/your-badge-id-2',
  },
  {
    id: 'cert-03',
    name: 'HashiCorp Certified: Terraform Associate',
    issuer: 'HashiCorp',
    date: 'Jan 2023',
    credlyBadgeId: '',
    verifyUrl: 'https://www.credly.com/badges/your-badge-id-3',
  },
  {
    id: 'cert-04',
    name: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    date: 'Jun 2022',
    credlyBadgeId: '',
    verifyUrl: 'https://www.credly.com/badges/your-badge-id-4',
  },
]
