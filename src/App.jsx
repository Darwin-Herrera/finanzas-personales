import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  supabase,
} from './lib/supabase'

import Auth from './components/Auth'

import Sidebar from './components/Sidebar'

import Topbar from './components/Topbar'

import Dashboard from './components/Dashboard'

import Transactions from './components/Transactions'

import Cards from './components/Cards'

import FixedPayments from './components/FixedPayments'

import Account from './components/Account'

import {
  firstDayOfMonth,
  lastDayOfMonth,
  monthKey,
} from './utils/money'


const titles = {

  dashboard:
    'Resumen general',

  transactions:
    'Movimientos',

  cards:
    'Tarjetas de crédito',

  fixed:
    'Pagos fijos',

  account:
    'Mi cuenta',

}


export default function App() {

  const [
    session,
    setSession,
  ] =
    useState(null)


  const [
    loadingSession,
    setLoadingSession,
  ] =
    useState(true)


  const [
    page,
    setPage,
  ] =
    useState(
      'dashboard'
    )


  const [
    month,
    setMonth,
  ] =
    useState(
      monthKey()
    )


  const [
    transactions,
    setTransactions,
  ] =
    useState([])


  const [
    cards,
    setCards,
  ] =
    useState([])


  const [
    fixedPayments,
    setFixedPayments,
  ] =
    useState([])


  const [
    loadingData,
    setLoadingData,
  ] =
    useState(false)


  const [
    sidebarOpen,
    setSidebarOpen,
  ] =
    useState(false)


  // ==================================================
  // SESIÓN
  // ==================================================

  useEffect(
    () => {

      supabase.auth
        .getSession()
        .then(
          ({
            data,
          }) => {

            setSession(
              data.session
            )

            setLoadingSession(
              false
            )

          }
        )


      const {
        data:
          listener,
      } =
        supabase.auth
          .onAuthStateChange(
            (
              event,
              nextSession
            ) => {

              setSession(
                nextSession
              )


              // -----------------------------------------
              // RECUPERACIÓN DE CONTRASEÑA
              // -----------------------------------------

              if (
                event ===
                'PASSWORD_RECOVERY'
              ) {

                setPage(
                  'account'
                )

              }

            }
          )


      return () => {

        listener
          .subscription
          .unsubscribe()

      }

    },
    []
  )


  // ==================================================
  // TARJETAS
  // ==================================================

  const loadCards =
    useCallback(
      async () => {

        if (
          !session?.user
        ) {
          return
        }


        const {
          data,
          error,
        } =
          await supabase
            .from(
              'cards'
            )
            .select(
              '*'
            )
            .order(
              'created_at',
              {
                ascending:
                  true,
              }
            )


        if (!error) {

          setCards(
            data ||
            []
          )

        }

      },
      [
        session,
      ]
    )


  // ==================================================
  // PAGOS FIJOS
  // ==================================================

  const loadFixed =
    useCallback(
      async () => {

        if (
          !session?.user
        ) {
          return
        }


        const {
          data,
          error,
        } =
          await supabase
            .from(
              'fixed_payments'
            )
            .select(
              '*'
            )
            .eq(
              'active',
              true
            )
            .order(
              'due_day',
              {
                ascending:
                  true,
              }
            )


        if (!error) {

          setFixedPayments(
            data ||
            []
          )

        }

      },
      [
        session,
      ]
    )


  // ==================================================
  // MOVIMIENTOS
  // ==================================================

  const loadTransactions =
    useCallback(
      async () => {

        if (
          !session?.user
        ) {
          return
        }


        const {
          data,
          error,
        } =
          await supabase
            .from(
              'transactions'
            )
            .select(
              '*'
            )
            .gte(
              'transaction_date',
              firstDayOfMonth(
                month
              )
            )
            .lte(
              'transaction_date',
              lastDayOfMonth(
                month
              )
            )
            .order(
              'transaction_date',
              {
                ascending:
                  false,
              }
            )
            .order(
              'created_at',
              {
                ascending:
                  false,
              }
            )


        if (!error) {

          setTransactions(
            data ||
            []
          )

        }

      },
      [
        session,
        month,
      ]
    )


  // ==================================================
  // RECARGAR TODO
  // ==================================================

  const reloadAll =
    useCallback(
      async () => {

        if (
          !session?.user
        ) {
          return
        }


        setLoadingData(
          true
        )


        await Promise.all([
          loadCards(),
          loadFixed(),
          loadTransactions(),
        ])


        setLoadingData(
          false
        )

      },
      [
        session,
        loadCards,
        loadFixed,
        loadTransactions,
      ]
    )


  // ==================================================
  // CARGA
  // ==================================================

  useEffect(
    () => {

      reloadAll()

    },
    [
      reloadAll,
    ]
  )


  // ==================================================
  // ESPERANDO SESIÓN
  // ==================================================

  if (
    loadingSession
  ) {

    return (

      <div className="screen-center">

        Cargando...

      </div>

    )

  }


  // ==================================================
  // LOGIN
  // ==================================================

  if (
    !session
  ) {

    return (
      <Auth />
    )

  }


  // ==================================================
  // APLICACIÓN
  // ==================================================

  return (

    <div className="app-shell">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div
        className={`sidebar-wrap ${
          sidebarOpen
            ? 'open'
            : ''
        }`}
      >

        <Sidebar
          page={
            page
          }
          setPage={(
            newPage
          ) => {

            setPage(
              newPage
            )

            setSidebarOpen(
              false
            )

          }}
          email={
            session
              .user
              .email
          }
        />

      </div>


      {/* =================================================
          OVERLAY MOBILE
      ================================================= */}

      {sidebarOpen && (

        <div
          className="mobile-overlay"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        />

      )}


      {/* =================================================
          PRINCIPAL
      ================================================= */}

      <main className="main">

        <Topbar
          title={
            titles[
              page
            ]
          }
          month={
            month
          }
          setMonth={
            setMonth
          }
          toggleSidebar={() =>
            setSidebarOpen(
              true
            )
          }
        />


        <div className="content">

          {loadingData && (

            <div className="loading-bar" />

          )}


          {/* ============================================
              DASHBOARD
          ============================================ */}

          {page ===
            'dashboard' && (

            <Dashboard
              transactions={
                transactions
              }
              cards={
                cards
              }
            />

          )}


          {/* ============================================
              MOVIMIENTOS
          ============================================ */}

          {page ===
            'transactions' && (

            <Transactions
              user={
                session.user
              }
              transactions={
                transactions
              }
              cards={
                cards
              }
              reload={
                loadTransactions
              }
            />

          )}


          {/* ============================================
              TARJETAS
          ============================================ */}

          {page ===
            'cards' && (

            <Cards
              user={
                session.user
              }
              cards={
                cards
              }
              reload={
                loadCards
              }
            />

          )}


          {/* ============================================
              PAGOS FIJOS
          ============================================ */}

          {page ===
            'fixed' && (

            <FixedPayments
              user={
                session.user
              }
              fixedPayments={
                fixedPayments
              }
              cards={
                cards
              }
              month={
                month
              }
              reloadAll={
                reloadAll
              }
            />

          )}


          {/* ============================================
              MI CUENTA
          ============================================ */}

          {page ===
            'account' && (

            <Account
              user={
                session.user
              }
            />

          )}

        </div>

      </main>

    </div>

  )

}