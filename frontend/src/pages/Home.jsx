import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, userProfile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }
    if (!userProfile) {
      navigate('/complete-profile')
      return
    }
    const role = userProfile.role
    if (role === 'parent') navigate('/parent', { replace: true })
    else if (role === 'driver') navigate('/driver', { replace: true })
    else if (role === 'admin') navigate('/admin', { replace: true })
    else navigate('/unauthorized', { replace: true })
  }, [user, userProfile, loading, navigate])

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-slate-400">
      <div className="w-10 h-10 border-2 border-slate-600 border-t-sky-500 rounded-full animate-spin" />
      <p>Loading...</p>
    </div>
  )
}
