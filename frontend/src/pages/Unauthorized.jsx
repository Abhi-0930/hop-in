import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hop-In</h1>
        <h2 className="text-lg font-semibold text-slate-700 mt-6">Access Denied</h2>
        <p className="text-slate-500 mt-2 mb-6">You don't have permission to access this page.</p>
        <Link
          to="/"
          className="inline-block w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition text-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
