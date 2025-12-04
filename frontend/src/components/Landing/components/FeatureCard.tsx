import React, { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion
} from 'framer-motion'
import { subtleSpring, cardVariants, titleVariants, iconVariants } from '../constants/animations'
import { iconMap } from './icons'
import type { Feature } from '../constants/features'

interface FeatureCardProps extends Feature {
  index: number
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  title,
  description,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index: _index
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Mouse tracking for 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Transform mouse position to rotation (max 5 degrees)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5])

  // Smooth springs for rotation
  const springConfig = { stiffness: 400, damping: 40 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  // Glow position follows cursor
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['20%', '80%'])
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['20%', '80%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  // Get the icon component for this feature
  const IconComponent = iconMap[id]

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div className="feature-card feature-card-static">
        {IconComponent && (
          <div className="feature-card-icon">
            <IconComponent isHovered={false} />
          </div>
        )}
        <h4 className="feature-card-title">{title}</h4>
        <p className="feature-card-description">{description}</p>
      </div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      className="feature-card"
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d'
      }}
      tabIndex={0}
      role="article"
      aria-label={`Feature: ${title}`}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {/* Glow overlay - follows cursor */}
      <motion.div
        className="feature-card-glow"
        style={{
          '--glow-x': glowX,
          '--glow-y': glowY
        } as React.CSSProperties}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      {IconComponent && (
        <motion.div
          className="feature-card-icon"
          variants={iconVariants}
        >
          <IconComponent isHovered={isHovered} />
        </motion.div>
      )}

      {/* Title */}
      <motion.h4
        className="feature-card-title"
        variants={titleVariants}
      >
        {title}
      </motion.h4>

      {/* Description */}
      <motion.p
        className="feature-card-description"
        animate={{
          opacity: isHovered ? 1 : 0.75,
          y: isHovered ? -2 : 0
        }}
        transition={subtleSpring}
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

export default FeatureCard
