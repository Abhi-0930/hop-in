import { useAuth } from '../context/AuthContext'

export default function DriverDashboard() {
  const { userProfile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Hop-In</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500">Driver</span>
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
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Today's Route</h2>
          <p className="text-slate-500 text-sm mb-4">Morning Pickup</p>
          <div className="flex gap-4 mb-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">0/0</span>
              <span className="text-xs text-slate-500">Enrolled</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition">
              Start Trip
            </button>
            <button className="px-6 py-3 border border-sky-500 text-sky-500 hover:bg-sky-50 font-semibold rounded-lg transition">
              Scan QR Code
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Attendance Status</h2>
          <div className="py-8 text-center text-slate-500">No attendance records yet.</div>
          <button className="mt-4 px-6 py-3 border border-sky-500 text-sky-500 hover:bg-sky-50 font-semibold rounded-lg transition">
            Mark School Arrival
          </button>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Performance</h2>
          <div className="flex gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">—</span>
              <span className="text-xs text-slate-500">Overall Rating</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">—</span>
              <span className="text-xs text-slate-500">Reviews</span>
            </div>
          </div>
        </section>

        <button className="fixed bottom-6 right-6 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition">
          Emergency Alert
        </button>
      </main>
    </div>
  )
}
