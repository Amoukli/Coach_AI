import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/auth'
import './Index.css'

const Index: React.FC = () => {
  const navigate = useNavigate()
  const user = authService.getCurrentUser() || authService.autoLoginDev()

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  return (
    <div className="index-page">
      {/* Header */}
      <header className="index-header">
        <div className="logo-container">
          <img src="/images/CoachLogo.svg" alt="Coach" className="index-logo" />
        </div>
        <div className="header-user">
          <span className="user-name">{user?.full_name || 'User'}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Sidebar */}
        <aside className="sidebar">
          {/* Settings Button */}
          <button className="control-btn" disabled title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="tooltip">Settings</span>
          </button>

          {/* Catalog Button */}
          <Link to="/scenarios" className="control-btn" title="Catalog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span className="tooltip">Catalog</span>
          </Link>

          <div className="button-separator"></div>

          {/* Professional Level Button */}
          <button className="control-btn" disabled title="Professional Level">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="tooltip">Level</span>
          </button>

          {/* Dashboard Button */}
          <Link to="/dashboard" className="control-btn" title="Dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="tooltip">Dashboard</span>
          </Link>

          <div className="button-separator"></div>

          {/* Logout Button */}
          <button className="control-btn logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="tooltip">Logout</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="content-area">
          <div className="output-container">
            <div className="output-content">
              <div className="welcome-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="instructions-text">
                  <p>Welcome to Coach Clinical Training Platform</p>
                  <ul>
                    <li><strong>Catalog:</strong> Browse available clinical scenarios and start a training session</li>
                    <li><strong>Dashboard:</strong> View your progress, skill assessments, and past cases</li>
                    <li><strong>Settings:</strong> Customize your experience (coming soon)</li>
                    <li><strong>Professional Level:</strong> Set your training level (coming soon)</li>
                  </ul>
                  <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                    Click <strong>Catalog</strong> in the sidebar to begin your clinical training journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="index-footer">
        <div className="footer-container">
          <p className="footer-text">© Coach 2025. All rights reserved. Clinical Training Platform</p>
          <div className="footer-links">
            <Link to="/legal#privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/legal#tos" className="footer-link">Terms of Service</Link>
            <Link to="/legal#medical-disclaimer" className="footer-link">Medical Disclaimer</Link>
            <Link to="/legal#contact" className="footer-link">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index
