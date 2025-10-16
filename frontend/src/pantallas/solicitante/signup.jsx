import { useState, useEffect } from 'react'
import './signup.css'

const API_BASE = '/api'

export default function SignUp({ onBackToSignIn, onRegister }) {
  const [form, setForm] = useState({
    cedula_usuario: '',
    nombre_usuario: '',
    correo_usuario: '',
    password_usuario: '',
    telefono_usuario: '',
    direccion_usuario: '',
    sector_usuario: '',
    provincia_usuario: '', // guardará id_provincia (number/string)
    municipio_usuario: '', // guardará id_municipio (number/string)
    id_emp_usuario: '',
  })

  const [empresas, setEmpresas] = useState([])
  const [provincias, setProvincias] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // === Cargar empresas === (ya funcionaba)
  useEffect(() => {
    async function loadEmpresas() {
      try {
        const res = await fetch(`${API_BASE}/empresa/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // spGetEmpresa espera muchos params; este array coincide con lo que ya usabas
            args: [null, null, null, null, null, null, null, null, null, true, null, null],
          }),
        })
        const result = await res.json()
        if (res.ok && result.success) {
          setEmpresas(result.data || [])
        } else {
          console.error('empresa/get backend error:', result)
        }
      } catch (err) {
        console.error('Error cargando empresas', err)
      }
    }
    loadEmpresas()
  }, [])

  // === Cargar provincias ===
  useEffect(() => {
    async function loadProvincias() {
      try {
        // spGetProvincia(p_id_provincia, p_nombre_provincia, p_estado_activo_provincia)
        // para obtener provincias activas pasamos [null, null, true]
        const res = await fetch(`${API_BASE}/provincia/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args: [null, null, true] }),
        })
        const result = await res.json()
        if (res.ok && result.success) {
          // DB devuelve objetos con id_provincia, nombre_provincia
          setProvincias(Array.isArray(result.data) ? result.data : [])
        } else {
          console.error('provincia/get backend error:', result)
        }
      } catch (err) {
        console.error('Error cargando provincias', err)
      }
    }
    loadProvincias()
  }, [])

  // === Cargar municipios según provincia ===
  useEffect(() => {
    async function loadMunicipios() {
      if (!form.provincia_usuario) {
        setMunicipios([])
        setForm((f) => ({ ...f, municipio_usuario: '' }))
        return
      }

      try {
        // spGetMunicipio(p_id_municipio, p_nombre_municipio, p_id_provincia, p_estado_activo_municipio)
        // queremos todos los municipios activos de la provincia => [null, null, id_provincia, true]
        const args = [null, null, Number(form.provincia_usuario), true]
        const res = await fetch(`${API_BASE}/municipio/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args }),
        })
        const result = await res.json()
        if (res.ok && result.success) {
          // DB devuelve id_municipio, nombre_municipio, id_provincia, ...
          setMunicipios(Array.isArray(result.data) ? result.data : [])
        } else {
          console.error('municipio/get backend error:', result)
          setMunicipios([])
        }
      } catch (err) {
        console.error('Error cargando municipios', err)
        setMunicipios([])
      }
    }
    loadMunicipios()
  }, [form.provincia_usuario])

  const handleChange = (e) => {
    const { name, value } = e.target
    // si es select numérico, lo dejamos como string y convertimos cuando sea necesario
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (
      !form.cedula_usuario ||
      !form.nombre_usuario ||
      !form.correo_usuario ||
      !form.password_usuario ||
      !form.id_emp_usuario ||
      !form.provincia_usuario ||
      !form.municipio_usuario
    ) {
      setError('Por favor complete todos los campos obligatorios.')
      return
    }

    setLoading(true)
    try {
      // Aquí enviamos el id_municipio al SP de usuario (si el SP acepta id_municipio)
      // spSetUsuario(...) en BD espera p_id_municipio_usuario como 12° arg en su firma según el script
      const args = [
        1, // p_operacion = 1 (insertar)
        null, // id_usuario
        form.cedula_usuario,
        form.nombre_usuario,
        form.correo_usuario,
        form.password_usuario,
        form.telefono_usuario || null,
        5, // id_rol_usuario = 5 (solicitante)
        form.id_emp_usuario ? Number(form.id_emp_usuario) : null,
        form.direccion_usuario || null,
        form.sector_usuario || null,
        form.municipio_usuario ? Number(form.municipio_usuario) : null, // <-- id_municipio_usuario
      ]

      // Nota: la implementación backend callSP/add wrapper puede esperar más/menos args; 
      // si necesita exactamente N argumentos para el SP, tu backend debe mapearlo.
      // Aquí enviamos el array con los campos que maneja spSetUsuario según script.

      const res = await fetch(`${API_BASE}/usuario/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args }),
      })

      const result = await res.json()
      setLoading(false)

      if (res.ok && result.success) {
        setSuccess('Registro exitoso. Ya puede iniciar sesión.')
        setForm({
          cedula_usuario: '',
          nombre_usuario: '',
          correo_usuario: '',
          password_usuario: '',
          telefono_usuario: '',
          direccion_usuario: '',
          sector_usuario: '',
          provincia_usuario: '',
          municipio_usuario: '',
          id_emp_usuario: '',
        })
        if (onRegister) onRegister()
      } else {
        // mostrar mensaje detallado si viene del backend
        setError(result.message || 'No se pudo registrar el usuario.')
        console.error('usuario/set error detail:', result.detail || result)
      }
    } catch (err) {
      console.error('Error registrando usuario:', err)
      setError('Error de conexión con el servidor.')
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Crear cuenta de solicitante</h2>

        {error && <div className="signup-error">{error}</div>}
        {success && <div className="signup-success">{success}</div>}

        <div className="signup-grid">
          <div className="signup-field">
            <label htmlFor="cedula_usuario">Cédula *</label>
            <input
              id="cedula_usuario"
              name="cedula_usuario"
              type="text"
              value={form.cedula_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="nombre_usuario">Nombre completo *</label>
            <input
              id="nombre_usuario"
              name="nombre_usuario"
              type="text"
              value={form.nombre_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="correo_usuario">Correo electrónico *</label>
            <input
              id="correo_usuario"
              name="correo_usuario"
              type="email"
              value={form.correo_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="password_usuario">Contraseña *</label>
            <input
              id="password_usuario"
              name="password_usuario"
              type="password"
              value={form.password_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="telefono_usuario">Teléfono</label>
            <input
              id="telefono_usuario"
              name="telefono_usuario"
              type="tel"
              value={form.telefono_usuario}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="direccion_usuario">Dirección</label>
            <input
              id="direccion_usuario"
              name="direccion_usuario"
              type="text"
              value={form.direccion_usuario}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="sector_usuario">Sector</label>
            <input
              id="sector_usuario"
              name="sector_usuario"
              type="text"
              value={form.sector_usuario}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </div>

          <div className="signup-field">
            <label htmlFor="provincia_usuario">Provincia *</label>
            <select
              id="provincia_usuario"
              name="provincia_usuario"
              value={form.provincia_usuario}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione provincia...</option>
              {provincias.map((p) => (
                <option key={p.id_provincia} value={p.id_provincia}>
                  {p.nombre_provincia}
                </option>
              ))}
            </select>
          </div>

          <div className="signup-field">
            <label htmlFor="municipio_usuario">Municipio *</label>
            <select
              id="municipio_usuario"
              name="municipio_usuario"
              value={form.municipio_usuario}
              onChange={handleChange}
              required
              disabled={!form.provincia_usuario || municipios.length === 0}
            >
              <option value="">Seleccione municipio...</option>
              {municipios.map((m) => (
                <option key={m.id_municipio} value={m.id_municipio}>
                  {m.nombre_municipio}
                </option>
              ))}
            </select>
          </div>

          <div className="signup-field">
            <label htmlFor="id_emp_usuario">Empresa *</label>
            <select
              id="id_emp_usuario"
              name="id_emp_usuario"
              value={form.id_emp_usuario}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione empresa...</option>
              {empresas.map((e) => (
                <option key={e.id_emp} value={e.id_emp}>
                  {e.nombre_comercial_emp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="signup-btn" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

        <div className="signup-footer">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="signup-back-link"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </form>
    </div>
  )
}
