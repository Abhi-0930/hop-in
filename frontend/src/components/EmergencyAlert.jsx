import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export default function EmergencyAlert({ vanId }) {
  const { user, userProfile } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'emergencyAlerts'), {
        reportedBy: user.uid,
        role: userProfile?.role || 'parent',
        vanId: vanId || '',
        description: description.trim(),
        location: { lat: 0, lng: 0 },
        timestamp: serverTimestamp(),
        status: 'open',
        adminNotes: '',
      })
      setShowModal(false)
      setDescription('')
      alert('Emergency alert sent. Admin has been notified.')
    } catch (err) {
      alert(err.message || 'Failed to send alert')
    }
    setSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition"
      >
        Emergency Alert
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Emergency Alert</h3>
            <p className="text-slate-500 text-sm mb-4">
              This will notify all admins immediately. Use only for real emergencies.
            </p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the emergency..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg mb-4 min-h-[100px]"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-70"
                >
                  {submitting ? 'Sending...' : 'Send Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
