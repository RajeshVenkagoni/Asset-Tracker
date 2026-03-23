import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Printer', 'Network Equipment', 'Server', 'Other']
const STATUSES = ['Available', 'Assigned', 'In Repair', 'Retired', 'Lost']
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor']

const INITIAL = {
  name: '', category: 'Laptop', manufacturer: '', model_number: '',
  serial_number: '', purchase_date: '', purchase_cost: '',
  warranty_expiry: '', status: 'Available', condition: 'Good',
  location: '', department: '', notes: '', assigned_to: '',
}

export default function AssetForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(INITIAL)
  const [users, setUsers] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/users/').then(res => setUsers(res.data || []))
    if (isEdit) {
      api.get(`/assets/${id}/`).then(res => {
        const d = res.data
        setForm({
          name: d.name || '', category: d.category || 'Laptop',
          manufacturer: d.manufacturer || '', model_number: d.model_number || '',
          serial_number: d.serial_number || '',
          purchase_date: d.purchase_date || '', purchase_cost: d.purchase_cost || '',
          warranty_expiry: d.warranty_expiry || '', status: d.status || 'Available',
          condition: d.condition || 'Good', location: d.location || '',
          department: d.department || '', notes: d.notes || '',
          assigned_to: d.assigned_to || '',
        })
      })
    }
  }, [id])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.purchase_cost && isNaN(Number(form.purchase_cost))) errs.purchase_cost = 'Must be a number'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const payload = { ...form }
    if (!payload.purchase_date) delete payload.purchase_date
    if (!payload.warranty_expiry) delete payload.warranty_expiry
    if (!payload.assigned_to) payload.assigned_to = null
    if (!payload.purchase_cost) delete payload.purchase_cost
    try {
      if (isEdit) {
        await api.patch(`/assets/${id}/`, payload)
        toast.success('Asset updated')
      } else {
        await api.post('/assets/', payload)
        toast.success('Asset created')
      }
      navigate('/assets')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') setErrors(data)
      else toast.error('Failed to save asset')
    } finally { setLoading(false) }
  }

  const Field = ({ label, name, type = 'text', options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select
          value={form[name]}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors[name] ? 'border-red-400' : 'border-gray-300'}`}
        />
      )}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/assets" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={16} /> Back to Assets
      </Link>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{isEdit ? 'Edit Asset' : 'Add New Asset'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Asset Name *" name="name" />
            <Field label="Category" name="category" options={CATEGORIES} />
            <Field label="Manufacturer" name="manufacturer" />
            <Field label="Model Number" name="model_number" />
            <Field label="Serial Number" name="serial_number" />
            <Field label="Purchase Date" name="purchase_date" type="date" />
            <Field label="Purchase Cost ($)" name="purchase_cost" type="number" />
            <Field label="Warranty Expiry" name="warranty_expiry" type="date" />
            <Field label="Status" name="status" options={STATUSES} />
            <Field label="Condition" name="condition" options={CONDITIONS} />
            <Field label="Location" name="location" />
            <Field label="Department" name="department" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                value={form.assigned_to}
                onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">— Unassigned —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Link to="/assets" className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Asset' : 'Create Asset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
