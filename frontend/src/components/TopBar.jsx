import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard': 'Dashboard',
  '/assets': 'Assets',
  '/reports': 'Reports',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const title = Object.entries(titles).find(([key]) => pathname.startsWith(key))?.[1] || 'IT Asset Tracker'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
      </div>
    </header>
  )
}
