import { useState } from 'react'
import './Landing.css'
import LoginModal from '../LoginModal'
import TrialModal from '../TrialModal'
import { FeatureCarousel } from './components'

const Landing: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false)
  const [trialButtonText, setTrialButtonText] = useState('Free Trial')

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsLoginModalOpen(false)
  }

  const handleTrialClick = () => {
    setIsTrialModalOpen(true)
  }

  const handleCloseTrialModal = () => {
    setIsTrialModalOpen(false)
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <button className="login-btn" onClick={handleLoginClick} aria-label="Login">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span className="tooltip">Login</span>
        </button>
      </header>

      {/* Main Content - contains both hero and features like Clark */}
      <main className="landing-main">
        <div className="hero">
          <div className="logo-center">
            <img src="/images/CoachLogo.svg" alt="Coach" className="hero-logo" />
          </div>
          <h1>Clinical Training Platform</h1>
          <p className="hero-description">
            Transform clinical education with AI-powered patient simulations. Practice real-world scenarios,
            receive instant feedback, and build confidence before seeing real patients.
          </p>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <button
              className="cta-btn"
              onClick={handleTrialClick}
              onMouseEnter={() => setTrialButtonText('14-day Trial')}
              onMouseLeave={() => setTrialButtonText('Free Trial')}
            >
              {trialButtonText}
            </button>
          </div>
        </div>

        {/* Features Section - Animated carousel with Framer Motion */}
        <FeatureCarousel />
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; Coach 2025. All rights reserved. Clinical Training Platform</p>
          <div className="footer-links">
            <a href="/legal#privacy" className="footer-link">Privacy Policy</a>
            <a href="/legal#tos" className="footer-link">Terms of Service</a>
            <a href="/legal#medical-disclaimer" className="footer-link">Medical Disclaimer</a>
            <a href="/legal#contact" className="footer-link">Contact</a>
            <a href="/admin/scenarios" className="footer-link">Admin</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />

      {/* Trial Modal */}
      <TrialModal isOpen={isTrialModalOpen} onClose={handleCloseTrialModal} />
    </div>
  )
}

export default Landing
