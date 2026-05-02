import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Shield, LogOut, Clock, Target, Award, Sparkles, ChevronRight, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { API_URL } from '../config'

export const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<{ error?: string; next_lesson_in?: number; message?: string }>({})
  const [stats, setStats] = useState<any>({ xp: 0, streak: 0, lessons_today: 0, vocabulary: 0, accuracy: '0%', ranking: '#1' })
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      await axios.get(`${API_URL}/api/lessons/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStatus({})
      const statsRes = await axios.get(`${API_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(statsRes.data)
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        setStatus(err.response?.data)
        const statsRes = await axios.get(`${API_URL}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStats(statsRes.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="min-h-screen mesh-gradient text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <nav className="flex justify-between items-center mb-16 px-4 py-3 glass-panel rounded-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Target size={22} className="text-white" /></div>
            <span className="text-lg font-black uppercase text-slate-200">German Mastery</span>
          </div>
          <div className="flex items-center gap-8">
            {user?.is_admin && <Link to="/admin" className="text-sm font-bold text-slate-400 hover:text-indigo-400 flex items-center gap-2"><Shield size={16} /> Admin</Link>}
            <div className="h-4 w-px bg-white/10" />
            <button onClick={logout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8"><div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2"><Sparkles size={14} className="text-indigo-400" /><span className="text-xs font-black text-indigo-400 uppercase">Active Mission</span></div></div>
                <h2 className="text-5xl md:text-7xl font-black mb-6 text-gradient tracking-tight">Your Next <br /> Learning Frontier</h2>
                <p className="text-slate-400 text-lg mb-12 max-w-xl">Focus on 10 new words and critical mastery reviews prepared just for you.</p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {loading ? (
                    <div className="h-20 w-48 bg-white/5 rounded-3xl animate-pulse" />
                  ) : status.error === 'Empty' ? (
                    <div className="space-y-4"><div className="flex items-center gap-3 px-6 py-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl"><Activity size={20} className="text-orange-400" /><p className="text-orange-400 font-bold">Course content coming soon.</p></div>{user?.is_admin && <button onClick={() => navigate('/admin')} className="w-full px-8 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 border border-white/5 transition-all">Manage Course Panel</button>}</div>
                  ) : status.error === 'Nothing Due' ? (
                    <div className="flex items-center gap-4 px-8 py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem]"><Award className="text-emerald-400" size={32} /><div><p className="text-white font-black text-xl">All Caught Up!</p><p className="text-slate-500 text-sm mt-1">Check back soon for more reviews.</p></div></div>
                  ) : status.error ? (
                    <div className="px-8 py-5 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center gap-4"><Clock className="text-indigo-400" size={24} /><div><p className="text-indigo-400 font-black text-xl">{status.next_lesson_in ? `Next in ${status.next_lesson_in}h` : 'Mission Paused'}</p><p className="text-slate-500 text-sm">{status.error === 'Locked' ? 'Memory optimization active' : status.message || 'Check back later'}</p></div></div>
                  ) : (
                    <button onClick={() => navigate('/lesson')} className="group relative px-12 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-[2rem] font-black text-2xl shadow-xl flex items-center gap-4 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />Begin Mission <ChevronRight size={28} /></button>
                  )}
                </div>
              </div>
              <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Vocabulary', value: stats.vocabulary, icon: BookOpen, color: 'text-blue-400' },
                { label: 'Accuracy', value: stats.accuracy, icon: Activity, color: 'text-emerald-400' },
                { label: 'Ranking', value: stats.ranking, icon: Award, color: 'text-amber-400' }
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:border-white/20 transition-all">
                  <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 ${stat.color}`}><stat.icon size={24} className="" /></div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-[3rem] p-8">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Zap className="text-orange-500" size={20} fill="currentColor" /> Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-3"><span className="text-slate-400 uppercase tracking-widest text-xs">Daily Goal</span><span>{stats.lessons_today}/2</span></div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(stats.lessons_today / 2) * 100}%` }} /></div>
                </div>
                <div className="pt-6 border-t border-white/5"><div className="flex items-center justify-between mb-2"><span className="text-slate-400 text-sm">Global Streak</span><span className="text-orange-500 font-black text-lg">{stats.streak} Days</span></div><div className="flex gap-2">{[1, 2, 3, 4, 5, 6, 7].map(day => (<div key={day} className={`h-10 flex-1 rounded-lg border border-white/5 ${day <= stats.streak ? 'bg-orange-500/20 border-orange-500/30' : 'bg-white/5'}`} />))}</div></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-[3rem] p-8 flex flex-col items-center gap-6">
               <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400"><Activity size={32} /></div>
               <div className="text-center"><p className="text-2xl font-black">{stats.xp}</p><p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Earned XP</p></div>
               <button className="w-full py-4 glass-card rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white">Analytics Detail</button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

const BookOpen = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)
