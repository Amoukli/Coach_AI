import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import apiClient from '../../services/api'

interface PatientProfile {
  age: number
  gender: string
  occupation: string
  presenting_complaint: string
  background: string
  personality_traits: string[]
  accent: string
  emotional_state: string
}

interface DialogueNode {
  id: string
  type: 'greeting' | 'response' | 'branch' | 'conclusion'
  content: string
  triggers?: string[]
  next_nodes?: string[]
  topic?: string
}

interface AssessmentRubric {
  must_ask_questions: string[]
  red_flags: string[]
  key_findings: string[]
  management_steps: string[]
}

interface ScenarioFormData {
  title: string
  specialty: string
  difficulty: string
  description: string
  learning_objectives: string[]
  patient_profile: PatientProfile
  dialogue_tree: DialogueNode[]
  correct_diagnosis: string
  differential_diagnoses: string[]
  assessment_rubric: AssessmentRubric
  clare_guideline_ids: string[]
}

const SPECIALTIES = [
  'General Practice',
  'Cardiology',
  'Respiratory',
  'Gastroenterology',
  'Neurology',
  'Psychiatry',
  'Paediatrics',
  'Obstetrics & Gynaecology',
  'Emergency Medicine',
  'Musculoskeletal',
]

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

const defaultFormData: ScenarioFormData = {
  title: '',
  specialty: 'General Practice',
  difficulty: 'beginner',
  description: '',
  learning_objectives: [''],
  patient_profile: {
    age: 45,
    gender: 'female',
    occupation: '',
    presenting_complaint: '',
    background: '',
    personality_traits: [],
    accent: 'British',
    emotional_state: 'neutral',
  },
  dialogue_tree: [
    {
      id: 'greeting',
      type: 'greeting',
      content: '',
      next_nodes: [],
    },
  ],
  correct_diagnosis: '',
  differential_diagnoses: [''],
  assessment_rubric: {
    must_ask_questions: [''],
    red_flags: [''],
    key_findings: [''],
    management_steps: [''],
  },
  clare_guideline_ids: [],
}

const ScenarioEditor: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(scenarioId)

  const [formData, setFormData] = useState<ScenarioFormData>(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'patient' | 'dialogue' | 'assessment'>('basic')

  useEffect(() => {
    if (scenarioId) {
      loadScenario()
    }
  }, [scenarioId])

  const loadScenario = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getScenario(scenarioId!)
      setFormData({
        title: data.title || '',
        specialty: data.specialty || 'General Practice',
        difficulty: data.difficulty || 'beginner',
        description: data.description || '',
        learning_objectives: data.learning_objectives?.length ? data.learning_objectives : [''],
        patient_profile: data.patient_profile || defaultFormData.patient_profile,
        dialogue_tree: data.dialogue_tree?.length ? data.dialogue_tree : defaultFormData.dialogue_tree,
        correct_diagnosis: data.correct_diagnosis || '',
        differential_diagnoses: data.differential_diagnoses?.length ? data.differential_diagnoses : [''],
        assessment_rubric: data.assessment_rubric || defaultFormData.assessment_rubric,
        clare_guideline_ids: data.clare_guideline_ids || [],
      })
    } catch (error) {
      console.error('Error loading scenario:', error)
      alert('Failed to load scenario')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clean up empty strings from arrays
    const cleanedData = {
      ...formData,
      // Generate scenario_id for new scenarios
      scenario_id: scenarioId || `scenario_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`,
      learning_objectives: formData.learning_objectives.filter(Boolean),
      differential_diagnoses: formData.differential_diagnoses.filter(Boolean),
      assessment_rubric: {
        must_ask_questions: formData.assessment_rubric.must_ask_questions.filter(Boolean),
        red_flags: formData.assessment_rubric.red_flags.filter(Boolean),
        key_findings: formData.assessment_rubric.key_findings.filter(Boolean),
        management_steps: formData.assessment_rubric.management_steps.filter(Boolean),
      },
    }

    try {
      setSaving(true)
      if (isEditing) {
        await apiClient.updateScenario(scenarioId!, cleanedData)
      } else {
        await apiClient.createScenario(cleanedData)
      }
      navigate('/admin/scenarios')
    } catch (error) {
      console.error('Error saving scenario:', error)
      alert('Failed to save scenario')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof ScenarioFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updatePatientProfile = (field: keyof PatientProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      patient_profile: { ...prev.patient_profile, [field]: value },
    }))
  }

  const updateRubric = (field: keyof AssessmentRubric, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      assessment_rubric: { ...prev.assessment_rubric, [field]: value },
    }))
  }

  const handleArrayFieldChange = (
    arrayField: 'learning_objectives' | 'differential_diagnoses',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[arrayField]]
    newArray[index] = value
    updateField(arrayField, newArray)
  }

  const addArrayItem = (arrayField: 'learning_objectives' | 'differential_diagnoses') => {
    updateField(arrayField, [...formData[arrayField], ''])
  }

  const removeArrayItem = (arrayField: 'learning_objectives' | 'differential_diagnoses', index: number) => {
    const newArray = formData[arrayField].filter((_, i) => i !== index)
    updateField(arrayField, newArray.length ? newArray : [''])
  }

  const handleRubricArrayChange = (field: keyof AssessmentRubric, index: number, value: string) => {
    const newArray = [...formData.assessment_rubric[field]]
    newArray[index] = value
    updateRubric(field, newArray)
  }

  const addRubricItem = (field: keyof AssessmentRubric) => {
    updateRubric(field, [...formData.assessment_rubric[field], ''])
  }

  const removeRubricItem = (field: keyof AssessmentRubric, index: number) => {
    const newArray = formData.assessment_rubric[field].filter((_, i) => i !== index)
    updateRubric(field, newArray.length ? newArray : [''])
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
          <h1 className="text-2xl font-bold text-secondary-900">
            {isEditing ? 'Edit Scenario' : 'Create New Scenario'}
          </h1>
          <p className="text-secondary-600">
            {isEditing ? 'Update scenario details and content' : 'Build a new clinical training scenario'}
          </p>
        </div>
        <Link to="/admin/scenarios" className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex space-x-8">
          {(['basic', 'patient', 'dialogue', 'assessment'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {tab === 'basic' ? 'Basic Info' : tab === 'patient' ? 'Patient Profile' : tab}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Scenario Title *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Chest Pain Assessment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Specialty *
                </label>
                <select
                  className="input"
                  value={formData.specialty}
                  onChange={(e) => updateField('specialty', e.target.value)}
                  required
                >
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Difficulty *
                </label>
                <select
                  className="input"
                  value={formData.difficulty}
                  onChange={(e) => updateField('difficulty', e.target.value)}
                  required
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Correct Diagnosis *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.correct_diagnosis}
                  onChange={(e) => updateField('correct_diagnosis', e.target.value)}
                  placeholder="e.g., Acute Coronary Syndrome"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Description
              </label>
              <textarea
                className="input min-h-[100px]"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of the scenario and learning context..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Learning Objectives
              </label>
              {formData.learning_objectives.map((obj, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={obj}
                    onChange={(e) => handleArrayFieldChange('learning_objectives', index, e.target.value)}
                    placeholder="e.g., Perform systematic cardiovascular history taking"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('learning_objectives', index)}
                    className="text-error hover:text-error/80"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('learning_objectives')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Learning Objective
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Differential Diagnoses
              </label>
              {formData.differential_diagnoses.map((diag, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={diag}
                    onChange={(e) => handleArrayFieldChange('differential_diagnoses', index, e.target.value)}
                    placeholder="e.g., Musculoskeletal chest pain"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('differential_diagnoses', index)}
                    className="text-error hover:text-error/80"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('differential_diagnoses')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Differential Diagnosis
              </button>
            </div>
          </div>
        )}

        {/* Patient Profile Tab */}
        {activeTab === 'patient' && (
          <div className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.patient_profile.age}
                  onChange={(e) => updatePatientProfile('age', parseInt(e.target.value) || 0)}
                  min={0}
                  max={120}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Gender *
                </label>
                <select
                  className="input"
                  value={formData.patient_profile.gender}
                  onChange={(e) => updatePatientProfile('gender', e.target.value)}
                  required
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.patient_profile.occupation}
                  onChange={(e) => updatePatientProfile('occupation', e.target.value)}
                  placeholder="e.g., Office worker"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Presenting Complaint *
              </label>
              <textarea
                className="input min-h-[80px]"
                value={formData.patient_profile.presenting_complaint}
                onChange={(e) => updatePatientProfile('presenting_complaint', e.target.value)}
                placeholder="What the patient initially reports, e.g., 'I've been having this pain in my chest for the last few days...'"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Medical & Social Background
              </label>
              <textarea
                className="input min-h-[100px]"
                value={formData.patient_profile.background}
                onChange={(e) => updatePatientProfile('background', e.target.value)}
                placeholder="Past medical history, medications, family history, lifestyle factors..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Accent/Voice Style
                </label>
                <select
                  className="input"
                  value={formData.patient_profile.accent}
                  onChange={(e) => updatePatientProfile('accent', e.target.value)}
                >
                  <option value="British">British</option>
                  <option value="Scottish">Scottish</option>
                  <option value="Irish">Irish</option>
                  <option value="Welsh">Welsh</option>
                  <option value="American">American</option>
                  <option value="Australian">Australian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Emotional State
                </label>
                <select
                  className="input"
                  value={formData.patient_profile.emotional_state}
                  onChange={(e) => updatePatientProfile('emotional_state', e.target.value)}
                >
                  <option value="neutral">Neutral</option>
                  <option value="anxious">Anxious</option>
                  <option value="calm">Calm</option>
                  <option value="distressed">Distressed</option>
                  <option value="irritable">Irritable</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Dialogue Tab */}
        {activeTab === 'dialogue' && (
          <div className="card space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Dialogue Tree Editor</h3>
              <p className="text-sm text-blue-700">
                The dialogue tree defines how the simulated patient responds to different questions.
                For complex scenarios, you may want to use the JSON import feature or the API directly.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Initial Greeting / Opening Statement *
              </label>
              <textarea
                className="input min-h-[100px]"
                value={formData.dialogue_tree[0]?.content || ''}
                onChange={(e) => {
                  const newTree = [...formData.dialogue_tree]
                  if (newTree[0]) {
                    newTree[0] = { ...newTree[0], content: e.target.value }
                  } else {
                    newTree[0] = {
                      id: 'greeting',
                      type: 'greeting',
                      content: e.target.value,
                      next_nodes: [],
                    }
                  }
                  updateField('dialogue_tree', newTree)
                }}
                placeholder="What the patient says when they first meet the doctor, e.g., 'Hello doctor, I've come in because I've been having this terrible pain in my chest...'"
                required
              />
            </div>

            <div className="text-sm text-secondary-500">
              <p>
                Additional dialogue nodes with branching logic can be added via the API or JSON import.
                The AI will use the patient profile and context to generate appropriate responses during scenarios.
              </p>
            </div>
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Must-Ask Questions
              </label>
              <p className="text-xs text-secondary-500 mb-2">
                Key questions that students should ask during the consultation
              </p>
              {formData.assessment_rubric.must_ask_questions.map((q, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={q}
                    onChange={(e) => handleRubricArrayChange('must_ask_questions', index, e.target.value)}
                    placeholder="e.g., Ask about duration and character of pain"
                  />
                  <button
                    type="button"
                    onClick={() => removeRubricItem('must_ask_questions', index)}
                    className="text-error hover:text-error/80"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addRubricItem('must_ask_questions')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Question
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Red Flags to Identify
              </label>
              <p className="text-xs text-secondary-500 mb-2">
                Critical warning signs students should recognize
              </p>
              {formData.assessment_rubric.red_flags.map((flag, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={flag}
                    onChange={(e) => handleRubricArrayChange('red_flags', index, e.target.value)}
                    placeholder="e.g., Radiating pain to left arm"
                  />
                  <button
                    type="button"
                    onClick={() => removeRubricItem('red_flags', index)}
                    className="text-error hover:text-error/80"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addRubricItem('red_flags')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Red Flag
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Key Clinical Findings
              </label>
              <p className="text-xs text-secondary-500 mb-2">
                Important findings the student should elicit or note
              </p>
              {formData.assessment_rubric.key_findings.map((finding, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={finding}
                    onChange={(e) => handleRubricArrayChange('key_findings', index, e.target.value)}
                    placeholder="e.g., Central crushing chest pain"
                  />
                  <button
                    type="button"
                    onClick={() => removeRubricItem('key_findings', index)}
                    className="text-error hover:text-error/80"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addRubricItem('key_findings')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Finding
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Management Steps
              </label>
              <p className="text-xs text-secondary-500 mb-2">
                Expected management or next steps the student should propose
              </p>
              {formData.assessment_rubric.management_steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={step}
                    onChange={(e) => handleRubricArrayChange('management_steps', index, e.target.value)}
                    placeholder="e.g., Urgent 12-lead ECG"
                  />
                  <button
                    type="button"
                    onClick={() => removeRubricItem('management_steps', index)}
                    className="text-error hover:text-error/80"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addRubricItem('management_steps')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Step
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 mt-6">
          <Link to="/admin/scenarios" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : isEditing ? 'Update Scenario' : 'Create Scenario'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ScenarioEditor
