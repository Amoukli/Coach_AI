import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-secondary-200 mt-auto">
      <div className="px-8 py-4">
        <div className="flex justify-between items-center w-full">
          <p className="text-xs text-secondary-500">
            &copy; Coach 2025. All rights reserved. Clinical Training Platform
          </p>

          <div className="flex gap-6">
            <a href="/privacy" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
              Terms of Service
            </a>
            <a href="/help" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
