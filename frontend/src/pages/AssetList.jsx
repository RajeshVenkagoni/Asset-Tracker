import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { SkeletonTable } from '../components/Skeleton'
import { formatDate, formatCurrency } from '../utils/format'

const STATUS_BADGE = {
  Available: 'bg-green-100 text-green-800',
  Assigned: 'bg-blue-100 text-blue-800',
  'In Repair': 'bg-amber-100 text-amber-800',
  Retired: 'bg-gray-100 text-gray-800',
  Lost: 'bg-red-100 text-red-800',
}

const CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Printer', 'Network Equipment', 'Server', 'Other']
const STATUSES = ['Available', 'Assigned', 'In Repair', 'Retired', 'Lost']

export default function AssetList() {
  const [assets, setAssets] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', category: '', department: '' })
  const navigate = useNavigate()

  const fetchAssets = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.department) params.set('department', filters.department)
    try {
      const res = await api.get(`/assets/?${params}`)
      setAssets(res.data.results || [])
      setCount(res.data.count || 0)
    } catch { toast.error('Failed to load assets') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAssets() }, [page, filters])

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return
    try {
      await api.delete(`/assets/${id}/`)
      toast.success('Asset deleted')
      fetchAssets()
    } catch { toast.error('Failed to delete asset') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{count} assets total</p>
        <Link
          to="/assets/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Asset
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search assets..."
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        {[
          { key: 'status', options: STATUSES, label: 'Status' },
          { key: 'category', options: CATEGORIES, label: 'Category' },
        ].map(({ key, options, label }) => (
          <select
            key={key}
            value={filters[key]}
            onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Asset Tag', 'Name', 'Category', 'Status', 'Assigned To', 'Location', 'Value', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No assets found</td></tr>
              ) : assets.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/assets/${asset.id}`)}>
                  <td className="px-4 py-3 font-mono text-indigo-600 font-medium">{asset.asset_tag}</td>
                  <td className="px-4 py-3 font-medium">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-600">{asset.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[asset.status] || 'bg-gray-100 text-gray-700'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{asset.assigned_to_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{asset.location || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(asset.purchase_cost)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Link to={`/assets/${asset.id}`} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Eye size={14} /></Link>
                      <Link to={`/assets/${asset.id}/edit`} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Pencil size={14} /></Link>
                      <button onClick={() => handleDelete(asset.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page} of {Math.ceil(count / 20) || 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= count}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
