interface MainMenuProps {
  onModeSelect: (mode: string) => void
  onShowSettings: () => void
  onShowGuide: () => void
  onShowCredits: () => void
  onShowStats: () => void
  onShowCampaign: () => void
  currentStage: number
}

export default function MainMenu({ 
  onModeSelect, 
  onShowSettings, 
  onShowGuide, 
  onShowCredits, 
  onShowStats, 
  onShowCampaign,
  currentStage 
}: MainMenuProps) {
} 