import React from 'react'
import { motion } from 'framer-motion'
import { subtleSpring } from '../../constants/animations'

interface IconProps {
  isHovered: boolean
}

const AssessmentIcon: React.FC<IconProps> = ({ isHovered }) => {
  const checkmarkVariants = {
    initial: {
      pathLength: 1,
      opacity: 0.7
    },
    hover: {
      pathLength: 1,
      opacity: 1
    }
  }

  const drawCheckmark = {
    initial: {
      pathLength: 0,
      opacity: 0
    },
    hover: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.4, ease: 'easeOut' as const },
        opacity: { duration: 0.2 }
      }
    }
  }

  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
    >
      {/* Clipboard background */}
      <motion.rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        variants={checkmarkVariants}
        transition={subtleSpring}
      />
      {/* Clipboard top */}
      <motion.path
        d="M9 3V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        variants={checkmarkVariants}
        transition={subtleSpring}
      />
      {/* Checkmark - draws on hover */}
      <motion.path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={drawCheckmark}
      />
      {/* Lines below checkmark */}
      <motion.line
        x1="9"
        y1="17"
        x2="15"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      />
    </motion.svg>
  )
}

export default AssessmentIcon
