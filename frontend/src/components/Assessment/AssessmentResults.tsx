import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../../services/api'

interface Assessment {
  overall_score: number
  history_taking_score: number
  clinical_reasoning_score: number
  management_score: number
  communication_score: number
  efficiency_score: number
  feedback_summary: string
  strengths: string[]
  areas_for_improvement: string[]
  skills_breakdown: any
}

const AssessmentResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssessment()
  }, [sessionId])

  const loadAssessment = async () => {
    try {
      if (!sessionId) return

      setLoading(true)
      const data = await apiClient.getAssessmentBySession(sessionId)
      setAssessment(data)
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-primary-600'
    if (score >= 50) return 'text-warning'
    return 'text-error'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'badge-success'
    if (score >= 70) return 'badge-primary'
    if (score >= 50) return 'badge-warning'
    return 'badge-error'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="card text-center">
        <p className="text-secondary-600">Assessment not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-card p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Scenario Complete!</h1>
        <p className="text-primary-100">Here's your performance assessment</p>
      </div>

      {/* Overall Score */}
      <div className="card text-center">
        <h2 className="text-lg font-medium text-secondary-600 mb-2">Overall Score</h2>
        <div className={`text-6xl font-bold mb-4 ${getScoreColor(assessment.overall_score)}`}>
          {assessment.overall_score}%
        </div>
        <p className="text-secondary-700">{assessment.feedback_summary}</p>
      </div>

      {/* Skills Breakdown */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Skills Breakdown</h2>

        <div className="space-y-4">
          {/* History Taking */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-secondary-900">History Taking</span>
              <span className={`badge ${getScoreBadge(assessment.history_taking_score)}`}>
                {assessment.history_taking_score}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${assessment.history_taking_score}%` }}></div>
            </div>
            {assessment.skills_breakdown?.history_taking?.details && (
              <p className="text-sm text-secondary-600 mt-1">{assessment.skills_breakdown.history_taking.details}</p>
            )}
          </div>

          {/* Clinical Reasoning */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-secondary-900">Clinical Reasoning</span>
              <span className={`badge ${getScoreBadge(assessment.clinical_reasoning_score)}`}>
                {assessment.clinical_reasoning_score}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${assessment.clinical_reasoning_score}%` }}></div>
            </div>
            {assessment.skills_breakdown?.clinical_reasoning?.details && (
              <p className="text-sm text-secondary-600 mt-1">
                {assessment.skills_breakdown.clinical_reasoning.details}
              </p>
            )}
          </div>

          {/* Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-secondary-900">Management</span>
              <span className={`badge ${getScoreBadge(assessment.management_score)}`}>
                {assessment.management_score}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${assessment.management_score}%` }}></div>
            </div>
          </div>

          {/* Communication */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-secondary-900">Communication</span>
              <span className={`badge ${getScoreBadge(assessment.communication_score)}`}>
                {assessment.communication_score}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${assessment.communication_score}%` }}></div>
            </div>
          </div>

          {/* Efficiency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-secondary-900">Efficiency</span>
              <span className={`badge ${getScoreBadge(assessment.efficiency_score)}`}>
                {assessment.efficiency_score}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${assessment.efficiency_score}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths and Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <h3 className="text-lg font-bold text-success mb-4">Strengths</h3>
          {assessment.strengths && assessment.strengths.length > 0 ? (
            <ul className="space-y-2">
              {assessment.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary-700">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary-600">Keep practicing to identify your strengths!</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="card">
          <h3 className="text-lg font-bold text-warning mb-4">Areas for Improvement</h3>
          {assessment.areas_for_improvement && assessment.areas_for_improvement.length > 0 ? (
            <ul className="space-y-2">
              {assessment.areas_for_improvement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-warning mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary-700">{area}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary-600">Great work! No specific areas identified for improvement.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button onClick={() => navigate('/scenarios')} className="btn btn-primary flex-1">
          Practice Another Scenario
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline flex-1">
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}

export default AssessmentResults
