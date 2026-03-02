import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

const schema = yup.object({
  name: yup.string().min(2, 'Name is required').required('Name is required'),
  age: yup.number().min(1, 'Invalid age').max(18, 'Invalid age').required('Age is required'),
  schoolName: yup.string().min(2, 'School name is required').required('School name is required'),
  street: yup.string().optional(),
  latitude: yup.number().optional(),
  longitude: yup.number().optional(),
})

export default function AddChild() {
  const { userProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { latitude: 28.4595, longitude: 77.0266 },
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      const childId = `child-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const child = {
        childId,
        name: data.name,
        age: data.age,
        schoolName: data.schoolName,
        homeAddress: {
          street: data.street || '',
          latitude: data.latitude || 28.4595,
          longitude: data.longitude || 77.0266,
        },
        qrCode: childId,
        activeBookingId: null,
      }
      await updateDoc(doc(db, 'users', userProfile.id), {
        children: arrayUnion(child),
      })
      await refreshProfile()
      navigate('/parent')
    } catch (err) {
      setError(err.message || 'Failed to add child')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Add Child</h1>
      </header>

      <main className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Child's Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="Full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
            <input
              type="number"
              {...register('age', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="Age"
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
            <input
              {...register('schoolName')}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="School name"
            />
            {errors.schoolName && (
              <p className="text-red-500 text-xs mt-1">{errors.schoolName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Home Address (optional)</label>
            <input
              {...register('street')}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="Street address"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition disabled:opacity-70"
          >
            {isSubmitting ? 'Adding...' : 'Add Child'}
          </button>
        </form>
      </main>
    </div>
  )
}
