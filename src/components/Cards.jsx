import { useState } from 'react'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { currency } from '../utils/money'

const empty = {
  name: '',
  bank: '',
  last4: '',
  credit_limit: '',
  currency: 'HNL',
  closing_day: '',
  payment_day: '',
}

export default function Cards({ user, cards, reload }) {
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('cards').insert({
      user_id: user.id,
      name: form.name.trim(),
      bank: form.bank.trim() || null,
      last4: form.last4.trim() || null,
      credit_limit: form.credit_limit ? Number(form.credit_limit) : null,
      currency: form.currency,
      closing_day: form.closing_day ? Number(form.closing_day) : null,
      payment_day: form.payment_day ? Number(form.payment_day) : null,
    })
    if (error) return alert(error.message)
    setForm(empty)
    setShowForm(false)
    reload()
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta tarjeta? Los movimientos existentes conservarán su historial, pero quedarán sin tarjeta.')) return
    const { error } = await supabase.from('cards').delete().eq('id', id)
    if (error) return alert(error.message)
    reload()
  }

  return (
    <>
      <div className="page-actions">
        <div>
          <h2>Mis tarjetas</h2>
          <p>Configura corte, pago y límite para cada tarjeta.</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={17} /> Agregar tarjeta
        </button>
      </div>

      {showForm && (
        <article className="panel form-panel">
          <form className="form-grid" onSubmit={save}>
            <label>
              Nombre
              <input required value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} placeholder="Ej. BAC América" />
            </label>
            <label>
              Banco
              <input value={form.bank} onChange={(e) => setForm({...form, bank:e.target.value})} placeholder="BAC, Ficohsa..." />
            </label>
            <label>
              Últimos 4 dígitos
              <input maxLength="4" value={form.last4} onChange={(e) => setForm({...form, last4:e.target.value.replace(/\D/g,'')})} placeholder="1234" />
            </label>
            <label>
              Moneda principal
              <select value={form.currency} onChange={(e) => setForm({...form, currency:e.target.value})}>
                <option value="HNL">HNL</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <label>
              Límite
              <input type="number" step="0.01" value={form.credit_limit} onChange={(e) => setForm({...form, credit_limit:e.target.value})} />
            </label>
            <label>
              Día de corte
              <input type="number" min="1" max="31" value={form.closing_day} onChange={(e) => setForm({...form, closing_day:e.target.value})} placeholder="18" />
            </label>
            <label>
              Día de pago
              <input type="number" min="1" max="31" value={form.payment_day} onChange={(e) => setForm({...form, payment_day:e.target.value})} placeholder="8" />
            </label>
            <div className="form-actions">
              <button className="btn primary">Guardar tarjeta</button>
            </div>
          </form>
        </article>
      )}

      <section className="card-grid">
        {cards.map((c) => (
          <article className="credit-card-ui" key={c.id}>
            <div className="credit-card-top">
              <span className="cc-icon"><CreditCard size={21} /></span>
              <button className="icon-btn light" onClick={() => remove(c.id)}><Trash2 size={16} /></button>
            </div>
            <div>
              <small>{c.bank || 'Tarjeta'}</small>
              <h3>{c.name}</h3>
              <p>{c.last4 ? `•••• ${c.last4}` : 'Sin terminación registrada'}</p>
            </div>
            <div className="credit-card-meta">
              <span><small>Corte</small><strong>Día {c.closing_day || '-'}</strong></span>
              <span><small>Pago</small><strong>Día {c.payment_day || '-'}</strong></span>
              <span><small>Límite</small><strong>{c.credit_limit ? currency(c.credit_limit, c.currency) : '-'}</strong></span>
            </div>
          </article>
        ))}
        {!cards.length && <div className="empty panel">Agrega tu primera tarjeta para comenzar.</div>}
      </section>
    </>
  )
}
