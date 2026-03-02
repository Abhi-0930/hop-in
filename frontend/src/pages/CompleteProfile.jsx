import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function CompleteProfile() {
  const { user, userProfile, loading, refreshProfile } = useAuth()

  useEffect(() => {
    if (user && !userProfile && !loading) refreshProfile()
  }, [user, userProfile, loading, refreshProfile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hop-In</h1>
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-600 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-500">Setting up your profile...</p>
        </div>
      </div>
    </div>
  )
}
