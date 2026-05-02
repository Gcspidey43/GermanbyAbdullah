export const playTTS = (text: string, lang: string = 'de-DE') => {
  if (!window.speechSynthesis) return

  // Cancel any current speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9 // Slightly slower for better learning
  
  // Find a good voice
  const voices = window.speechSynthesis.getVoices()
  const premiumVoice = voices.find(v => v.lang.startsWith(lang) && v.name.includes('Google')) || 
                        voices.find(v => v.lang.startsWith(lang))
  
  if (premiumVoice) utterance.voice = premiumVoice

  window.speechSynthesis.speak(utterance)
}
