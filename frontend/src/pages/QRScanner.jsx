import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { addDoc, serverTimestamp } from 'firebase/firestore'

export default function QRScanner() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [van, setVan] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const [manualCode, setManualCode] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    async function fetchVan() {
      const vansSnap = await getDocs(
        query(collection(db, 'vans'), where('driverId', '==', userProfile?.id))
      )
      if (!vansSnap.empty) {
        const doc = vansSnap.docs[0]
        setVan({ id: doc.id, ...doc.data() })
      }
    }
    if (userProfile?.id) fetchVan()
  }, [userProfile?.id])

  const processQRData = async (data) => {
    setError('')
    try {
      const parsed = JSON.parse(data)
      const { childId, childName, parentId, vanId } = parsed
      if (!childId) {
        setError('Invalid QR code')
        return
      }
      const myVanId = van?.id || van?.vanId
      if (myVanId && vanId && vanId !== myVanId) {
        setError('This child is not enrolled in your van')
        return
      }
      const enrolled = van?.enrolledChildren || []
      const isEnrolled = enrolled.some((c) => c.childId === childId)
      if (!isEnrolled && enrolled.length > 0) {
        setError('This child is not enrolled in your van')
        return
      }
      await addDoc(collection(db, 'attendance'), {
        childId,
        childName: childName || 'Child',
        vanId: van?.id || vanId,
        date: new Date(),
        boardingTime: serverTimestamp(),
        boardingLocation: { lat: 0, lng: 0 },
        schoolArrivalTime: null,
        dropBoardingTime: null,
        homeArrivalTime: null,
      })
      setScanResult(`${childName} boarded at ${new Date().toLocaleTimeString()}`)
      setTimeout(() => setScanResult(null), 3000)
    } catch (err) {
      setError('Invalid QR code or scan failed')
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) processQRData(manualCode.trim())
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-4">
        ← Back
      </button>
      <h1 className="text-xl font-bold mb-4">Scan QR Code</h1>
      {!van ? (
        <p className="text-slate-400">No van assigned. Contact admin.</p>
      ) : (
        <>
          <p className="text-slate-400 text-sm mb-4">
            Point camera at child's QR code, or enter code manually below.
          </p>
          <div className="bg-slate-800 rounded-xl p-4 mb-4 aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              playsInline
              muted
            />
            <p className="text-slate-500 text-center">
              Camera scan requires https. Use manual entry for testing.
            </p>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder='Paste QR data: {"childId":"...","vanId":"..."}'
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm"
            />
            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 font-semibold rounded-lg"
            >
              Submit
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {scanResult && (
            <p className="text-emerald-400 text-sm mt-2 font-medium">{scanResult}</p>
          )}
        </>
      )}
    </div>
  )
}
