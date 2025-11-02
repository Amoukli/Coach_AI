import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layout components
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'

// Page components (will be created)
import Dashboard from './components/Dashboard'
import ScenarioLibrary from './components/ScenarioLibrary'
import ScenarioPlayer from './components/ScenarioPlayer'
import AssessmentResults from './components/Assessment/AssessmentResults'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-secondary-50">
        <Header />

        <main className="flex-grow container-app py-8">
          <Routes>
            {/* Dashboard - default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Scenario Library */}
            <Route path="/scenarios" element={<ScenarioLibrary />} />

            {/* Scenario Player */}
            <Route path="/scenarios/:scenarioId/play" element={<ScenarioPlayer />} />

            {/* Assessment Results */}
            <Route path="/sessions/:sessionId/results" element={<AssessmentResults />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
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
