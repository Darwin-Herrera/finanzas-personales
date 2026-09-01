import { Menu } from 'lucide-react'

export default function Topbar({ title, month, setMonth, toggleSidebar }) {
  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={toggleSidebar}>
        <Menu size={21} />
      </button>
      <div>
        <h1>{title}</h1>
        <p>Administra tus finanzas personales</p>
      </div>
      <label className="month-filter">
        Mes
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </label>
    </header>
  )
}
