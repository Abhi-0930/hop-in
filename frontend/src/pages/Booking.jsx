import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore'

const CONTRACT_MONTHS = [3, 6, 12, 24, 36, 48]

export default function Booking() {
  const { vanId } = useParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [van, setVan] = useState(null)
  const [driver, setDriver] = useState(null)
  const [school, setSchool] = useState(null)
  const [contractMonths, setContractMonths] = useState(12)
  const [childId, setChildId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user || userProfile?.role !== 'parent') {
      navigate('/login', { state: { from: { pathname: `/van/${vanId}/book` } } })
      return
    }
    async function fetch() {
      try {
        const vanDoc = await getDoc(doc(db, 'vans', vanId))
        if (!vanDoc.exists()) {
          navigate('/')
          return
        }
        setVan({ id: vanDoc.id, ...vanDoc.data() })
        const driverDoc = await getDoc(doc(db, 'users', vanDoc.data().driverId))
        setDriver(driverDoc.exists() ? driverDoc.data() : null)
        const schoolDoc = await getDoc(doc(db, 'schools', vanDoc.data().schoolId))
        setSchool(schoolDoc.exists() ? schoolDoc.data() : null)
        const children = userProfile?.children || []
        if (children.length > 0) setChildId(children[0].childId)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetch()
  }, [vanId, user, userProfile, navigate])

  const monthlyPrice = van?.pricePerMonth || 0
  const totalValue = monthlyPrice * contractMonths

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!childId || !van) return
    const childBelongsToParent = userProfile?.children?.some((c) => c.childId === childId)
    if (!childBelongsToParent) {
      alert('Invalid child selection')
      return
    }
    setSubmitting(true)
    try {
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        parentId: user.uid,
        childId,
        driverId: van.driverId,
        vanId: van.id,
        contractMonths,
        monthlyPrice,
        totalValue,
        startDate: new Date(),
        endDate: new Date(Date.now() + contractMonths * 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        paymentStatus: 'completed',
        createdAt: new Date(),
      })

      await updateDoc(doc(db, 'vans', van.id), {
        currentVacancy: van.currentVacancy - 1,
        enrolledChildren: arrayUnion({
          childId,
          firstName: userProfile?.children?.find((c) => c.childId === childId)?.name?.split(' ')[0] || 'Child',
          parentId: user.uid,
        }),
      })

      navigate('/parent', { replace: true })
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const children = userProfile?.children || []
  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Add a child first</h2>
          <p className="text-slate-500 mt-2">You need to add your child before booking a van.</p>
          <button
            onClick={() => navigate('/parent')}
            className="mt-4 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Complete Booking</h1>
      </header>

      <main className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <p className="font-semibold text-slate-900">{school?.name}</p>
          <p className="text-slate-500 text-sm">Driver: {driver?.name}</p>
          <p className="text-slate-500 text-sm">₹{monthlyPrice}/month</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Child</label>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              {children.map((c) => (
                <option key={c.childId} value={c.childId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contract Period</label>
            <select
              value={contractMonths}
              onChange={(e) => setContractMonths(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              {CONTRACT_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} months
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-slate-600">
              Monthly: <span className="font-semibold">₹{monthlyPrice}</span>
            </p>
            <p className="text-slate-600 mt-1">
              Total ({contractMonths} months): <span className="font-semibold">₹{totalValue}</span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-2">Payment</p>
            <div className="flex gap-4 text-slate-500 text-sm">
              <span>UPI</span>
              <span>Net Banking</span>
              <span>Card</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Payment UI only — no actual processing</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition disabled:opacity-70"
          >
            {submitting ? 'Processing...' : 'Complete Payment'}
          </button>
        </form>
      </main>
    </div>
  )
}
