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
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login'
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
  async getScenarios(params?: { specialty?: string; difficulty?: string; skip?: number; limit?: number }) {
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
  async createSession(scenarioId: string, studentId: number) {
    const response = await this.client.post('/sessions/', {
      scenario_id: scenarioId,
      student_id: studentId,
    })
    return response.data
  }

  async getSession(sessionId: string) {
    const response = await this.client.get(`/sessions/${sessionId}`)
    return response.data
  }

  async getStudentSessions(studentId: number, skip = 0, limit = 50) {
    const response = await this.client.get(`/sessions/student/${studentId}`, {
      params: { skip, limit },
    })
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

  async getStudentAssessments(studentId: number, skip = 0, limit = 50) {
    const response = await this.client.get(`/assessments/student/${studentId}`, {
      params: { skip, limit },
    })
    return response.data
  }

  async getStudentSkillProgress(studentId: number) {
    const response = await this.client.get(`/assessments/student/${studentId}/skills`)
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
  async getStudentDashboard(studentId: number) {
    const response = await this.client.get(`/analytics/student/${studentId}/dashboard`)
    return response.data
  }

  async getSkillsRadar(studentId: number) {
    const response = await this.client.get(`/analytics/student/${studentId}/skills-radar`)
    return response.data
  }

  async getProgressTrend(studentId: number, skill?: string, days = 30) {
    const response = await this.client.get(`/analytics/student/${studentId}/progress-trend`, {
      params: { skill, days },
    })
    return response.data
  }

  async getScenarioRecommendations(studentId: number, limit = 5) {
    const response = await this.client.get(`/analytics/student/${studentId}/recommendations`, {
      params: { limit },
    })
    return response.data
  }

  async getLeaderboard(specialty?: string, limit = 10) {
    const response = await this.client.get('/analytics/leaderboard', {
      params: { specialty, limit },
    })
    return response.data
  }
}

// Create singleton instance
const apiClient = new ApiClient()

export default apiClient
