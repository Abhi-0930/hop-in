import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { userProfile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Hop-In</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500">Admin</span>
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">0</span>
              <span className="text-xs text-slate-500">Pending Verifications</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">0</span>
              <span className="text-xs text-slate-500">Active Emergency Alerts</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Driver Verification Requests</h2>
          <div className="py-8 text-center text-slate-500">No pending verification requests.</div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">0</span>
              <span className="text-xs text-slate-500">Total Vans</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">0</span>
              <span className="text-xs text-slate-500">Active Bookings</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">0</span>
              <span className="text-xs text-slate-500">Verified Drivers</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
