import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { MultipleChoice } from '../components/drills/MultipleChoice'
import { Typing } from '../components/drills/Typing'
import { Scramble } from '../components/drills/Scramble'
import { IntroSlide } from '../components/drills/IntroSlide'
import { Sentence } from '../components/drills/Sentence'
import { X, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playTTS } from '../lib/tts'

import { API_URL } from '../config'

export const Lesson: React.FC = () => {
  const [drills, setDrills] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const startTime = useRef<number>(Date.now())
  
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/lessons/generate`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDrills(res.data.drills)
        startTime.current = Date.now()
      } catch (err) {
        navigate('/')
      }
    }
    fetchLesson()
  }, [])

  // Auto-play TTS on new drill
  useEffect(() => {
    if (drills[currentIndex]) {
      const drill = drills[currentIndex]
      // Only play TTS for the German word during non-quiz slides
      if (drill.type === 'intro' || drill.type === 'scramble' || drill.type === 'sentence') {
        playTTS(drill.word, 'de-DE')
      }
    }
  }, [currentIndex, drills])

  const handleAnswer = async (answer: string) => {
    const drill = drills[currentIndex]
    
    if (drill.type === 'intro') {
      setCurrentIndex(currentIndex + 1)
      startTime.current = Date.now()
      return
    }

    const timeTakenMs = Date.now() - startTime.current
    const isCorrect = answer.trim().toLowerCase() === drill.word.toLowerCase()

    setFeedback(isCorrect ? 'correct' : 'wrong')
    
    // Play the German word after answering to reinforce learning
    playTTS(drill.word, 'de-DE')

    await axios.post(`${API_URL}/api/lessons/submit-drill`, {
      wordId: drill.wordId,
      isCorrect,
      timeTakenMs,
      mistakeCount: isCorrect ? 0 : 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    setTimeout(async () => {
      setFeedback(null)
      if (currentIndex < drills.length - 1) {
        setCurrentIndex(currentIndex + 1)
        startTime.current = Date.now()
      } else {
        await axios.post(`${API_URL}/api/lessons/complete`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsFinished(true)
      }
    }, 1500)
  }

  if (drills.length === 0) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
    </div>
  )

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h1 className="text-5xl font-black mb-6">Mission Accomplished!</h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">You've completed your daily training. Your memory is getting sharper.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            Finish & Return
          </button>
        </motion.div>
      </div>
    )
  }

  const currentDrill = drills[currentIndex]
  const progress = ((currentIndex) / drills.length) * 100

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col text-white font-sans overflow-hidden">
      <header className="p-8 flex items-center gap-8 max-w-5xl mx-auto w-full">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white transition p-2">
          <X size={28} />
        </button>
        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-4xl"
          >
            <div className="flex justify-center mb-8">
              <button 
                onClick={() => {
                  if (feedback) {
                    playTTS(currentDrill.word, 'de-DE') 
                  } else {
                    const isRecallDrill = currentDrill.type === 'typing' || currentDrill.type === 'multiple_choice';
                    playTTS(
                      isRecallDrill ? currentDrill.translation : currentDrill.word, 
                      isRecallDrill ? 'en-US' : 'de-DE'
                    )
                  }
                }}
                className="p-6 glass rounded-full hover:bg-white/10 transition text-indigo-400 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Volume2 size={40} className="relative z-10" />
              </button>
            </div>

            {currentDrill.type === 'intro' ? (
              <IntroSlide
                word={currentDrill.word}
                translation={currentDrill.translation}
                pronunciation={currentDrill.pronunciation}
                sentence={currentDrill.sentence}
                onNext={() => handleAnswer('')}
              />
            ) : currentDrill.type === 'multiple_choice' ? (
              <MultipleChoice 
                word={currentDrill.word} 
                translation={currentDrill.translation}
                options={currentDrill.options} 
                onAnswer={handleAnswer} 
              />
            ) : currentDrill.type === 'scramble' ? (
              <Scramble 
                word={currentDrill.word} 
                onAnswer={handleAnswer} 
              />
            ) : currentDrill.type === 'sentence' ? (
              <Sentence
                sentence={currentDrill.sentence}
                targetWord={currentDrill.word}
                onAnswer={handleAnswer}
              />
            ) : (
              <Typing 
                translation={currentDrill.translation} 
                correctWord={currentDrill.word} 
                onAnswer={handleAnswer} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className={`fixed bottom-0 left-0 right-0 p-10 backdrop-blur-2xl border-t border-white/10 z-50 ${feedback === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'}`}
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {feedback === 'correct' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback === 'correct' ? 'Outstanding!' : 'Not quite right'}
                  </h3>
                  {feedback === 'wrong' && (
                    <p className="text-slate-400 text-lg mt-1 font-medium">The correct answer was: <span className="text-white font-bold">{currentDrill.word}</span></p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
