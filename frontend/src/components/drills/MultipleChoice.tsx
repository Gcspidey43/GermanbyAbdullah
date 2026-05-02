import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  word: string
  translation: string
  options: string[]
  onAnswer: (answer: string) => void
}

export const MultipleChoice: React.FC<Props> = ({ translation, options, onAnswer }) => {
  return (
    <div className="text-center">
      <p className="text-slate-500 text-lg mb-8 font-medium uppercase tracking-widest">Select the correct translation</p>
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-6xl font-black mb-16 text-white tracking-tight"
      >
        {translation}
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onAnswer(option)}
            className="p-8 glass rounded-[2rem] text-2xl font-bold hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-[0.98] border border-white/5"
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
