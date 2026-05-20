import { useState, useEffect } from 'react'
import './dashboard.css'
import RegistrarMuestra from '../registrador/registrar-muestra.jsx'
import VerMuestra from './ver-muestra.jsx'
import VerAsignacion from './ver-asignacion.jsx'
import MisAsignaciones from './mis-asignaciones.jsx'
import RealizarPrueba from '../analista/realizar-prueba.jsx'
import MisSolicitudes from '../cliente/mis-solicitudes.jsx'
import PanelAdmin from '../admin/panel-admin.jsx'
import { buildAuthHeaders } from '../../utils/auth.js'

// <--- Importa el nuevo archivo
// import RealizarPruebas from '../analista/realizar-pruebas.jsx' // COMENTADO TEMPORALMENTE

const API_BASE = '/api'
async function apiCall(endpoint, args = []) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    body: JSON.stringify({ args })
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || json.detail || 'Error en la petición')
  return json.data
}

export default function Dashboard({ user, onLogout }) {
  const [moduloActivo, setModuloActivo] = useState('inicio')
  const [muestraIdActual, setMuestraIdActual] = useState(null)
  const [asignacionIdActual, setAsignacionIdActual] = useState(null)
  const [origenNavegacion, setOrigenNavegacion] = useState(null) // 'asignacion' o null
  const [vieneDeVerMuestra, setVieneDeVerMuestra] = useState(false)
  const [datosPrueba, setDatosPrueba] = useState(null)
  const [verAsignacionRefresh, setVerAsignacionRefresh] = useState(0)

  const handleMuestraCreada = (idMuestra) => {
    setMuestraIdActual(idMuestra)
    setModuloActivo('ver-muestra')
  }

  const handleVolverDeMuestra = () => {
    setMuestraIdActual(null)
    setModuloActivo('inicio')
  }

  const handleVerAsignacion = (idAsignacion) => {
    setAsignacionIdActual(idAsignacion)
    setModuloActivo('ver-asignacion')
  }

  const handleVolverDeAsignacion = () => {
    setAsignacionIdActual(null)
    setModuloActivo('mis-asignaciones')
  }

  const handleVerMuestraDesdeAsignacion = (idMuestra) => {
    setMuestraIdActual(idMuestra)
    setOrigenNavegacion('asignacion')
    setModuloActivo('ver-muestra')
  }

  const handleVolverDeMuestraAAsignacion = () => {
    setMuestraIdActual(null)
    setOrigenNavegacion(null)
    setVieneDeVerMuestra(true)
    setModuloActivo('ver-asignacion')
  }

  const handleIrAAsignacionDesdeMuestra = (idAsignacion) => {
    setAsignacionIdActual(idAsignacion)
    setVieneDeVerMuestra(true)
    setModuloActivo('ver-asignacion')
  }

  const handleRealizarPrueba = (datos) => {
    setDatosPrueba(datos)
    setModuloActivo('realizar-prueba')
  }

  const handleVolverDeRealizarPrueba = () => {
    setDatosPrueba(null)
    setVerAsignacionRefresh((prev) => prev + 1)
    setModuloActivo('ver-asignacion')
  }

  const getOpcionesMenu = () => {
    const rol = user?.id_rol_usuario
    const opciones = [
      { id: 'inicio', label: 'Inicio', icon: '🏠', roles: [1, 2, 3, 4, 5] }
    ]
    if (rol === 2) {
      opciones.push(
        { id: 'mis-asignaciones', label: 'Ver Muestras Registradas', icon: '📋', roles: [2] },
        { id: 'registrar-muestra', label: 'Registrar Muestra', icon: '📝', roles: [2] }
      )
    }
    if (rol === 3) {
      opciones.push(
        { id: 'mis-asignaciones', label: 'Ver Pruebas', icon: '📋', roles: [3] }
      )
    }
    if (rol === 4) {
      opciones.push(
        { id: 'mis-asignaciones', label: 'Evaluar Muestras', icon: '📋', roles: [4] },
        { id: 'evaluar-muestras', label: 'Ratificar Muestras', icon: '✓', roles: [4] }
      )
    }
    if (rol === 5) {
      opciones.push(
        { id: 'mis-solicitudes', label: 'Mis Solicitudes', icon: '📦', roles: [5] },
        { id: 'resultados', label: 'Resultados', icon: '📊', roles: [5] }
      )
    }
    if (rol === 1) {
      opciones.push(
        { id: 'panel-admin', label: 'Panel Admin', icon: '🛠️', roles: [1] }
      )
    }
    return opciones
  }

  const opcionesMenu = getOpcionesMenu()
  const renderContenido = () => {
    switch (moduloActivo) {
      case 'inicio':
        return <PantallaInicio user={user} />
      case 'registrar-muestra':
        return <RegistrarMuestra user={user} onMuestraCreada={handleMuestraCreada} />;
      case 'ver-muestra':
        return <VerMuestra 
          muestraId={muestraIdActual} 
          user={user} 
          onBack={origenNavegacion === 'asignacion' ? handleVolverDeMuestraAAsignacion : handleVolverDeMuestra}
          onUpdate={() => {}}
          onVerAsignacion={handleIrAAsignacionDesdeMuestra}
        />;
      case 'ver-asignacion':
        return <VerAsignacion
          asignacionId={asignacionIdActual}
          user={user}
          onBack={handleVolverDeAsignacion}
          onVerMuestra={handleVerMuestraDesdeAsignacion}
          onRealizarPrueba={handleRealizarPrueba}
          vieneDeVerMuestra={vieneDeVerMuestra}
          refreshToken={verAsignacionRefresh}
        />;
      case 'mis-asignaciones':
        return <MisAsignaciones user={user} onVerAsignacion={handleVerAsignacion} />
        case 'panel-admin':
          return <PanelAdmin />;
        case 'realizar-prueba':
        if (datosPrueba) {
          return <RealizarPrueba 
            idMuestra={datosPrueba.idMuestra}
            idTipoPrueba={datosPrueba.idTipoPrueba}
            idAsignacion={datosPrueba.idAsignacion}
            idPrueba={datosPrueba.idPrueba} // <- ASEGÚRATE DE QUE ESTA LÍNEA EXISTA
            user={user}
            onBack={handleVolverDeRealizarPrueba}
          />
        } else {
          setModuloActivo('inicio')
          return <PantallaInicio user={user} />
        }
      case 'evaluar-muestras':
        return <PlaceholderModule titulo="Ratificar Muestras" />
        case 'mis-solicitudes':
          return <MisSolicitudes user={user} />;
      case 'resultados':
        return <PlaceholderModule titulo="Resultados" />
      case 'usuarios':
        return <PlaceholderModule titulo="Gestión de Usuarios" />
      case 'empresas':
        return <PlaceholderModule titulo="Gestión de Empresas" />
      case 'laboratorios':
        return <PlaceholderModule titulo="Gestión de Laboratorios" />
      case 'parametros':
        return <PlaceholderModule titulo="Gestión de Parámetros" />
      case 'normas':
        return <PlaceholderModule titulo="Gestión de Normas" />
      default:
        return <PantallaInicio user={user} />
    }
  }

  useEffect(() => {
    if (moduloActivo !== 'ver-asignacion') {
      setVieneDeVerMuestra(false)
    }
  }, [moduloActivo])

  return (
    <div className="dashboard">
      <header className="topBar">
        <div className="logo">
          <span className="logoIcon">🔬</span>
          <span className="logoText">Dirección General de Medicamentos, Alimentos y Productos Sanitarios</span>
        </div>
        <div className="userInfo">
          <span className="userName">{user?.nombre_usuario || user?.correo_usuario}</span>
          <span className="userRole">({getRolNombre(user?.id_rol_usuario)})</span>
          <button onClick={onLogout} className="btnLogout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="mainLayout">
        <aside className="sidebar">
          <nav className="nav">
            {opcionesMenu.map(opcion => (
              <button
                key={opcion.id}
                onClick={() => setModuloActivo(opcion.id)}
                className={`menuItem${moduloActivo === opcion.id ? ' menuItemActive' : ''}`}
              >
                <span className="menuIcon">{opcion.icon}</span>
                <span className="menuLabel">{opcion.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="mainContent">
          {renderContenido()}
        </main>
      </div>
    </div>
  )
}

function PantallaInicio({ user }) {
  const rol = user?.id_rol_usuario;
  return (
    <div className="inicioContainer">
      <h1>Bienvenido a DIGEMAPS</h1>
      <div className="welcomeCard">
        <h2>👋 Hola, {user?.nombre_usuario}!</h2>
        <p>Has iniciado sesión como <strong>{getRolNombre(rol)}</strong></p>
        <div className="infoBox">
          <h3>Acciones disponibles:</h3>
          {rol === 2 && (
            <ul className="accionesList">
              <li>✓ Registrar nuevas muestras</li>
              <li>✓ Ver y gestionar asignaciones</li>
              <li>✓ Revisar el estado de las muestras</li>
            </ul>
          )}
          {rol === 3 && (
            <ul className="accionesList">
              <li>✓ Ver asignaciones de pruebas</li>
              <li>✓ Registrar resultados de análisis</li>
              <li>✓ Validar pruebas realizadas</li>
            </ul>
          )}
          {rol === 4 && (
            <ul className="accionesList">
              <li>✓ Evaluar muestras analizadas</li>
              <li>✓ Aprobar o devolver resultados</li>
              <li>✓ Certificar muestras</li>
            </ul>
          )}
          {rol === 5 && (
            <ul className="accionesList">
              <li>✓ Ver estado de solicitudes</li>
              <li>✓ Consultar resultados</li>
              <li>✓ Descargar certificados</li>
            </ul>
          )}
          {rol === 1 && (
            <ul className="accionesList">
              <li>✓ Gestión completa del sistema</li>
              <li>✓ Administrar usuarios y empresas</li>
              <li>✓ Configurar parámetros y normas</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}



function PlaceholderModule({ titulo }) {
  return (
    <div className="moduleContainer">
      <h1>{titulo}</h1>
      <div className="placeholderBox">
        <p className="placeholderText">
          🚧 Este módulo estará disponible próximamente
        </p>
      </div>
    </div>
  );
}

function getRolNombre(idRol) {
  const roles = {
    1: 'Administrador',
    2: 'Encargado de Registro',
    3: 'Analista de Pruebas',
    4: 'Evaluador Final',
    5: 'Solicitante'
  };
  return roles[idRol] || 'Usuario';
}