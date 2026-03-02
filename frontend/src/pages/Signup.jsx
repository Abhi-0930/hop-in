import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  phone: yup.string().optional(),
  role: yup.string().oneOf(['parent', 'driver']).required('Please select a role'),
})

export default function Signup() {
  const [error, setError] = useState('')
  const { signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'parent' },
  })

  const role = watch('role')

  const onSubmit = async (data) => {
    setError('')
    try {
      const { user } = await signUp(data.email, data.password)
      const userData = {
        userId: user.uid,
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone || '',
        createdAt: new Date(),
      }
      if (data.role === 'parent') userData.children = []
      if (data.role === 'driver') {
        userData.aadhaarVerified = false
        userData.verificationStatus = 'pending'
        userData.yearsOfExperience = 0
        userData.performanceScore = 0
        userData.overallRating = 0
        userData.totalReviews = 0
      }
      await setDoc(doc(db, 'users', user.uid), userData)
      await refreshProfile()
      navigate(`/${data.role}`, { replace: true })
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Use a different email or sign in instead.')
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.')
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else {
        setError(err.message || 'Failed to create account')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Hop-In</h1>
        <p className="text-slate-500 text-sm mt-1">Create your account</p>
        <h2 className="text-lg font-semibold text-slate-700 mt-6 mb-4">Sign Up</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer transition has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
                <input type="radio" {...register('role')} value="parent" className="sr-only" />
                <span>Parent</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer transition has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
                <input type="radio" {...register('role')} value="driver" className="sr-only" />
                <span>Driver</span>
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          {role === 'driver' && (
            <p className="text-slate-500 text-xs">
              As a driver, you'll complete verification (Aadhaar, van details) after signup.
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
