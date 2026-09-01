import {
  useState,
} from 'react'

import {
  UserRound,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

import {
  supabase,
} from '../lib/supabase'


export default function Account({
  user,
}) {

  const [
    password,
    setPassword,
  ] =
    useState('')


  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false)


  const [
    showConfirm,
    setShowConfirm,
  ] =
    useState(false)


  const [
    loading,
    setLoading,
  ] =
    useState(false)


  const [
    message,
    setMessage,
  ] =
    useState('')


  const [
    messageType,
    setMessageType,
  ] =
    useState('success')


  // ==================================================
  // CAMBIAR CONTRASEÑA
  // ==================================================

  const changePassword =
    async (e) => {

      e.preventDefault()


      setMessage(
        ''
      )


      // -----------------------------------------------
      // LONGITUD
      // -----------------------------------------------

      if (
        password.length <
        8
      ) {

        setMessage(
          'La contraseña debe tener al menos 8 caracteres.'
        )

        setMessageType(
          'error'
        )

        return
      }


      // -----------------------------------------------
      // COINCIDENCIA
      // -----------------------------------------------

      if (
        password !==
        confirmPassword
      ) {

        setMessage(
          'Las contraseñas no coinciden.'
        )

        setMessageType(
          'error'
        )

        return
      }


      setLoading(
        true
      )


      // -----------------------------------------------
      // SUPABASE
      // -----------------------------------------------

      const {
        error,
      } =
        await supabase.auth
          .updateUser({
            password,
          })


      setLoading(
        false
      )


      if (error) {

        setMessage(
          error.message
        )

        setMessageType(
          'error'
        )

        return
      }


      setPassword(
        ''
      )

      setConfirmPassword(
        ''
      )


      setMessage(
        'Contraseña actualizada correctamente.'
      )

      setMessageType(
        'success'
      )

  }


  return (

    <>

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div className="page-actions">

        <div>

          <h2>
            Mi cuenta
          </h2>

          <p>
            Administra la seguridad
            y acceso a tu cuenta.
          </p>

        </div>

      </div>


      {/* =================================================
          INFORMACIÓN USUARIO
      ================================================= */}

      <section
        style={{
          display:
            'grid',

          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',

          gap:
            '18px',
        }}
      >

        {/* ===============================================
            PERFIL
        =============================================== */}

        <article
          className="panel"
          style={{
            padding:
              '22px',
          }}
        >

          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                '14px',

              marginBottom:
                '22px',
            }}
          >

            <span
              className="stat-icon"
              style={{
                width:
                  '48px',

                height:
                  '48px',
              }}
            >

              <UserRound
                size={22}
              />

            </span>


            <div>

              <h3
                style={{
                  marginBottom:
                    '3px',
                }}
              >

                Información de cuenta

              </h3>

              <small>
                Datos asociados a tu usuario
              </small>

            </div>

          </div>


          <div
            style={{
              display:
                'grid',

              gap:
                '15px',
            }}
          >

            <div>

              <small
                style={{
                  display:
                    'block',

                  marginBottom:
                    '5px',
                }}
              >

                Correo electrónico

              </small>


              <div
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    '8px',

                  fontWeight:
                    '600',
                }}
              >

                <Mail
                  size={17}
                />

                {
                  user?.email
                }

              </div>

            </div>


            <div>

              <small
                style={{
                  display:
                    'block',

                  marginBottom:
                    '5px',
                }}
              >

                Seguridad

              </small>


              <div
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    '8px',

                  color:
                    '#059669',

                  fontWeight:
                    '600',
                }}
              >

                <ShieldCheck
                  size={17}
                />

                Cuenta protegida por Supabase

              </div>

            </div>

          </div>

        </article>


        {/* ===============================================
            CAMBIAR CONTRASEÑA
        =============================================== */}

        <article
          className="panel"
          style={{
            padding:
              '22px',
          }}
        >

          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                '14px',

              marginBottom:
                '22px',
            }}
          >

            <span
              className="stat-icon"
              style={{
                width:
                  '48px',

                height:
                  '48px',
              }}
            >

              <LockKeyhole
                size={22}
              />

            </span>


            <div>

              <h3
                style={{
                  marginBottom:
                    '3px',
                }}
              >

                Cambiar contraseña

              </h3>

              <small>
                Utiliza mínimo 8 caracteres
              </small>

            </div>

          </div>


          <form
            onSubmit={
              changePassword
            }
            className="form-stack"
          >

            {/* ===========================================
                NUEVA CONTRASEÑA
            =========================================== */}

            <label>

              Nueva contraseña

              <div
                style={{
                  position:
                    'relative',
                }}
              >

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
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
                  required
                  minLength={
                    8
                  }
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    paddingRight:
                      '44px',
                  }}
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
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

                    width:
                      '34px',

                    height:
                      '34px',

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

                  {showPassword
                    ? (
                      <EyeOff
                        size={17}
                      />
                    )
                    : (
                      <Eye
                        size={17}
                      />
                    )}

                </button>

              </div>

            </label>


            {/* ===========================================
                CONFIRMAR
            =========================================== */}

            <label>

              Confirmar contraseña

              <div
                style={{
                  position:
                    'relative',
                }}
              >

                <input
                  type={
                    showConfirm
                      ? 'text'
                      : 'password'
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(
                    e
                  ) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                  minLength={
                    8
                  }
                  placeholder="Repite la contraseña"
                  style={{
                    paddingRight:
                      '44px',
                  }}
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      !showConfirm
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

                    width:
                      '34px',

                    height:
                      '34px',

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

                  {showConfirm
                    ? (
                      <EyeOff
                        size={17}
                      />
                    )
                    : (
                      <Eye
                        size={17}
                      />
                    )}

                </button>

              </div>

            </label>


            {/* ===========================================
                MENSAJE
            =========================================== */}

            {message && (

              <div
                style={{
                  padding:
                    '11px',

                  borderRadius:
                    '9px',

                  fontSize:
                    '12px',

                  background:
                    messageType ===
                    'success'
                      ? '#ecfdf5'
                      : '#fff1f2',

                  color:
                    messageType ===
                    'success'
                      ? '#047857'
                      : '#be123c',

                  border:
                    messageType ===
                    'success'
                      ? '1px solid #a7f3d0'
                      : '1px solid #fecdd3',
                }}
              >

                {
                  message
                }

              </div>

            )}


            {/* ===========================================
                BOTÓN
            =========================================== */}

            <button
              className="btn primary"
              disabled={
                loading
              }
            >

              <LockKeyhole
                size={17}
              />

              {loading
                ? 'Actualizando...'
                : 'Actualizar contraseña'}

            </button>

          </form>

        </article>

      </section>

    </>

  )

}