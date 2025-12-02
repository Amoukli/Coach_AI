import { useState } from 'react'
import './Landing.css'
import LoginModal from '../LoginModal'
import TrialModal from '../TrialModal'

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

        {/* Features Section - inside main like Clark */}
        <section className="features">
        <div className="features-content">
          <div className="features-scroll-container">
            <div className="features-scroll-track">
              <div className="scrolling-feature">
                <h4>Realistic Simulations</h4>
                <p>Interactive patient scenarios with AI-powered dialogue and realistic responses</p>
              </div>
              <div className="scrolling-feature">
                <h4>Instant Assessment</h4>
                <p>Real-time feedback on clinical reasoning, communication, and decision-making skills</p>
              </div>
              <div className="scrolling-feature">
                <h4>Targeted Learning</h4>
                <p>Practice specific specialties and difficulty levels tailored to your learning needs</p>
              </div>
              <div className="scrolling-feature">
                <h4>Voice Integration</h4>
                <p>Natural voice interactions with AI patients using Azure Speech Services</p>
              </div>
              <div className="scrolling-feature">
                <h4>Progress Tracking</h4>
                <p>Monitor your improvement across five key clinical competency areas</p>
              </div>
              <div className="scrolling-feature">
                <h4>Clare Integration</h4>
                <p>Access evidence-based clinical guidelines seamlessly during training scenarios</p>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="scrolling-feature">
                <h4>Realistic Simulations</h4>
                <p>Interactive patient scenarios with AI-powered dialogue and realistic responses</p>
              </div>
              <div className="scrolling-feature">
                <h4>Instant Assessment</h4>
                <p>Real-time feedback on clinical reasoning, communication, and decision-making skills</p>
              </div>
              <div className="scrolling-feature">
                <h4>Targeted Learning</h4>
                <p>Practice specific specialties and difficulty levels tailored to your learning needs</p>
              </div>
              <div className="scrolling-feature">
                <h4>Voice Integration</h4>
                <p>Natural voice interactions with AI patients using Azure Speech Services</p>
              </div>
              <div className="scrolling-feature">
                <h4>Progress Tracking</h4>
                <p>Monitor your improvement across five key clinical competency areas</p>
              </div>
              <div className="scrolling-feature">
                <h4>Clare Integration</h4>
                <p>Access evidence-based clinical guidelines seamlessly during training scenarios</p>
              </div>
            </div>
          </div>
        </div>
        </section>
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
