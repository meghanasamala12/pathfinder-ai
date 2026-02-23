import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Brain } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../config'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetPwd, setResetPwd] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
      login(data.access_token, { email: data.email, name: data.name })
      navigate(from, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string'
          ? err.response.data.detail
          : 'Invalid email or password')
      } else {
        setError('Could not reach server. Is the backend running at http://localhost:8000?')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithoutAccount = () => {
    login('demo-token', { email: 'guest@pathfinder.ai', name: 'Guest' })
    navigate(from, { replace: true })
  }

  const handleReset = async () => {
    if (!resetEmail.trim()) { setResetError('Please enter your email'); return }
    if (resetPwd !== resetConfirm) { setResetError('Passwords do not match'); return }
    if (resetPwd.length < 6) { setResetError('Password must be at least 6 characters'); return }
    setResetLoading(true); setResetError('')
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, { email: resetEmail.trim().toLowerCase(), new_password: resetPwd })
      setResetSuccess(true)
      setTimeout(() => {
        setShowReset(false)
        setResetSuccess(false)
        setResetEmail(''); setResetPwd(''); setResetConfirm('')
      }, 1500)
    } catch (e: unknown) {
      const detail = axios.isAxiosError(e) ? e.response?.data?.detail : null
      setResetError(detail || 'Failed to reset password. Check your email is correct.')
    } finally { setResetLoading(false) }
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 flex-shrink-0 text-purple-600" strokeWidth={1.5} />
              <h1 className="text-2xl font-bold text-gray-900">PathFinder AI</h1>
            </div>
            <p className="text-gray-500 mt-2">You&apos;re signed in as <strong>{user.name}</strong></p>
            <div className="flex flex-col gap-2 mt-6">
              <button type="button" onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700">
                Go to Dashboard
              </button>
              <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">Enter your email and a new password to reset your account.</p>
            {resetSuccess ? (
              <p className="text-green-600 font-medium text-center py-4">Password reset successfully!</p>
            ) : (
              <div className="space-y-3">
                <input type="email" placeholder="Your email address" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500" />
                <input type="password" placeholder="New password" value={resetPwd} onChange={e => setResetPwd(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500" />
                <input type="password" placeholder="Confirm new password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500" />
                {resetError && <p className="text-red-500 text-xs">{resetError}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowReset(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleReset} disabled={resetLoading}
                    className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Brain className="w-12 h-12 flex-shrink-0 text-purple-600" strokeWidth={1.5} />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">PathFinder AI</h1>
                <p className="text-gray-500 mt-0.5">Sign in to your account</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="you@example.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <button type="button" onClick={() => { setShowReset(true); setResetEmail(email) }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    Forgot password?
                  </button>
                </div>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-purple-600 font-medium hover:text-purple-700">Sign up</Link>
            </p>
            <p className="text-center mt-4">
              <button type="button" onClick={handleContinueWithoutAccount}
                className="text-sm text-gray-500 hover:text-purple-600 underline">
                Continue to Dashboard (no account)
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
