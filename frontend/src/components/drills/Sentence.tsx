import React, { useState } from 'react'

interface Props {
  sentence: string
  targetWord: string
  onAnswer: (answer: string) => void
}

export const Sentence: React.FC<Props> = ({ sentence, targetWord, onAnswer }) => {
  const [input, setInput] = useState('')
  
  // Replace the target word in the sentence with a blank
  const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAnswer(input)
  }

  return (
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-slate-500 text-lg mb-8 font-medium uppercase tracking-widest">Complete the sentence</p>
      
      <div className="glass p-12 rounded-[3rem] mb-12">
        <h2 className="text-3xl md:text-4xl font-bold leading-relaxed">
          {parts.map((part, i) => (
            part.toLowerCase() === targetWord.toLowerCase() ? (
              <span key={i} className="inline-block border-b-4 border-indigo-500 min-w-[120px] mx-2 text-indigo-400">
                {input || '...'}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          ))}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full text-3xl p-6 glass rounded-2xl text-center outline-none focus:border-indigo-500 transition-all font-black"
          placeholder="Type missing word"
        />
        <button type="submit" className="hidden">Submit</button>
      </form>
    </div>
  )
}
