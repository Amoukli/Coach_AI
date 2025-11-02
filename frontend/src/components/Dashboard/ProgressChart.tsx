import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import apiClient from '../../services/api'

interface ProgressChartProps {
  studentId: number
}

const ProgressChart: React.FC<ProgressChartProps> = ({ studentId }) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgressData()
  }, [studentId])

  const loadProgressData = async () => {
    try {
      const progressData = await apiClient.getProgressTrend(studentId, undefined, 30)

      // Transform data for chart
      const chartData = progressData.dates.map((date: string, index: number) => ({
        date: new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        score: progressData.scores[index],
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-600">
        <p>No progress data available yet. Complete scenarios to see your progress!</p>
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Line type="monotone" dataKey="score" stroke="#0073e6" strokeWidth={2} dot={{ fill: '#0073e6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProgressChart
