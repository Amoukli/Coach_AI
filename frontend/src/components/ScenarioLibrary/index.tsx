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
  average_score: number | null
}

const ScenarioLibrary: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    specialty: '',
    difficulty: '',
  })

  useEffect(() => {
    loadScenarios()
  }, [filters])

  const loadScenarios = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getScenarios(filters)
      setScenarios(data)
    } catch (error) {
      console.error('Error loading scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'badge-success'
      case 'intermediate':
        return 'badge-warning'
      case 'advanced':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Scenario Library</h1>
        <p className="text-secondary-600">Choose a clinical scenario to practice your skills</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group mb-0">
            <label className="label">Specialty</label>
            <select
              className="input"
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
            >
              <option value="">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Neurology">Neurology</option>
              <option value="General">General Medicine</option>
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="label">Difficulty</label>
            <select
              className="input"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={() => setFilters({ specialty: '', difficulty: '' })} className="btn btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-12 h-12"></div>
        </div>
      ) : scenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="card hover:shadow-medium transition-shadow">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-secondary-900 flex-1">{scenario.title}</h3>
                  <span className={`badge ${getDifficultyColor(scenario.difficulty)}`}>{scenario.difficulty}</span>
                </div>

                <p className="text-sm text-secondary-600 mb-3">
                  <span className="font-medium">{scenario.specialty}</span>
                </p>

                <div className="flex items-center space-x-4 text-sm text-secondary-600">
                  <span>
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {scenario.times_played} plays
                  </span>
                  {scenario.average_score && (
                    <span>
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      {scenario.average_score}% avg
                    </span>
                  )}
                </div>
              </div>

              <Link to={`/scenarios/${scenario.scenario_id}/play`} className="btn btn-primary w-full">
                Start Scenario
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-secondary-600">No scenarios found matching your filters.</p>
          <button onClick={() => setFilters({ specialty: '', difficulty: '' })} className="btn btn-primary mt-4">
            View All Scenarios
          </button>
        </div>
      )}
    </div>
  )
}

export default ScenarioLibrary
