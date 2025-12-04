// Icon exports for feature cards

export { default as SimulationsIcon } from './SimulationsIcon'
export { default as AssessmentIcon } from './AssessmentIcon'
export { default as LearningIcon } from './LearningIcon'
export { default as VoiceIcon } from './VoiceIcon'
export { default as ProgressIcon } from './ProgressIcon'
export { default as ClareIcon } from './ClareIcon'

// Icon mapping by feature ID
import SimulationsIcon from './SimulationsIcon'
import AssessmentIcon from './AssessmentIcon'
import LearningIcon from './LearningIcon'
import VoiceIcon from './VoiceIcon'
import ProgressIcon from './ProgressIcon'
import ClareIcon from './ClareIcon'

export const iconMap: Record<string, React.FC<{ isHovered: boolean }>> = {
  simulations: SimulationsIcon,
  assessment: AssessmentIcon,
  learning: LearningIcon,
  voice: VoiceIcon,
  progress: ProgressIcon,
  clare: ClareIcon
}
