import React from 'react'
import { motion } from 'framer-motion'
import { subtleSpring } from '../../constants/animations'

interface IconProps {
  isHovered: boolean
}

const ProgressIcon: React.FC<IconProps> = ({ isHovered }) => {
  const barHeights = [6, 10, 8, 14]
  const barDelays = [0, 0.05, 0.1, 0.15]

  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Axis lines */}
      <motion.line
        x1="3"
        y1="21"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      <motion.line
        x1="3"
        y1="21"
        x2="3"
        y2="3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Progress bars */}
      {barHeights.map((height, index) => (
        <motion.rect
          key={index}
          x={6 + index * 4}
          y={21 - height}
          width="2.5"
          height={height}
          rx="1"
          fill="currentColor"
          initial={{ scaleY: 0, opacity: 0.7 }}
          animate={{
            scaleY: isHovered ? 1.15 : 1,
            opacity: isHovered ? 1 : 0.7,
            y: isHovered ? -2 : 0
          }}
          transition={{
            ...subtleSpring,
            delay: barDelays[index]
          }}
          style={{ transformOrigin: 'bottom' }}
        />
      ))}
      {/* Trend line */}
      <motion.path
        d="M6 17 L10 13 L14 15 L18 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 1, opacity: 0.5 }}
        animate={{
          pathLength: 1,
          opacity: isHovered ? 1 : 0.5
        }}
        transition={{ duration: 0.4 }}
      />
      {/* Arrow at end of trend */}
      <motion.path
        d="M16 8 L18 9 L17 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? 1 : 0,
          y: isHovered ? -1 : 0
        }}
        transition={subtleSpring}
      />
    </motion.svg>
  )
}

export default ProgressIcon
