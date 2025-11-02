import React from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface SkillsRadarProps {
  data: {
    history_taking: number
    clinical_reasoning: number
    management: number
    communication: number
    efficiency: number
  }
}

const SkillsRadar: React.FC<SkillsRadarProps> = ({ data }) => {
  // Transform data for Recharts
  const chartData = [
    { skill: 'History Taking', score: data.history_taking || 0 },
    { skill: 'Clinical Reasoning', score: data.clinical_reasoning || 0 },
    { skill: 'Management', score: data.management || 0 },
    { skill: 'Communication', score: data.communication || 0 },
    { skill: 'Efficiency', score: data.efficiency || 0 },
  ]

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar name="Skills" dataKey="score" stroke="#0073e6" fill="#0073e6" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SkillsRadar
