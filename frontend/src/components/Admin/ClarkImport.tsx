import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../services/api'

interface Consultation {
  id: string
  specialty?: string
  diagnosis?: string
  diagnosis_preview?: string
  presenting_complaint_preview?: string
  patient_age?: number
  patient_gender?: string
  date?: string
  created_at?: string
  summary?: string
  status?: string
  has_transcript?: boolean
  has_structured_data?: boolean
}

interface ConsultationsResponse {
  success: boolean
  authenticated: boolean
  login_required?: boolean
  message?: string
  consultations: Consultation[]
  count: number
  is_mock_data?: boolean
  error?: string
}

interface ConsultationPreview {
  consultation_id: string
  title: string
  specialty: string
  difficulty: string
  patient_profile: {
    name: string
    age: number
    gender: string
    presenting_complaint: string
    occupation?: string
    background?: string
  }
  correct_diagnosis: string
  learning_objectives: string[]
}

interface AuthStatus {
  authenticated: boolean
  username: string | null
  expires_at: string | null
}

const ClarkImport: React.FC = () => {
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null)
  const [preview, setPreview] = useState<ConsultationPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [filter, setFilter] = useState<string>('')

  // Auth state
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (authStatus !== null) {
      loadConsultations()
    }
  }, [filter, authStatus])

  const checkAuthStatus = async () => {
    try {
      const status = await apiClient.getClarkAuthStatus()
      setAuthStatus(status)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setAuthStatus({ authenticated: false, username: null, expires_at: null })
    }
  }

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const response: ConsultationsResponse = await apiClient.getClarkConsultations(filter || undefined)

      setConsultations(response.consultations || [])
      setIsMockData(response.is_mock_data || false)

      if (response.login_required && !response.authenticated) {
        setAuthStatus({ authenticated: false, username: null, expires_at: null })
      }
    } catch (error) {
      console.error('Error loading consultations:', error)
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const result = await apiClient.clarkLogin(loginUsername, loginPassword)

      if (result.success) {
        setAuthStatus({
          authenticated: true,
          username: result.user?.username || loginUsername,
          expires_at: result.expires_at || null
        })
        setShowLoginModal(false)
        setLoginUsername('')
        setLoginPassword('')
        // Reload consultations with real data
        loadConsultations()
      } else {
        setLoginError(result.error || 'Login failed')
      }
    } catch (error: any) {
      setLoginError(error.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.clarkLogout()
      setAuthStatus({ authenticated: false, username: null, expires_at: null })
      loadConsultations()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleSelectConsultation = async (consultationId: string) => {
    setSelectedConsultation(consultationId)
    setPreviewLoading(true)
    try {
      const previewData = await apiClient.previewClarkConsultation(consultationId)
      setPreview(previewData)
    } catch (error) {
      console.error('Error loading preview:', error)
      setPreview(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedConsultation) return

    try {
      setImporting(true)
      const result = await apiClient.importClarkConsultation(selectedConsultation)

      if (result.success) {
        alert(`Scenario imported successfully!\n\nScenario ID: ${result.scenario_id}\n\nThe scenario is in Draft status and needs to be reviewed before publishing.`)
        navigate('/admin/scenarios')
      } else {
        alert(`Import failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Error importing consultation:', error)
      alert('Failed to import consultation')
    } finally {
      setImporting(false)
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading && authStatus === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Import from Clark</h1>
          <p className="text-secondary-600">Import anonymized consultations as training scenarios</p>
        </div>
        <div className="flex items-center space-x-3">
          {authStatus?.authenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-secondary-600">
                Logged in as <strong>{authStatus.username}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="btn btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login to Clark
            </button>
          )}
          <Link to="/admin/scenarios" className="btn btn-secondary">
            Back to Scenarios
          </Link>
        </div>
      </div>

      {/* Auth Status Banner */}
      {!authStatus?.authenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-900">Login Required for Real Data</h3>
              <p className="text-sm text-amber-700 mt-1">
                Log in with your Clark admin credentials to access real consultation data.
                The data shown below is sample/demo data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mock Data Indicator */}
      {isMockData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900">Demo Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                Showing sample consultations for demonstration. Log in to Clark to access real anonymized consultation data.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">
              Available Consultations
              {authStatus?.authenticated && <span className="text-primary-600 ml-2">(Live)</span>}
            </h2>
            <select
              className="input text-sm w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Specialties</option>
              <option value="General Practice">General Practice</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Neurology">Neurology</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-8 text-secondary-600">
              <p>No consultations available for import.</p>
              {!authStatus?.authenticated && (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn btn-primary mt-4"
                >
                  Login to Access Consultations
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-secondary-100 max-h-[600px] overflow-y-auto">
              {consultations.map((consultation) => (
                <button
                  key={consultation.id}
                  onClick={() => handleSelectConsultation(consultation.id)}
                  className={`w-full text-left p-4 hover:bg-secondary-50 transition-colors ${
                    selectedConsultation === consultation.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900">
                        {consultation.diagnosis || consultation.diagnosis_preview || 'Clinical Consultation'}
                      </p>
                      {consultation.presenting_complaint_preview && (
                        <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                          {consultation.presenting_complaint_preview}
                        </p>
                      )}
                      {consultation.summary && (
                        <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                          {consultation.summary}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        {consultation.has_transcript && (
                          <span className="text-xs text-green-600">✓ Transcript</span>
                        )}
                        {consultation.has_structured_data && (
                          <span className="text-xs text-green-600">✓ Structured</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      {consultation.specialty && (
                        <span className="badge badge-secondary text-xs">{consultation.specialty}</span>
                      )}
                      <p className="text-xs text-secondary-400 mt-1">
                        {formatDate(consultation.date || consultation.created_at)}
                      </p>
                      {consultation.status && (
                        <span className={`text-xs ${consultation.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                          {consultation.status}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Scenario Preview</h2>
          </div>

          {!selectedConsultation ? (
            <div className="text-center py-12 text-secondary-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p>Select a consultation to preview</p>
            </div>
          ) : previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900">{preview.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="badge badge-secondary">{preview.specialty}</span>
                  <span className={`badge capitalize ${
                    preview.difficulty === 'beginner' ? 'badge-success' :
                    preview.difficulty === 'intermediate' ? 'badge-warning' :
                    'badge-error'
                  }`}>
                    {preview.difficulty}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-secondary-700 text-sm">Patient</h4>
                <p className="text-secondary-900">
                  {preview.patient_profile.age} y/o {preview.patient_profile.gender}
                  {preview.patient_profile.occupation && `, ${preview.patient_profile.occupation}`}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-secondary-700 text-sm">Presenting Complaint</h4>
                <p className="text-secondary-900 italic">"{preview.patient_profile.presenting_complaint}"</p>
              </div>

              <div>
                <h4 className="font-medium text-secondary-700 text-sm">Correct Diagnosis</h4>
                <p className="text-secondary-900">{preview.correct_diagnosis}</p>
              </div>

              <div>
                <h4 className="font-medium text-secondary-700 text-sm">Learning Objectives</h4>
                <ul className="list-disc list-inside text-secondary-700 text-sm space-y-1">
                  {preview.learning_objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-secondary-200">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="btn btn-primary w-full"
                >
                  {importing ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Import as Draft Scenario
                    </>
                  )}
                </button>
                <p className="text-xs text-secondary-500 text-center mt-2">
                  Imported scenarios require review before publishing
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-secondary-500">
              <p>Failed to load preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-secondary-900">Login to Clark</h2>
                <button
                  onClick={() => {
                    setShowLoginModal(false)
                    setLoginError('')
                  }}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-secondary-600 text-sm mb-4">
                Enter your Clark admin credentials to access real consultation data.
              </p>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="input w-full"
                    placeholder="Enter Clark admin username"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input w-full"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false)
                      setLoginError('')
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="btn btn-primary flex-1"
                  >
                    {loginLoading ? (
                      <>
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClarkImport
