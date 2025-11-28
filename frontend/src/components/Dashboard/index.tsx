import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../services/api'
import authService from '../../services/auth'
import SkillsRadar from './SkillsRadar'
import ProgressChart from './ProgressChart'
import PastCases from './PastCases'

interface DashboardStats {
  total_scenarios_completed: number
  total_time_spent: number
  average_score: number
  scenarios_by_specialty: Record<string, number>
  recent_activity: any[]
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [skillsData, setSkillsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const user = authService.getCurrentUser() || authService.autoLoginDev()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardData, skills] = await Promise.all([
        apiClient.getUserDashboard(user.id),
        apiClient.getSkillsRadar(user.id),
      ])

      setStats(dashboardData)
      setSkillsData(skills)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-card p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
        <p className="text-primary-100">Ready to continue your clinical training?</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Scenarios Completed</h3>
          <p className="text-3xl font-bold text-secondary-900">{stats?.total_scenarios_completed || 0}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-primary-600">{stats?.average_score || 0}%</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Time Spent</h3>
          <p className="text-3xl font-bold text-secondary-900">{stats?.total_time_spent || 0} min</p>
        </div>
      </div>

      {/* Skills and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Radar */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Skills</h2>
          {skillsData ? <SkillsRadar data={skillsData} /> : <p>No skill data available</p>}
        </div>

        {/* Progress Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Progress Over Time</h2>
          <ProgressChart userId={user.id} />
        </div>
      </div>

      {/* Past Cases */}
      <PastCases userId={user.id} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/scenarios" className="card hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Browse Scenarios</h3>
              <p className="text-sm text-secondary-600">Find scenarios to practice</p>
            </div>
          </div>
        </Link>

        <div className="card hover:shadow-medium transition-shadow cursor-pointer opacity-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">View Analytics</h3>
              <p className="text-sm text-secondary-600">Detailed performance analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
