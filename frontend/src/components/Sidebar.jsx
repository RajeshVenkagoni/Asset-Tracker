import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Monitor, BarChart3, Server } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets', icon: Monitor, label: 'Assets' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        <Server className="text-indigo-400" size={28} />
        <span className="font-bold text-lg">AssetTracker</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          IT Asset Management System
        </div>
      </div>
    </aside>
  )
}
