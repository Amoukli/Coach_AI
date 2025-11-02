/**
 * Authentication Service
 * Handles Azure AD B2C authentication (simplified for now)
 */

interface User {
  id: number
  email: string
  name: string
  institution?: string
}

class AuthService {
  private currentUser: User | null = null

  /**
   * Login (simplified - will be replaced with Azure AD B2C)
   */
  async login(email: string, _password: string): Promise<User> {
    // TODO: Implement actual Azure AD B2C authentication
    // For now, return mock user
    const mockUser: User = {
      id: 1,
      email,
      name: 'Demo Student',
      institution: 'Demo University',
    }

    this.currentUser = mockUser
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('auth_token', 'mock_token_' + Date.now())

    return mockUser
  }

  /**
   * Logout
   */
  logout(): void {
    this.currentUser = null
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr)
        return this.currentUser
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        return null
      }
    }

    return null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    return token !== null
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  /**
   * Auto-login for development (creates a demo user)
   */
  autoLoginDev(): User {
    const demoUser: User = {
      id: 1,
      email: 'demo@medical-student.edu',
      name: 'Demo Student',
      institution: 'Demo Medical School',
    }

    this.currentUser = demoUser
    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('auth_token', 'dev_token_' + Date.now())

    return demoUser
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
