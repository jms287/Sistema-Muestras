import { useState } from 'react'
import './signin.css'

function SignIn({ onLogin, onGoToSignUp }) {  // <- AGREGAR onGoToSignUp
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_usuario: email,
          password_usuario: password
        })
      })
      const result = await res.json()
      setLoading(false)
      if (result.success && result.user && result.token) {
        if (onLogin) onLogin({ user: result.user, token: result.token })
      } else {
        setError(result.message || 'Credenciales incorrectas')
      }
    } catch (err) {
      setLoading(false)
      setError('Error de conexión')
    }
  }

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSubmit} autoComplete="on">
        <h1 className="signin-app-title">DIGEMAPS</h1>
        <h2 className="signin-title">Iniciar sesión</h2>
        <div className="signin-field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />
        </div>
        <div className="signin-field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="signin-btn" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
        {error && <div className="signin-error">{error}</div>}
        
        {/* AGREGAR ESTA SECCIÓN */}
        <div className="signin-footer">
          <p className="signin-signup-prompt">¿No tienes cuenta?</p>
          <button 
            type="button" 
            onClick={onGoToSignUp} 
            className="signin-signup-link"
          >
            Crear cuenta de solicitante
          </button>
        </div>
      </form>
    </div>
  )
}

export default SignIn