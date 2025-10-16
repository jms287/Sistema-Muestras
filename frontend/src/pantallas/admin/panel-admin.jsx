import React, { useState, useEffect } from 'react';

const tablas = [
    "Asignacion",
    "ColeccionNormas",
    "Documento",
    "Empresa",
    "Laboratorio",
    "LimitesDeConfianza",
    "LogAcciones",
    "LogEventosSistema",
    "Muestra",
    "Municipio",
    "Norma",
    "Notificacion",
    "Parametro",
    "ParametroDeTipoMuestra",
    "Provincia",
    "Prueba",
    "Resultado",
    "Rolusuario",
    "TipoMuestra",
    "TipoPrueba",
    "Usuario",
  // Agrega más tablas si las tienes
];

const API_BASE = '/api';

export default function PanelAdmin() {
  const [tabla, setTabla] = useState('');
  const [columns, setColumns] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [upsertResult, setUpsertResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upserting, setUpserting] = useState(false);

  // Obtiene metadata y busca automáticamente al seleccionar la tabla
  useEffect(() => {
    if (tabla) {
      setLoading(true);
      fetch(`${API_BASE}/metadata/${tabla}`)
        .then(res => res.json())
        .then(res => {
          setColumns(res.columns || []);
          setFormData({});
          setResult(null);
          setUpsertResult(null);
          // Realiza búsqueda automática con todos los campos en null
          return fetch(`${API_BASE}/${tabla}/get`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ args: (res.columns || []).map(() => null) })
          });
        })
        .then(res => res && res.json ? res.json() : null)
        .then(json => {
          if (json) setResult(json.data || json);
        })
        .catch(() => {
          setColumns([]);
          setResult({ error: 'Error en la petición' });
        })
        .finally(() => setLoading(false));
    }
  }, [tabla]);

  const handleChange = (col, value) => {
    setFormData({ ...formData, [col.COLUMN_NAME]: value });
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpsertResult(null);
    try {
      const args = columns.map(col => formData[col.COLUMN_NAME] !== undefined && formData[col.COLUMN_NAME] !== ''
        ? formData[col.COLUMN_NAME]
        : null
      );
      const endpoint = `${API_BASE}/${tabla}/get`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args })
      });
      const json = await res.json();
      setResult(json.data || json);
    } catch (err) {
      setResult({ error: 'Error en la petición' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpsert = async (e) => {
    e.preventDefault();
    setUpserting(true);
    setUpsertResult(null);
    try {
      // Para upsert, envía todos los campos en el orden de columns
      const args = columns.map(col => formData[col.COLUMN_NAME] !== undefined && formData[col.COLUMN_NAME] !== ''
        ? formData[col.COLUMN_NAME]
        : null
      );
      const endpoint = `${API_BASE}/${tabla}/set`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args })
      });
      const json = await res.json();
      setUpsertResult(json.data || json);
    } catch (err) {
      setUpsertResult({ error: 'Error en la petición' });
    } finally {
      setUpserting(false);
    }
  };

  function formatValue(val, type) {
    if (
      val &&
      typeof val === 'string' &&
      (type === 'datetime' || type === 'timestamp' || type === 'date' || type === 'DATETIME' || type === 'TIMESTAMP' || type === 'DATE')
    ) {
      // Si es formato ISO, lo recorta y lo muestra como YYYY-MM-DD HH:mm:ss
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().replace('T', ' ').substring(0, 19);
      }
    }
    return val === null ? '' : val;
  }

  return (
    <div className="moduleContainer">
      <h1>Panel de Administración</h1>
      <div style={{ marginBottom: 16 }}>
        <label>
          Selecciona tabla:{' '}
          <select value={tabla} onChange={e => setTabla(e.target.value)}>
            <option value="">--</option>
            {tablas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      {tabla && (
        <>
          <form onSubmit={handleBuscar} style={{ marginBottom: 24 }}>
            <h3>Buscar por atributos</h3>
            <p>Completa solo los campos por los que deseas filtrar o para crear:</p>
            {columns.map(col => (
              <div key={col.COLUMN_NAME} style={{ marginBottom: 8 }}>
                <label>
                  <span style={{ fontWeight: 'bold' }}>{col.COLUMN_NAME}</span>
                  <span style={{ color: '#888', marginLeft: 8 }}>({col.DATA_TYPE})</span>:{' '}
                  <input
                    type="text"
                    value={formData[col.COLUMN_NAME] || ''}
                    onChange={e => handleChange(col, e.target.value)}
                    placeholder={`Filtrar por ${col.COLUMN_NAME}`}
                    style={{ marginLeft: 8 }}
                  />
                </label>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>
          <div style={{ marginTop: 24 }}>
            <h3>Resultado de búsqueda:</h3>
            {Array.isArray(result) && result.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr>
                    {Object.keys(result[0]).map(key => (
                      <th key={key} style={{ border: '1px solid #ddd', padding: '8px', background: '#f0f2f5' }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).map((key, i) => {
                        const colType = columns.find(col => col.COLUMN_NAME === key)?.DATA_TYPE || '';
                        return (
                          <td key={i} style={{ border: '1px solid #ddd', padding: '8px' }}>
                            {formatValue(row[key], colType)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                {result && typeof result === 'object' ? JSON.stringify(result, null, 2) : 'Sin resultados'}
              </pre>
            )}
          </div>
          <div style={{ marginTop: 24 }}>
            <h3>Resultado de upsert:</h3>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
              {upsertResult ? JSON.stringify(upsertResult, null, 2) : 'Sin acción'}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}