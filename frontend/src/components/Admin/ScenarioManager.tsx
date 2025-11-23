import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../services/api'

interface Scenario {
  id: number
  scenario_id: string
  title: string
  specialty: string
  difficulty: string
  status: string
  times_played: number
  average_score?: number
}

const ScenarioManager: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    loadScenarios()
  }, [filter])

  const loadScenarios = async () => {
    try {
      setLoading(true)
      // Pass status filter - 'all' means no filter (show all including drafts)
      const status = filter === 'all' ? undefined : filter
      const data = await apiClient.getScenarios({ status })
      setScenarios(data)
    } catch (error) {
      console.error('Error loading scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (scenarioId: string) => {
    try {
      setPublishing(scenarioId)
      await apiClient.publishScenario(scenarioId)
      await loadScenarios()
    } catch (error) {
      console.error('Error publishing scenario:', error)
      alert('Failed to publish scenario')
    } finally {
      setPublishing(null)
    }
  }

  const handleDelete = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario? This cannot be undone.')) {
      return
    }

    try {
      await apiClient.deleteScenario(scenarioId)
      await loadScenarios()
    } catch (error) {
      console.error('Error deleting scenario:', error)
      alert('Failed to delete scenario')
    }
  }

  const handleArchive = async (scenarioId: string) => {
    if (!confirm('Archive this scenario? It will no longer be available to students.')) {
      return
    }

    try {
      await apiClient.archiveScenario(scenarioId)
      await loadScenarios()
    } catch (error) {
      console.error('Error archiving scenario:', error)
      alert('Failed to archive scenario')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'badge-success'
      case 'draft':
        return 'badge-warning'
      case 'archived':
        return 'badge-secondary'
      default:
        return 'badge-secondary'
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'badge-success'
      case 'intermediate':
        return 'badge-warning'
      case 'advanced':
        return 'badge-error'
      default:
        return 'badge-secondary'
    }
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
          <h1 className="text-2xl font-bold text-secondary-900">Scenario Manager</h1>
          <p className="text-secondary-600">Create, edit, and publish clinical scenarios</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/admin/import" className="btn btn-secondary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import from Clark
          </Link>
          <Link to="/admin/scenarios/new" className="btn btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Scenario
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-secondary-700">Status:</label>
          <select
            className="input w-auto text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Scenarios</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <span className="text-sm text-secondary-500">
            {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="card">
        {scenarios.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-secondary-600 mb-4">No scenarios found</p>
            <Link to="/admin/scenarios/new" className="btn btn-primary">
              Create Your First Scenario
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Specialty</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-secondary-600">Difficulty</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-secondary-600">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-secondary-600">Plays</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-secondary-600">Avg Score</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr key={scenario.scenario_id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-secondary-900">{scenario.title}</p>
                      <p className="text-xs text-secondary-500">{scenario.scenario_id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="badge badge-secondary">{scenario.specialty}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge ${getDifficultyBadge(scenario.difficulty)} capitalize`}>
                        {scenario.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge ${getStatusBadge(scenario.status)} capitalize`}>
                        {scenario.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-secondary-700">
                      {scenario.times_played}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {scenario.average_score ? (
                        <span className="font-medium text-secondary-900">{scenario.average_score}%</span>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/scenarios/${scenario.scenario_id}/edit`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        {scenario.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(scenario.scenario_id)}
                            disabled={publishing === scenario.scenario_id}
                            className="text-success hover:text-success/80 text-sm font-medium"
                          >
                            {publishing === scenario.scenario_id ? 'Publishing...' : 'Publish'}
                          </button>
                        )}
                        {scenario.status === 'published' && (
                          <button
                            onClick={() => handleArchive(scenario.scenario_id)}
                            className="text-secondary-600 hover:text-secondary-800 text-sm font-medium"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(scenario.scenario_id)}
                          className="text-error hover:text-error/80 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScenarioManager
