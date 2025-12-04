import React from 'react'
import { motion } from 'framer-motion'
import { subtleSpring } from '../../constants/animations'

interface IconProps {
  isHovered: boolean
}

const ClareIcon: React.FC<IconProps> = ({ isHovered }) => {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book/document outline */}
      <motion.path
        d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={subtleSpring}
      />
      {/* Book spine/fold */}
      <motion.line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={subtleSpring}
      />
      {/* Text lines - left page */}
      <motion.line
        x1="5"
        y1="8"
        x2="10"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? 0.5 : 0
        }}
        transition={{ ...subtleSpring, delay: 0 }}
      />
      <motion.line
        x1="5"
        y1="11"
        x2="9"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? 0.5 : 0
        }}
        transition={{ ...subtleSpring, delay: 0.05 }}
      />
      <motion.line
        x1="5"
        y1="14"
        x2="10"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? 0.5 : 0
        }}
        transition={{ ...subtleSpring, delay: 0.1 }}
      />
      {/* Text lines - right page */}
      <motion.line
        x1="14"
        y1="8"
        x2="19"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? -0.5 : 0
        }}
        transition={{ ...subtleSpring, delay: 0.05 }}
      />
      <motion.line
        x1="14"
        y1="11"
        x2="18"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? -0.5 : 0
        }}
        transition={{ ...subtleSpring, delay: 0.1 }}
      />
      <motion.line
        x1="14"
        y1="14"
        x2="19"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          x: isHovered ? -0.5 : 0
        }}
        transition={{ ...subtleSpring, delay: 0.15 }}
      />
      {/* Glow effect on hover */}
      <motion.rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="0"
        animate={{
          strokeWidth: isHovered ? 1 : 0,
          opacity: isHovered ? 0.3 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{ filter: 'blur(2px)' }}
      />
    </motion.svg>
  )
}

export default ClareIcon
