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

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'patient_response') {
      const newMessage: Message = {
        role: 'patient',
        message: data.message,
        timestamp: new Date().toISOString(),
        audio_url: data.audio_url,
      }

      setMessages((prev) => [...prev, newMessage])

      // Play audio if available
      if (data.audio_url) {
        audioService.playAudioUrl(data.audio_url).catch(error => {
          console.error('Error playing audio:', error)
        })
      }
    } else if (data.type === 'error') {
      console.error('WebSocket error:', data.message)
      alert(`Error: ${data.message}`)
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

  const convertToWAV = async (audioBlob: Blob): Promise<Blob> => {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Read blob as array buffer
    const arrayBuffer = await audioBlob.arrayBuffer()

    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Convert to WAV
    const numberOfChannels = 1 // Mono
    const sampleRate = 16000 // Azure prefers 16kHz
    const length = Math.ceil(audioBuffer.duration * sampleRate)

    // Create offline context for resampling
    const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate)
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(offlineContext.destination)
    source.start()

    // Render the audio
    const renderedBuffer = await offlineContext.startRendering()

    // Convert to WAV blob
    const wav = audioBufferToWav(renderedBuffer)
    return new Blob([wav], { type: 'audio/wav' })
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numberOfChannels * bytesPerSample

    const data = buffer.getChannelData(0)
    const dataLength = data.length * bytesPerSample
    const headerLength = 44
    const totalLength = headerLength + dataLength

    const arrayBuffer = new ArrayBuffer(totalLength)
    const view = new DataView(arrayBuffer)

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, totalLength - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true) // byte rate
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataLength, true)

    // Write audio data
    let offset = 44
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }

    return arrayBuffer
  }

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      try {
        setIsRecording(false)
        const audioBlob = await audioService.stopRecording()

        console.log('Recording stopped, blob size:', audioBlob.size, 'type:', audioBlob.type)

        // Convert to WAV format
        console.log('Converting to WAV format...')
        const wavBlob = await convertToWAV(audioBlob)
        console.log('WAV conversion complete, size:', wavBlob.size)

        // Convert to FormData for upload
        const formData = new FormData()
        formData.append('audio_file', wavBlob, 'recording.wav')

        // Send to speech recognition API
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/voice/recognize`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        })

        console.log('Recognition response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Recognized text:', data.text)
          if (data.text) {
            setInputMessage(data.text)
          } else {
            console.warn('No text recognized from speech')
            alert('Could not recognize speech. Please speak clearly and try again.')
          }
        } else {
          const errorText = await response.text()
          console.error('Speech recognition failed:', response.status, errorText)
          alert('Speech recognition failed. Please try typing instead.')
        }
      } catch (error) {
        console.error('Error processing recording:', error)
        alert('Error processing recording. Please try typing instead.')
      }
    } else {
      // Start recording
      try {
        console.log('Requesting microphone access...')
        await audioService.startRecording()
        console.log('Recording started successfully')
        setIsRecording(true)
      } catch (error: any) {
        console.error('Error starting recording:', error)

        let errorMessage = 'Unable to access microphone.'

        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings and try again.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.'
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.'
        }

        alert(errorMessage)
      }
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'patient' ? 'bg-secondary-200' : 'bg-primary-200'
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
                onClick={toggleRecording}
                disabled={sending}
                className={`btn ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'btn-secondary'}`}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isRecording ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
              <button onClick={sendMessage} disabled={sending || !inputMessage.trim()} className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {isRecording && (
              <div className="mt-2 text-center text-red-500 text-sm animate-pulse">
                🎤 Recording... Click microphone again to stop
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScenarioPlayer
