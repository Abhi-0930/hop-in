import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

export default function ReviewsSection({ driverId, vanId }) {
  const { userProfile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [sortBy, setSortBy] = useState('recent')
  const [canReview, setCanReview] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetch() {
      const q = query(
        collection(db, 'reviews'),
        where('driverId', '==', driverId)
      )
      const snap = await getDocs(q)
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }
    if (driverId) fetch()
  }, [driverId])

  useEffect(() => {
    async function check() {
      if (userProfile?.role !== 'parent' || !userProfile?.id) return
      const q = query(
        collection(db, 'bookings'),
        where('parentId', '==', userProfile.id),
        where('driverId', '==', driverId)
      )
      const snap = await getDocs(q)
      const hasBooking = !snap.empty
      const existingReview = reviews.some((r) => r.parentId === userProfile.id)
      setCanReview(hasBooking && !existingReview)
    }
    check()
  }, [userProfile, driverId, reviews])

  const sortedReviews = [...reviews].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0
    const bTime = b.createdAt?.toMillis?.() || 0
    if (sortBy === 'recent') return bTime - aTime
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0)
    return bTime - aTime
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const reviewData = {
        driverId,
        parentId: userProfile.id,
        bookingId: '',
        rating,
        comment: comment.trim(),
        createdAt: new Date(),
        reportedAbuse: false,
        moderatedByAdmin: false,
      }
      await addDoc(collection(db, 'reviews'), reviewData)
      const allReviews = [...reviews, { ...reviewData, createdAt: { toDate: () => new Date() } }]
      setReviews(allReviews)
      const avg = allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length
      await updateDoc(doc(db, 'users', driverId), {
        overallRating: avg,
        totalReviews: allReviews.length,
      })
      setCanReview(false)
      setShowForm(false)
      setComment('')
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h3 className="font-semibold text-slate-900">Reviews</h3>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
          {canReview && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-3 py-1 bg-sky-500 text-white rounded-lg font-medium"
            >
              Write Review
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={`text-2xl ${s <= rating ? 'text-amber-500' : 'text-slate-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg mb-2"
            rows={3}
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {sortedReviews.length === 0 ? (
        <p className="text-slate-500 py-6 text-center">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {sortedReviews.map((r) => (
            <li key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="flex gap-2 items-center mb-1">
                <span className="text-amber-500">
                  {'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                </span>
                <span className="text-slate-400 text-sm">
                  {r.createdAt?.toDate?.() ? format(r.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                </span>
              </div>
              <p className="text-slate-700">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
