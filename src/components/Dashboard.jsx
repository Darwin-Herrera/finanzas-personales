import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import {
  Banknote,
  CalendarCheck,
  CreditCard,
  HeartHandshake,
  PiggyBank,
  Search,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
} from 'lucide-react'

import {
  currency,
} from '../utils/money'


// =====================================================
// CONFIGURACIÓN
// =====================================================

const PAGE_SIZE = 5


const PIE_COLORS = [
  '#0f766e',
  '#2563eb',
  '#7c3aed',
  '#e11d48',
  '#f59e0b',
  '#0891b2',
  '#64748b',
  '#16a34a',
  '#9333ea',
]


// Colores del gráfico principal
const INCOME_COLOR =
  '#059669'

const OUTFLOW_COLOR =
  '#ea580c'


// =====================================================
// COMPONENTE
// =====================================================

export default function Dashboard({
  transactions,
  cards,
}) {

  // ===================================================
  // PAGINACIÓN / BUSCADOR / ORDEN TABLA
  // ===================================================

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1)


  const [
    search,
    setSearch,
  ] =
    useState('')


  const [
    sortConfig,
    setSortConfig,
  ] =
    useState({
      key:
        'transaction_date',

      direction:
        'desc',
    })


  // ===================================================
  // DRILL DOWN DEL GRÁFICO
  // ===================================================

  const [
    detailType,
    setDetailType,
  ] =
    useState(null)


  const detailChartRef =
    useRef(null)


  // ===================================================
  // TIPOS DE MOVIMIENTO
  // ===================================================

  const incomes =
    transactions.filter(
      (transaction) =>
        transaction.movement_type ===
        'income'
    )


  const expenses =
    transactions.filter(
      (transaction) =>
        transaction.movement_type ===
        'expense'
    )


  const cash =
    transactions.filter(
      (transaction) =>
        transaction.movement_type ===
        'cash_withdrawal'
    )


  const fixed =
    transactions.filter(
      (transaction) =>
        transaction.movement_type ===
        'fixed_payment'
    )


  const savings =
    transactions.filter(
      (transaction) =>
        transaction.movement_type ===
        'saving'
    )


  const familyProjects =
    transactions.filter(
      (transaction) =>
        transaction.movement_type ===
        'family_project'
    )


  // ===================================================
  // TOTALES
  // ===================================================

  const totalIncome =
    incomes.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount_hnl ||
          0
        ),
      0
    )


  const totalExpenses =
    expenses.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount_hnl ||
          0
        ),
      0
    )


  const totalCash =
    cash.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount_hnl ||
          0
        ),
      0
    )


  const totalFixed =
    fixed.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount_hnl ||
          0
        ),
      0
    )


  const totalSavings =
    savings.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount_hnl ||
          0
        ),
      0
    )


  const totalFamily =
    familyProjects.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount_hnl ||
          0
        ),
      0
    )


  // ===================================================
  // GASTO TOTAL
  // ===================================================
  // Aquí NO incluimos ahorro
  // ni proyecto familiar.
  // ===================================================

  const totalSpent =
    totalExpenses +
    totalCash +
    totalFixed


  // ===================================================
  // SALIDAS TOTALES
  // ===================================================
  // Todo dinero que reduce
  // el disponible del mes.
  //
  // Pago tarjeta NO entra
  // para evitar duplicidad.
  // ===================================================

  const totalOutflows =
    totalSpent +
    totalSavings +
    totalFamily


  // ===================================================
  // DISPONIBLE
  // ===================================================

  const remaining =
    totalIncome -
    totalOutflows


  // ===================================================
  // MOVIMIENTOS DE SALIDA
  // ===================================================

  const outgoingTransactions =
    useMemo(
      () =>
        transactions.filter(
          (transaction) =>
            transaction.movement_type !==
              'income' &&
            transaction.movement_type !==
              'card_payment'
        ),
      [
        transactions,
      ]
    )


  // ===================================================
  // GRÁFICO DONA
  // DISTRIBUCIÓN POR CATEGORÍA
  // ===================================================

  const pieData =
    useMemo(
      () => {

        const map = {}

        outgoingTransactions.forEach(
          (
            transaction
          ) => {

            const category =
              transaction.category ||
              'Sin categoría'

            map[
              category
            ] =
              (
                map[
                  category
                ] ||
                0
              ) +
              Number(
                transaction.amount_hnl ||
                0
              )
          }
        )


        return Object
          .entries(
            map
          )
          .map(
            (
              [
                name,
                value,
              ]
            ) => ({
              name,
              value,
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.value -
              a.value
          )
      },
      [
        outgoingTransactions,
      ]
    )


  // ===================================================
  // INGRESOS VS SALIDAS
  // ===================================================

  const incomeVsOutflowData = [
    {
      type:
        'income',

      name:
        'Ingresos',

      monto:
        totalIncome,

      fill:
        INCOME_COLOR,
    },

    {
      type:
        'outflow',

      name:
        'Salidas',

      monto:
        totalOutflows,

      fill:
        OUTFLOW_COLOR,
    },
  ]


  // ===================================================
  // DETALLE POR CATEGORÍA
  // ===================================================

  const detailData =
    useMemo(
      () => {

        if (
          !detailType
        ) {

          return []
        }


        let source = []


        // -----------------------------------------------
        // INGRESOS
        // -----------------------------------------------

        if (
          detailType ===
          'income'
        ) {

          source =
            transactions.filter(
              (
                transaction
              ) =>
                transaction.movement_type ===
                'income'
            )
        }


        // -----------------------------------------------
        // SALIDAS
        // -----------------------------------------------

        if (
          detailType ===
          'outflow'
        ) {

          source =
            transactions.filter(
              (
                transaction
              ) =>
                transaction.movement_type !==
                  'income' &&
                transaction.movement_type !==
                  'card_payment'
            )
        }


        const categoryMap = {}


        source.forEach(
          (
            transaction
          ) => {

            const category =
              transaction.category ||
              'Sin categoría'


            categoryMap[
              category
            ] =
              (
                categoryMap[
                  category
                ] ||
                0
              ) +
              Number(
                transaction.amount_hnl ||
                0
              )
          }
        )


        // -----------------------------------------------
        // ASCENDENTE
        // -----------------------------------------------

        return Object
          .entries(
            categoryMap
          )
          .map(
            (
              [
                category,
                amount,
              ]
            ) => ({
              category,
              amount,
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              a.amount -
              b.amount
          )

      },
      [
        detailType,
        transactions,
      ]
    )


  // ===================================================
  // CLICK INGRESOS / SALIDAS
  // ===================================================

  const handleMainBarClick = (
    data
  ) => {

    if (
      !data
    ) {
      return
    }


    setDetailType(
      data.type
    )


    setTimeout(
      () => {

        detailChartRef
          .current
          ?.scrollIntoView({
            behavior:
              'smooth',

            block:
              'center',
          })

      },
      100
    )
  }


  // ===================================================
  // BUSCAR MOVIMIENTOS
  // ===================================================

  const searchedTransactions =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase()


        if (
          !value
        ) {

          return [
            ...transactions,
          ]
        }


        return transactions.filter(
          (
            transaction
          ) => {

            const description =
              (
                transaction.description ||
                ''
              )
                .toLowerCase()


            const category =
              (
                transaction.category ||
                ''
              )
                .toLowerCase()


            const type =
              typeLabel(
                transaction.movement_type
              )
                .toLowerCase()


            const currencyText =
              (
                transaction.currency ||
                ''
              )
                .toLowerCase()


            const amount =
              String(
                transaction.amount_hnl ||
                ''
              )
                .toLowerCase()


            const notes =
              (
                transaction.notes ||
                ''
              )
                .toLowerCase()


            return (
              description.includes(
                value
              ) ||
              category.includes(
                value
              ) ||
              type.includes(
                value
              ) ||
              currencyText.includes(
                value
              ) ||
              amount.includes(
                value
              ) ||
              notes.includes(
                value
              )
            )

          }
        )

      },
      [
        search,
        transactions,
      ]
    )


  // ===================================================
  // ORDENAR CUALQUIER COLUMNA
  // ===================================================

  const sortedTransactions =
    useMemo(
      () => {

        const data = [
          ...searchedTransactions,
        ]


        data.sort(
          (
            a,
            b
          ) => {

            let valueA
            let valueB


            switch (
              sortConfig.key
            ) {

              case 'transaction_date':

                valueA =
                  new Date(
                    `${a.transaction_date}T00:00:00`
                  )

                valueB =
                  new Date(
                    `${b.transaction_date}T00:00:00`
                  )

                break


              case 'description':

                valueA =
                  (
                    a.description ||
                    ''
                  )
                    .toLowerCase()

                valueB =
                  (
                    b.description ||
                    ''
                  )
                    .toLowerCase()

                break


              case 'category':

                valueA =
                  (
                    a.category ||
                    ''
                  )
                    .toLowerCase()

                valueB =
                  (
                    b.category ||
                    ''
                  )
                    .toLowerCase()

                break


              case 'movement_type':

                valueA =
                  typeLabel(
                    a.movement_type
                  )
                    .toLowerCase()

                valueB =
                  typeLabel(
                    b.movement_type
                  )
                    .toLowerCase()

                break


              case 'currency':

                valueA =
                  (
                    a.currency ||
                    ''
                  )
                    .toLowerCase()

                valueB =
                  (
                    b.currency ||
                    ''
                  )
                    .toLowerCase()

                break


              case 'amount_hnl':

                valueA =
                  Number(
                    a.amount_hnl ||
                    0
                  )

                valueB =
                  Number(
                    b.amount_hnl ||
                    0
                  )

                break


              default:

                valueA =
                  ''

                valueB =
                  ''

                break
            }


            let result = 0


            if (
              valueA <
              valueB
            ) {

              result = -1

            } else if (
              valueA >
              valueB
            ) {

              result = 1
            }


            return sortConfig.direction ===
              'asc'
                ? result
                : -result

          }
        )


        return data

      },
      [
        searchedTransactions,
        sortConfig,
      ]
    )


  // ===================================================
  // CLICK ENCABEZADO
  // ===================================================

  const handleSort = (
    key
  ) => {

    setSortConfig(
      (
        previous
      ) => {

        if (
          previous.key ===
          key
        ) {

          return {
            key,

            direction:
              previous.direction ===
              'asc'
                ? 'desc'
                : 'asc',
          }
        }


        return {
          key,

          direction:
            'asc',
        }
      }
    )


    setCurrentPage(
      1
    )
  }


  // ===================================================
  // REINICIAR PÁGINA AL BUSCAR
  // ===================================================

  useEffect(
    () => {

      setCurrentPage(
        1
      )

    },
    [
      search,
    ]
  )


  // ===================================================
  // PAGINACIÓN
  // ===================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        sortedTransactions.length /
        PAGE_SIZE
      )
    )


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    )


  const startIndex =
    (
      safeCurrentPage -
      1
    ) *
    PAGE_SIZE


  const paginatedTransactions =
    sortedTransactions.slice(
      startIndex,
      startIndex +
        PAGE_SIZE
    )


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>

      {/* =================================================
          RESUMEN
      ================================================= */}

      <section className="stats-grid">

        <Stat
          icon={
            Banknote
          }
          label="Ingresos"
          value={
            currency(
              totalIncome
            )
          }
        />


        <Stat
          icon={
            Wallet
          }
          label="Gasto total"
          value={
            currency(
              totalSpent
            )
          }
        />


        <Stat
          icon={
            PiggyBank
          }
          label="Ahorro"
          value={
            currency(
              totalSavings
            )
          }
        />


        <Stat
          icon={
            HeartHandshake
          }
          label="Proyecto familiar"
          value={
            currency(
              totalFamily
            )
          }
        />


        <Stat
          icon={
            CalendarCheck
          }
          label="Pagos fijos"
          value={
            currency(
              totalFixed
            )
          }
        />


        <Stat
          icon={
            CreditCard
          }
          label="Disponible del mes"
          value={
            currency(
              remaining
            )
          }
          highlight={
            remaining
          }
        />

      </section>


      {/* =================================================
          GRÁFICOS PRINCIPALES
      ================================================= */}

      <section className="dashboard-grid">

        {/* ===============================================
            DISTRIBUCIÓN
        =============================================== */}

        <article className="panel chart-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Distribución de salidas
              </h3>

              <p>
                Distribución por
                categoría durante
                el mes
              </p>

            </div>

          </div>


          {pieData.length ? (

            <div className="chart-wrap">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={
                      pieData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={
                      70
                    }
                    outerRadius={
                      105
                    }
                    paddingAngle={
                      2
                    }
                  >

                    {pieData.map(
                      (
                        _,
                        index
                      ) => (

                        <Cell
                          key={
                            index
                          }
                          fill={
                            PIE_COLORS[
                              index %
                                PIE_COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>


                  <Tooltip
                    formatter={(
                      value
                    ) =>
                      currency(
                        value
                      )
                    }
                  />

                </PieChart>

              </ResponsiveContainer>


              <div className="legend-list">

                {pieData
                  .slice(
                    0,
                    9
                  )
                  .map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        key={
                          item.name
                        }
                        className="legend-item"
                      >

                        <span
                          className="legend-dot"
                          style={{
                            background:
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ],
                          }}
                        />


                        <span>
                          {
                            item.name
                          }
                        </span>


                        <strong>
                          {currency(
                            item.value
                          )}
                        </strong>

                      </div>

                    )
                  )}

              </div>

            </div>

          ) : (

            <Empty />

          )}

        </article>


        {/* ===============================================
            INGRESOS VS SALIDAS
        =============================================== */}

        <article className="panel chart-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Ingresos vs salidas
              </h3>

              <p>
                Haz clic sobre una
                barra para consultar
                su detalle
              </p>

            </div>

          </div>


          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={
                incomeVsOutflowData
              }
              margin={{
                top: 20,
                right: 25,
                bottom: 10,
                left: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={
                  false
                }
              />


              <XAxis
                dataKey="name"
              />


              <YAxis />


              <Tooltip
                formatter={(
                  value
                ) =>
                  currency(
                    value
                  )
                }
                cursor={{
                  fill:
                    'rgba(148, 163, 184, 0.10)',
                }}
              />


              <Bar
                dataKey="monto"
                radius={[
                  9,
                  9,
                  0,
                  0,
                ]}
                cursor="pointer"
                onClick={
                  handleMainBarClick
                }
              >

                {incomeVsOutflowData.map(
                  (
                    entry
                  ) => (

                    <Cell
                      key={
                        entry.type
                      }
                      fill={
                        entry.fill
                      }
                    />

                  )
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>


          {/* =============================================
              LEYENDA / TOTALES
          ============================================= */}

          <div
            style={{
              display:
                'grid',

              gridTemplateColumns:
                'repeat(3, 1fr)',

              gap:
                '12px',

              borderTop:
                '1px solid #edf0f5',

              paddingTop:
                '14px',
            }}
          >

            <MiniTotal
              label="Ingresos"
              value={
                totalIncome
              }
              color={
                INCOME_COLOR
              }
            />


            <MiniTotal
              label="Salidas"
              value={
                totalOutflows
              }
              color={
                OUTFLOW_COLOR
              }
            />


            <MiniTotal
              label="Disponible"
              value={
                remaining
              }
            />

          </div>

        </article>

      </section>


      {/* =================================================
          GRÁFICO DETALLADO
      ================================================= */}

      {detailType && (

        <article
          ref={
            detailChartRef
          }
          className="panel chart-panel"
          style={{
            marginBottom:
              '18px',
          }}
        >

          <div className="panel-heading">

            <div>

              <h3
                style={{
                  color:
                    detailType ===
                    'income'
                      ? INCOME_COLOR
                      : OUTFLOW_COLOR,
                }}
              >

                {detailType ===
                'income'
                  ? 'Detalle de ingresos por categoría'
                  : 'Detalle de salidas por categoría'}

              </h3>


              <p>
                Ordenado de menor
                a mayor según el
                monto acumulado
              </p>

            </div>


            <button
              type="button"
              className="icon-btn"
              title="Cerrar detalle"
              onClick={() =>
                setDetailType(
                  null
                )
              }
            >

              <X
                size={
                  17
                }
              />

            </button>

          </div>


          {detailData.length ? (

            <ResponsiveContainer
              width="100%"
              height={
                Math.max(
                  330,
                  detailData.length *
                    55
                )
              }
            >

              <BarChart
                data={
                  detailData
                }
                layout="vertical"
                margin={{
                  top: 10,
                  right: 70,
                  bottom: 10,
                  left: 40,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={
                    false
                  }
                />


                <XAxis
                  type="number"
                />


                <YAxis
                  type="category"
                  dataKey="category"
                  width={
                    130
                  }
                />


                <Tooltip
                  formatter={(
                    value
                  ) =>
                    currency(
                      value
                    )
                  }
                />


                <Bar
                  dataKey="amount"
                  fill={
                    detailType ===
                    'income'
                      ? INCOME_COLOR
                      : OUTFLOW_COLOR
                  }
                  radius={[
                    0,
                    8,
                    8,
                    0,
                  ]}
                  label={{
                    position:
                      'right',

                    formatter:
                      (
                        value
                      ) =>
                        currency(
                          value
                        ),
                  }}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (

            <Empty />

          )}

        </article>

      )}


      {/* =================================================
          MOVIMIENTOS
      ================================================= */}

      <article className="panel">

        {/* ===============================================
            ENCABEZADO
        =============================================== */}

        <div
          className="panel-heading"
          style={{
            padding:
              '18px 18px 0 18px',

            gap:
              '18px',

            flexWrap:
              'wrap',
          }}
        >

          <div>

            <h3>
              Últimos movimientos
            </h3>

            <p>
              Busca movimientos
              específicos u ordena
              haciendo clic sobre
              cualquier columna
            </p>

          </div>


          {/* =============================================
              BUSCADOR
          ============================================= */}

          <div
            style={{
              position:
                'relative',

              width:
                'min(360px, 100%)',
            }}
          >

            <Search
              size={
                17
              }
              style={{
                position:
                  'absolute',

                left:
                  '12px',

                top:
                  '50%',

                transform:
                  'translateY(-50%)',

                color:
                  '#94a3b8',

                pointerEvents:
                  'none',
              }}
            />


            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar movimiento..."
              style={{
                paddingLeft:
                  '39px',

                paddingRight:
                  search
                    ? '40px'
                    : '12px',
              }}
            />


            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch(
                    ''
                  )
                }
                style={{
                  position:
                    'absolute',

                  right:
                    '6px',

                  top:
                    '50%',

                  transform:
                    'translateY(-50%)',

                  border:
                    'none',

                  background:
                    'transparent',

                  display:
                    'grid',

                  placeItems:
                    'center',

                  color:
                    '#64748b',
                }}
              >

                <X
                  size={
                    16
                  }
                />

              </button>

            )}

          </div>

        </div>


        {/* ===============================================
            RESULTADOS BÚSQUEDA
        =============================================== */}

        <div
          style={{
            padding:
              '8px 18px 12px',

            display:
              'flex',

            justifyContent:
              'space-between',

            alignItems:
              'center',

            flexWrap:
              'wrap',

            gap:
              '10px',
          }}
        >

          <small>

            {search
              ? `${sortedTransactions.length} resultado(s) encontrado(s)`
              : `${sortedTransactions.length} movimiento(s)`}

          </small>


          <small>

            Orden actual:{' '}

            <strong>

              {sortColumnLabel(
                sortConfig.key
              )}

              {' '}

              {sortConfig.direction ===
              'asc'
                ? '↑ ASC'
                : '↓ DESC'}

            </strong>

          </small>

        </div>


        {/* ===============================================
            TABLA
        =============================================== */}

        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <SortableHeader
                  label="Fecha"
                  field="transaction_date"
                  sortConfig={
                    sortConfig
                  }
                  onSort={
                    handleSort
                  }
                />


                <SortableHeader
                  label="Descripción"
                  field="description"
                  sortConfig={
                    sortConfig
                  }
                  onSort={
                    handleSort
                  }
                />


                <SortableHeader
                  label="Categoría"
                  field="category"
                  sortConfig={
                    sortConfig
                  }
                  onSort={
                    handleSort
                  }
                />


                <SortableHeader
                  label="Tipo"
                  field="movement_type"
                  sortConfig={
                    sortConfig
                  }
                  onSort={
                    handleSort
                  }
                />


                <SortableHeader
                  label="Moneda"
                  field="currency"
                  sortConfig={
                    sortConfig
                  }
                  onSort={
                    handleSort
                  }
                />


                <SortableHeader
                  label="Monto HNL"
                  field="amount_hnl"
                  sortConfig={
                    sortConfig
                  }
                  onSort={
                    handleSort
                  }
                  right
                />

              </tr>

            </thead>


            <tbody>

              {paginatedTransactions.map(
                (
                  transaction
                ) => (

                  <tr
                    key={
                      transaction.id
                    }
                  >

                    <td>

                      {formatDate(
                        transaction.transaction_date
                      )}

                    </td>


                    <td>

                      <strong>
                        {
                          transaction.description
                        }
                      </strong>


                      {transaction.notes && (

                        <small className="table-note">

                          {
                            transaction.notes
                          }

                        </small>

                      )}

                    </td>


                    <td>

                      {
                        transaction.category ||
                        '-'
                      }

                    </td>


                    <td>

                      <span
                        className={`badge ${transaction.movement_type}`}
                      >

                        {typeLabel(
                          transaction.movement_type
                        )}

                      </span>

                    </td>


                    <td>

                      {
                        transaction.currency
                      }

                    </td>


                    <td className="right">

                      <strong>

                        {currency(
                          transaction.amount_hnl
                        )}

                      </strong>

                    </td>

                  </tr>

                )
              )}


              {!paginatedTransactions.length && (

                <tr>

                  <td
                    colSpan="6"
                  >

                    <div className="empty">

                      {search
                        ? 'No encontramos movimientos con esa búsqueda.'
                        : 'Todavía no hay movimientos para este mes.'}

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* ===============================================
            PAGINACIÓN
        =============================================== */}

        {sortedTransactions.length >
          PAGE_SIZE && (

          <div
            style={{
              display:
                'flex',

              justifyContent:
                'space-between',

              alignItems:
                'center',

              gap:
                '15px',

              padding:
                '14px 18px',

              borderTop:
                '1px solid #edf0f5',

              flexWrap:
                'wrap',
            }}
          >

            <small>

              Mostrando{' '}

              {
                startIndex +
                1
              }

              {' - '}

              {
                Math.min(
                  startIndex +
                    PAGE_SIZE,
                  sortedTransactions.length
                )
              }

              {' de '}

              {
                sortedTransactions.length
              }

            </small>


            <div
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '8px',
              }}
            >

              <button
                type="button"
                className="icon-btn"
                disabled={
                  safeCurrentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (
                      page
                    ) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >

                <ChevronLeft
                  size={
                    17
                  }
                />

              </button>


              {/* =========================================
                  BOTONES DE PÁGINA
              ========================================= */}

              {Array
                .from({
                  length:
                    totalPages,
                })
                .map(
                  (
                    _,
                    index
                  ) => {

                    const page =
                      index +
                      1


                    return (

                      <button
                        key={
                          page
                        }
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                        style={{
                          minWidth:
                            '34px',

                          height:
                            '34px',

                          borderRadius:
                            '8px',

                          border:
                            '1px solid #dbe2ea',

                          background:
                            page ===
                            safeCurrentPage
                              ? '#2563eb'
                              : '#ffffff',

                          color:
                            page ===
                            safeCurrentPage
                              ? '#ffffff'
                              : '#475569',

                          fontWeight:
                            '600',
                        }}
                      >

                        {
                          page
                        }

                      </button>

                    )
                  }
                )}


              <button
                type="button"
                className="icon-btn"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (
                      page
                    ) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >

                <ChevronRight
                  size={
                    17
                  }
                />

              </button>

            </div>

          </div>

        )}

      </article>

    </>
  )
}


// =====================================================
// ENCABEZADO ORDENABLE
// =====================================================

function SortableHeader({
  label,
  field,
  sortConfig,
  onSort,
  right = false,
}) {

  const active =
    sortConfig.key ===
    field


  return (

    <th
      className={
        right
          ? 'right'
          : ''
      }
    >

      <button
        type="button"
        onClick={() =>
          onSort(
            field
          )
        }
        style={{
          width:
            '100%',

          border:
            'none',

          background:
            'transparent',

          display:
            'flex',

          justifyContent:
            right
              ? 'flex-end'
              : 'flex-start',

          alignItems:
            'center',

          gap:
            '5px',

          padding:
            0,

          color:
            active
              ? '#2563eb'
              : '#657085',

          fontSize:
            '11px',

          textTransform:
            'uppercase',

          letterSpacing:
            '.03em',

          fontWeight:
            '700',
        }}
      >

        {label}


        {active ? (

          <span
            style={{
              fontSize:
                '13px',
            }}
          >

            {sortConfig.direction ===
            'asc'
              ? '↑'
              : '↓'}

          </span>

        ) : (

          <ArrowUpDown
            size={
              12
            }
          />

        )}

      </button>

    </th>

  )
}


// =====================================================
// TARJETA RESUMEN
// =====================================================

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}) {

  return (

    <article
      className={`stat-card ${
        highlight !==
          undefined &&
        highlight <
          0
          ? 'stat-negative'
          : ''
      }`}
    >

      <span className="stat-icon">

        <Icon
          size={
            20
          }
        />

      </span>


      <div>

        <p>
          {label}
        </p>

        <strong>
          {value}
        </strong>

      </div>

    </article>

  )
}


// =====================================================
// MINI TOTAL
// =====================================================

function MiniTotal({
  label,
  value,
  color,
}) {

  return (

    <div
      style={{
        textAlign:
          'center',
      }}
    >

      <small
        style={{
          display:
            'block',

          marginBottom:
            '4px',
        }}
      >

        {label}

      </small>


      <strong
        style={{
          color:
            color ||
            undefined,
        }}
      >

        {currency(
          value
        )}

      </strong>

    </div>

  )
}


// =====================================================
// VACÍO
// =====================================================

function Empty() {

  return (

    <div className="empty">

      Todavía no hay datos
      para este mes.

    </div>

  )
}


// =====================================================
// ETIQUETAS
// =====================================================

function typeLabel(
  type
) {

  return {

    income:
      'Ingreso',

    expense:
      'Gasto',

    saving:
      'Ahorro',

    family_project:
      'Proyecto familiar',

    cash_withdrawal:
      'Retiro de efectivo',

    fixed_payment:
      'Pago fijo',

    card_payment:
      'Pago a tarjeta',

  }[type] || type
}


// =====================================================
// FORMATO FECHA
// =====================================================

function formatDate(
  date
) {

  if (
    !date
  ) {

    return '-'
  }


  const [
    year,
    month,
    day,
  ] =
    date.split('-')


  return `${day}/${month}/${year}`
}


// =====================================================
// NOMBRE COLUMNA
// =====================================================

function sortColumnLabel(
  field
) {

  return {

    transaction_date:
      'Fecha',

    description:
      'Descripción',

    category:
      'Categoría',

    movement_type:
      'Tipo',

    currency:
      'Moneda',

    amount_hnl:
      'Monto HNL',

  }[field] ||
    field
}