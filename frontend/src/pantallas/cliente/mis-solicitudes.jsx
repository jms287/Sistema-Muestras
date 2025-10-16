import React, { useState, useEffect } from 'react';
import { formatDateShort } from '../../utils/dateUtils';
import '../common/dashboard.css';

const API_BASE = 'http://localhost:3001/api'; // Ensure the backend URL is correct
async function apiCall(endpoint, args = []) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || json.detail || 'Error en la petición');
  return json.data;
}

// Obtiene el nombre comercial de la empresa por ID
async function getNombreEmpresa(id) {
  if (!id) return '';
  // Ajustar el número de argumentos a 12
  const res = await apiCall('/empresa/get', [id, null, null, null, null, null, null, null, null, null, null, null]);
  return res[0]?.nombre_comercial_emp || '';
}

// Obtiene el nombre del laboratorio por ID
async function getNombreLaboratorio(id) {
  if (!id) return '';
  const res = await apiCall('/laboratorio/get', [id, null, null, null, null, null, null, null, null, null]);
  return res[0]?.nombre_lab || '';
}

// Obtiene los resultados de pruebas asociadas a la muestra
async function getResultadosPrueba(id_muestra) {
  if (!id_muestra) return [];
  const pruebas = await apiCall('/prueba/get', [
    null, // p_id_prueba
    null, // p_codigo_prueba
    id_muestra, // p_id_muestra
    null, // p_id_tipo_prueba
    null, // p_notas_prueba
    null, // p_prueba_aprobada
    null, // p_prueba_validada
    null, // p_estado_activo_prueba
    null, // p_fecha_creacion_prueba
    null  // p_fecha_actualizacion_prueba
  ]);
  const resultados = [];
  for (const prueba of pruebas) {
    const res = await apiCall('/resultado/get', [
      prueba.id_prueba, // p_id_prueba
      null, // p_id_parametro
      null, // p_resultado_numerico
      null, // p_resultado_texto
      null, // p_observaciones_resultado
      null, // p_resultado_dentro_de_limites
      null, // p_fecha_creacion_resultado
      null  // p_fecha_actualizacion_resultado
    ]);
    resultados.push(...res);
  }
  return resultados;
}

// Genera y envía el documento Excel con los datos enriquecidos
async function handleDescargarDocumento(m) {
  try {
    console.log('Descargando documento para la muestra:', m.id_muestra); // Log para depuración

    // Redirigir a la nueva ruta con el identificador de la muestra
    const url = `${API_BASE}/excel/descargar-excel/${m.id_muestra}`;
    window.open(url, '_blank'); // Abrir en una nueva pestaña
  } catch (error) {
    console.error('Error al descargar el documento:', error); // Log para errores
  }
}

export default function MisSolicitudes({ user }) {
  const [muestras, setMuestras] = useState([]);
  const [tiposMuestra, setTiposMuestra] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Recibida');

  useEffect(() => {
    async function fetchMuestras() {
      setLoading(true);
      setError('');
      try {
        const muestrasData = await apiCall('/muestra/get', [
          null, // p_id_muestra
          null, // p_codigo_muestra
          user?.id_usuario || null, // p_id_solicitante_muestra
          null, // p_id_emp_fabricante_muestra
          null, // p_id_emp_distribuidor_muestra
          null, // p_id_tipo_muestra
          null, // p_nombre_producto_muestra
          null, // p_condicion_muestra
          null, // p_fecha_recepcion_muestra
          null, // p_id_lab_muestra
          null, // p_condicion_transp_muestra
          null, // p_condicion_almac_muestra
          null, // p_temperatura_muestra
          null, // p_color_muestra
          null, // p_olor_muestra
          null, // p_sabor_muestra
          null, // p_aspecto_muestra
          null, // p_textura_muestra
          null, // p_peso_neto_muestra
          null, // p_fecha_vencimiento_muestra
          null, // p_observaciones_muestra
          null, // p_estado_muestra
          null, // p_muestra_en_proceso
          null, // p_muestra_apta_para_consumo
          null, // p_muestra_validada
          null, // p_fecha_creacion_muestra
          null  // p_fecha_actualizacion_muestra
        ]);
        setMuestras(muestrasData || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchMuestras();
  }, [user]);

  useEffect(() => {
    async function fetchTiposMuestra() {
      try {
        const tipos = await apiCall('/tipomuestra/get', [
          null, // p_id_tipo_muestra
          null, // p_abreviatura_tipo_muestra
          null, // p_nombre_tipo_muestra
          null  // p_estado_activo_tipo_muestra
        ]);
        const tiposMap = {};
        tipos.forEach(t => {
          tiposMap[t.id_tipo_muestra] = t.nombre_tipo_muestra;
        });
        setTiposMuestra(tiposMap);
      } catch (err) {
        // No mostrar error aquí
      }
    }
    fetchTiposMuestra();
  }, []);

  const muestrasFiltradas = muestras.filter(m =>
    m.estado_muestra === filtro
  );

  const mostrarDocumento = filtro === 'Certificada';

  return (
    <div className="moduleContainer">
      <h1>Mis Solicitudes</h1>
      <div className="infoBox">
        <h3>Muestras solicitadas por ti:</h3>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {/* Botones de filtro */}
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'Recibida' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'Recibida' ? '#fff' : '#111',
              border: filtro === 'Recibida' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'Recibida' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('Recibida')}
          >
            Recibida
          </button>
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'En análisis' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'En análisis' ? '#fff' : '#111',
              border: filtro === 'En análisis' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'En análisis' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('En análisis')}
          >
            En análisis
          </button>
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'Evaluada' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'Evaluada' ? '#fff' : '#111',
              border: filtro === 'Evaluada' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'Evaluada' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('Evaluada')}
          >
            Evaluada
          </button>
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'Certificada' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'Certificada' ? '#fff' : '#111',
              border: filtro === 'Certificada' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'Certificada' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('Certificada')}
          >
            Certificada
          </button>
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'Descartada' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'Descartada' ? '#fff' : '#111',
              border: filtro === 'Descartada' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'Descartada' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('Descartada')}
          >
            Descartada
          </button>
        </div>
        {loading && <p>Cargando solicitudes...</p>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && muestrasFiltradas.length === 0 && <p>No tienes solicitudes registradas.</p>}
        {!loading && muestrasFiltradas.length > 0 && (
          <table className="asignacionesTable">
            <thead>
              <tr>
                <th>Código Muestra</th>
                <th>Nombre Producto</th>
                <th>Tipo Muestra</th>
                <th>Estado</th>
                <th>Fecha Recepción</th>
                <th>Laboratorio</th>
                {mostrarDocumento && <th>Documento</th>}
              </tr>
            </thead>
            <tbody>
              {muestrasFiltradas.map(m => (
                <tr key={m.id_muestra}>
                  <td>{m.codigo_muestra || '-'}</td>
                  <td>{m.nombre_producto_muestra || '-'}</td>
                  <td>{tiposMuestra[m.id_tipo_muestra] || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor:
                        m.estado_muestra === 'Recibida' ? '#e2e8f0' :
                        m.estado_muestra === 'En análisis' ? '#fed7aa' :
                        m.estado_muestra === 'Evaluada' ? '#d1fae5' :
                        m.estado_muestra === 'Certificada' ? '#bbf7d0' :
                        m.estado_muestra === 'Descartada' ? '#fecaca' : '#e5e7eb',
                      color:
                        m.estado_muestra === 'Recibida' ? '#475569' :
                        m.estado_muestra === 'En análisis' ? '#c2410c' :
                        m.estado_muestra === 'Evaluada' ? '#065f46' :
                        m.estado_muestra === 'Certificada' ? '#166534' :
                        m.estado_muestra === 'Descartada' ? '#dc2626' : '#374151'
                    }}>
                      {m.estado_muestra}
                    </span>
                  </td>
                  <td>{formatDateShort(m.fecha_recepcion_muestra)}</td>
                  <td>{m.id_lab_muestra || '-'}</td>
                  {mostrarDocumento && (
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDescargarDocumento(m)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 4,
                          border: '1px solid #2563eb',
                          background: '#3b82f6',
                          color: '#fff',
                          fontWeight: 500,
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Descargar documento
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}