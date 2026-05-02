import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Book, ChevronLeft, Trash2, Edit2, Users, 
  Activity, RefreshCw, Shield, Zap, ChevronRight 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '../config'

// Version 2.3 - Clean Stable Build
console.log('AdminPanel Component v2.3 Initialized');

export const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'decks' | 'users' | 'security'>('decks')
  const [decks, setDecks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedDeck, setSelectedDeck] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', target_word: '', translation: '', pronunciation: '', sentence: '', newPassword: '' })
  
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  const fetchDecks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/decks`, { headers: { Authorization: `Bearer ${token}` } })
      setDecks(res.data)
    } catch (e) { console.error('Fetch decks error:', e) }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(res.data)
    } catch (e) { console.error('Fetch users error:', e) }
  }

  const fetchWords = async (deckId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/decks/${deckId}/words`, { headers: { Authorization: `Bearer ${token}` } })
      setWords(res.data)
    } catch (e) { console.error('Fetch words error:', e) }
  }

  useEffect(() => { 
    fetchDecks(); 
    fetchUsers(); 
  }, [])

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    await axios.post(`${API_URL}/api/decks`, formData, { headers: { Authorization: `Bearer ${token}` } })
    setIsModalOpen(null); fetchDecks()
  }

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    await axios.put(`${API_URL}/api/decks/${editItem.id}`, formData, { headers: { Authorization: `Bearer ${token}` } })
    setIsModalOpen(null); fetchDecks()
  }

  const handleDeleteDeck = async (id: string) => {
    if (!confirm('Delete course?')) return
    await axios.delete(`${API_URL}/api/decks/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    fetchDecks()
  }

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault()
    await axios.post(`${API_URL}/api/decks/${selectedDeck.id}/words`, formData, { headers: { Authorization: `Bearer ${token}` } })
    setIsModalOpen(null); fetchWords(selectedDeck.id)
  }

  const handleUpdateWord = async (e: React.FormEvent) => {
    e.preventDefault()
    await axios.put(`${API_URL}/api/words/${editItem.id}`, formData, { headers: { Authorization: `Bearer ${token}` } })
    setIsModalOpen(null); fetchWords(selectedDeck.id)
  }

  const handleDeleteWord = async (id: string) => {
    if (!confirm('Delete word?')) return
    await axios.delete(`${API_URL}/api/words/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    fetchWords(selectedDeck.id)
  }

  const handleResetData = async () => {
    if (!confirm('Erase all course content?')) return
    await axios.post(`${API_URL}/api/admin/reset-content`, {}, { headers: { Authorization: `Bearer ${token}` } })
    window.location.reload()
  }

  const toggleUserStatus = async (user: any) => {
    const status = user.status === 'blocked' ? 'active' : 'blocked'
    await axios.patch(`${API_URL}/api/admin/users/${user.id}/status`, { status: status }, { headers: { Authorization: `Bearer ${token}` } })
    fetchUsers()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete user?')) return
    await axios.delete(`${API_URL}/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    fetchUsers()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/auth/change-password`, { newPassword: formData.newPassword }, { headers: { Authorization: `Bearer ${token}` } })
      alert('Password updated'); 
      setFormData({ ...formData, newPassword: '' })
    } catch (err) { alert('Update failed') }
  }

  return (
    <div className="min-h-screen mesh-gradient p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 glass-panel p-6 rounded-[2.5rem]">
          <div className="flex items-center gap-6">
            <button onClick={() => selectedDeck ? setSelectedDeck(null) : navigate('/')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg"><ChevronLeft size={24} /></button>
            <h1 className="text-3xl font-black tracking-tight">{selectedDeck ? selectedDeck.name : 'Master Control'}</h1>
          </div>
          <div className="flex gap-4">
             {!selectedDeck && (
               <>
                 <button onClick={() => setView('decks')} className={`px-6 py-3 rounded-2xl font-bold transition ${view === 'decks' ? 'bg-indigo-600' : 'bg-white/5'}`}>Content</button>
                 <button onClick={() => setView('users')} className={`px-6 py-3 rounded-2xl font-bold transition ${view === 'users' ? 'bg-indigo-600' : 'bg-white/5'}`}>Users</button>
                 <button onClick={() => setView('security')} className={`px-6 py-3 rounded-2xl font-bold transition ${view === 'security' ? 'bg-indigo-600' : 'bg-white/5'}`}>Security</button>
               </>
             )}
             {view !== 'security' && <button onClick={() => selectedDeck ? setIsModalOpen('word') : setIsModalOpen('deck')} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20} /> New {selectedDeck ? 'Word' : 'Deck'}</button>}
          </div>
        </header>

        {view === 'security' ? (
           <div className="max-w-md mx-auto">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-12 rounded-[3rem]">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Shield size={24} className="text-indigo-400" /> Security</h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                     <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-indigo-500" placeholder="••••••••" required />
                   </div>
                   <button type="submit" className="w-full bg-indigo-600 py-5 rounded-2xl font-black shadow-xl">Update Password</button>
                </form>
             </motion.div>
           </div>
        ) : view === 'users' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(u => (
              <div key={u.id} className={`glass-panel p-8 rounded-[2rem] border relative overflow-hidden group transition-all ${u.status === 'blocked' ? 'border-red-500/50 opacity-80' : 'border-white/5'}`}>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.is_admin ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>{u.is_admin ? 'Admin' : 'Student'}</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${u.status === 'blocked' ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-slate-300'}`}><Users size={24} /></div>
                  <div className="overflow-hidden">
                    <p className={`font-bold truncate ${u.status === 'blocked' ? 'text-red-400 line-through' : 'text-slate-200'}`}>{u.email}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black mt-0.5">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">XP</p><p className="text-2xl font-black text-indigo-400">{u.xp || 0}</p></div>
                   <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Words</p><p className="text-2xl font-black text-emerald-400">{u.words_learned || 0}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5"><Zap size={16} className="text-orange-500" fill="currentColor" /><div><p className="text-[9px] font-black text-slate-500 uppercase">Streak</p><p className="text-sm font-black">{u.streak || 0}d</p></div></div>
                   <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5"><Activity size={16} className="text-blue-400" /><div><p className="text-[9px] font-black text-slate-500 uppercase">Today</p><p className="text-sm font-black">{u.lessons_today || 0}/2</p></div></div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => toggleUserStatus(u)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${u.status === 'blocked' ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600' : 'bg-red-500/10 text-red-500 hover:bg-red-500'}`}>{u.status === 'blocked' ? 'Unblock' : 'Block'}</button>
                   <button onClick={() => deleteUser(u.id)} className="w-12 bg-white/5 hover:bg-red-500 transition-all rounded-xl flex items-center justify-center text-slate-500 hover:text-white"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : !selectedDeck ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {decks.map((deck) => (
                <motion.div key={deck.id} whileHover={{ scale: 1.02 }} className="glass-panel p-10 rounded-[3rem] cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={(e) => { e.stopPropagation(); setEditItem(deck); setFormData({ ...formData, name: deck.name, description: deck.description }); setIsModalOpen('edit-deck'); }} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500"><Trash2 size={16} /></button>
                  </div>
                  <div onClick={() => { setSelectedDeck(deck); fetchWords(deck.id); }}>
                    <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-xl"><Book size={28} /></div>
                    <h3 className="text-2xl font-black mb-3">{deck.name}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6 line-clamp-2">{deck.description}</p>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold group-hover:gap-4 transition-all">Manage <ChevronRight size={18} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="pt-12 border-t border-white/10">
               <h3 className="text-red-500 font-black uppercase tracking-[0.3em] mb-6">Danger Zone</h3>
               <button onClick={handleResetData} className="flex items-center gap-3 px-8 py-5 border-2 border-red-500/20 text-red-500 rounded-3xl font-black hover:bg-red-500 hover:text-white transition-all shadow-xl"><RefreshCw size={20} /> Erase All Course Content</button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-[3rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-500">German</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-500">English</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Example</th>
                  <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {words.map((word) => (
                  <tr key={word.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-10 py-8 font-black text-xl text-indigo-400">{word.target_word}</td>
                    <td className="px-10 py-8 font-bold text-slate-200">{word.translation}</td>
                    <td className="px-10 py-8 text-slate-500 italic max-w-md truncate">{word.sentence}</td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => { setEditItem(word); setFormData(word); setIsModalOpen('edit-word'); }} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteWord(word.id)} className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 transition"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel p-12 rounded-[3.5rem] w-full max-w-xl">
                <h2 className="text-3xl font-black mb-10">{isModalOpen === 'deck' ? 'New Course' : isModalOpen === 'edit-deck' ? 'Edit Course' : isModalOpen === 'edit-word' ? 'Edit Entry' : 'New Word'}</h2>
                <form onSubmit={isModalOpen === 'deck' ? handleCreateDeck : isModalOpen === 'edit-deck' ? handleUpdateDeck : isModalOpen === 'edit-word' ? handleUpdateWord : handleAddWord} className="space-y-6">
                  {(isModalOpen === 'deck' || isModalOpen === 'edit-deck') ? (
                    <>
                      <input type="text" value={formData.name} placeholder="Course Name" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 font-bold" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      <textarea value={formData.description} placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 h-32" onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={formData.target_word} placeholder="German Word" required className="bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 font-black" onChange={(e) => setFormData({ ...formData, target_word: e.target.value })} />
                        <input type="text" value={formData.translation} placeholder="English" required className="bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 font-bold" onChange={(e) => setFormData({ ...formData, translation: e.target.value })} />
                      </div>
                      <input type="text" value={formData.pronunciation} placeholder="Pronunciation" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500" onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })} />
                      <textarea value={formData.sentence} placeholder="Example Sentence" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 h-24" onChange={(e) => setFormData({ ...formData, sentence: e.target.value })} />
                    </>
                  )}
                  <div className="flex gap-6 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(null)} className="flex-1 py-5 glass-card rounded-[2rem] font-black uppercase text-sm">Cancel</button>
                    <button type="submit" className="flex-1 py-5 bg-indigo-600 rounded-[2rem] font-black uppercase text-sm shadow-xl shadow-indigo-600/30">Save</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
