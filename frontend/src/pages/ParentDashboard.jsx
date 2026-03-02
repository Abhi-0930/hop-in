import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ParentDashboard() {
  const { userProfile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Hop-In</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500">Parent</span>
          <span className="text-slate-400 text-sm">{userProfile?.name}</span>
          <button
            onClick={signOut}
            className="px-4 py-2 border border-slate-500 rounded-lg text-sm hover:bg-white/10 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Children</h2>
          <div className="py-12 text-center text-slate-500">
            <p>No children added yet.</p>
            <p className="text-sm mt-1">Add your children to start booking van services.</p>
            <Link
              to="/parent/children/add"
              className="inline-block mt-4 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition"
            >
              Add Child
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Van Location</h2>
          <div className="h-48 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
            Map will appear here when you have an active booking
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Notifications</h2>
          <div className="py-8 text-center text-slate-500">No notifications yet.</div>
        </section>

        <button className="fixed bottom-6 right-6 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition">
          Emergency Alert
        </button>
      </main>
    </div>
  )
}
