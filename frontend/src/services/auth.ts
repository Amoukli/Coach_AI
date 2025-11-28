/**
 * Authentication Service
 * Handles Azure AD B2C authentication (simplified for now)
 */

export type ExperienceLevel = 'medical_student' | 'physician_under_5_years' | 'physician_over_5_years'
export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  institution?: string
  year_of_study?: number
  specialty_interest?: string
  experience_level: ExperienceLevel
  role: UserRole
  is_active: boolean
  is_verified: boolean
  total_scenarios_completed: number
  total_time_spent: number
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
      username: 'demo_student',
      first_name: 'Demo',
      last_name: 'Student',
      full_name: 'Demo Student',
      institution: 'Demo University',
      experience_level: 'medical_student',
      role: 'user',
      is_active: true,
      is_verified: false,
      total_scenarios_completed: 0,
      total_time_spent: 0,
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
      username: 'demo_student',
      first_name: 'Demo',
      last_name: 'Student',
      full_name: 'Demo Student',
      institution: 'Demo Medical School',
      experience_level: 'medical_student',
      role: 'user',
      is_active: true,
      is_verified: false,
      total_scenarios_completed: 0,
      total_time_spent: 0,
    }

    this.currentUser = demoUser
    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('auth_token', 'dev_token_' + Date.now())

    return demoUser
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'admin'
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
