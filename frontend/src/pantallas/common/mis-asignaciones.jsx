import React, { useState, useEffect } from 'react';
import { formatDateShort } from '../../utils/dateUtils';
import './dashboard.css';

const API_BASE = '/api';
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

export default function MisAsignaciones({ user, onVerAsignacion }) {
  const [asignaciones, setAsignaciones] = useState([]);
  const [muestras, setMuestras] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('En proceso');

  useEffect(() => {
    async function fetchAsignaciones() {
      setLoading(true);
      setError('');
      try {
        // 1. Obtener asignaciones
        const asignacionesData = await apiCall('/asignacion/get', [
          null,
          user?.id_usuario || null,
          null,
          null,
          null,
          null, null, null, null, null, null, null
        ]);
        setAsignaciones(asignacionesData || []);

        // 2. Obtener muestras relacionadas
        const muestraIds = [...new Set((asignacionesData || []).map(a => a.id_muestra))];
        if (muestraIds.length > 0) {
          // Consulta todas las muestras necesarias en una sola llamada
          const muestrasData = await apiCall('/muestra/get', [
            null, // p_id_muestra
            null, // p_codigo_muestra
            null, // p_id_solicitante_muestra
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
          // Filtra solo las muestras que están en muestraIds
          const muestrasFiltradas = (muestrasData || []).filter(m => muestraIds.includes(m.id_muestra));
          // Indexa por id_muestra
          const muestrasMap = {};
          muestrasFiltradas.forEach(m => {
            muestrasMap[m.id_muestra] = m;
          });
          setMuestras(muestrasMap);
        } else {
          setMuestras({});
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchAsignaciones();
  }, [user]);

  // Filtrar asignaciones por estado
  const asignacionesFiltradas = asignaciones.filter(a =>
    a.estado_asignacion === filtro
  );

  const esAdmin = user?.id_rol_usuario === 1;

  return (
    <div className="moduleContainer">
      <h1>Mis Asignaciones</h1>
      <div className="infoBox">
        <h3>Asignaciones asignadas a ti:</h3>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'En proceso' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'En proceso' ? '#fff' : '#111',
              border: filtro === 'En proceso' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'En proceso' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('En proceso')}
          >
            En proceso
          </button>
          <button
            type="button"
            style={{
              minWidth: 120,
              backgroundColor: filtro === 'Finalizada' ? '#3b82f6' : '#f5f5f5',
              color: filtro === 'Finalizada' ? '#fff' : '#111',
              border: filtro === 'Finalizada' ? '1px solid #2563eb' : '1px solid #bcd0ee',
              fontWeight: filtro === 'Finalizada' ? '600' : '500',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setFiltro('Finalizada')}
          >
            Finalizada
          </button>
        </div>
        
        {loading && <p>Cargando asignaciones...</p>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && asignacionesFiltradas.length === 0 && <p>No tienes asignaciones registradas.</p>}
        {!loading && asignacionesFiltradas.length > 0 && (
          <table className="asignacionesTable">
            <thead>
              <tr>
                {esAdmin && <th>ID Asignación</th>}
                <th>Código Muestra</th>
                <th>Nombre Producto</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Límite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesFiltradas.map(a => {
                const muestra = muestras[a.id_muestra] || {};
                return (
                  <tr key={a.id_asignacion}>
                    {esAdmin && <td>{a.id_asignacion}</td>}
                    <td>{muestra.codigo_muestra || '-'}</td>
                    <td>{muestra.nombre_producto_muestra || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          a.estado_asignacion === 'Pendiente' ? '#e2e8f0' :
                          a.estado_asignacion === 'En proceso' ? '#fed7aa' :
                          a.estado_asignacion === 'Finalizada' ? '#d1fae5' :
                          a.estado_asignacion === 'Finalizada y última' ? '#bbf7d0' :
                          a.estado_asignacion === 'Devuelta' ? '#fecaca' : '#e5e7eb',
                        color:
                          a.estado_asignacion === 'Pendiente' ? '#475569' :
                          a.estado_asignacion === 'En proceso' ? '#c2410c' :
                          a.estado_asignacion === 'Finalizada' ? '#065f46' :
                          a.estado_asignacion === 'Finalizada y última' ? '#166534' :
                          a.estado_asignacion === 'Devuelta' ? '#dc2626' : '#374151'
                      }}>
                        {a.estado_asignacion}
                      </span>
                    </td>
                    <td>{formatDateShort(a.fecha_inicio_asignacion)}</td>
                    <td>{formatDateShort(a.fecha_limite_asignacion)}</td>
                    <td>
                      <button
                        onClick={() => onVerAsignacion(a.id_asignacion)}
                        className="btnVerAsignacion"
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}