import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setConnectionError(false)
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          setUserProfile(userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null)
        } catch (err) {
          console.error('Error fetching user profile:', err)
          setUserProfile(null)
          const isOffline = err?.code === 'unavailable' || 
            err?.message?.toLowerCase?.().includes('offline') ||
            err?.message?.toLowerCase?.().includes('blocked')
          if (isOffline) setConnectionError(true)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const signOut = () => firebaseSignOut(auth)

  const refreshProfile = async () => {
    if (!user) return
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    setUserProfile(userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null)
  }

  const value = {
    user,
    userProfile,
    loading,
    connectionError,
    setConnectionError,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAuthenticated: !!user,
    role: userProfile?.role || null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
