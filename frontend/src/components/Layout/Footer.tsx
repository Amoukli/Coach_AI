import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-secondary-200 mt-auto">
      <div className="container-app py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-secondary-600 mb-4 md:mb-0">
            <p>&copy; 2025 Coach AI. Part of the Medical AI Ecosystem.</p>
            <p className="text-xs mt-1">
              Integrates with{' '}
              <a href="https://www.clareai.app" className="text-primary-600 hover:underline">
                Clare
              </a>{' '}
              and{' '}
              <a href="https://www.clarkai.app" className="text-primary-600 hover:underline">
                Clark
              </a>
            </p>
          </div>

          <div className="flex space-x-6 text-sm text-secondary-600">
            <a href="/privacy" className="hover:text-secondary-900">
              Privacy
            </a>
            <a href="/terms" className="hover:text-secondary-900">
              Terms
            </a>
            <a href="/help" className="hover:text-secondary-900">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
