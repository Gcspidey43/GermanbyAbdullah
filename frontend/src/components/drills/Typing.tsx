import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  translation: string
  correctWord: string
  onAnswer: (answer: string) => void
}

export const Typing: React.FC<Props> = ({ translation, onAnswer }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAnswer(input)
  }

  return (
    <div className="text-center">
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-6xl font-black mb-4 text-white tracking-tight"
      >
        {translation}
      </motion.h2>
      <p className="text-slate-500 text-lg mb-16 font-medium">Translate this word to continue</p>
      
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative">
        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full text-4xl p-8 glass rounded-[2.5rem] text-center outline-none border-2 border-transparent focus:border-indigo-500/50 focus:shadow-2xl focus:shadow-indigo-500/10 transition-all font-black"
          placeholder="..."
        />
        <div className="mt-8">
           <p className="text-slate-600 text-sm font-bold uppercase tracking-[0.2em]">Press Enter to check</p>
        </div>
        <button type="submit" className="hidden">Submit</button>
      </form>
    </div>
  )
}
