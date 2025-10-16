import React, { useState, useEffect } from 'react';

// ==================== API UTILS ====================
const API_BASE = '/api';

async function apiCall(endpoint, args = []) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message || 'Error en API');
  return result.data;
}

// Helper para extraer valores de enums (puede ser string u objeto)
const extractEnumValue = (item) => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const keys = Object.keys(item);
    return keys.length > 0 ? item[keys[0]] : String(item);
  }
  return String(item);
};

// ==================== COMPONENTES ====================

// Formulario de Muestra (para editar)
function MuestraForm({ muestraId, onSave, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    id_solicitante_muestra: '',
    id_emp_fabricante_muestra: '',
    id_emp_distribuidor_muestra: '',
    id_tipo_muestra: '',
    nombre_producto_muestra: '',
    condicion_muestra: '',
    fecha_recepcion_muestra: '',
    id_lab_muestra: '',
    condicion_transp_muestra: '',
    condicion_almac_muestra: '',
    temperatura_muestra: '',
    color_muestra: '',
    olor_muestra: '',
    sabor_muestra: '',
    aspecto_muestra: '',
    textura_muestra: '',
    peso_neto_muestra: '',
    fecha_vencimiento_muestra: '',
    observaciones_muestra: ''
  });

  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [tiposMuestra, setTiposMuestra] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [condicionesEnum, setCondicionesEnum] = useState([]);
  const [condicionesTranspEnum, setCondicionesTranspEnum] = useState([]);
  const [condicionesAlmacEnum, setCondicionesAlmacEnum] = useState([]);
  const [coloresEnum, setColoresEnum] = useState([]);
  const [oloresEnum, setOloresEnum] = useState([]);
  const [saboresEnum, setSaboresEnum] = useState([]);
  const [aspectosEnum, setAspectosEnum] = useState([]);
  const [texturasEnum, setTexturasEnum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [muestraId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar usuarios solicitantes (rol 5)
      const usuariosData = await apiCall('/usuario/get', [
        null, null, null, null, null, null, 5, null, null, null, null, true, null, null
      ]);
      setUsuarios(usuariosData || []);

      // Cargar empresas activas
      const empresasData = await apiCall('/empresa/get', [
        null, null, null, null, null, null, null, null, null, true, null, null
      ]);
      setEmpresas(empresasData || []);

      // Cargar tipos de muestra activos
      const tiposData = await apiCall('/tipomuestra/get', [
        null, null, null, true
      ]);
      setTiposMuestra(tiposData || []);

      // Cargar laboratorios activos
      const labsData = await apiCall('/laboratorio/get', [
        null, null, null, null, null, null, null, true, null, null
      ]);
      setLaboratorios(labsData || []);

      // Cargar valores enum
      const condicionMuestra = await apiCall('/enumvalues/get', ['Muestra', 'condicion_muestra']);
      setCondicionesEnum(condicionMuestra || []);

      const condicionTransp = await apiCall('/enumvalues/get', ['Muestra', 'condicion_transp_muestra']);
      setCondicionesTranspEnum(condicionTransp || []);

      const condicionAlmac = await apiCall('/enumvalues/get', ['Muestra', 'condicion_almac_muestra']);
      setCondicionesAlmacEnum(condicionAlmac || []);

      const colores = await apiCall('/enumvalues/get', ['Muestra', 'color_muestra']);
      setColoresEnum(colores || []);

      const olores = await apiCall('/enumvalues/get', ['Muestra', 'olor_muestra']);
      setOloresEnum(olores || []);

      const sabores = await apiCall('/enumvalues/get', ['Muestra', 'sabor_muestra']);
      setSaboresEnum(sabores || []);

      const aspectos = await apiCall('/enumvalues/get', ['Muestra', 'aspecto_muestra']);
      setAspectosEnum(aspectos || []);

      const texturas = await apiCall('/enumvalues/get', ['Muestra', 'textura_muestra']);
      setTexturasEnum(texturas || []);

      // Cargar datos de la muestra
      if (muestraId) {
        const muestrasData = await apiCall('/muestra/get', [
          muestraId, null, null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null, null, null, null,
          null, null, null, null, null, null
        ]);

        if (muestrasData && muestrasData.length > 0) {
          const muestra = muestrasData[0];
          setFormData({
            id_solicitante_muestra: muestra.id_solicitante_muestra || '',
            id_emp_fabricante_muestra: muestra.id_emp_fabricante_muestra || '',
            id_emp_distribuidor_muestra: muestra.id_emp_distribuidor_muestra || '',
            id_tipo_muestra: muestra.id_tipo_muestra || '',
            nombre_producto_muestra: muestra.nombre_producto_muestra || '',
            condicion_muestra: muestra.condicion_muestra || '',
            fecha_recepcion_muestra: muestra.fecha_recepcion_muestra ? muestra.fecha_recepcion_muestra.split('T')[0] : '',
            id_lab_muestra: muestra.id_lab_muestra || '',
            condicion_transp_muestra: muestra.condicion_transp_muestra || '',
            condicion_almac_muestra: muestra.condicion_almac_muestra || '',
            temperatura_muestra: muestra.temperatura_muestra || '',
            color_muestra: muestra.color_muestra || '',
            olor_muestra: muestra.olor_muestra || '',
            sabor_muestra: muestra.sabor_muestra || '',
            aspecto_muestra: muestra.aspecto_muestra || '',
            textura_muestra: muestra.textura_muestra || '',
            peso_neto_muestra: muestra.peso_neto_muestra || '',
            fecha_vencimiento_muestra: muestra.fecha_vencimiento_muestra ? muestra.fecha_vencimiento_muestra.split('T')[0] : '',
            observaciones_muestra: muestra.observaciones_muestra || ''
          });
        }
      }
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      // Validaciones básicas
      if (!formData.id_solicitante_muestra || !formData.id_emp_fabricante_muestra || 
          !formData.id_emp_distribuidor_muestra || !formData.id_tipo_muestra || 
          !formData.nombre_producto_muestra || !formData.condicion_muestra ||
          !formData.fecha_recepcion_muestra || !formData.id_lab_muestra ||
          !formData.condicion_transp_muestra || !formData.condicion_almac_muestra) {
        setError('Por favor complete todos los campos obligatorios');
        return;
      }

      const args = [
        2, // operación editar
        muestraId,
        parseInt(formData.id_solicitante_muestra),
        parseInt(formData.id_emp_fabricante_muestra),
        parseInt(formData.id_emp_distribuidor_muestra),
        parseInt(formData.id_tipo_muestra),
        formData.nombre_producto_muestra,
        formData.condicion_muestra,
        formData.fecha_recepcion_muestra,
        parseInt(formData.id_lab_muestra),
        formData.condicion_transp_muestra,
        formData.condicion_almac_muestra,
        formData.temperatura_muestra ? parseFloat(formData.temperatura_muestra) : null,
        formData.color_muestra || null,
        formData.olor_muestra || null,
        formData.sabor_muestra || null,
        formData.aspecto_muestra || null,
        formData.textura_muestra || null,
        formData.peso_neto_muestra ? parseFloat(formData.peso_neto_muestra) : null,
        formData.fecha_vencimiento_muestra || null,
        formData.observaciones_muestra || null,
        false, // muestra_validada
        null // id_usuario_registro (null en edición)
      ];

      await apiCall('/muestra/set', args);
      alert('Muestra actualizada exitosamente');
      onSave();
    } catch (err) {
      setError('Error al guardar: ' + err.message);
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando...</div>;

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>Editar Muestra</h2>
      
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Información Básica */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Información Básica</h3>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Solicitante *</label>
              <select
                name="id_solicitante_muestra"
                value={formData.id_solicitante_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombre_usuario}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Muestra *</label>
              <select
                name="id_tipo_muestra"
                value={formData.id_tipo_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {tiposMuestra.map(t => (
                  <option key={t.id_tipo_muestra} value={t.id_tipo_muestra}>
                    {t.nombre_tipo_muestra}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del Producto *</label>
              <input
                type="text"
                name="nombre_producto_muestra"
                value={formData.nombre_producto_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Condición de la Muestra *</label>
              <select
                name="condicion_muestra"
                value={formData.condicion_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {condicionesEnum.map((c, idx) => {
                  const valor = extractEnumValue(c);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha de Recepción *</label>
              <input
                type="date"
                name="fecha_recepcion_muestra"
                value={formData.fecha_recepcion_muestra}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha de Vencimiento</label>
              <input
                type="date"
                name="fecha_vencimiento_muestra"
                value={formData.fecha_vencimiento_muestra}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Empresas */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Información de Empresas</h3>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Empresa Fabricante *</label>
              <select
                name="id_emp_fabricante_muestra"
                value={formData.id_emp_fabricante_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {empresas.map(e => (
                  <option key={e.id_emp} value={e.id_emp}>
                    {e.nombre_comercial_emp}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Empresa Distribuidora *</label>
              <select
                name="id_emp_distribuidor_muestra"
                value={formData.id_emp_distribuidor_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {empresas.map(e => (
                  <option key={e.id_emp} value={e.id_emp}>
                    {e.nombre_comercial_emp}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Laboratorio *</label>
              <select
                name="id_lab_muestra"
                value={formData.id_lab_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {laboratorios.map(l => (
                  <option key={l.id_lab} value={l.id_lab}>
                    {l.nombre_lab}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Condiciones de Transporte y Almacenamiento */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Condiciones de Transporte y Almacenamiento</h3>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Condición de Transporte *</label>
              <select
                name="condicion_transp_muestra"
                value={formData.condicion_transp_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {condicionesTranspEnum.map((c, idx) => {
                  const valor = extractEnumValue(c);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Condición de Almacenamiento *</label>
              <select
                name="condicion_almac_muestra"
                value={formData.condicion_almac_muestra}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {condicionesAlmacEnum.map((c, idx) => {
                  const valor = extractEnumValue(c);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Temperatura (°C)</label>
              <input
                type="number"
                step="0.1"
                name="temperatura_muestra"
                value={formData.temperatura_muestra}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Características Físicas */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Características Físicas</h3>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <select
                name="color_muestra"
                value={formData.color_muestra}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {coloresEnum.map((c, idx) => {
                  const valor = extractEnumValue(c);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Olor</label>
              <select
                name="olor_muestra"
                value={formData.olor_muestra}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {oloresEnum.map((o, idx) => {
                  const valor = extractEnumValue(o);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sabor</label>
              <select
                name="sabor_muestra"
                value={formData.sabor_muestra}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {saboresEnum.map((s, idx) => {
                  const valor = extractEnumValue(s);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Aspecto</label>
              <select
                name="aspecto_muestra"
                value={formData.aspecto_muestra}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {aspectosEnum.map((a, idx) => {
                  const valor = extractEnumValue(a);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Textura</label>
              <select
                name="textura_muestra"
                value={formData.textura_muestra}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                {texturasEnum.map((t, idx) => {
                  const valor = extractEnumValue(t);
                  return (
                    <option key={idx} value={valor}>
                      {valor}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Peso Neto (g)</label>
              <input
                type="number"
                step="0.01"
                name="peso_neto_muestra"
                value={formData.peso_neto_muestra}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div style={styles.section}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Observaciones</label>
            <textarea
              name="observaciones_muestra"
              value={formData.observaciones_muestra}
              onChange={handleChange}
              rows="4"
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Botones */}
        <div style={styles.buttonGroup}>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" style={styles.submitButton}>
            Actualizar
          </button>
        </div>
      </form>
    </div>
  );
}

// Tabla de Muestras
function MuestrasTable({ onEdit, onView, onDelete }) {
  const [muestras, setMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    codigo: '',
    tipo: '',
    estado: ''
  });
  const [tiposMuestra, setTiposMuestra] = useState([]);
  const [estadosEnum, setEstadosEnum] = useState([]);

  useEffect(() => {
    loadTipos();
    loadEstados();
    loadMuestras();
  }, []);

  const loadTipos = async () => {
    try {
      const data = await apiCall('/tipomuestra/get', [null, null, null, true]);
      setTiposMuestra(data || []);
    } catch (err) {
      console.error('Error cargando tipos:', err);
    }
  };

  const loadEstados = async () => {
    try {
      const data = await apiCall('/enumvalues/get', ['Muestra', 'estado_muestra']);
      setEstadosEnum(data || []);
    } catch (err) {
      console.error('Error cargando estados:', err);
    }
  };

  const loadMuestras = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiCall('/muestra/get', [
        null,
        filters.codigo || null,
        null, null, null,
        filters.tipo ? parseInt(filters.tipo) : null,
        null, null, null, null, null, null, null, null, null, null, null, null,
        null, null, null,
        filters.estado || null,
        null, null, null, null, null
      ]);

      setMuestras(data || []);
    } catch (err) {
      setError('Error al cargar muestras: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    loadMuestras();
  };

  const handleClearFilters = () => {
    setFilters({ codigo: '', tipo: '', estado: '' });
    setTimeout(loadMuestras, 100);
  };

  const handleDeleteClick = async (muestra) => {
    if (window.confirm(`¿Está seguro de eliminar la muestra ${muestra.codigo_muestra}?`)) {
      try {
        // Operación 3 = eliminar
        await apiCall('/muestra/set', [3, muestra.id_muestra]);
        alert('Muestra eliminada exitosamente');
        loadMuestras();
      } catch (err) {
        alert('Error al eliminar muestra: ' + err.message);
        console.error(err);
      }
    }
  };

  if (loading) return <div style={styles.loading}>Cargando muestras...</div>;

  return (
    <div style={styles.tableContainer}>
      {/* Filtros */}
      <div style={styles.filtersSection}>
        <h3 style={styles.filtersTitle}>Filtros de Búsqueda</h3>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código</label>
            <input
              type="text"
              name="codigo"
              value={filters.codigo}
              onChange={handleFilterChange}
              placeholder="Buscar por código..."
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Muestra</label>
            <select
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              style={styles.input}
            >
              <option value="">Todos</option>
              {tiposMuestra.map(t => (
                <option key={t.id_tipo_muestra} value={t.id_tipo_muestra}>
                  {t.nombre_tipo_muestra}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Estado</label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              style={styles.input}
            >
              <option value="">Todos</option>
              {estadosEnum.map((e, idx) => {
                const valor = extractEnumValue(e);
                return (
                  <option key={idx} value={valor}>
                    {valor}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div style={styles.filterButtons}>
          <button onClick={handleSearch} style={styles.searchButton}>
            Buscar
          </button>
          <button onClick={handleClearFilters} style={styles.clearButton}>
            Limpiar
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Tabla */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Producto</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Fecha Recepción</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {muestras.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.noData}>
                  No se encontraron muestras
                </td>
              </tr>
            ) : (
              muestras.map(muestra => (
                <tr key={muestra.id_muestra} style={styles.tr}>
                  <td style={styles.td}>{muestra.codigo_muestra}</td>
                  <td style={styles.td}>{muestra.nombre_producto_muestra}</td>
                  <td style={styles.td}>{muestra.nombre_tipo_muestra}</td>
                  <td style={styles.td}>
                    {muestra.fecha_recepcion_muestra ? 
                      new Date(muestra.fecha_recepcion_muestra).toLocaleDateString() : '-'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: muestra.estado_muestra === 'Recibida' ? '#10b981' :
                                     muestra.estado_muestra === 'En análisis' ? '#f59e0b' :
                                     muestra.estado_muestra === 'Evaluada' ? '#3b82f6' :
                                     muestra.estado_muestra === 'Certificada' ? '#059669' : '#ef4444'
                    }}>
                      {muestra.estado_muestra}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => onView(muestra.id_muestra)}
                        style={styles.viewButton}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => onEdit(muestra.id_muestra)}
                        style={styles.editButton}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(muestra)}
                        style={styles.deleteButton}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Vista de Detalle de Muestra
function MuestraDetalle({ muestraId, onBack }) {
  const [muestra, setMuestra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMuestra();
  }, [muestraId]);

  const loadMuestra = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiCall('/muestra/get', [
        muestraId, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null
      ]);

      if (data && data.length > 0) {
        setMuestra(data[0]);
      } else {
        setError('Muestra no encontrada');
      }
    } catch (err) {
      setError('Error al cargar muestra: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando detalles...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!muestra) return <div style={styles.error}>Muestra no encontrada</div>;

  return (
    <div style={styles.detalleContainer}>
      <div style={styles.detalleHeader}>
        <h2 style={styles.detalleTitle}>Detalle de Muestra</h2>
        <button onClick={onBack} style={styles.backButton}>
          ← Volver
        </button>
      </div>

      <div style={styles.detalleContent}>
        {/* Información General */}
        <div style={styles.detalleSection}>
          <h3 style={styles.detalleSectionTitle}>Información General</h3>
          <div style={styles.detalleGrid}>
            <div style={styles.detalleItem}>
              <strong>Código:</strong>
              <span>{muestra.codigo_muestra}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Estado:</strong>
              <span style={{
                ...styles.badge,
                backgroundColor: muestra.estado_muestra === 'Recibida' ? '#10b981' :
                               muestra.estado_muestra === 'En análisis' ? '#f59e0b' :
                               muestra.estado_muestra === 'Evaluada' ? '#3b82f6' :
                               muestra.estado_muestra === 'Certificada' ? '#059669' : '#ef4444'
              }}>
                {muestra.estado_muestra}
              </span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Tipo de Muestra:</strong>
              <span>{muestra.nombre_tipo_muestra}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Producto:</strong>
              <span>{muestra.nombre_producto_muestra}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Condición:</strong>
              <span>{muestra.condicion_muestra || '-'}</span>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div style={styles.detalleSection}>
          <h3 style={styles.detalleSectionTitle}>Fechas</h3>
          <div style={styles.detalleGrid}>
            <div style={styles.detalleItem}>
              <strong>Fecha de Recepción:</strong>
              <span>
                {muestra.fecha_recepcion_muestra ? 
                  new Date(muestra.fecha_recepcion_muestra).toLocaleDateString() : '-'}
              </span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Fecha de Vencimiento:</strong>
              <span>
                {muestra.fecha_vencimiento_muestra ? 
                  new Date(muestra.fecha_vencimiento_muestra).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Empresas y Laboratorio */}
        <div style={styles.detalleSection}>
          <h3 style={styles.detalleSectionTitle}>Empresas y Laboratorio</h3>
          <div style={styles.detalleGrid}>
            <div style={styles.detalleItem}>
              <strong>Fabricante:</strong>
              <span>{muestra.nombre_fabricante || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Distribuidor:</strong>
              <span>{muestra.nombre_distribuidor || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Laboratorio:</strong>
              <span>{muestra.nombre_lab || '-'}</span>
            </div>
          </div>
        </div>

        {/* Condiciones */}
        <div style={styles.detalleSection}>
          <h3 style={styles.detalleSectionTitle}>Condiciones</h3>
          <div style={styles.detalleGrid}>
            <div style={styles.detalleItem}>
              <strong>Transporte:</strong>
              <span>{muestra.condicion_transp_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Almacenamiento:</strong>
              <span>{muestra.condicion_almac_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Temperatura:</strong>
              <span>{muestra.temperatura_muestra ? `${muestra.temperatura_muestra} °C` : '-'}</span>
            </div>
          </div>
        </div>

        {/* Características Físicas */}
        <div style={styles.detalleSection}>
          <h3 style={styles.detalleSectionTitle}>Características Físicas</h3>
          <div style={styles.detalleGrid}>
            <div style={styles.detalleItem}>
              <strong>Color:</strong>
              <span>{muestra.color_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Olor:</strong>
              <span>{muestra.olor_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Sabor:</strong>
              <span>{muestra.sabor_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Aspecto:</strong>
              <span>{muestra.aspecto_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Textura:</strong>
              <span>{muestra.textura_muestra || '-'}</span>
            </div>
            <div style={styles.detalleItem}>
              <strong>Peso Neto:</strong>
              <span>{muestra.peso_neto_muestra ? `${muestra.peso_neto_muestra} g` : '-'}</span>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {muestra.observaciones_muestra && (
          <div style={styles.detalleSection}>
            <h3 style={styles.detalleSectionTitle}>Observaciones</h3>
            <p style={styles.observaciones}>{muestra.observaciones_muestra}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function GestionarMuestras({ user }) {
  const [view, setView] = useState('table'); // 'table', 'form', 'detail'
  const [selectedMuestraId, setSelectedMuestraId] = useState(null);

  const handleEdit = (id) => {
    setSelectedMuestraId(id);
    setView('form');
  };

  const handleView = (id) => {
    setSelectedMuestraId(id);
    setView('detail');
  };

  const handleSave = () => {
    setView('table');
    setSelectedMuestraId(null);
  };

  const handleCancel = () => {
    setView('table');
    setSelectedMuestraId(null);
  };

  const handleBack = () => {
    setView('table');
    setSelectedMuestraId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de Muestras</h1>
      </div>

      {view === 'table' && (
        <MuestrasTable onEdit={handleEdit} onView={handleView} />
      )}

      {view === 'form' && (
        <MuestraForm
          muestraId={selectedMuestraId}
          onSave={handleSave}
          onCancel={handleCancel}
          currentUser={user}
        />
      )}

      {view === 'detail' && (
        <MuestraDetalle
          muestraId={selectedMuestraId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

// ==================== ESTILOS ====================
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '20px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #fecaca'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  section: {
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '20px'
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  tableContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  filtersSection: {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  filtersTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '15px'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  clearButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px',
    color: '#374151'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#9ca3af'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  editButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  detalleContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  detalleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e5e7eb'
  },
  detalleTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  backButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  detalleContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  detalleSection: {
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  detalleSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '20px'
  },
  detalleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  detalleItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  observaciones: {
    color: '#374151',
    lineHeight: '1.6',
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    margin: 0
  }
};