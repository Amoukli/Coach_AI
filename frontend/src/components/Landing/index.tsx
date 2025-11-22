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
        <button className="control-btn" onClick={handleLogin}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2C14.5,2 15,2.2 15.4,2.6C15.8,3 16,3.5 16,4V6H14V4H5V20H14V18H16V20C16,20.5 15.8,21 15.4,21.4C15,21.8 14.5,22 14,22H5C4.5,22 4,21.8 3.6,21.4C3.2,21 3,20.5 3,20V4C3,3.5 3.2,3 3.6,2.6C4,2.2 4.5,2 5,2H14Z"/>
          </svg>
          <div className="tooltip">Login</div>
        </button>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="hero">
          <div className="logo-center">
            <div className="coach-logo-text">Coach</div>
          </div>
          <h1>Clinical Training Platform</h1>
          <p className="hero-description">
            Transform clinical education with AI-powered patient simulations. Practice real-world scenarios,
            receive instant feedback, and build confidence before seeing real patients.
          </p>
        </div>
      </main>

      {/* Features Section */}
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
