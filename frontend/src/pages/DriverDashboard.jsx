import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import EmergencyAlert from '../components/EmergencyAlert'

export default function DriverDashboard() {
  const { userProfile, signOut } = useAuth()
  const [van, setVan] = useState(null)
  const [isTripActive, setIsTripActive] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState([])
  const [watchId, setWatchId] = useState(null)

  // Fetch driver's van
  useEffect(() => {
    async function fetchVan() {
      const q = query(
        collection(db, 'vans'),
        where('driverId', '==', userProfile?.id)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0]
        setVan({ id: d.id, ...d.data() })
      }
    }
    if (userProfile?.id) fetchVan()
  }, [userProfile?.id])

  // Listen to today's attendance for this van
  useEffect(() => {
    if (!van?.id) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const unsub = onSnapshot(collection(db, 'attendance'), (snap) => {
      const list = snap.docs
        .filter((d) => d.data().vanId === van.id)
        .filter((d) => {
          const t = d.data().boardingTime?.toDate?.()
          return t && t >= today
        })
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.boardingTime?.toDate?.() || 0) - (a.boardingTime?.toDate?.() || 0))
      setTodayAttendance(list)
    })
    return () => unsub()
  }, [van?.id])

  const startTrip = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setDoc(doc(db, 'driverLocations', userProfile.id), {
          driverId: userProfile.id,
          vanId: van?.id,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: serverTimestamp(),
          isActiveTrip: true,
        })
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 10000 }
    )
    setWatchId(id)
    setIsTripActive(true)
  }

  const stopTrip = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId)
    setWatchId(null)
    setDoc(doc(db, 'driverLocations', userProfile.id), {
      driverId: userProfile.id,
      vanId: van?.id,
      latitude: 0,
      longitude: 0,
      timestamp: serverTimestamp(),
      isActiveTrip: false,
    })
    setIsTripActive(false)
  }

  const markSchoolArrival = async () => {
    if (!van?.id) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const attSnap = await getDocs(collection(db, 'attendance'))
    const toUpdate = attSnap.docs.filter((d) => {
      const data = d.data()
      const t = data.boardingTime?.toDate?.()
      return data.vanId === van.id && t && t >= today && !data.schoolArrivalTime
    })
    for (const d of toUpdate) {
      await updateDoc(doc(db, 'attendance', d.id), {
        schoolArrivalTime: serverTimestamp(),
      })
    }
    if (toUpdate.length > 0) alert(`Marked ${toUpdate.length} child(ren) arrived at school`)
  }

  const enrolledCount = van?.enrolledChildren?.length || 0
  const capacity = van?.capacity || 0

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

      {!van && userProfile?.verificationStatus === 'approved' && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="font-medium text-amber-800">Complete your profile to add your van.</p>
            <Link
              to="/driver/complete-profile"
              className="inline-block mt-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Today's Route</h2>
          <p className="text-slate-500 text-sm mb-4">Morning Pickup</p>
          <div className="flex gap-4 mb-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">
                {todayAttendance.length}/{enrolledCount}
              </span>
              <span className="text-xs text-slate-500">Boarded</span>
            </div>
          </div>
          <div className="flex gap-3">
            {!isTripActive ? (
              <button
                onClick={startTrip}
                disabled={!van}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                Start Trip
              </button>
            ) : (
              <button
                onClick={stopTrip}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Stop Trip
              </button>
            )}
            <Link
              to="/driver/scan"
              className="px-6 py-3 border border-sky-500 text-sky-500 hover:bg-sky-50 font-semibold rounded-lg transition inline-block"
            >
              Scan QR Code
            </Link>
          </div>
          {isTripActive && (
            <p className="text-emerald-600 text-sm mt-2 font-medium">● Live — Sharing location</p>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Attendance Status</h2>
          {todayAttendance.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No attendance records yet today.</div>
          ) : (
            <ul className="space-y-2">
              {todayAttendance.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  <span>{a.childName || 'Child'}</span>
                  <span className="text-slate-400 text-sm">
                    — {a.boardingTime?.toDate?.()?.toLocaleTimeString() || '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={markSchoolArrival}
            className="mt-4 px-6 py-3 border border-sky-500 text-sky-500 hover:bg-sky-50 font-semibold rounded-lg transition"
          >
            Mark School Arrival
          </button>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Performance</h2>
          <div className="flex gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">
                {userProfile?.overallRating?.toFixed(1) || '—'}
              </span>
              <span className="text-xs text-slate-500">Overall Rating</span>
            </div>
            <div className="bg-slate-100 rounded-lg px-4 py-3 text-center">
              <span className="block text-xl font-bold text-slate-900">
                {userProfile?.totalReviews || 0}
              </span>
              <span className="text-xs text-slate-500">Reviews</span>
            </div>
          </div>
        </section>

        <EmergencyAlert vanId={van?.id} />
      </main>
    </div>
  )
}
