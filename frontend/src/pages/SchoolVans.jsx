import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

export default function SchoolVans() {
  const { schoolId } = useParams()
  const navigate = useNavigate()
  const [school, setSchool] = useState(null)
  const [vans, setVans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const schoolDoc = await getDoc(doc(db, 'schools', schoolId))
        if (!schoolDoc.exists()) {
          navigate('/')
          return
        }
        setSchool({ id: schoolDoc.id, ...schoolDoc.data() })

        const vansRef = collection(db, 'vans')
        const q = query(
          vansRef,
          where('schoolId', '==', schoolId),
          where('isActive', '==', true)
        )
        const vansSnap = await getDocs(q)
        const vansList = await Promise.all(
          vansSnap.docs.map(async (v) => {
            const van = { id: v.id, ...v.data() }
            const driverDoc = await getDoc(doc(db, 'users', van.driverId))
            van.driver = driverDoc.exists() ? driverDoc.data() : null
            return van
          })
        )
        setVans(vansList)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetch()
  }, [schoolId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">{school?.name}</h1>
        <p className="text-slate-400 text-sm">{school?.address}, {school?.city}</p>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Vans</h2>
        {vans.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500">
            No vans available for this school yet.
          </div>
        ) : (
          <div className="space-y-4">
            {vans.map((van) => (
              <div
                key={van.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-sky-200 transition cursor-pointer"
                onClick={() => navigate(`/van/${van.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {van.driver?.name || 'Driver'}
                      {van.driver?.aadhaarVerified && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      {van.currentVacancy}/{van.capacity} seats • ₹{van.pricePerMonth}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-500 font-medium">
                      ★ {van.driver?.overallRating?.toFixed(1) || '—'}
                    </span>
                    <p className="text-xs text-slate-400">{van.driver?.totalReviews || 0} reviews</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Pickup: {van.pickupTime} • Drop: {van.dropTime}
                </p>
                <p className="text-sky-500 text-sm font-medium mt-2">View Details →</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
