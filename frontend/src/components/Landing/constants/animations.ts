// Framer Motion animation configurations for Landing page
// Premium, medical-appropriate spring physics

import type { Transition, Variants } from 'framer-motion'

// Spring configurations
export const subtleSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 0.8
}

export const elegantSpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1.2
}

export const responsiveSpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35
}

// Card animation variants
export const cardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '0 0 0 rgba(102, 153, 0, 0)'
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow: '0 20px 40px rgba(102, 153, 0, 0.12)',
    transition: subtleSpring
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

// Content container for stagger effect
export const contentContainerVariants: Variants = {
  initial: {},
  hover: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02
    }
  }
}

// Individual content items (icon, title, description)
export const contentItemVariants: Variants = {
  initial: {
    y: 0,
    opacity: 0.9
  },
  hover: {
    y: -3,
    opacity: 1,
    transition: subtleSpring
  }
}

// Title specific variants
export const titleVariants: Variants = {
  initial: {
    y: 0,
    color: '#2c3e50'
  },
  hover: {
    y: -2,
    color: '#527a00',
    transition: subtleSpring
  }
}

// Icon animation variants
export const iconVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.85
  },
  hover: {
    scale: 1.1,
    opacity: 1,
    transition: subtleSpring
  }
}

// Heartbeat animation for Simulations icon
export const heartbeatVariants: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: [1, 1.08, 1, 1.04, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: 'easeInOut'
    }
  }
}

// Line draw animation for icons
export const pathDrawVariants: Variants = {
  initial: {
    pathLength: 1,
    opacity: 0.7
  },
  hover: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

// Wave animation for Voice icon
export const waveVariants: Variants = {
  initial: {
    opacity: 0.5,
    scale: 0.8
  },
  hover: {
    opacity: [0.5, 1, 0.5],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Subtle rotation for Target icon
export const rotateVariants: Variants = {
  initial: {
    rotate: 0
  },
  hover: {
    rotate: 45,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
}

// Idle glow pulse (always-on subtle effect)
export const idleGlowVariants: Variants = {
  idle: {
    boxShadow: [
      '0 0 0 1px rgba(102, 153, 0, 0.05)',
      '0 0 0 1px rgba(102, 153, 0, 0.12)',
      '0 0 0 1px rgba(102, 153, 0, 0.05)'
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}
