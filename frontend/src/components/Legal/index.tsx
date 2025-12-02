import React from 'react'
import { Link } from 'react-router-dom'
import './Legal.css'

const Legal: React.FC = () => {
  return (
    <div className="legal-page">
      {/* Header */}
      <header className="legal-header">
        <div className="logo-container">
          <img src="/images/CoachLogo.svg" alt="Coach" className="legal-logo" />
        </div>
        <div className="header-actions">
          <Link to="/" className="header-btn">Back to Coach</Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="legal-container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Legal & Compliance</h1>
          <div className="last-updated">
            Last updated: <time>December 2025</time>
          </div>
        </div>

        {/* Quick Navigation */}
        <nav className="nav-section">
          <h2>Quick Navigation</h2>
          <div className="nav-links">
            <a href="#tos">Terms of Service</a>
            <a href="#medical-disclaimer">Medical Training Disclaimer</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#data-processing">Data Processing & Security</a>
            <a href="#copyright">Copyright & Intellectual Property</a>
            <a href="#acceptable-use">Acceptable Use Policy</a>
            <a href="#accessibility">Accessibility Statement</a>
            <a href="#contact">Contact Information</a>
          </div>
        </nav>

        {/* Terms of Service */}
        <div className="content-section">
          <h2 id="tos">Terms of Service</h2>

          <h3>1. Who we are</h3>
          <p><strong>Coach Clinical Training Platform</strong> is an AI-powered medical training service. Contact: <a href="mailto:support@coach-clinical.com">support@coach-clinical.com</a>.</p>

          <h3>2. Acceptance of terms</h3>
          <p>By accessing or using Coach, you agree to these Terms. If you use Coach on behalf of an educational institution, you confirm you have authority to bind that organisation.</p>

          <h3>3. Service description</h3>
          <p>Coach provides AI-powered clinical scenario simulations for medical education. The service allows students to practice patient consultations and receive feedback on their clinical skills. It is an educational tool, not a diagnostic or prescriptive medical device.</p>

          <h3>4. Educational responsibility</h3>
          <p>You acknowledge that:</p>
          <ul>
            <li>Coach is for educational purposes only</li>
            <li>Simulated scenarios are not real patient cases</li>
            <li>AI-generated feedback is educational guidance, not clinical advice</li>
            <li>Real clinical decisions should follow established medical protocols</li>
          </ul>
        </div>

        <div className="divider"></div>

        {/* Medical Training Disclaimer */}
        <div className="content-section">
          <h2 id="medical-disclaimer">Medical Training Disclaimer</h2>

          <div className="warning-box">
            <p><strong>Important:</strong> Coach is an educational simulation tool only. It does not provide medical advice, diagnosis, or treatment recommendations.</p>
          </div>

          <ul>
            <li>Coach is an AI-powered training simulation, not a medical device</li>
            <li>All scenarios are fictional and for educational purposes only</li>
            <li>AI-generated patient responses are simulations, not real clinical data</li>
            <li>Assessment feedback is educational guidance, not clinical evaluation</li>
            <li>Students should not apply simulated scenarios directly to real patient care</li>
            <li>Always follow your institution's clinical guidelines and supervision requirements</li>
          </ul>
        </div>

        <div className="divider"></div>

        {/* Privacy Policy */}
        <div className="content-section">
          <h2 id="privacy">Privacy Policy</h2>

          <h3>1. Data we collect</h3>
          <ul>
            <li><strong>Account data:</strong> Name, email, institution, student ID</li>
            <li><strong>Training data:</strong> Scenario responses, assessment scores, progress metrics</li>
            <li><strong>Technical data:</strong> IP address, browser type, usage analytics</li>
          </ul>

          <h3>2. How we use your data</h3>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and improve the training platform</li>
            <li>Track your learning progress</li>
            <li>Generate personalized recommendations</li>
            <li>Maintain platform security</li>
          </ul>

          <h3>3. Data retention</h3>
          <ul>
            <li><strong>Account data:</strong> Retained during account lifetime</li>
            <li><strong>Training records:</strong> Retained for educational records as required</li>
            <li><strong>Audio recordings:</strong> Processed and deleted immediately</li>
          </ul>
        </div>

        <div className="divider"></div>

        {/* Data Processing */}
        <div className="content-section">
          <h2 id="data-processing">Data Processing & Security</h2>

          <h3>Security measures</h3>
          <ul>
            <li>Encryption in transit (TLS 1.2+)</li>
            <li>Encryption at rest (AES-256)</li>
            <li>Regular security audits</li>
            <li>Access control and authentication</li>
            <li>Audit logging of all access</li>
          </ul>

          <h3>Third-party services</h3>
          <ul>
            <li><strong>Microsoft Azure:</strong> Cloud hosting and AI services</li>
            <li><strong>Azure OpenAI:</strong> Patient dialogue generation</li>
            <li><strong>Azure Speech:</strong> Voice synthesis and recognition</li>
          </ul>
        </div>

        <div className="divider"></div>

        {/* Copyright */}
        <div className="content-section">
          <h2 id="copyright">Copyright & Intellectual Property</h2>

          <p>© 2025 Coach Clinical Training Platform. All rights reserved.</p>

          <ul>
            <li>Coach name, logo, and olive green colour scheme are our trademarks</li>
            <li>User interface and software code are proprietary</li>
            <li>Scenario content is proprietary educational material</li>
            <li>Clare Guidelines integration © respective content owners</li>
          </ul>
        </div>

        <div className="divider"></div>

        {/* Acceptable Use */}
        <div className="content-section">
          <h2 id="acceptable-use">Acceptable Use Policy</h2>

          <h3>Permitted use</h3>
          <ul>
            <li>Clinical skills training and practice</li>
            <li>Educational assessment and feedback</li>
            <li>Professional development activities</li>
          </ul>

          <h3>Prohibited use</h3>
          <ul>
            <li>Using Coach for real patient consultations</li>
            <li>Sharing account credentials</li>
            <li>Attempting to extract AI models or training data</li>
            <li>Any unlawful or unethical use</li>
          </ul>
        </div>

        <div className="divider"></div>

        {/* Accessibility */}
        <div className="content-section">
          <h2 id="accessibility">Accessibility Statement</h2>

          <p>Coach is committed to digital accessibility for all users.</p>

          <h3>Accessible features</h3>
          <ul>
            <li>Keyboard navigation throughout the interface</li>
            <li>High contrast colour scheme</li>
            <li>Responsive design for various screen sizes</li>
            <li>Clear, consistent navigation</li>
            <li>Alt text for images and icons</li>
          </ul>

          <h3>Known limitations</h3>
          <ul>
            <li>Voice interaction features may not be fully accessible</li>
            <li>Some third-party content may not meet accessibility standards</li>
          </ul>

          <p>To report accessibility issues: <a href="mailto:support@coach-clinical.com">support@coach-clinical.com</a></p>
        </div>

        <div className="divider"></div>

        {/* Contact */}
        <div className="content-section">
          <h2 id="contact">Contact Information</h2>

          <h3>General support</h3>
          <p>Email: <a href="mailto:support@coach-clinical.com">support@coach-clinical.com</a></p>

          <h3>Data protection</h3>
          <p>Data Protection Officer: <a href="mailto:dpo@coach-clinical.com">dpo@coach-clinical.com</a></p>

          <h3>Feedback</h3>
          <p>We welcome feedback on improving Coach. Please contact us at the support email above.</p>
        </div>

        <div className="divider"></div>

        <div className="content-section">
          <h2>Changes to this Page</h2>
          <p>We will update this page when policies change and adjust the "Last updated" date at the top.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="footer-container">
          <p className="footer-text">© Coach 2025. All rights reserved. Clinical Training Platform</p>
          <div className="footer-links">
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <a href="#tos" className="footer-link">Terms of Service</a>
            <a href="#medical-disclaimer" className="footer-link">Medical Disclaimer</a>
            <a href="#contact" className="footer-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Legal
