import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CompleteProfile from './pages/CompleteProfile'
import Unauthorized from './pages/Unauthorized'
import Landing from './pages/Landing'
import ParentDashboard from './pages/ParentDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SchoolVans from './pages/SchoolVans'
import VanDetail from './pages/VanDetail'
import Booking from './pages/Booking'
import AddChild from './pages/AddChild'
import QRScanner from './pages/QRScanner'
import DriverProfileSetup from './pages/DriverProfileSetup'
import ConnectionError from './components/ConnectionError'

export default function App() {
  return (
    <AuthProvider>
      <ConnectionError />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/schools/:schoolId/vans" element={<SchoolVans />} />
          <Route path="/van/:vanId" element={<VanDetail />} />
          <Route path="/van/:vanId/book" element={<Booking />} />
          <Route path="/parent/children/add" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <AddChild />
            </ProtectedRoute>
          } />
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/driver/complete-profile" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/driver/scan" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
