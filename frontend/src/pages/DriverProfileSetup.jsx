import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect } from 'react'
import { doc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

const schema = yup.object({
  aadhaarNumber: yup.string().length(12, 'Aadhaar must be 12 digits').optional(),
  yearsOfExperience: yup.number().min(0).max(50).required('Required'),
  capacity: yup.number().min(1).max(30).required('Required'),
  pricePerMonth: yup.number().min(500).required('Required'),
  pickupTime: yup.string().required('Required'),
  dropTime: yup.string().required('Required'),
  schoolId: yup.string().optional(),
})

export default function DriverProfileSetup() {
  const { userProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [vanPhotoFile, setVanPhotoFile] = useState(null)
  const [schools, setSchools] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getDocs(collection(db, 'schools')).then((snap) => {
      setSchools(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      yearsOfExperience: 0,
      capacity: 20,
      pricePerMonth: 2500,
      pickupTime: '07:00',
      dropTime: '15:30',
    },
  })

  const onSubmit = async (data) => {
    setUploading(true)
    try {
      let aadhaarDocUrl = userProfile?.aadhaarDocUrl || ''
      let vanPhotoUrl = ''

      if (aadhaarFile) {
        const aadhaarRef = ref(storage, `drivers/${userProfile.id}/aadhaar_${Date.now()}`)
        await uploadBytes(aadhaarRef, aadhaarFile)
        aadhaarDocUrl = await getDownloadURL(aadhaarRef)
      }

      if (vanPhotoFile) {
        const vanRef = ref(storage, `vans/${userProfile.id}/van_${Date.now()}`)
        await uploadBytes(vanRef, vanPhotoFile)
        vanPhotoUrl = await getDownloadURL(vanRef)
      }

      const vanId = `van-${userProfile.id}-${Date.now()}`
      const schoolDoc = schools.find((s) => s.id === data.schoolId)
      await updateDoc(doc(db, 'users', userProfile.id), {
        aadhaarNumber: data.aadhaarNumber ? `****${data.aadhaarNumber.slice(-4)}` : '',
        aadhaarDocUrl: aadhaarDocUrl || userProfile?.aadhaarDocUrl,
        yearsOfExperience: data.yearsOfExperience,
        vanDetails: {
          vanId,
          photo: vanPhotoUrl || userProfile?.vanDetails?.photo,
          capacity: data.capacity,
          currentVacancy: data.capacity,
          pricePerMonth: data.pricePerMonth,
        },
      })

      if (data.schoolId && schoolDoc) {
        await setDoc(doc(db, 'vans', vanId), {
          vanId,
          driverId: userProfile.id,
          schoolId: data.schoolId,
          capacity: data.capacity,
          currentVacancy: data.capacity,
          enrolledChildren: [],
          pricePerMonth: data.pricePerMonth,
          route: schoolDoc.latitude ? [{ latitude: schoolDoc.latitude, longitude: schoolDoc.longitude, order: 1 }] : [],
          pickupTime: data.pickupTime,
          dropTime: data.dropTime,
          isActive: true,
        })
      }

      await refreshProfile()
      navigate('/driver')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save')
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-2">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Complete Driver Profile</h1>
      </header>

      <main className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-900">Aadhaar Verification</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number (last 4 digits shown)</label>
            <input
              {...register('aadhaarNumber')}
              placeholder="12 digits"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            />
            {errors.aadhaarNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Document</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setAadhaarFile(e.target.files?.[0])}
              className="w-full text-sm"
            />
          </div>

          <h2 className="font-semibold text-slate-900 pt-4">Van Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
            <select
              {...register('schoolId')}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            >
              <option value="">Select school</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.schoolId && (
              <p className="text-red-500 text-xs mt-1">{errors.schoolId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Van Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setVanPhotoFile(e.target.files?.[0])}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
            <input
              type="number"
              {...register('yearsOfExperience', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            />
            {errors.yearsOfExperience && (
              <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (seats)</label>
            <input
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price per month (₹)</label>
            <input
              type="number"
              {...register('pricePerMonth', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            />
            {errors.pricePerMonth && (
              <p className="text-red-500 text-xs mt-1">{errors.pricePerMonth.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Time</label>
              <input
                type="time"
                {...register('pickupTime')}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Drop Time</label>
              <input
                type="time"
                {...register('dropTime')}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg disabled:opacity-70"
          >
            {uploading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </main>
    </div>
  )
}
