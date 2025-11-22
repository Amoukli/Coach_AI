import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../../services/api'
import wsService from '../../services/websocket'
import audioService from '../../services/audio'
import authService from '../../services/auth'

interface Message {
  role: string
  message: string
  timestamp: string
  audio_url?: string
}

const ScenarioPlayer: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const user = authService.getCurrentUser() || authService.autoLoginDev()

  const [scenario, setScenario] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  // const [isPlaying, setIsPlaying] = useState(false) // TODO: Implement audio playback

  useEffect(() => {
    initializeScenario()
    return () => {
      wsService.disconnect()
      audioService.cleanup()
    }
  }, [scenarioId])

  const initializeScenario = async () => {
    try {
      if (!scenarioId || !user) return

      setLoading(true)

      // Load scenario
      const scenarioData = await apiClient.getScenario(scenarioId)
      setScenario(scenarioData)

      // Create session
      const sessionData = await apiClient.createSession(scenarioId, user.id)
      setSession(sessionData)

      // Connect WebSocket
      await wsService.connect(sessionData.session_id)

      // Set up message handler
      wsService.onMessage(handleWebSocketMessage)

      // Get initial patient message
      const initialMessage: Message = {
        role: 'patient',
        message: scenarioData.dialogue_tree?.root?.patient_says || 'Hello, doctor.',
        timestamp: new Date().toISOString(),
      }

      setMessages([initialMessage])

      // Generate and play initial audio
      await generateAndPlayAudio(initialMessage.message, scenarioData.patient_profile?.voice_profile)
    } catch (error) {
      console.error('Error initializing scenario:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWebSocketMessage = async (data: any) => {
    if (data.type === 'patient_response') {
      const newMessage: Message = {
        role: 'patient',
        message: data.message,
        timestamp: new Date().toISOString(),
        audio_url: data.audio_url,
      }

      setMessages((prev) => [...prev, newMessage])

      // Play audio if available (base64 encoded)
      if (data.audio_base64) {
        try {
          // Convert base64 to Blob
          const audioData = atob(data.audio_base64)
          const audioArray = new Uint8Array(audioData.length)
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i)
          }
          const audioBlob = new Blob([audioArray], { type: 'audio/wav' })
          await audioService.playAudioBlob(audioBlob)
        } catch (error) {
          console.error('Error playing audio:', error)
        }
      } else if (data.audio_url) {
        // Fallback to URL-based audio
        audioService.playAudioUrl(data.audio_url)
      }
    } else if (data.type === 'error') {
      console.error('WebSocket error:', data.message)
    }
  }

  const generateAndPlayAudio = async (text: string, voiceProfile?: any) => {
    try {
      const audioBlob = await apiClient.synthesizeSpeech(
        text,
        voiceProfile?.voice_id,
        voiceProfile?.emotional_state || 'neutral'
      )
      await audioService.playAudioBlob(audioBlob)
    } catch (error) {
      console.error('Error generating audio:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending || !session) return

    try {
      setSending(true)

      // Add student message
      const studentMessage: Message = {
        role: 'student',
        message: inputMessage,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, studentMessage])

      // Save to backend
      await apiClient.addMessageToSession(session.session_id, 'student', inputMessage)

      // Send via WebSocket for real-time response
      wsService.send({
        type: 'student_message',
        message: inputMessage,
      })

      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startRecording = async () => {
    try {
      setIsRecording(true)
      setRecordingTime(0)
      await audioService.startRecording()

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

        // Store interval ID for cleanup
        ; (window as any).recordingInterval = interval
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsRecording(false)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = async () => {
    try {
      // Clear interval
      if ((window as any).recordingInterval) {
        clearInterval((window as any).recordingInterval)
          ; (window as any).recordingInterval = null
      }

      setIsRecording(false)
      const audioBlob = await audioService.stopRecording()

      // Transcribe audio
      setSending(true)
      const transcribedText = await apiClient.transcribeAudio(audioBlob)
      setInputMessage(transcribedText)
    } catch (error) {
      console.error('Error stopping recording:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setSending(false)
      setRecordingTime(0)
    }
  }

  const completeScenario = async () => {
    if (!session) return

    try {
      await apiClient.completeSession(session.session_id)
      navigate(`/sessions/${session.session_id}/results`)
    } catch (error) {
      console.error('Error completing scenario:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!scenario || !session) {
    return (
      <div className="card text-center">
        <p className="text-secondary-600">Scenario not found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Patient Info Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Patient Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-600">Age</p>
              <p className="font-medium">{scenario.patient_profile?.age || 'Unknown'} years</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Gender</p>
              <p className="font-medium capitalize">{scenario.patient_profile?.gender || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Presenting Complaint</p>
              <p className="font-medium">{scenario.patient_profile?.presenting_complaint || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Scenario Details</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-secondary-600">Specialty:</span>{' '}
              <span className="font-medium">{scenario.specialty}</span>
            </p>
            <p>
              <span className="text-secondary-600">Difficulty:</span>{' '}
              <span className="badge badge-warning capitalize">{scenario.difficulty}</span>
            </p>
          </div>
        </div>

        <button onClick={completeScenario} className="btn btn-success w-full">
          Complete Scenario
        </button>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <div className="card h-full flex flex-col" style={{ minHeight: '600px' }}>
          <div className="card-header">
            <h2 className="text-xl font-bold">{scenario.title}</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`transcript-message ${msg.role} ${msg.role === 'patient' ? 'ml-0 mr-8' : 'ml-8 mr-0'}`}
              >
                <div className="flex items-start space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'patient' ? 'bg-secondary-200' : 'bg-primary-200'
                      }`}
                  >
                    {msg.role === 'patient' ? '🤕' : '👨‍⚕️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-700 capitalize mb-1">{msg.role}</p>
                    <p className="text-secondary-900">{msg.message}</p>
                    <p className="text-xs text-secondary-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="transcript-message patient ml-0 mr-8 opacity-50">
                <div className="flex items-center space-x-2">
                  <div className="spinner w-4 h-4"></div>
                  <span className="text-sm text-secondary-600">Patient is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-secondary-200 pt-4">
            {isRecording && (
              <div className="mb-2 flex items-center justify-center space-x-2 text-sm text-error-600">
                <div className="w-3 h-3 bg-error-600 rounded-full animate-pulse"></div>
                <span>Recording... {recordingTime}s</span>
              </div>
            )}
            <div className="flex space-x-2">
              <textarea
                className="input flex-1 resize-none"
                rows={2}
                placeholder="Ask a question or make a statement..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending || isRecording}
              />
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={sending}
                className={`btn ${isRecording ? 'btn-error' : 'btn-secondary'} px-3`}
                title={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>
              <button onClick={sendMessage} disabled={sending || !inputMessage.trim() || isRecording} className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScenarioPlayer
