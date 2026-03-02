import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import ChildQRCard from '../components/ChildQRCard'
import LiveMap from '../components/LiveMap'
import EmergencyAlert from '../components/EmergencyAlert'

export default function ParentDashboard() {
  const { userProfile, signOut } = useAuth()
  const [activeBookings, setActiveBookings] = useState([])
  const [driverLocation, setDriverLocation] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [attendance, setAttendance] = useState([])

  // Fetch active booking for parent
  useEffect(() => {
    if (!userProfile?.id) return
    const q = query(
      collection(db, 'bookings'),
      where('parentId', '==', userProfile.id),
      where('status', '==', 'active')
    )
    const unsub = onSnapshot(q, (snap) => {
      setActiveBookings(snap.docs.map((b) => ({ id: b.id, ...b.data() })))
    })
    return () => unsub()
  }, [userProfile?.id])

  // Listen to driver location when we have active booking
  const firstBooking = activeBookings[0]
  useEffect(() => {
    if (!firstBooking?.driverId) return
    const unsub = onSnapshot(doc(db, 'driverLocations', firstBooking.driverId), (snap) => {
      if (snap.exists()) setDriverLocation(snap.data())
      else setDriverLocation(null)
    })
    return () => unsub()
  }, [firstBooking?.driverId])

  // Fetch attendance for parent's children
  useEffect(() => {
    if (!userProfile?.children?.length) return
    const childIds = userProfile.children.map((c) => c.childId)
    const q = query(
      collection(db, 'attendance'),
      where('childId', 'in', childIds.slice(0, 10))
    )
    const unsub = onSnapshot(q, (snap) => {
      setAttendance(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [userProfile?.children])

  const addNotification = (msg) => {
    setNotifications((prev) => [{ id: Date.now(), msg }, ...prev.slice(0, 4)])
  }

  const children = userProfile?.children || []
  const childWithBooking = firstBooking
    ? children.find((c) => c.childId === firstBooking.childId)
    : null
  const homeCenter = childWithBooking?.homeAddress
    ? [childWithBooking.homeAddress.latitude, childWithBooking.homeAddress.longitude]
    : [28.4595, 77.0266]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">
          <Link to="/" className="hover:opacity-90">Hop-In</Link>
        </h1>
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
          <Link
            to="/search"
            className="inline-block mb-4 px-4 py-2 border border-sky-500 text-sky-500 hover:bg-sky-50 font-medium rounded-lg transition"
          >
            Find Van
          </Link>
          {children.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {children.map((child) => {
                const booking = activeBookings.find((b) => b.childId === child.childId)
                return (
                  <ChildQRCard
                    key={child.childId}
                    child={child}
                    vanId={booking?.vanId}
                    parentId={userProfile?.id}
                    booking={booking}
                  />
                )
              })}
              <Link
                to="/parent/children/add"
                className="inline-block px-4 py-2 text-sky-500 hover:text-sky-600 text-sm font-medium"
              >
                + Add another child
              </Link>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Van Location</h2>
          {firstBooking && driverLocation ? (
            <LiveMap
              driverLocation={driverLocation}
              center={homeCenter}
              onDistanceAlert={addNotification}
            />
          ) : (
            <div className="h-48 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
              {firstBooking ? 'Waiting for driver to start trip...' : 'Map will appear when you have an active booking'}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Notifications</h2>
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="text-slate-600 text-sm">• {n.msg}</li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-slate-500">No notifications yet.</div>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Attendance History</h2>
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Boarding Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 10).map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="py-2">{a.date?.toDate?.()?.toLocaleDateString() || '—'}</td>
                      <td className="py-2">{a.boardingTime?.toDate?.()?.toLocaleTimeString() || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">No attendance records yet.</div>
          )}
        </section>

        <EmergencyAlert vanId={firstBooking?.vanId} />
      </main>
    </div>
  )
}
