import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Layout components
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'

// Page components
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import ScenarioLibrary from './components/ScenarioLibrary'
import ScenarioPlayer from './components/ScenarioPlayer'
import AssessmentResults from './components/Assessment/AssessmentResults'

// Layout wrapper for app pages (not landing)
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-secondary-50">
    <Header />
    <main className="flex-grow container-app py-8">
      {children}
    </main>
    <Footer />
  </div>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page - entry point (no header/footer) */}
        <Route path="/" element={<Landing />} />

        {/* App pages with header/footer */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/scenarios" element={<AppLayout><ScenarioLibrary /></AppLayout>} />
        <Route path="/scenarios/:scenarioId/play" element={<AppLayout><ScenarioPlayer /></AppLayout>} />
        <Route path="/sessions/:sessionId/results" element={<AppLayout><AssessmentResults /></AppLayout>} />

        {/* 404 Not Found */}
        <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
      </Routes>
    </Router>
  )
}

// Simple Not Found component
const NotFound: React.FC = () => (
  <div className="text-center py-16">
    <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
    <p className="text-xl text-secondary-600 mb-8">Page not found</p>
    <a href="/dashboard" className="btn btn-primary">
      Return to Dashboard
    </a>
  </div>
)

export default App
