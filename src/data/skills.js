// ── Skills Data Structured by Credly Credentials ──
export const nodesData = [
  // Primary Domain Hubs
  { id: 'gcp', label: 'Google Cloud (GCP)', group: 'Core' },
  { id: 'ai', label: 'Artificial Intelligence', group: 'Core' },
  { id: 'networking', label: 'Networking & Systems', group: 'Core' },

  // Skills under Google Cloud (ACE, CDL, GCCF, K8s badges)
  { id: 'gke', label: 'Kubernetes (GKE)', group: 'GCP' },
  { id: 'compute', label: 'Compute Engine & VMs', group: 'GCP' },
  { id: 'cloud-iam', label: 'Cloud IAM & Security', group: 'GCP' },
  { id: 'cloud-vpc', label: 'VPC & Cloud Networking', group: 'GCP' },
  { id: 'terraform', label: 'Terraform & IaC', group: 'GCP' },
  { id: 'cloud-arch', label: 'Cloud Architecture', group: 'GCP' },
  { id: 'storage-db', label: 'Cloud Storage & Databases', group: 'GCP' },
  { id: 'monitoring', label: 'Cloud Monitoring & Ops', group: 'GCP' },

  // Skills under Artificial Intelligence (Gemini Specialist, GenAI Leader, ADK)
  { id: 'gemini', label: 'Gemini Enterprise', group: 'AI' },
  { id: 'agents', label: 'AI Agent Development', group: 'AI' },
  { id: 'adk', label: 'Agent Development Kit (ADK)', group: 'AI' },
  { id: 'prompt-eng', label: 'Prompt Engineering & LLMs', group: 'AI' },
  { id: 'ai-workflows', label: 'AI Workflow Automation', group: 'AI' },
  { id: 'python', label: 'Python & Scripting', group: 'AI' },

  // Skills under Networking & Systems (CCNA Routing, Switching & Wireless)
  { id: 'ccna', label: 'CCNA Routing & Switching', group: 'Networking' },
  { id: 'tcp-ip', label: 'TCP/IP & DNS Architecture', group: 'Networking' },
  { id: 'firewalls', label: 'Firewalls & Network Security', group: 'Networking' },
  { id: 'wireless', label: 'Wireless Essentials', group: 'Networking' },
  { id: 'linux', label: 'Linux Administration', group: 'Networking' },
  { id: 'docker', label: 'Docker & Containers', group: 'Networking' },
  { id: 'cicd', label: 'CI/CD Automation', group: 'Networking' }
]

export const edgesData = [
  // ── Under Google Cloud (GCP) ─────────────────────
  { source: 'gcp', target: 'gke' },
  { source: 'gcp', target: 'compute' },
  { source: 'gcp', target: 'cloud-iam' },
  { source: 'gcp', target: 'cloud-vpc' },
  { source: 'gcp', target: 'terraform' },
  { source: 'gcp', target: 'cloud-arch' },
  { source: 'gcp', target: 'storage-db' },
  { source: 'gcp', target: 'monitoring' },

  // ── Under Artificial Intelligence ────────────────
  { source: 'ai', target: 'gemini' },
  { source: 'ai', target: 'agents' },
  { source: 'ai', target: 'adk' },
  { source: 'ai', target: 'prompt-eng' },
  { source: 'ai', target: 'ai-workflows' },
  { source: 'ai', target: 'python' },

  // ── Under Networking & Systems ───────────────────
  { source: 'networking', target: 'ccna' },
  { source: 'networking', target: 'tcp-ip' },
  { source: 'networking', target: 'firewalls' },
  { source: 'networking', target: 'wireless' },
  { source: 'networking', target: 'linux' },
  { source: 'networking', target: 'docker' },
  { source: 'networking', target: 'cicd' },

  // ── Cross-Domain Structural Links (Interconnected Web) ──
  { source: 'gcp', target: 'ai' },
  { source: 'gcp', target: 'networking' },
  { source: 'gke', target: 'docker' },
  { source: 'docker', target: 'cicd' },
  { source: 'terraform', target: 'cicd' },
  { source: 'agents', target: 'gemini' },
  { source: 'agents', target: 'adk' },
  { source: 'agents', target: 'python' },
  { source: 'cloud-vpc', target: 'ccna' },
  { source: 'cloud-iam', target: 'firewalls' },
  { source: 'compute', target: 'linux' }
]
