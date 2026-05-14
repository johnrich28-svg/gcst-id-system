import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { RequestProvider } from './context/RequestContext'

function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <div className="min-h-screen bg-slate-50">
          <AppRoutes />
        </div>
      </RequestProvider>
    </AuthProvider>
  )
}

export default App
