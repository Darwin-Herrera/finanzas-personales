import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { WalletCards } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const action =
      mode === 'login'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

    const { error } = await action
    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (mode === 'register') {
      setMessage('Cuenta creada. Revisa tu correo si Supabase solicita confirmación.')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-icon"><WalletCards size={24} /></span>
          <div>
            <h1>Mis Finanzas</h1>
            <p>Control mensual personal</p>
          </div>
        </div>

        <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
        <p className="muted">
          Tus movimientos se guardan en tu cuenta de Supabase.
        </p>

        <form onSubmit={submit} className="form-stack">
          <label>
            Correo
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          {message && <div className="notice">{message}</div>}

          <button className="btn primary" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <button
          className="btn link"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setMessage('')
          }}
        >
          {mode === 'login'
            ? '¿No tienes cuenta? Crear una'
            : 'Ya tengo cuenta'}
        </button>
      </section>
    </main>
  )
}
