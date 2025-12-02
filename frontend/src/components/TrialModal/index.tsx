import { useEffect, useRef } from 'react'
import './TrialModal.css'

interface TrialModalProps {
  isOpen: boolean
  onClose: () => void
}

const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle click outside modal to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="trial-modal-overlay"
      ref={modalRef}
      onClick={handleBackdropClick}
    >
      <div className="trial-modal-content">
        {/* Logo */}
        <div className="modal-logo-container">
          <img
            src="/images/CoachLogo.svg"
            alt="Coach"
            className="modal-logo"
          />
        </div>

        {/* Coming Soon Message */}
        <h2 className="trial-modal-title">Coming Soon</h2>
        <p className="trial-modal-description">
          We're working hard to bring you an amazing trial experience.
          Sign up below to be notified when we launch.
        </p>

        {/* Email Signup Form (placeholder) */}
        <form className="trial-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              disabled
            />
          </div>
          <button type="button" className="trial-notify-button" disabled>
            Notify Me
          </button>
        </form>

        {/* Features Preview */}
        <div className="trial-features">
          <h3>What you'll get:</h3>
          <ul>
            <li>14-day free access to all scenarios</li>
            <li>AI-powered patient simulations</li>
            <li>Real-time feedback and assessment</li>
            <li>Progress tracking across clinical skills</li>
          </ul>
        </div>

        {/* Close Button */}
        <button className="trial-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default TrialModal
