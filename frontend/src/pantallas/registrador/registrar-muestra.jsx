import React, { useState, useEffect } from 'react';
import { getTodayForInput } from '../../utils/dateUtils';

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

// ==================== COMPONENTE PRINCIPAL ====================

export default function RegistrarMuestra({ user, onMuestraCreada }) {
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
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

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
      setSuccess('');

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
        1, // operación: 1 = crear
        null, // id_muestra (null para crear)
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
        user.id_usuario // id_usuario_registro
      ];

      await apiCall('/muestra/set', args);
      setSuccess('Muestra registrada exitosamente. Redirigiendo...');
    
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(async () => {
        try {
          const asignaciones = await apiCall('/asignacion/get', [
            null, // id_asignacion
            user.id_usuario, // id_usuario - el registrador que acaba de crear la muestra
            null, // id_muestra
            null, // numero_fase_asignacion
            null, // estado_asignacion
            null, null, null, null, null, null, null
          ]);

          if (asignaciones && asignaciones.length > 0) {
            // Ordenar por id_asignacion descendente y tomar la primera (última creada)
            const asignacionesOrdenadas = asignaciones.sort((a, b) => b.id_asignacion - a.id_asignacion);
            const ultimaAsignacion = asignacionesOrdenadas[0];
            
            // Navegar a ver-muestra usando el id_muestra de la última asignación
            if (onMuestraCreada) {
              onMuestraCreada(ultimaAsignacion.id_muestra);
            }
          }
        } catch (err) {
          console.error('Error obteniendo muestra creada:', err);
          // Si falla, al menos mostrar el éxito
        }
      }, 2000);
    } catch (err) {
      setError('Error al registrar muestra: ' + err.message);
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando formulario...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Registro de Nueva Muestra</h1>
      </div>

      <div style={styles.formContainer}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

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
                  max={getTodayForInput()}
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
            <button type="submit" style={styles.submitButton}>
              Registrar Muestra
            </button>
          </div>
        </form>
      </div>
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
  success: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #6ee7b7'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box'
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
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  }
};