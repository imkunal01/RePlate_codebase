import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { getCurrentUser, handleGoogleCallback } from './services/authService'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    // Check if user is already logged in
    const loggedInUser = getCurrentUser()
    if (loggedInUser) {
      setUser(loggedInUser)
    }
    // Check if this is a Google callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      handleGoogleCallback(code)
        .then(result => {
          if (result.success) {
            setUser(result.data)
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname)
          } else {
            setError('Google authentication failed: ' + result.message)
          }
        })
        .catch(err => {
          setError('Error processing Google callback')
          console.error(err)
        })
    }
    
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setError('')
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app-container">
      <header>
        <h1>RePlate</h1>
      </header>
      
      {error && <div className="error-banner">{error}</div>}
      
      <main>
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  )
}

export default App