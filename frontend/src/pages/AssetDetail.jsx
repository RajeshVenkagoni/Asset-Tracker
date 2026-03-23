import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Pencil, Trash2, Printer, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { formatDate, formatCurrency } from '../utils/format'

const STATUS_BADGE = {
  Available: 'bg-green-100 text-green-800',
  Assigned: 'bg-blue-100 text-blue-800',
  'In Repair': 'bg-amber-100 text-amber-800',
  Retired: 'bg-gray-100 text-gray-800',
  Lost: 'bg-red-100 text-red-800',
}

export default function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/assets/${id}/`).then(res => setAsset(res.data))
      .catch(() => toast.error('Asset not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this asset?')) return
    try {
      await api.delete(`/assets/${id}/`)
      toast.success('Asset deleted')
      navigate('/assets')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="animate-pulse h-64 bg-white rounded-xl" />
  if (!asset) return <p className="text-center text-gray-500 mt-20">Asset not found</p>

  const fields = [
    ['Asset Tag', asset.asset_tag], ['Name', asset.name],
    ['Category', asset.category], ['Manufacturer', asset.manufacturer],
    ['Model Number', asset.model_number], ['Serial Number', asset.serial_number],
    ['Status', null], ['Condition', asset.condition],
    ['Department', asset.department], ['Location', asset.location],
    ['Purchase Date', formatDate(asset.purchase_date)],
    ['Purchase Cost', formatCurrency(asset.purchase_cost)],
    ['Warranty Expiry', formatDate(asset.warranty_expiry)],
    ['Assigned To', asset.assigned_to_name || '—'],
  ]

  return (
    <div className="space-y-6 print:p-4">
      <div className="flex items-center justify-between no-print">
        <Link to="/assets" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft size={16} /> Back to Assets
        </Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Printer size={14} /> Print
          </button>
          <Link to={`/assets/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100">
            <Pencil size={14} /> Edit
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 font-mono">{asset.asset_tag}</p>
            <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_BADGE[asset.status] || 'bg-gray-100'}`}>
            {asset.status}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              {label === 'Status' ? (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[asset.status] || ''}`}>{asset.status}</span>
              ) : (
                <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
              )}
            </div>
          ))}
        </div>
        {asset.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-gray-700">{asset.notes}</p>
          </div>
        )}
      </div>

      {asset.assignments?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Assignment History</h3>
          <div className="space-y-3">
            {asset.assignments.map(a => (
              <div key={a.id} className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{a.assigned_to_name}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(a.assigned_date)} {a.returned_date ? `→ ${formatDate(a.returned_date)}` : '(current)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {asset.maintenance_logs?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Maintenance History</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Type', 'Date', 'Performed By', 'Cost', 'Description'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {asset.maintenance_logs.map(log => (
                <tr key={log.id}>
                  <td className="px-3 py-2 font-medium">{log.maintenance_type}</td>
                  <td className="px-3 py-2 text-gray-600">{formatDate(log.date_performed)}</td>
                  <td className="px-3 py-2 text-gray-600">{log.performed_by}</td>
                  <td className="px-3 py-2 text-gray-600">{formatCurrency(log.cost)}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
