import { useMemo, useState } from 'react'

import {
  Plus,
  Trash2,
  X,
  FileSpreadsheet,
  ArrowUpDown,
  Search,
} from 'lucide-react'

import * as XLSX from 'xlsx'

import { supabase } from '../lib/supabase'

import {
  currency,
  toHnl,
} from '../utils/money'


// ======================================================
// CATEGORÍAS SEGÚN TIPO DE MOVIMIENTO
// ======================================================

const categoriesByType = {

  income: [
    'Salario',
    'Bonificación',
    'Otros ingresos',
  ],

  expense: [
    'Aplicaciones',
    'Casa',
    'Cine',
    'Comida',
    'Compras',
    'Entretenimiento',
    'Farmacia',
    'Gasolina',
    'Otros',
    'Seguro',
    'Servicios',
    'Supermercado',
    'Transporte',
    'Viajes',
  ],

  saving: [
    'Ahorro general',
    'Fondo de emergencia',
    'Meta personal',
    'Inversión',
    'Viaje',
    'Vivienda',
    'Otros ahorros',
  ],

  family_project: [
    'Embarazo',
    'Matrimonio',
    'Bebé',
    'Hogar',
    'Salud familiar',
    'Preparativos',
    'Otros familiares',
  ],

  cash_withdrawal: [
    'Retiro efectivo',
    'Otros',
  ],

  fixed_payment: [
    'Casa',
    'Seguro',
    'Servicios',
    'Internet',
    'Suscripciones',
    'Otros',
  ],

  card_payment: [
    'Pago tarjeta',
  ],
}


// ======================================================
// FORMULARIO INICIAL
// ======================================================

const createEmptyForm = () => ({
  description: '',
  category: 'Comida',
  movement_type: 'expense',
  transaction_date:
    new Date()
      .toISOString()
      .slice(0, 10),
  currency: 'HNL',
  amount: '',
  exchange_rate: '1',
  card_id: '',
  notes: '',
})


// ======================================================
// COMPONENTE
// ======================================================

export default function Transactions({
  user,
  transactions,
  cards,
  reload,
}) {

  // ----------------------------------------------------
  // MODAL
  // ----------------------------------------------------

  const [open, setOpen] =
    useState(false)

  const [form, setForm] =
    useState(
      createEmptyForm()
    )

  const [saving, setSaving] =
    useState(false)


  // ----------------------------------------------------
  // FILTROS / ORDEN
  // ----------------------------------------------------

  const [search, setSearch] =
    useState('')

  const [typeFilter, setTypeFilter] =
    useState('all')

  const [sortDirection, setSortDirection] =
    useState('desc')


  // ====================================================
  // MAPA TARJETA
  // ====================================================

  const cardName =
    useMemo(
      () =>
        Object.fromEntries(
          cards.map(
            (card) => [
              card.id,
              card.name,
            ]
          )
        ),
      [cards]
    )


  // ====================================================
  // CATEGORÍAS ACTUALES
  // ====================================================

  const currentCategories =
    categoriesByType[
      form.movement_type
    ] || ['Otros']


  // ====================================================
  // CAMBIAR TIPO
  // ====================================================

  const handleMovementTypeChange = (
    e
  ) => {

    const movementType =
      e.target.value

    const categories =
      categoriesByType[
        movementType
      ] || ['Otros']

    setForm({
      ...form,

      movement_type:
        movementType,

      category:
        categories[0],

      // Un ingreso normalmente
      // no se relaciona con tarjeta.
      card_id:
        movementType ===
        'income'
          ? ''
          : form.card_id,
    })
  }


  // ====================================================
  // FILTRAR Y ORDENAR
  // ====================================================

  const filteredTransactions =
    useMemo(() => {

      let data = [
        ...transactions,
      ]

      // -----------------------------
      // FILTRO TIPO
      // -----------------------------

      if (
        typeFilter !==
        'all'
      ) {

        data =
          data.filter(
            (item) =>
              item.movement_type ===
              typeFilter
          )
      }


      // -----------------------------
      // BÚSQUEDA
      // -----------------------------

      const searchValue =
        search
          .trim()
          .toLowerCase()

      if (searchValue) {

        data =
          data.filter(
            (item) => {

              const description =
                (
                  item.description ||
                  ''
                )
                  .toLowerCase()

              const category =
                (
                  item.category ||
                  ''
                )
                  .toLowerCase()

              const notes =
                (
                  item.notes ||
                  ''
                )
                  .toLowerCase()

              const card =
                (
                  item.card_id
                    ? cardName[
                        item.card_id
                      ] || ''
                    : 'efectivo otro'
                )
                  .toLowerCase()

              const type =
                typeLabel(
                  item.movement_type
                )
                  .toLowerCase()

              return (
                description.includes(
                  searchValue
                ) ||
                category.includes(
                  searchValue
                ) ||
                notes.includes(
                  searchValue
                ) ||
                card.includes(
                  searchValue
                ) ||
                type.includes(
                  searchValue
                )
              )
            }
          )
      }


      // -----------------------------
      // ORDENAMIENTO POR FECHA
      // -----------------------------

      data.sort(
        (a, b) => {

          const dateA =
            new Date(
              `${a.transaction_date}T00:00:00`
            )

          const dateB =
            new Date(
              `${b.transaction_date}T00:00:00`
            )

          if (
            sortDirection ===
            'asc'
          ) {

            return (
              dateA -
              dateB
            )
          }

          return (
            dateB -
            dateA
          )
        }
      )

      return data

    }, [
      transactions,
      typeFilter,
      search,
      sortDirection,
      cardName,
    ])


  // ====================================================
  // TOTAL VISIBLE
  // ====================================================

  const totalVisible =
    useMemo(
      () =>
        filteredTransactions.reduce(
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
        ),
      [
        filteredTransactions,
      ]
    )


  // ====================================================
  // GUARDAR
  // ====================================================

  const save =
    async (e) => {

      e.preventDefault()

      setSaving(true)

      const amountHnl =
        toHnl(
          form.amount,
          form.currency,
          form.exchange_rate
        )

      const {
        error,
      } =
        await supabase
          .from(
            'transactions'
          )
          .insert({

            user_id:
              user.id,

            description:
              form.description
                .trim(),

            category:
              form.category,

            movement_type:
              form.movement_type,

            transaction_date:
              form.transaction_date,

            currency:
              form.currency,

            amount:
              Number(
                form.amount
              ),

            exchange_rate:
              form.currency ===
              'HNL'
                ? 1
                : Number(
                    form.exchange_rate
                  ),

            amount_hnl:
              amountHnl,

            card_id:
              form.card_id ||
              null,

            notes:
              form.notes ||
              null,
          })

      setSaving(false)

      if (error) {

        alert(
          error.message
        )

        return
      }

      setForm(
        createEmptyForm()
      )

      setOpen(false)

      reload()
    }


  // ====================================================
  // ELIMINAR
  // ====================================================

  const remove =
    async (id) => {

      if (
        !confirm(
          '¿Eliminar este movimiento?'
        )
      ) {
        return
      }

      const {
        error,
      } =
        await supabase
          .from(
            'transactions'
          )
          .delete()
          .eq(
            'id',
            id
          )

      if (error) {

        alert(
          error.message
        )

        return
      }

      reload()
    }


  // ====================================================
  // EXPORTAR EXCEL
  // ====================================================

  const exportExcel = () => {

    if (
      !filteredTransactions.length
    ) {

      alert(
        'No hay movimientos para exportar.'
      )

      return
    }


    // --------------------------------------------------
    // PREPARAR DATA PARA EXCEL
    // --------------------------------------------------

    const excelData =
      filteredTransactions.map(
        (item) => ({

          Fecha:
            item.transaction_date,

          Descripción:
            item.description,

          Categoría:
            item.category ||
            '',

          Tipo:
            typeLabel(
              item.movement_type
            ),

          Tarjeta:
            item.card_id
              ? cardName[
                  item.card_id
                ] || ''
              : 'Efectivo / Otro',

          Moneda:
            item.currency,

          'Monto original':
            Number(
              item.amount ||
              0
            ),

          'Tipo de cambio':
            Number(
              item.exchange_rate ||
              1
            ),

          'Monto HNL':
            Number(
              item.amount_hnl ||
              0
            ),

          Nota:
            item.notes ||
            '',
        })
      )


    // --------------------------------------------------
    // HOJA MOVIMIENTOS
    // --------------------------------------------------

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      )


    // --------------------------------------------------
    // ANCHO DE COLUMNAS
    // --------------------------------------------------

    worksheet['!cols'] = [

      {
        wch: 13,
      },

      {
        wch: 30,
      },

      {
        wch: 22,
      },

      {
        wch: 22,
      },

      {
        wch: 22,
      },

      {
        wch: 10,
      },

      {
        wch: 16,
      },

      {
        wch: 16,
      },

      {
        wch: 16,
      },

      {
        wch: 35,
      },
    ]


    // --------------------------------------------------
    // HOJA RESUMEN
    // --------------------------------------------------

    const summaryData = [

      {
        Concepto:
          'Cantidad de movimientos',

        Valor:
          filteredTransactions.length,
      },

      {
        Concepto:
          'Total visible HNL',

        Valor:
          totalVisible,
      },

      {
        Concepto:
          'Fecha de exportación',

        Valor:
          new Date()
            .toLocaleString(
              'es-HN'
            ),
      },
    ]

    const summarySheet =
      XLSX.utils.json_to_sheet(
        summaryData
      )

    summarySheet[
      '!cols'
    ] = [
      {
        wch: 30,
      },
      {
        wch: 25,
      },
    ]


    // --------------------------------------------------
    // CREAR LIBRO
    // --------------------------------------------------

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Movimientos'
    )

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      'Resumen'
    )


    // --------------------------------------------------
    // NOMBRE ARCHIVO
    // --------------------------------------------------

    const today =
      new Date()
        .toISOString()
        .slice(0, 10)

    XLSX.writeFile(
      workbook,
      `Movimientos_Finanzas_${today}.xlsx`
    )
  }


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div className="page-actions">

        <div>

          <h2>
            Movimientos del mes
          </h2>

          <p>
            Consulta, ordena,
            filtra y exporta tus
            movimientos financieros.
          </p>

        </div>


        <div
          style={{
            display:
              'flex',

            gap:
              '10px',

            flexWrap:
              'wrap',
          }}
        >

          <button
            className="btn secondary"
            onClick={
              exportExcel
            }
          >

            <FileSpreadsheet
              size={
                17
              }
            />

            Exportar Excel

          </button>


          <button
            className="btn primary"
            onClick={() =>
              setOpen(true)
            }
          >

            <Plus
              size={
                17
              }
            />

            Nuevo movimiento

          </button>

        </div>

      </div>


      {/* =================================================
          FILTROS
      ================================================= */}

      <article
        className="panel"
        style={{
          marginBottom:
            '18px',

          padding:
            '18px',
        }}
      >

        <div
          style={{
            display:
              'grid',

            gridTemplateColumns:
              'minmax(250px, 1fr) 220px 210px',

            gap:
              '12px',

            alignItems:
              'end',
          }}
          className="transactions-filters"
        >


          {/* ---------------------------------------------
              BUSCADOR
          --------------------------------------------- */}

          <label>

            Buscar

            <div
              style={{
                position:
                  'relative',
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
                    '11px',

                  top:
                    '50%',

                  transform:
                    'translateY(-50%)',

                  color:
                    '#94a3b8',
                }}
              />

              <input
                value={
                  search
                }
                onChange={(
                  e
                ) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Descripción, categoría, tarjeta..."
                style={{
                  paddingLeft:
                    '38px',
                }}
              />

            </div>

          </label>


          {/* ---------------------------------------------
              FILTRO TIPO
          --------------------------------------------- */}

          <label>

            Tipo de movimiento

            <select
              value={
                typeFilter
              }
              onChange={(
                e
              ) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                Todos
              </option>

              <option value="income">
                Ingresos
              </option>

              <option value="expense">
                Gastos
              </option>

              <option value="saving">
                Ahorros
              </option>

              <option value="family_project">
                Proyecto familiar
              </option>

              <option value="cash_withdrawal">
                Retiros
              </option>

              <option value="fixed_payment">
                Pagos fijos
              </option>

              <option value="card_payment">
                Pagos a tarjeta
              </option>

            </select>

          </label>


          {/* ---------------------------------------------
              ORDEN FECHA
          --------------------------------------------- */}

          <label>

            Ordenar fecha

            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                setSortDirection(
                  sortDirection ===
                    'desc'
                    ? 'asc'
                    : 'desc'
                )
              }
              style={{
                width:
                  '100%',
              }}
            >

              <ArrowUpDown
                size={
                  16
                }
              />

              {sortDirection ===
              'desc'
                ? 'Más reciente primero'
                : 'Más antigua primero'}

            </button>

          </label>

        </div>


        {/* -----------------------------------------------
            RESUMEN FILTROS
        ----------------------------------------------- */}

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

            marginTop:
              '16px',

            paddingTop:
              '14px',

            borderTop:
              '1px solid #edf0f5',

            flexWrap:
              'wrap',
          }}
        >

          <small>

            Mostrando{' '}

            <strong>
              {
                filteredTransactions.length
              }
            </strong>

            {' '}de{' '}

            <strong>
              {
                transactions.length
              }
            </strong>

            {' '}movimientos

          </small>


          <div>

            <small>
              Total visible:{' '}
            </small>

            <strong>
              {currency(
                totalVisible
              )}
            </strong>

          </div>

        </div>

      </article>


      {/* =================================================
          TABLA
      ================================================= */}

      <article className="panel">

        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Fecha
                </th>

                <th>
                  Descripción
                </th>

                <th>
                  Categoría
                </th>

                <th>
                  Tarjeta
                </th>

                <th>
                  Tipo
                </th>

                <th>
                  Original
                </th>

                <th className="right">
                  HNL
                </th>

                <th>
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredTransactions.map(
                (transaction) => (

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

                      {transaction.card_id
                        ? cardName[
                            transaction.card_id
                          ] ||
                          '-'
                        : 'Efectivo / Otro'}

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

                      {currency(
                        transaction.amount,
                        transaction.currency
                      )}

                    </td>


                    <td className="right">

                      <strong>

                        {currency(
                          transaction.amount_hnl
                        )}

                      </strong>

                    </td>


                    <td className="right">

                      <button
                        className="icon-btn danger"
                        onClick={() =>
                          remove(
                            transaction.id
                          )
                        }
                        title="Eliminar movimiento"
                      >

                        <Trash2
                          size={
                            16
                          }
                        />

                      </button>

                    </td>

                  </tr>

                )
              )}


              {!filteredTransactions.length && (

                <tr>

                  <td
                    colSpan="8"
                  >

                    <div className="empty">

                      No hay movimientos
                      que coincidan con
                      los filtros.

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </article>


      {/* =================================================
          MODAL NUEVO MOVIMIENTO
      ================================================= */}

      {open && (

        <div
          className="modal-backdrop"
          onMouseDown={() =>
            setOpen(false)
          }
        >

          <section
            className="modal"
            onMouseDown={(
              e
            ) =>
              e.stopPropagation()
            }
          >

            <div className="modal-heading">

              <div>

                <h2>
                  Nuevo movimiento
                </h2>

                <p>
                  Todos los montos
                  también se convierten
                  a Lempiras para el
                  resumen.
                </p>

              </div>


              <button
                type="button"
                className="icon-btn"
                onClick={() =>
                  setOpen(false)
                }
              >

                <X
                  size={
                    19
                  }
                />

              </button>

            </div>


            <form
              className="form-grid"
              onSubmit={
                save
              }
            >


              {/* -----------------------------------------
                  DESCRIPCIÓN
              ----------------------------------------- */}

              <label className="span-2">

                Descripción

                <input
                  required
                  value={
                    form.description
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,

                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Ej. Almuerzo, ahorro, embarazo, internet..."
                />

              </label>


              {/* -----------------------------------------
                  TIPO
              ----------------------------------------- */}

              <label>

                Tipo

                <select
                  value={
                    form.movement_type
                  }
                  onChange={
                    handleMovementTypeChange
                  }
                >

                  <option value="income">
                    Ingreso
                  </option>

                  <option value="expense">
                    Gasto
                  </option>

                  <option value="saving">
                    Ahorro
                  </option>

                  <option value="family_project">
                    Proyecto familiar
                  </option>

                  <option value="cash_withdrawal">
                    Retiro de efectivo
                  </option>

                  <option value="fixed_payment">
                    Pago fijo
                  </option>

                  <option value="card_payment">
                    Pago a tarjeta
                  </option>

                </select>

              </label>


              {/* -----------------------------------------
                  CATEGORÍA
              ----------------------------------------- */}

              <label>

                Categoría

                <select
                  value={
                    form.category
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,

                      category:
                        e.target.value,
                    })
                  }
                >

                  {currentCategories.map(
                    (
                      category
                    ) => (

                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >

                        {
                          category
                        }

                      </option>

                    )
                  )}

                </select>

              </label>


              {/* -----------------------------------------
                  FECHA
              ----------------------------------------- */}

              <label>

                Fecha

                <input
                  type="date"
                  required
                  value={
                    form.transaction_date
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,

                      transaction_date:
                        e.target.value,
                    })
                  }
                />

              </label>


              {/* -----------------------------------------
                  TARJETA
              ----------------------------------------- */}

              <label>

                Tarjeta

                <select
                  value={
                    form.card_id
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,

                      card_id:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    Efectivo / sin tarjeta
                  </option>

                  {cards.map(
                    (
                      card
                    ) => (

                      <option
                        value={
                          card.id
                        }
                        key={
                          card.id
                        }
                      >

                        {
                          card.name
                        }

                      </option>

                    )
                  )}

                </select>

              </label>


              {/* -----------------------------------------
                  MONEDA
              ----------------------------------------- */}

              <label>

                Moneda

                <select
                  value={
                    form.currency
                  }
                  onChange={(
                    e
                  ) => {

                    const curr =
                      e.target.value

                    setForm({
                      ...form,

                      currency:
                        curr,

                      exchange_rate:
                        curr ===
                        'HNL'
                          ? '1'
                          : form.exchange_rate,
                    })
                  }}
                >

                  <option value="HNL">
                    Lempiras (HNL)
                  </option>

                  <option value="USD">
                    Dólares (USD)
                  </option>

                </select>

              </label>


              {/* -----------------------------------------
                  MONTO
              ----------------------------------------- */}

              <label>

                Monto

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={
                    form.amount
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,

                      amount:
                        e.target.value,
                    })
                  }
                />

              </label>


              {/* -----------------------------------------
                  TIPO CAMBIO
              ----------------------------------------- */}

              {form.currency ===
                'USD' && (

                <label>

                  Tipo de cambio

                  <input
                    type="number"
                    step="0.0001"
                    min="1"
                    required
                    value={
                      form.exchange_rate
                    }
                    onChange={(
                      e
                    ) =>
                      setForm({
                        ...form,

                        exchange_rate:
                          e.target.value,
                      })
                    }
                    placeholder="Ej. 26.25"
                  />

                </label>

              )}


              {/* -----------------------------------------
                  NOTA
              ----------------------------------------- */}

              <label className="span-2">

                Nota

                <textarea
                  rows="3"
                  value={
                    form.notes
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,

                      notes:
                        e.target.value,
                    })
                  }
                  placeholder="Opcional"
                />

              </label>


              {/* -----------------------------------------
                  BOTONES
              ----------------------------------------- */}

              <div className="modal-actions span-2">

                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    setOpen(false)
                  }
                >

                  Cancelar

                </button>


                <button
                  className="btn primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? 'Guardando...'
                    : 'Guardar'}

                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </>
  )
}


// ======================================================
// ETIQUETAS TIPOS
// ======================================================

function typeLabel(type) {

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


// ======================================================
// FORMATO FECHA
// ======================================================

function formatDate(
  date
) {

  if (!date) {
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