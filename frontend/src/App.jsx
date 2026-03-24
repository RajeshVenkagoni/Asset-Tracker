import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AssetList from './pages/AssetList'
import AssetDetail from './pages/AssetDetail'
import AssetForm from './pages/AssetForm'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/new" element={<AssetForm />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/assets/:id/edit" element={<AssetForm />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
