import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../services/api'

interface SessionHistory {
  id: number
  session_id: string
  scenario_id: number
  scenario_title: string
  scenario_specialty: string
  status: string
  started_at: string
  completed_at?: string
  duration?: number
  overall_score?: number
  diagnosis_submitted?: string
  diagnosis_correct?: boolean
}

interface PastCasesProps {
  userId: number
}

const PastCases: React.FC<PastCasesProps> = ({ userId }) => {
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadSessions()
  }, [userId, filter])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const status = filter === 'all' ? undefined : filter
      const data = await apiClient.getUserSessionHistory(userId, status)
      setSessions(data)
    } catch (error) {
      console.error('Error loading session history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'badge-success'
    if (score >= 70) return 'badge-primary'
    if (score >= 50) return 'badge-warning'
    return 'badge-error'
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-xl font-bold">Past Cases</h2>
        <select
          className="input text-sm w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Cases</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-secondary-600">
          <svg className="w-12 h-12 mx-auto mb-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No cases found. Start practicing!</p>
          <Link to="/scenarios" className="btn btn-primary mt-4 inline-block">
            Browse Scenarios
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-secondary-600">Date</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-secondary-600">Scenario</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-secondary-600">Specialty</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-secondary-600">Duration</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-secondary-600">Score</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-secondary-600">Status</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-secondary-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.session_id} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="py-3 px-2 text-sm text-secondary-700">
                    {formatDate(session.started_at)}
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-secondary-900 text-sm">{session.scenario_title}</p>
                    {session.diagnosis_submitted && (
                      <p className="text-xs text-secondary-500 mt-0.5">
                        Diagnosis: {session.diagnosis_submitted}
                        {session.diagnosis_correct !== null && (
                          <span className={session.diagnosis_correct ? 'text-green-600 ml-1' : 'text-error ml-1'}>
                            {session.diagnosis_correct ? '(Correct)' : '(Incorrect)'}
                          </span>
                        )}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <span className="badge badge-secondary text-xs">{session.scenario_specialty}</span>
                  </td>
                  <td className="py-3 px-2 text-center text-sm text-secondary-700">
                    {formatDuration(session.duration)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {session.overall_score !== null && session.overall_score !== undefined ? (
                      <span className={`badge ${getScoreBadge(session.overall_score)} text-sm font-semibold`}>
                        {session.overall_score}%
                      </span>
                    ) : (
                      <span className="text-secondary-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`badge text-xs capitalize ${
                      session.status === 'completed' ? 'badge-success' :
                      session.status === 'in_progress' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {session.status === 'completed' ? (
                      <Link
                        to={`/sessions/${session.session_id}/results`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Results
                      </Link>
                    ) : session.status === 'in_progress' ? (
                      <Link
                        to={`/scenarios/${session.scenario_id}/play`}
                        className="text-warning hover:text-warning/80 text-sm font-medium"
                      >
                        Continue
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PastCases
