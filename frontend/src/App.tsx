import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import Profile from "./pages/Profile"
import Dashboard from './pages/Dashboard'
import CompanySuggestions from './pages/CompanySuggestions'
import AlumniNetwork from './pages/AlumniNetwork'
import GapAnalysis from './pages/GapAnalysis'
import Login from './pages/Login'
import Signup from './pages/Signup'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/career/companies" element={<ProtectedRoute><DashboardLayout><CompanySuggestions /></DashboardLayout></ProtectedRoute>} />
            <Route path="/gap-analysis" element={<ProtectedRoute><DashboardLayout><GapAnalysis /></DashboardLayout></ProtectedRoute>} />
            <Route path="/alumni" element={<ProtectedRoute><DashboardLayout><AlumniNetwork /></DashboardLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
