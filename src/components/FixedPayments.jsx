import { useState } from 'react'
import { Plus, Play, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { currency, toHnl } from '../utils/money'

const empty = {
  name: '',
  category: 'Servicios',
  amount: '',
  currency: 'HNL',
  exchange_rate: '1',
  due_day: '1',
  card_id: '',
}

export default function FixedPayments({ user, fixedPayments, cards, month, reloadAll }) {
  const [form, setForm] = useState(empty)
  const [show, setShow] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('fixed_payments').insert({
      user_id: user.id,
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency,
      exchange_rate: form.currency === 'HNL' ? 1 : Number(form.exchange_rate),
      due_day: Number(form.due_day),
      card_id: form.card_id || null,
      active: true,
    })
    if (error) return alert(error.message)
    setForm(empty)
    setShow(false)
    reloadAll()
  }

  const generate = async (payment) => {
    const day = String(Math.min(payment.due_day, 28)).padStart(2, '0')
    const date = `${month}-${day}`

    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('fixed_payment_id', payment.id)
      .gte('transaction_date', `${month}-01`)
      .lte('transaction_date', `${month}-31`)
      .limit(1)

    if (existing?.length) {
      return alert('Este pago fijo ya fue generado para el mes seleccionado.')
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      description: payment.name,
      category: payment.category,
      movement_type: 'fixed_payment',
      transaction_date: date,
      currency: payment.currency,
      amount: Number(payment.amount),
      exchange_rate: Number(payment.exchange_rate || 1),
      amount_hnl: toHnl(payment.amount, payment.currency, payment.exchange_rate),
      card_id: payment.card_id || null,
      fixed_payment_id: payment.id,
    })

    if (error) return alert(error.message)
    reloadAll()
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar este pago fijo?')) return
    const { error } = await supabase.from('fixed_payments').delete().eq('id', id)
    if (error) return alert(error.message)
    reloadAll()
  }

  return (
    <>
      <div className="page-actions">
        <div>
          <h2>Pagos fijos mensuales</h2>
          <p>Guarda una plantilla y genera el movimiento cada mes con un clic.</p>
        </div>
        <button className="btn primary" onClick={() => setShow(!show)}>
          <Plus size={17} /> Nuevo pago fijo
        </button>
      </div>

      {show && (
        <article className="panel form-panel">
          <form className="form-grid" onSubmit={save}>
            <label>
              Nombre
              <input required value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} placeholder="Ej. Internet" />
            </label>
            <label>
              Categoría
              <select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}>
                <option>Servicios</option>
                <option>Casa</option>
                <option>Seguro</option>
                <option>Aplicaciones</option>
                <option>Otros</option>
              </select>
            </label>
            <label>
              Monto
              <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({...form, amount:e.target.value})} />
            </label>
            <label>
              Moneda
              <select value={form.currency} onChange={(e) => setForm({...form, currency:e.target.value, exchange_rate:e.target.value === 'HNL' ? '1' : form.exchange_rate})}>
                <option value="HNL">HNL</option>
                <option value="USD">USD</option>
              </select>
            </label>
            {form.currency === 'USD' && (
              <label>
                Tipo de cambio
                <input type="number" min="1" step="0.0001" required value={form.exchange_rate} onChange={(e) => setForm({...form, exchange_rate:e.target.value})} />
              </label>
            )}
            <label>
              Día de vencimiento
              <input type="number" min="1" max="28" required value={form.due_day} onChange={(e) => setForm({...form, due_day:e.target.value})} />
            </label>
            <label>
              Tarjeta / forma
              <select value={form.card_id} onChange={(e) => setForm({...form, card_id:e.target.value})}>
                <option value="">Efectivo / otro</option>
                {cards.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div className="form-actions">
              <button className="btn primary">Guardar plantilla</button>
            </div>
          </form>
        </article>
      )}

      <article className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pago</th>
                <th>Categoría</th>
                <th>Día</th>
                <th>Monto</th>
                <th>Moneda</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fixedPayments.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td>{p.due_day}</td>
                  <td>{currency(p.amount, p.currency)}</td>
                  <td>{p.currency}</td>
                  <td className="right actions-inline">
                    <button className="btn small secondary" onClick={() => generate(p)}>
                      <Play size={15} /> Generar en {month}
                    </button>
                    <button className="icon-btn danger" onClick={() => remove(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!fixedPayments.length && (
                <tr><td colSpan="6"><div className="empty">No tienes pagos fijos configurados.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </>
  )
}
