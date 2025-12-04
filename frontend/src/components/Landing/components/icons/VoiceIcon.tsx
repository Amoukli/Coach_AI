import React from 'react'
import { motion } from 'framer-motion'
import { subtleSpring } from '../../constants/animations'

interface IconProps {
  isHovered: boolean
}

const VoiceIcon: React.FC<IconProps> = ({ isHovered }) => {
  const waveDelays = [0, 0.15, 0.3]

  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Microphone body */}
      <motion.rect
        x="9"
        y="2"
        width="6"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Microphone base arc */}
      <motion.path
        d="M5 10v1a7 7 0 0 0 14 0v-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Stand */}
      <motion.line
        x1="12"
        y1="18"
        x2="12"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      <motion.line
        x1="8"
        y1="22"
        x2="16"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Sound waves */}
      {waveDelays.map((delay, index) => (
        <motion.path
          key={index}
          d={`M${19 + index * 1.5} ${6 - index} v${12 + index * 2}`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{
            opacity: isHovered ? [0.3, 1, 0.3] : 0,
            scaleY: isHovered ? [0.8, 1, 0.8] : 0.8
          }}
          transition={{
            duration: 1,
            repeat: isHovered ? Infinity : 0,
            delay,
            ease: 'easeInOut'
          }}
          style={{ transformOrigin: 'center' }}
        />
      ))}
    </motion.svg>
  )
}

export default VoiceIcon
