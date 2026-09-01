import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  CalendarClock,
  LogOut,
  WalletCards,
  UserRound,
} from 'lucide-react'

import {
  supabase,
} from '../lib/supabase'


const items = [

  [
    'dashboard',
    'Resumen',
    LayoutDashboard,
  ],

  [
    'transactions',
    'Movimientos',
    ReceiptText,
  ],

  [
    'cards',
    'Tarjetas',
    CreditCard,
  ],

  [
    'fixed',
    'Pagos fijos',
    CalendarClock,
  ],

  [
    'account',
    'Mi cuenta',
    UserRound,
  ],

]


export default function Sidebar({
  page,
  setPage,
  email,
}) {

  return (

    <aside className="sidebar">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="brand">

        <span className="brand-icon">

          <WalletCards
            size={22}
          />

        </span>


        <div>

          <strong>
            Mis Finanzas
          </strong>

          <small>
            Control personal
          </small>

        </div>

      </div>


      {/* =================================================
          MENÚ
      ================================================= */}

      <nav>

        {items.map(
          (
            [
              key,
              label,
              Icon,
            ]
          ) => (

            <button
              key={
                key
              }
              className={`nav-item ${
                page ===
                key
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setPage(
                  key
                )
              }
            >

              <Icon
                size={18}
              />

              <span>
                {label}
              </span>

            </button>

          )
        )}

      </nav>


      {/* =================================================
          CUENTA / SALIR
      ================================================= */}

      <div className="sidebar-bottom">

        <small className="account-email">

          {
            email
          }

        </small>


        <button
          className="nav-item"
          onClick={() =>
            supabase.auth
              .signOut()
          }
        >

          <LogOut
            size={18}
          />

          <span>
            Salir
          </span>

        </button>

      </div>

    </aside>

  )

}