import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  CalendarClock,
  LogOut,
  WalletCards,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const items = [
  ['dashboard', 'Resumen', LayoutDashboard],
  ['transactions', 'Movimientos', ReceiptText],
  ['cards', 'Tarjetas', CreditCard],
  ['fixed', 'Pagos fijos', CalendarClock],
]

export default function Sidebar({ page, setPage, email }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon"><WalletCards size={22} /></span>
        <div>
          <strong>Mis Finanzas</strong>
          <small>Control Mensual</small>
        </div>
      </div>

      <nav>
        {items.map(([key, label, Icon]) => (
          <button
            key={key}
            className={`nav-item ${page === key ? 'active' : ''}`}
            onClick={() => setPage(key)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <small className="account-email">{email}</small>
        <button className="nav-item" onClick={() => supabase.auth.signOut()}>
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  )
}
