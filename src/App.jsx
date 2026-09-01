import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Cards from './components/Cards'
import FixedPayments from './components/FixedPayments'
import { firstDayOfMonth, lastDayOfMonth, monthKey } from './utils/money'

const titles = {
  dashboard: 'Resumen general',
  transactions: 'Movimientos',
  cards: 'Tarjetas de crédito',
  fixed: 'Pagos fijos',
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [month, setMonth] = useState(monthKey())
  const [transactions, setTransactions] = useState([])
  const [cards, setCards] = useState([])
  const [fixedPayments, setFixedPayments] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoadingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const loadCards = useCallback(async () => {
    if (!session?.user) return
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setCards(data || [])
  }, [session])

  const loadFixed = useCallback(async () => {
    if (!session?.user) return
    const { data, error } = await supabase
      .from('fixed_payments')
      .select('*')
      .eq('active', true)
      .order('due_day', { ascending: true })

    if (!error) setFixedPayments(data || [])
  }, [session])

  const loadTransactions = useCallback(async () => {
    if (!session?.user) return
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', firstDayOfMonth(month))
      .lte('transaction_date', lastDayOfMonth(month))
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error) setTransactions(data || [])
  }, [session, month])

  const reloadAll = useCallback(async () => {
    if (!session?.user) return
    setLoadingData(true)
    await Promise.all([loadCards(), loadFixed(), loadTransactions()])
    setLoadingData(false)
  }, [session, loadCards, loadFixed, loadTransactions])

  useEffect(() => {
    reloadAll()
  }, [reloadAll])

  if (loadingSession) {
    return <div className="screen-center">Cargando...</div>
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app-shell">
      <div className={`sidebar-wrap ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          page={page}
          setPage={(p) => {
            setPage(p)
            setSidebarOpen(false)
          }}
          email={session.user.email}
        />
      </div>
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main">
        <Topbar
          title={titles[page]}
          month={month}
          setMonth={setMonth}
          toggleSidebar={() => setSidebarOpen(true)}
        />

        <div className="content">
          {loadingData && <div className="loading-bar" />}

          {page === 'dashboard' && (
            <Dashboard transactions={transactions} cards={cards} />
          )}

          {page === 'transactions' && (
            <Transactions
              user={session.user}
              transactions={transactions}
              cards={cards}
              reload={loadTransactions}
            />
          )}

          {page === 'cards' && (
            <Cards
              user={session.user}
              cards={cards}
              reload={loadCards}
            />
          )}

          {page === 'fixed' && (
            <FixedPayments
              user={session.user}
              fixedPayments={fixedPayments}
              cards={cards}
              month={month}
              reloadAll={reloadAll}
            />
          )}
        </div>
      </main>
    </div>
  )
}
