import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import ReviewsSection from '../components/ReviewsSection'

function MapFitBounds({ route }) {
  const map = useMap()
  useEffect(() => {
    if (route?.length) {
      const bounds = route.map((p) => [p.latitude, p.longitude])
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [map, route])
  return null
}

export default function VanDetail() {
  const { vanId } = useParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [van, setVan] = useState(null)
  const [driver, setDriver] = useState(null)
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const vanDoc = await getDoc(doc(db, 'vans', vanId))
        if (!vanDoc.exists()) {
          navigate('/')
          return
        }
        const vanData = { id: vanDoc.id, ...vanDoc.data() }
        setVan(vanData)

        const driverDoc = await getDoc(doc(db, 'users', vanData.driverId))
        setDriver(driverDoc.exists() ? { id: driverDoc.id, ...driverDoc.data() } : null)

        const schoolDoc = await getDoc(doc(db, 'schools', vanData.schoolId))
        setSchool(schoolDoc.exists() ? schoolDoc.data() : null)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetch()
  }, [vanId, navigate])

  const handleBook = () => {
    if (!user || userProfile?.role !== 'parent') {
      navigate('/login', { state: { from: { pathname: `/van/${vanId}` } } })
      return
    }
    navigate(`/van/${vanId}/book`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  const route = van?.route || []
  const positions = route.map((p) => [p.latitude, p.longitude])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Van Details</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {driver?.name || 'Driver'}
                {driver?.aadhaarVerified && (
                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                    ✓ Verified Driver
                  </span>
                )}
              </p>
              <p className="text-slate-500 text-sm">
                {driver?.yearsOfExperience || 0} years experience
              </p>
              <p className="text-amber-500 font-medium mt-1">
                ★ {driver?.overallRating?.toFixed(1) || '—'} ({driver?.totalReviews || 0} reviews)
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">₹{van?.pricePerMonth}</p>
              <p className="text-slate-500 text-sm">per month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Route</h3>
          <p className="text-slate-500 text-sm mb-3">{school?.name}</p>
          <div className="h-48 rounded-lg overflow-hidden border border-slate-200">
            <MapContainer
              center={positions[0] || [28.4595, 77.0266]}
              zoom={12}
              className="h-full w-full"
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {positions.length > 1 && (
                <Polyline positions={positions} color="#0ea5e9" weight={4} />
              )}
              <MapFitBounds route={route} />
            </MapContainer>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Pickup: {van?.pickupTime} • Drop: {van?.dropTime}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">Capacity</h3>
          <p className="text-slate-600">
            {van?.currentVacancy} of {van?.capacity} seats available
          </p>
        </div>

        {driver?.id && (
          <ReviewsSection driverId={driver.id} vanId={vanId} />
        )}

        <button
          onClick={handleBook}
          className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition"
        >
          Book This Van
        </button>
      </main>
    </div>
  )
}
