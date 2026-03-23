import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Monitor, CheckCircle, Wrench, DollarSign, AlertTriangle } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../api/axios'
import { SkeletonCard } from '../components/Skeleton'
import { formatDate } from '../utils/format'

const STATUS_COLORS = {
  Available: '#22c55e', Assigned: '#3b82f6',
  'In Repair': '#f59e0b', Retired: '#6b7280', Lost: '#ef4444'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/assets/stats/'),
      api.get('/assets/?warranty_before=' + new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] + '&ordering=warranty_expiry'),
    ]).then(([statsRes, assetsRes]) => {
      setStats(statsRes.data)
      setAssets(assetsRes.data.results || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  const statCards = [
    { label: 'Total Assets', value: stats?.total_assets || 0, icon: Monitor, color: 'bg-blue-50 text-blue-600' },
    { label: 'Assigned', value: stats?.by_status?.Assigned || 0, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'In Repair', value: stats?.by_status?.['In Repair'] || 0, icon: Wrench, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Value', value: `$${(stats?.total_value || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
  ]

  const statusData = Object.entries(stats?.by_status || {}).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(stats?.by_category || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`p-2 rounded-lg ${color}`}><Icon size={18} /></span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Assets by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-700">Warranty Expiring Soon (30 days)</h3>
        </div>
        {assets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No assets with expiring warranty</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Asset Tag', 'Name', 'Category', 'Warranty Expiry'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.slice(0, 5).map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-indigo-600">
                    <Link to={`/assets/${a.id}`}>{a.asset_tag}</Link>
                  </td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.category}</td>
                  <td className="px-4 py-3 text-amber-600 font-medium">{formatDate(a.warranty_expiry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
