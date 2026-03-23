import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { Products } from './pages/Products'
import { Sales } from './pages/Sales'
import { Login } from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Register } from './pages/Register'

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <Layout>
                  <Clients />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/products"
            element={
              <PrivateRoute>
                <Layout>
                  <Products />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <PrivateRoute>
                <Layout>
                  <Sales />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App