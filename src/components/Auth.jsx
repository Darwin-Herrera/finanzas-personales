import { useState } from 'react'

import {
  WalletCards,
  Mail,
  LockKeyhole,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'

import { supabase } from '../lib/supabase'


export default function Auth() {

  const [mode, setMode] =
    useState('login')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [messageType, setMessageType] =
    useState('info')


  // ==================================================
  // LOGIN / REGISTRO
  // ==================================================

  const submit = async (e) => {

    e.preventDefault()

    setLoading(true)
    setMessage('')
    setMessageType('info')


    // ------------------------------------------------
    // LOGIN
    // ------------------------------------------------

    if (mode === 'login') {

      const { error } =
        await supabase.auth
          .signInWithPassword({
            email,
            password,
          })


      setLoading(false)


      if (error) {

        setMessage(
          'Correo o contraseña incorrectos.'
        )

        setMessageType(
          'error'
        )

        return
      }


      return
    }


    // ------------------------------------------------
    // REGISTRO
    // ------------------------------------------------

    if (mode === 'register') {

      if (
        password.length < 8
      ) {

        setLoading(false)

        setMessage(
          'La contraseña debe tener al menos 8 caracteres.'
        )

        setMessageType(
          'error'
        )

        return
      }


      const { error } =
        await supabase.auth
          .signUp({
            email,
            password,
          })


      setLoading(false)


      if (error) {

        setMessage(
          error.message
        )

        setMessageType(
          'error'
        )

        return
      }


      setMessage(
        'Cuenta creada correctamente. Revisa tu correo si Supabase solicita confirmación.'
      )

      setMessageType(
        'success'
      )

      return
    }

  }


  // ==================================================
  // RECUPERAR CONTRASEÑA
  // ==================================================

  const recoverPassword =
    async (e) => {

      e.preventDefault()


      if (!email) {

        setMessage(
          'Ingresa tu correo electrónico.'
        )

        setMessageType(
          'error'
        )

        return
      }


      setLoading(true)
      setMessage('')


      const redirectTo =
        `${window.location.origin}${import.meta.env.BASE_URL}`


      const { error } =
        await supabase.auth
          .resetPasswordForEmail(
            email,
            {
              redirectTo,
            }
          )


      setLoading(false)


      if (error) {

        setMessage(
          error.message
        )

        setMessageType(
          'error'
        )

        return
      }


      setMessage(
        'Te enviamos un enlace para recuperar tu contraseña. Revisa tu correo.'
      )

      setMessageType(
        'success'
      )

    }


  // ==================================================
  // RECUPERACIÓN
  // ==================================================

  if (mode === 'forgot') {

    return (

      <main className="auth-pro-page">

        <section className="auth-pro-shell">

          <VisualPanel />

          <div className="auth-pro-form-side">

            <div className="auth-pro-form-card">

              <button
                type="button"
                className="auth-back-btn"
                onClick={() => {

                  setMode('login')
                  setMessage('')

                }}
              >

                <ArrowLeft size={16} />

                Volver

              </button>


              <div className="auth-mobile-brand">

                <Brand />

              </div>


              <div className="auth-form-heading">

                <span className="auth-kicker">
                  SEGURIDAD DE CUENTA
                </span>

                <h1>
                  Recuperar contraseña
                </h1>

                <p>
                  Ingresa el correo asociado a tu cuenta
                  y te enviaremos un enlace seguro.
                </p>

              </div>


              <form
                className="auth-form-stack"
                onSubmit={recoverPassword}
              >

                <label className="auth-field">

                  <span>
                    Correo electrónico
                  </span>

                  <div className="auth-input-wrap">

                    <Mail
                      size={18}
                      className="auth-input-icon"
                    />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="correo@ejemplo.com"
                    />

                  </div>

                </label>


                {message && (

                  <AuthMessage
                    type={messageType}
                  >
                    {message}
                  </AuthMessage>

                )}


                <button
                  className="auth-main-btn"
                  disabled={loading}
                >

                  {loading
                    ? 'Enviando...'
                    : 'Enviar enlace de recuperación'}

                </button>

              </form>

            </div>

          </div>

        </section>

      </main>

    )

  }


  // ==================================================
  // LOGIN / REGISTRO
  // ==================================================

  return (

    <main className="auth-pro-page">

      <section className="auth-pro-shell">

        {/* =============================================
            PANEL IZQUIERDO
        ============================================= */}

        <VisualPanel />


        {/* =============================================
            FORMULARIO
        ============================================= */}

        <div className="auth-pro-form-side">

          <div className="auth-pro-form-card">

            <div className="auth-mobile-brand">

              <Brand />

            </div>


            <div className="auth-form-heading">

              <span className="auth-kicker">

                {mode === 'login'
                  ? 'BIENVENIDO DE NUEVO'
                  : 'COMIENZA AHORA'}

              </span>


              <h1>

                {mode === 'login'
                  ? 'Inicia sesión'
                  : 'Crea tu cuenta'}

              </h1>


              <p>

                {mode === 'login'
                  ? 'Accede a tu panel financiero y continúa gestionando tu dinero.'
                  : 'Crea una cuenta y empieza a organizar tus finanzas personales.'}

              </p>

            </div>


            <form
              className="auth-form-stack"
              onSubmit={submit}
            >

              {/* ========================================
                  CORREO
              ======================================== */}

              <label className="auth-field">

                <span>
                  Correo electrónico
                </span>

                <div className="auth-input-wrap">

                  <Mail
                    size={18}
                    className="auth-input-icon"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="correo@ejemplo.com"
                  />

                </div>

              </label>


              {/* ========================================
                  PASSWORD
              ======================================== */}

              <label className="auth-field">

                <div className="auth-label-row">

                  <span>
                    Contraseña
                  </span>

                  {mode === 'login' && (

                    <button
                      type="button"
                      className="auth-forgot"
                      onClick={() => {

                        setMode('forgot')
                        setMessage('')

                      }}
                    >
                      ¿La olvidaste?
                    </button>

                  )}

                </div>


                <div className="auth-input-wrap">

                  <LockKeyhole
                    size={18}
                    className="auth-input-icon"
                  />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    minLength={
                      mode === 'register'
                        ? 8
                        : 6
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder={
                      mode === 'register'
                        ? 'Mínimo 8 caracteres'
                        : 'Ingresa tu contraseña'
                    }
                  />


                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >

                    {showPassword
                      ? (
                        <EyeOff size={18} />
                      )
                      : (
                        <Eye size={18} />
                      )}

                  </button>

                </div>

              </label>


              {/* ========================================
                  MENSAJE
              ======================================== */}

              {message && (

                <AuthMessage
                  type={messageType}
                >
                  {message}
                </AuthMessage>

              )}


              {/* ========================================
                  BOTÓN PRINCIPAL
              ======================================== */}

              <button
                className="auth-main-btn"
                disabled={loading}
              >

                {loading
                  ? 'Procesando...'
                  : mode === 'login'
                    ? 'Entrar a mi cuenta'
                    : 'Crear mi cuenta'}

              </button>

            </form>


            {/* ==========================================
                CAMBIO LOGIN / REGISTER
            ========================================== */}

            <div className="auth-switch">

              <span>

                {mode === 'login'
                  ? '¿Todavía no tienes una cuenta?'
                  : '¿Ya tienes una cuenta?'}

              </span>


              <button
                type="button"
                onClick={() => {

                  setMode(
                    mode === 'login'
                      ? 'register'
                      : 'login'
                  )

                  setMessage('')
                  setPassword('')

                }}
              >

                {mode === 'login'
                  ? 'Crear cuenta'
                  : 'Iniciar sesión'}

              </button>

            </div>


            {/* ==========================================
                SEGURIDAD
            ========================================== */}

            <div className="auth-security">

              <ShieldCheck size={16} />

              <span>
                Protegido con autenticación segura
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>

  )

}


// ==================================================
// PANEL VISUAL
// ==================================================

function VisualPanel() {

  return (

    <aside className="auth-visual">

      <div className="auth-visual-glow auth-glow-one"></div>

      <div className="auth-visual-glow auth-glow-two"></div>


      <div className="auth-visual-content">

        <Brand />


        <div className="auth-visual-copy">

          <span className="auth-visual-chip">

            <Sparkles size={15} />

            Finanzas bajo control

          </span>


          <h2>

            Organiza hoy.
            <br />

            <span>
              Decide mejor mañana.
            </span>

          </h2>


          <p>
            Lleva el control de ingresos, gastos,
            ahorros y compromisos desde un solo lugar.
          </p>

        </div>


        <div className="auth-preview-card">

          <div className="auth-preview-top">

            <div>

              <small>
                Disponible del mes
              </small>

              <strong>
                L 14,807.74
              </strong>

            </div>


            <div className="auth-preview-icon">

              <WalletCards size={22} />

            </div>

          </div>


          <div className="auth-preview-line">

            <span>
              <TrendingUp size={16} />
              Ingresos
            </span>

            <strong>
              L 38,600.00
            </strong>

          </div>


          <div className="auth-preview-line">

            <span>
              <PieChart size={16} />
              Salidas
            </span>

            <strong>
              L 23,792.26
            </strong>

          </div>


          <div className="auth-preview-progress">

            <div
              className="auth-preview-progress-value"
            ></div>

          </div>

        </div>


        <div className="auth-visual-footer">

          <ShieldCheck size={16} />

          <span>
            Tus datos están protegidos y separados por usuario.
          </span>

        </div>

      </div>

    </aside>

  )

}


// ==================================================
// BRAND
// ==================================================

function Brand() {

  return (

    <div className="auth-pro-brand">

      <span className="auth-pro-brand-icon">

        <WalletCards size={24} />

      </span>


      <div>

        <strong>
          Mis Finanzas
        </strong>

        <small>
          Finanzas personales inteligentes
        </small>

      </div>

    </div>

  )

}


// ==================================================
// MENSAJES
// ==================================================

function AuthMessage({
  children,
  type,
}) {

  return (

    <div
      className={`auth-message auth-message-${type}`}
    >

      {children}

    </div>

  )

}