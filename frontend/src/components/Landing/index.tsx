import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const Landing: React.FC = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/scenarios')
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <button className="login-btn" onClick={handleLogin} aria-label="Login">
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
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <a href="#terms" className="footer-link">Terms of Service</a>
            <a href="#contact" className="footer-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
