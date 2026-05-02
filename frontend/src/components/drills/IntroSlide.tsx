import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, BookOpen } from 'lucide-react'
import { playTTS } from '../../lib/tts'

interface Props {
  word: string
  translation: string
  pronunciation?: string
  sentence?: string
  onNext: () => void
}

export const IntroSlide: React.FC<Props> = ({ word, translation, pronunciation, sentence, onNext }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[3rem] relative overflow-hidden mb-12"
      >
        <div className="absolute top-0 right-0 p-8 text-indigo-500/20">
          <BookOpen size={120} />
        </div>

        <div className="relative z-10">
          <p className="text-indigo-400 font-black uppercase tracking-[0.3em] mb-6">New Word</p>
          
          <h2 className="text-7xl font-black mb-4 tracking-tight">{word}</h2>
          <p className="text-slate-400 text-2xl font-medium mb-8 italic">"{pronunciation}"</p>
          
          <div className="h-px bg-white/10 w-24 mx-auto mb-8" />
          
          <h3 className="text-4xl font-bold text-white/90 mb-10">{translation}</h3>
          
          {sentence && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Example</p>
              <p className="text-xl text-slate-200 font-medium leading-relaxed">{sentence}</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => playTTS(word)}
          className="flex items-center gap-3 text-indigo-400 font-bold hover:text-indigo-300 transition"
        >
          <Volume2 size={24} /> Listen to Pronunciation
        </button>
        
        <button 
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-16 py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
