import { useState } from 'react'

import {
  WalletCards,
  Mail,
  LockKeyhole,
  ArrowLeft,
} from 'lucide-react'

import { supabase } from '../lib/supabase'


export default function Auth() {

  const [mode, setMode] =
    useState('login')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

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

      const {
        error,
      } =
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
        password.length <
        8
      ) {

        setLoading(
          false
        )

        setMessage(
          'La contraseña debe tener al menos 8 caracteres.'
        )

        setMessageType(
          'error'
        )

        return
      }


      const {
        error,
      } =
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


      const {
        error,
      } =
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
  // PANTALLA RECUPERACIÓN
  // ==================================================

  if (
    mode ===
    'forgot'
  ) {

    return (

      <main className="auth-page">

        <section className="auth-card">

          <div className="brand auth-brand">

            <span className="brand-icon">

              <WalletCards
                size={24}
              />

            </span>


            <div>

              <h1>
                Mis Finanzas
              </h1>

              <p>
                Control mensual personal
              </p>

            </div>

          </div>


          <button
            type="button"
            className="btn link"
            onClick={() => {

              setMode(
                'login'
              )

              setMessage(
                ''
              )

            }}
            style={{
              marginBottom:
                '14px',
            }}
          >

            <ArrowLeft
              size={16}
            />

            Volver al inicio

          </button>


          <h2>
            Recuperar contraseña
          </h2>


          <p className="muted">

            Ingresa el correo
            asociado a tu cuenta.

          </p>


          <form
            onSubmit={
              recoverPassword
            }
            className="form-stack"
          >

            <label>

              Correo

              <div
                style={{
                  position:
                    'relative',
                }}
              >

                <Mail
                  size={17}
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
                  type="email"
                  required
                  value={
                    email
                  }
                  onChange={(
                    e
                  ) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="correo@ejemplo.com"
                  style={{
                    paddingLeft:
                      '38px',
                  }}
                />

              </div>

            </label>


            {message && (

              <Message
                type={
                  messageType
                }
              >

                {message}

              </Message>

            )}


            <button
              className="btn primary"
              disabled={
                loading
              }
            >

              {loading
                ? 'Enviando...'
                : 'Enviar enlace de recuperación'}

            </button>

          </form>

        </section>

      </main>

    )

  }


  // ==================================================
  // LOGIN / REGISTRO
  // ==================================================

  return (

    <main className="auth-page">

      <section className="auth-card">

        <div className="brand auth-brand">

          <span className="brand-icon">

            <WalletCards
              size={24}
            />

          </span>


          <div>

            <h1>
              Mis Finanzas
            </h1>

            <p>
              Control mensual personal
            </p>

          </div>

        </div>


        <h2>

          {mode ===
          'login'
            ? 'Iniciar sesión'
            : 'Crear cuenta'}

        </h2>


        <p className="muted">

          Tus movimientos se
          guardan de forma segura
          en tu cuenta.

        </p>


        <form
          onSubmit={
            submit
          }
          className="form-stack"
        >

          <label>

            Correo

            <input
              type="email"
              required
              value={
                email
              }
              onChange={(
                e
              ) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="correo@ejemplo.com"
            />

          </label>


          <label>

            Contraseña

            <input
              type="password"
              required
              minLength={
                mode ===
                'register'
                  ? 8
                  : 6
              }
              value={
                password
              }
              onChange={(
                e
              ) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder={
                mode ===
                'register'
                  ? 'Mínimo 8 caracteres'
                  : 'Tu contraseña'
              }
            />

          </label>


          {message && (

            <Message
              type={
                messageType
              }
            >

              {message}

            </Message>

          )}


          <button
            className="btn primary"
            disabled={
              loading
            }
          >

            {loading
              ? 'Procesando...'
              : mode ===
                'login'
                ? 'Entrar'
                : 'Registrarme'}

          </button>

        </form>


        {/* ============================================
            OLVIDÉ CONTRASEÑA
        ============================================ */}

        {mode ===
          'login' && (

          <button
            type="button"
            className="btn link"
            onClick={() => {

              setMode(
                'forgot'
              )

              setMessage(
                ''
              )

            }}
          >

            ¿Olvidaste tu contraseña?

          </button>

        )}


        {/* ============================================
            CAMBIAR LOGIN / REGISTRO
        ============================================ */}

        <button
          type="button"
          className="btn link"
          onClick={() => {

            setMode(
              mode ===
                'login'
                ? 'register'
                : 'login'
            )

            setMessage(
              ''
            )

            setPassword(
              ''
            )

          }}
        >

          {mode ===
          'login'
            ? '¿No tienes cuenta? Crear una'
            : 'Ya tengo una cuenta'}

        </button>

      </section>

    </main>

  )

}


// ==================================================
// MENSAJE
// ==================================================

function Message({
  children,
  type,
}) {

  const styles = {

    success: {
      background:
        '#ecfdf5',

      color:
        '#047857',

      border:
        '1px solid #a7f3d0',
    },

    error: {
      background:
        '#fff1f2',

      color:
        '#be123c',

      border:
        '1px solid #fecdd3',
    },

    info: {
      background:
        '#eff6ff',

      color:
        '#1d4ed8',

      border:
        '1px solid #bfdbfe',
    },

  }


  return (

    <div
      style={{
        padding:
          '10px 12px',

        borderRadius:
          '9px',

        fontSize:
          '12px',

        ...styles[
          type
        ],
      }}
    >

      {children}

    </div>

  )

}