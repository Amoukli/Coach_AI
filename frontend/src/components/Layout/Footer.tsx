import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container-app py-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary-500 m-0">
            &copy; Coach 2025. All rights reserved. Clinical Training Platform
          </p>

          <div className="flex gap-6 text-xs text-secondary-500">
            <a href="#privacy" className="hover:text-primary-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-primary-500 transition-colors">
              Terms of Service
            </a>
            <a href="#contact" className="hover:text-primary-500 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
