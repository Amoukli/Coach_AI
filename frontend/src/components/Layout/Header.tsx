import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  return (
    <header className="bg-white border-b border-secondary-200">
      <div className="px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img src="/images/CoachLogo.svg" alt="Coach" className="h-10 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-secondary-500 hover:text-secondary-800'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/scenarios"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/scenarios') && !isActive('/admin')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-secondary-500 hover:text-secondary-800'
              }`}
            >
              Scenarios
            </Link>
            <Link
              to="/admin/scenarios"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-secondary-500 hover:text-secondary-800'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="text-secondary-500 hover:text-secondary-800 transition-opacity hover:opacity-70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
