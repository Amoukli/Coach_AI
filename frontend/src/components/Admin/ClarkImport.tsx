import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../services/api'

interface Consultation {
  id: string
  specialty: string
  diagnosis: string
  patient_age: number
  patient_gender: string
  created_at: string
  summary?: string
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

const ClarkImport: React.FC = () => {
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null)
  const [preview, setPreview] = useState<ConsultationPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    loadConsultations()
  }, [filter])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getClarkConsultations(filter || undefined)
      setConsultations(data)
    } catch (error) {
      console.error('Error loading consultations:', error)
    } finally {
      setLoading(false)
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
        alert(`Scenario imported successfully!\n\nScenario ID: ${result.scenario_id}\n\nThe scenario is in Draft status and needs to be reviewed and published.`)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
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
        <Link to="/admin/scenarios" className="btn btn-secondary">
          Back to Scenarios
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">How it works</h3>
            <p className="text-sm text-blue-700 mt-1">
              Consultations from Clark are anonymized and converted into training scenarios.
              Imported scenarios are created in Draft status and must be reviewed before publishing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Available Consultations</h2>
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

          {consultations.length === 0 ? (
            <div className="text-center py-8 text-secondary-600">
              <p>No consultations available for import.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
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
                      <p className="font-medium text-secondary-900">{consultation.diagnosis}</p>
                      <p className="text-sm text-secondary-500 mt-1">
                        {consultation.patient_age} y/o {consultation.patient_gender}
                      </p>
                      {consultation.summary && (
                        <p className="text-sm text-secondary-600 mt-2 line-clamp-2">
                          {consultation.summary}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <span className="badge badge-secondary text-xs">{consultation.specialty}</span>
                      <p className="text-xs text-secondary-400 mt-1">{formatDate(consultation.created_at)}</p>
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
    </div>
  )
}

export default ClarkImport
