// Feature data for Landing page carousel

export interface Feature {
  id: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    id: 'simulations',
    title: 'Realistic Simulations',
    description: 'Interactive patient scenarios with AI-powered dialogue and realistic responses'
  },
  {
    id: 'assessment',
    title: 'Instant Assessment',
    description: 'Real-time feedback on clinical reasoning, communication, and decision-making skills'
  },
  {
    id: 'learning',
    title: 'Targeted Learning',
    description: 'Practice specific specialties and difficulty levels tailored to your learning needs'
  },
  {
    id: 'voice',
    title: 'Voice Integration',
    description: 'Natural voice interactions with AI patients using Azure Speech Services'
  },
  {
    id: 'progress',
    title: 'Progress Tracking',
    description: 'Monitor your improvement across five key clinical competency areas'
  },
  {
    id: 'clare',
    title: 'Clare Integration',
    description: 'Access evidence-based clinical guidelines seamlessly during training scenarios'
  }
]
