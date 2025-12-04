import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import FeatureCard from './FeatureCard'
import { features } from '../constants/features'

const FeatureCarousel: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Motion value for scroll position
  const x = useMotionValue(0)

  // Card dimensions
  const CARD_WIDTH = 320
  const GAP = 24
  const CARD_TOTAL = CARD_WIDTH + GAP
  const TOTAL_WIDTH = features.length * CARD_TOTAL // Width of one set of cards

  // Speed: pixels per millisecond (TOTAL_WIDTH over 25 seconds)
  const SPEED = TOTAL_WIDTH / 25000

  const animateScroll = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    // Update position
    const currentX = x.get()
    let newX = currentX - (SPEED * deltaTime)

    // Reset when one set is fully scrolled
    if (newX <= -TOTAL_WIDTH) {
      newX = 0
    }

    x.set(newX)

    // Continue animation
    animationRef.current = requestAnimationFrame(animateScroll)
  }, [x, TOTAL_WIDTH, SPEED])

  useEffect(() => {
    if (prefersReducedMotion) return

    if (isPaused) {
      // Stop animation but keep position
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      lastTimeRef.current = 0
      return
    }

    // Start/resume animation
    lastTimeRef.current = 0
    animationRef.current = requestAnimationFrame(animateScroll)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, prefersReducedMotion, animateScroll])

  // Handle pause/resume
  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  // For reduced motion, show static cards
  if (prefersReducedMotion) {
    return (
      <section className="features">
        <div className="features-content">
          <div className="features-scroll-container" ref={containerRef}>
            <div className="features-scroll-track features-scroll-track-static">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.id}
                  {...feature}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="features">
      <div className="features-content">
        <div
          className="features-scroll-container"
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className="features-scroll-track"
            style={{ x }}
          >
            {/* First set of cards */}
            {features.map((feature, index) => (
              <FeatureCard
                key={`${feature.id}-1`}
                {...feature}
                index={index}
              />
            ))}
            {/* Duplicate set for seamless loop */}
            {features.map((feature, index) => (
              <FeatureCard
                key={`${feature.id}-2`}
                {...feature}
                index={index + features.length}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FeatureCarousel
