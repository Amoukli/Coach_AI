/**
 * Audio Service for handling speech playback and recording
 */

class AudioService {
  private currentAudio: HTMLAudioElement | null = null
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  constructor() {
    // Initialize Audio Context
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Play audio from a Blob
   */
  async playAudioBlob(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        this.stopAudio()

        // Create audio URL
        const audioUrl = URL.createObjectURL(audioBlob)

        // Create and play audio
        this.currentAudio = new Audio(audioUrl)
        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          reject(error)
        }

        this.currentAudio.play()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Play audio from a URL
   */
  async playAudioUrl(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        this.stopAudio()

        // Create and play audio
        this.currentAudio = new Audio(audioUrl)
        this.currentAudio.onended = () => resolve()
        this.currentAudio.onerror = (error) => reject(error)

        this.currentAudio.play()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Determine best supported MIME type for recording
      // Prefer webm/opus as it's widely supported and our backend can convert it
      const mimeType = this.getSupportedMimeType()

      this.mediaRecorder = new MediaRecorder(stream, { mimeType })
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Error starting audio recording:', error)
      throw error
    }
  }

  /**
   * Get the best supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav',
    ]

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`Using audio format: ${mimeType}`)
        return mimeType
      }
    }

    // Fallback - let browser choose
    console.log('Using default audio format')
    return ''
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = () => {
        // Use the actual MIME type from the recorder
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        this.audioChunks = []

        // Stop all tracks
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
        }

        console.log(`Recording complete: ${audioBlob.size} bytes, type: ${mimeType}`)
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Check if recording is in progress
   */
  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording'
  }

  /**
   * Convert audio blob to base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert blob to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopAudio()
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

// Create singleton instance
const audioService = new AudioService()

export default audioService
