/**
 * API Client for Coach AI Backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_V1 = `${API_URL}/api/v1`

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_V1,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Log auth errors but don't redirect during development
        // TODO: Enable redirect when proper auth is implemented
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn('Auth error:', error.response?.status, error.response?.data)
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  clearToken(): void {
    localStorage.removeItem('auth_token')
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health')
    return response.data
  }

  // Scenarios
  async getScenarios(params?: { specialty?: string; difficulty?: string; status?: string; skip?: number; limit?: number }) {
    // Filter out empty string params to avoid 422 validation errors
    const cleanParams: Record<string, string | number> = {}
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanParams[key] = value
        }
      })
    }
    const response = await this.client.get('/scenarios/', { params: cleanParams })
    return response.data
  }

  async getScenario(scenarioId: string) {
    const response = await this.client.get(`/scenarios/${scenarioId}`)
    return response.data
  }

  async createScenario(scenarioData: any) {
    const response = await this.client.post('/scenarios', scenarioData)
    return response.data
  }

  // Sessions
  async createSession(scenarioId: string, userId: number) {
    const response = await this.client.post('/sessions/', {
      scenario_id: scenarioId,
      user_id: userId,
    })
    return response.data
  }

  async getSession(sessionId: string) {
    const response = await this.client.get(`/sessions/${sessionId}`)
    return response.data
  }

  async getUserSessions(userId: number, skip = 0, limit = 50) {
    const response = await this.client.get(`/sessions/user/${userId}`, {
      params: { skip, limit },
    })
    return response.data
  }

  async getUserSessionHistory(userId: number, status?: string, skip = 0, limit = 50) {
    const params: Record<string, string | number> = { skip, limit }
    if (status) params.status = status
    const response = await this.client.get(`/sessions/user/${userId}/history`, { params })
    return response.data
  }

  async addMessageToSession(sessionId: string, role: string, message: string, audioUrl?: string) {
    const response = await this.client.post(`/sessions/${sessionId}/message`, {
      role,
      message,
      audio_url: audioUrl,
    })
    return response.data
  }

  async completeSession(sessionId: string, diagnosis?: string) {
    const response = await this.client.post(`/sessions/${sessionId}/complete`, null, {
      params: { diagnosis },
    })
    return response.data
  }

  // Assessments
  async createAssessment(assessmentData: any) {
    const response = await this.client.post('/assessments', assessmentData)
    return response.data
  }

  async getAssessment(assessmentId: string) {
    const response = await this.client.get(`/assessments/${assessmentId}`)
    return response.data
  }

  async getAssessmentBySession(sessionId: string) {
    const response = await this.client.get(`/assessments/session/${sessionId}`)
    return response.data
  }

  async getUserAssessments(userId: number, skip = 0, limit = 50) {
    const response = await this.client.get(`/assessments/user/${userId}`, {
      params: { skip, limit },
    })
    return response.data
  }

  async getUserSkillProgress(userId: number) {
    const response = await this.client.get(`/assessments/user/${userId}/skills`)
    return response.data
  }

  // Voice
  async synthesizeSpeech(text: string, voiceName?: string, emotionalStyle = 'neutral') {
    const response = await this.client.post(
      '/voice/synthesize',
      {
        text,
        voice_name: voiceName,
        emotional_style: emotionalStyle,
      },
      {
        responseType: 'blob',
      }
    )
    return response.data
  }

  async getVoiceForProfile(accent: string, gender: string, emotionalState = 'neutral') {
    const response = await this.client.post('/voice/get-voice-for-profile', {
      accent,
      gender,
      emotional_state: emotionalState,
    })
    return response.data
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData()

    // Determine file extension from MIME type
    const mimeType = audioBlob.type || 'audio/webm'
    let extension = 'webm'
    if (mimeType.includes('wav')) extension = 'wav'
    else if (mimeType.includes('mp4')) extension = 'mp4'
    else if (mimeType.includes('ogg')) extension = 'ogg'
    else if (mimeType.includes('webm')) extension = 'webm'

    formData.append('file', audioBlob, `recording.${extension}`)

    const response = await this.client.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.text
  }

  // Analytics
  async getUserDashboard(userId: number) {
    const response = await this.client.get(`/analytics/user/${userId}/dashboard`)
    return response.data
  }

  async getSkillsRadar(userId: number) {
    const response = await this.client.get(`/analytics/user/${userId}/skills-radar`)
    return response.data
  }

  async getProgressTrend(userId: number, skill?: string, days = 30) {
    const response = await this.client.get(`/analytics/user/${userId}/progress-trend`, {
      params: { skill, days },
    })
    return response.data
  }

  async getScenarioRecommendations(userId: number, limit = 5) {
    const response = await this.client.get(`/analytics/user/${userId}/recommendations`, {
      params: { limit },
    })
    return response.data
  }

  // Users
  async getCurrentUser() {
    const response = await this.client.get('/users/me')
    return response.data
  }

  async updateUserProfile(userData: any) {
    const response = await this.client.put('/users/me', userData)
    return response.data
  }

  async getUserById(userId: number) {
    const response = await this.client.get(`/users/${userId}`)
    return response.data
  }

  async getLeaderboard(specialty?: string, limit = 10) {
    const response = await this.client.get('/analytics/leaderboard', {
      params: { specialty, limit },
    })
    return response.data
  }

  // Guidelines (Clare Integration)
  async searchGuidelines(condition: string, specialty?: string) {
    const response = await this.client.get('/guidelines/search', {
      params: { condition, specialty },
    })
    return response.data
  }

  async getGuideline(guidelineId: string) {
    const response = await this.client.get(`/guidelines/${guidelineId}`)
    return response.data
  }

  // Admin - Scenario Management
  async publishScenario(scenarioId: string) {
    const response = await this.client.post(`/scenarios/${scenarioId}/publish`)
    return response.data
  }

  async deleteScenario(scenarioId: string) {
    await this.client.delete(`/scenarios/${scenarioId}`)
  }

  async updateScenario(scenarioId: string, scenarioData: any) {
    const response = await this.client.put(`/scenarios/${scenarioId}`, scenarioData)
    return response.data
  }

  async archiveScenario(scenarioId: string) {
    const response = await this.client.post(`/scenarios/${scenarioId}/archive`)
    return response.data
  }

  // Clark Integration - Authentication
  async clarkLogin(username: string, password: string) {
    const response = await this.client.post('/clark/auth/login', { username, password })
    return response.data
  }

  async clarkLogout() {
    const response = await this.client.post('/clark/auth/logout')
    return response.data
  }

  async getClarkAuthStatus() {
    const response = await this.client.get('/clark/auth/status')
    return response.data
  }

  // Clark Integration - Import Consultations
  async getClarkConsultations(specialty?: string, limit: number = 20) {
    const params: Record<string, string | number> = { limit }
    if (specialty) params.specialty = specialty
    const response = await this.client.get('/clark/consultations', { params })
    return response.data
  }

  async previewClarkConsultation(consultationId: string) {
    const response = await this.client.get(`/clark/consultations/${consultationId}/preview`)
    return response.data
  }

  async importClarkConsultation(consultationId: string, difficulty?: string) {
    const params: Record<string, string> = {}
    if (difficulty) params.difficulty = difficulty
    const response = await this.client.post(`/clark/consultations/${consultationId}/import`, null, { params })
    return response.data
  }
}

// Create singleton instance
const apiClient = new ApiClient()

export default apiClient
