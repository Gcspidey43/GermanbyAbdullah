import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  word: string
  onAnswer: (answer: string) => void
}

export const Scramble: React.FC<Props> = ({ word, onAnswer }) => {
  const [letters, setLetters] = useState<{ char: string, id: number, used: boolean }[]>([])
  const [selection, setSelection] = useState<{ char: string, id: number }[]>([])
  
  useEffect(() => {
    const charArray = word.split('').map((char, idx) => ({ char, id: idx, used: false }))
    const scrambled = [...charArray].sort(() => Math.random() - 0.5)
    setLetters(scrambled)
    setSelection([])
  }, [word])

  const handleLetterClick = (item: { char: string, id: number }) => {
    if (selection.length >= word.length) return
    setSelection([...selection, item])
    setLetters(letters.map(l => l.id === item.id ? { ...l, used: true } : l))
  }

  const handleRemoveLast = () => {
    if (selection.length === 0) return
    const last = selection[selection.length - 1]
    setSelection(selection.slice(0, -1))
    setLetters(letters.map(l => l.id === last.id ? { ...l, used: false } : l))
  }

  useEffect(() => {
    if (selection.length === word.length && selection.length > 0) {
      const result = selection.map(s => s.char).join('')
      onAnswer(result)
    }
  }, [selection, word])

  return (
    <div className="text-center">
      <p className="text-slate-500 text-lg mb-8 font-medium uppercase tracking-widest">Reorder the letters</p>
      
      {/* Answer Slots */}
      <div className="flex justify-center gap-3 mb-16 flex-wrap min-h-[80px]">
        {word.split('').map((_, i) => (
          <div 
            key={i}
            onClick={i === selection.length - 1 ? handleRemoveLast : undefined}
            className={`w-14 h-16 md:w-16 md:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all
              ${selection[i] ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg cursor-pointer' : 'bg-white/5 border-white/10 text-transparent'}
            `}
          >
            {selection[i]?.char}
          </div>
        ))}
      </div>

      {/* Available Letters */}
      <div className="flex justify-center gap-4 flex-wrap max-w-2xl mx-auto">
        {letters.map((item) => (
          <motion.button
            key={item.id}
            whileHover={!item.used ? { scale: 1.1 } : {}}
            whileTap={!item.used ? { scale: 0.9 } : {}}
            disabled={item.used}
            onClick={() => handleLetterClick(item)}
            className={`w-14 h-16 md:w-16 md:h-20 glass rounded-2xl flex items-center justify-center text-3xl font-black transition-all
              ${item.used ? 'opacity-0 cursor-default scale-90' : 'hover:border-indigo-500/50 hover:bg-white/10'}
            `}
          >
            {item.char}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
