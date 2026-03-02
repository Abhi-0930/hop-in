import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

export default function Landing() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true)
    setResults([])
    try {
      const snap = await getDocs(collection(db, 'schools'))
      const searchLower = search.toLowerCase()
      const schools = snap.docs
        .filter((d) => d.data().name?.toLowerCase().includes(searchLower))
        .map((d) => ({ id: d.id, ...d.data() }))
      setResults(schools)
    } catch (err) {
      console.error(err)
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="px-4 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Hop-In</h1>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Find Safe Van Transport for Your Child
        </h2>
        <p className="text-slate-400 text-lg mb-12">
          Search by school name and connect with verified drivers
        </p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter school name..."
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition disabled:opacity-70"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="space-y-3 text-left">
            <h3 className="text-slate-400 font-medium">Schools found</h3>
            {results.map((school) => (
              <button
                key={school.id}
                onClick={() => navigate(`/schools/${school.id}/vans`)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition"
              >
                <p className="font-semibold text-white">{school.name}</p>
                <p className="text-sm text-slate-400">{school.address}, {school.city}</p>
              </button>
            ))}
          </div>
        )}

        {results.length === 0 && search && !loading && (
          <p className="text-slate-500">No schools found. Try a different search or add sample data from Admin.</p>
        )}
      </main>
    </div>
  )
}
