import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { seedAll } from '../utils/seedData'

export default function AdminDashboard() {
  const { userProfile, signOut } = useAuth()
  const [pendingDrivers, setPendingDrivers] = useState([])
  const [stats, setStats] = useState({ vans: 0, bookings: 0, verified: 0 })
  const [emergencyAlerts, setEmergencyAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    async function fetch() {
      try {
        const usersSnap = await getDocs(
          query(collection(db, 'users'), where('verificationStatus', '==', 'pending'))
        )
        setPendingDrivers(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

        const vansSnap = await getDocs(collection(db, 'vans'))
        const bookingsSnap = await getDocs(
          query(collection(db, 'bookings'), where('status', '==', 'active'))
        )
        const verifiedSnap = await getDocs(
          query(collection(db, 'users'), where('aadhaarVerified', '==', true))
        )

        setStats({
          vans: vansSnap.size,
          bookings: bookingsSnap.size,
          verified: verifiedSnap.size,
        })
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'emergencyAlerts'), where('status', '==', 'open')),
      (snap) => {
        setEmergencyAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      }
    )
    return () => unsub()
  }, [])

  const handleVerify = async (driverId, status) => {
    try {
      await updateDoc(doc(db, 'users', driverId), {
        verificationStatus: status,
        aadhaarVerified: status === 'approved',
      })
      setPendingDrivers((prev) => prev.filter((d) => d.id !== driverId))
      setStats((s) => ({
        ...s,
        verified: s.verified + (status === 'approved' ? 1 : 0),
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolveAlert = async (alertId) => {
    try {
      await updateDoc(doc(db, 'emergencyAlerts', alertId), { status: 'resolved' })
      setEmergencyAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const { schoolCount, vanCount } = await seedAll()
      alert(`Seeded ${schoolCount} schools and ${vanCount} vans.`)
      window.location.reload()
    } catch (err) {
      alert(err.message || 'Seed failed')
    }
    setSeeding(false)
  }

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
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition disabled:opacity-70"
          >
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
        </div>
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">{pendingDrivers.length}</span>
              <span className="text-xs text-slate-500">Pending Verifications</span>
            </div>
            <div className={`rounded-lg px-4 py-3 text-center ${emergencyAlerts.length > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
              <span className={`block text-xl font-bold ${emergencyAlerts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {emergencyAlerts.length}
              </span>
              <span className="text-xs text-slate-500">Active Emergency Alerts</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">{stats.verified}</span>
              <span className="text-xs text-slate-500">Verified Drivers</span>
            </div>
          </div>
        </section>

        {emergencyAlerts.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Emergency Alerts
            </h2>
            <div className="space-y-4">
              {emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <p className="font-medium text-slate-900">{alert.description}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Reported by {alert.role} • {alert.timestamp?.toDate?.()?.toLocaleString() || '—'}
                  </p>
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Driver Verification Requests</h2>
          {pendingDrivers.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No pending verification requests.</div>
          ) : (
            <div className="space-y-4">
              {pendingDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{driver.name}</p>
                    <p className="text-slate-500 text-sm">{driver.email}</p>
                    {driver.aadhaarDocUrl && (
                      <a
                        href={driver.aadhaarDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 text-sm hover:underline"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(driver.id, 'approved')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(driver.id, 'rejected')}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">{stats.vans}</span>
              <span className="text-xs text-slate-500">Total Vans</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">{stats.bookings}</span>
              <span className="text-xs text-slate-500">Active Bookings</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">{stats.verified}</span>
              <span className="text-xs text-slate-500">Verified Drivers</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
