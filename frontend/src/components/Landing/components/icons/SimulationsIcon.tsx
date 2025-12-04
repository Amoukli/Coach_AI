import React from 'react'
import { motion } from 'framer-motion'
import { heartbeatVariants, subtleSpring } from '../../constants/animations'

interface IconProps {
  isHovered: boolean
}

const SimulationsIcon: React.FC<IconProps> = ({ isHovered }) => {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={heartbeatVariants}
      initial="initial"
      animate={isHovered ? 'hover' : 'initial'}
    >
      {/* Patient silhouette with heart */}
      <motion.circle
        cx="12"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      <motion.path
        d="M5 21v-2a7 7 0 0 1 14 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Heart pulse indicator */}
      <motion.path
        d="M12 14l-1.5 1.5a2.12 2.12 0 0 0 0 3c.83.83 2.17.83 3 0L12 17l-1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{
          opacity: isHovered ? [0.7, 1, 0.7] : 0.7,
          scale: isHovered ? [1, 1.1, 1] : 1
        }}
        transition={{
          duration: 0.8,
          repeat: isHovered ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />
    </motion.svg>
  )
}

export default SimulationsIcon
