import React from 'react'
import { motion } from 'framer-motion'
import { subtleSpring } from '../../constants/animations'

interface IconProps {
  isHovered: boolean
}

const LearningIcon: React.FC<IconProps> = ({ isHovered }) => {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Middle circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        animate={{
          opacity: isHovered ? 1 : 0.6,
          scale: isHovered ? 1.05 : 1
        }}
        transition={subtleSpring}
      />
      {/* Inner circle - target center */}
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          scale: isHovered ? 1.2 : 1
        }}
        transition={subtleSpring}
      />
      {/* Crosshair lines */}
      <motion.g
        animate={{ rotate: isHovered ? 45 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'center' }}
      >
        <motion.line
          x1="12"
          y1="2"
          x2="12"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        />
        <motion.line
          x1="12"
          y1="18"
          x2="12"
          y2="22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        />
        <motion.line
          x1="2"
          y1="12"
          x2="6"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        />
        <motion.line
          x1="18"
          y1="12"
          x2="22"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        />
      </motion.g>
    </motion.svg>
  )
}

export default LearningIcon
