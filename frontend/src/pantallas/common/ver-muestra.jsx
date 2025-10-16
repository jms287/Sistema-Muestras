import React, { useState, useEffect } from 'react';
import { formatDateShort, formatDateLong, dbToDateInput, getTodayForInput } from '../../utils/dateUtils';

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

// Helper para extraer valores de enums
const extractEnumValue = (item) => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const keys = Object.keys(item);
    return keys.length > 0 ? item[keys[0]] : String(item);
  }
  return String(item);
};

// Helper para formatear valores booleanos
const formatBoolean = (value) => {
  if (value === null || value === undefined) return '–';
  return value ? 'Sí' : 'No';
};

// Helper para formatear valores nulos
const formatValue = (value, suffix = '') => {
  if (value === null || value === undefined || value === '') return '–';
  return `${value}${suffix}`;
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function VerMuestra({ muestraId, user, onBack, onUpdate, onVerAsignacion }) {
  const [muestra, setMuestra] = useState(null);
  const [asignacionEnProceso, setAsignacionEnProceso] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para formulario de edición
  const [formData, setFormData] = useState(null);
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

  useEffect(() => {
    loadMuestra();
  }, [muestraId]);

  const loadMuestra = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = await apiCall('/muestra/get', [
        muestraId, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null
      ]);

      if (data && data.length > 0) {
        const muestraData = data[0];
        
        try {
          const [
            solicitantes,
            fabricantes,
            distribuidores,
            tiposMuestra,
            laboratorios
          ] = await Promise.all([
            apiCall('/usuario/get', [muestraData.id_solicitante_muestra, null, null, null, null, null, null, null, null, null, null, null, null, null]),
            apiCall('/empresa/get', [muestraData.id_emp_fabricante_muestra, null, null, null, null, null, null, null, null, null, null, null]),
            apiCall('/empresa/get', [muestraData.id_emp_distribuidor_muestra, null, null, null, null, null, null, null, null, null, null, null]),
            apiCall('/tipomuestra/get', [muestraData.id_tipo_muestra, null, null, null]),
            apiCall('/laboratorio/get', [muestraData.id_lab_muestra, null, null, null, null, null, null, null, null, null])
          ]);
          
          muestraData.nombre_solicitante = solicitantes && solicitantes.length > 0 ? solicitantes[0].nombre_usuario : '–';
          muestraData.nombre_fabricante = fabricantes && fabricantes.length > 0 ? fabricantes[0].nombre_comercial_emp : '–';
          muestraData.nombre_distribuidor = distribuidores && distribuidores.length > 0 ? distribuidores[0].nombre_comercial_emp : '–';
          muestraData.nombre_tipo_muestra = tiposMuestra && tiposMuestra.length > 0 ? tiposMuestra[0].nombre_tipo_muestra : '–';
          muestraData.nombre_lab = laboratorios && laboratorios.length > 0 ? laboratorios[0].nombre_lab : '–';

        } catch (err) {
          console.error('Error cargando nombres relacionados:', err);
          muestraData.nombre_solicitante = 'Error al cargar';
          muestraData.nombre_fabricante = 'Error al cargar';
          muestraData.nombre_distribuidor = 'Error al cargar';
          muestraData.nombre_tipo_muestra = 'Error al cargar';
          muestraData.nombre_lab = 'Error al cargar';
        }
        
        setMuestra(muestraData);
        setFormData({
          id_solicitante_muestra: muestraData.id_solicitante_muestra || '',
          id_emp_fabricante_muestra: muestraData.id_emp_fabricante_muestra || '',
          id_emp_distribuidor_muestra: muestraData.id_emp_distribuidor_muestra || '',
          id_tipo_muestra: muestraData.id_tipo_muestra || '',
          nombre_producto_muestra: muestraData.nombre_producto_muestra || '',
          condicion_muestra: muestraData.condicion_muestra || '',
          fecha_recepcion_muestra: dbToDateInput(muestraData.fecha_recepcion_muestra),
          id_lab_muestra: muestraData.id_lab_muestra || '',
          condicion_transp_muestra: muestraData.condicion_transp_muestra || '',
          condicion_almac_muestra: muestraData.condicion_almac_muestra || '',
          temperatura_muestra: muestraData.temperatura_muestra || '',
          color_muestra: muestraData.color_muestra || '',
          olor_muestra: muestraData.olor_muestra || '',
          sabor_muestra: muestraData.sabor_muestra || '',
          aspecto_muestra: muestraData.aspecto_muestra || '',
          textura_muestra: muestraData.textura_muestra || '',
          peso_neto_muestra: muestraData.peso_neto_muestra || '',
          fecha_vencimiento_muestra: dbToDateInput(muestraData.fecha_vencimiento_muestra),
          observaciones_muestra: muestraData.observaciones_muestra || ''
        });

        // Si el usuario es rol 2, 3 o 4, buscar su asignación en proceso para esta muestra
        if (user.id_rol_usuario === 2 || user.id_rol_usuario === 3 || user.id_rol_usuario === 4) {
          try {
            const asignacionesData = await apiCall('/asignacion/get', [
              null,
              user.id_usuario,
              muestraId,
              null,
              'En proceso',
              null, null, null, null, null, null, null
            ]);

            if (asignacionesData && asignacionesData.length > 0) {
              setAsignacionEnProceso(asignacionesData[0]);
            }
          } catch (err) {
            console.error('Error buscando asignación en proceso:', err);
          }
        }
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

  const loadFormData = async () => {
    try {
      setError(''); // Limpiar errores previos

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
      console.error('Error cargando datos del formulario:', err);
      setError('Error al cargar datos para edición');
    }
  };

  const handleEdit = async () => {
    await loadFormData();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Restaurar datos originales
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setError('');
      setSuccess('');

      // Validaciones
      if (!formData.id_solicitante_muestra || !formData.id_emp_fabricante_muestra || 
          !formData.id_emp_distribuidor_muestra || !formData.id_tipo_muestra || 
          !formData.nombre_producto_muestra || !formData.condicion_muestra ||
          !formData.fecha_recepcion_muestra || !formData.id_lab_muestra ||
          !formData.condicion_transp_muestra || !formData.condicion_almac_muestra) {
        setError('Por favor complete todos los campos obligatorios');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Validar que la fecha de recepción no sea posterior a la fecha de creación
      const fechaRecepcion = new Date(formData.fecha_recepcion_muestra);
      const fechaCreacion = new Date(muestra.fecha_creacion_muestra);
      if (fechaRecepcion > fechaCreacion) {
        setError('La fecha de recepción no puede ser posterior a la fecha de creación del registro');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        muestra.muestra_validada, // mantener el estado actual de validación
        null // id_usuario_registro (null en edición)
      ];

      await apiCall('/muestra/set', args);
      setSuccess('Muestra actualizada exitosamente');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(async () => {
        setIsEditing(false);
        await loadMuestra();
        if (onUpdate) onUpdate();
      }, 2000);

    } catch (err) {
      setError('Error al actualizar: ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handleDescartar = async () => {
    if (!window.confirm(`¿Está seguro de descartar la muestra ${muestra.codigo_muestra}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await apiCall('/muestra/set', [3, muestraId]); // Operación 3 = descartar
      setSuccess('Muestra descartada exitosamente');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    
      setTimeout(() => {
        if (onBack) onBack();
        if (onUpdate) onUpdate();
      }, 2000);
    } catch (err) {
      setError('Error al descartar muestra: ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handleToggleValidacion = async () => {
    const accion = muestra.muestra_validada ? 'invalidar' : 'validar';
    const nuevoEstado = !muestra.muestra_validada;

    if (!window.confirm(`¿Está seguro de ${accion} la muestra ${muestra.codigo_muestra}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const args = [
        2, // operación editar
        muestraId,
        muestra.id_solicitante_muestra,
        muestra.id_emp_fabricante_muestra,
        muestra.id_emp_distribuidor_muestra,
        muestra.id_tipo_muestra,
        muestra.nombre_producto_muestra,
        muestra.condicion_muestra,
        muestra.fecha_recepcion_muestra.split('T')[0],
        muestra.id_lab_muestra,
        muestra.condicion_transp_muestra,
        muestra.condicion_almac_muestra,
        muestra.temperatura_muestra,
        muestra.color_muestra,
        muestra.olor_muestra,
        muestra.sabor_muestra,
        muestra.aspecto_muestra,
        muestra.textura_muestra,
        muestra.peso_neto_muestra,
        muestra.fecha_vencimiento_muestra ? muestra.fecha_vencimiento_muestra.split('T')[0] : null,
        muestra.observaciones_muestra,
        nuevoEstado, // cambiar el estado de validación
        null
      ];

      await apiCall('/muestra/set', args);
      setSuccess(`Muestra ${accion === 'validar' ? 'validada' : 'invalidada'} exitosamente`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    
      setTimeout(async () => {
        await loadMuestra();
        if (onUpdate) onUpdate();
      }, 1500);

    } catch (err) {
      setError(`Error al ${accion} muestra: ` + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handleVolver = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleVolverAsignacion = () => {
    if (onVerAsignacion && asignacionEnProceso) {
      onVerAsignacion(asignacionEnProceso.id_asignacion, true);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando datos de la muestra...</div>;
  if (error && !muestra) return <div style={styles.error}>{error}</div>;
  if (!muestra) return <div style={styles.error}>Muestra no encontrada</div>;

  const puedeEditar = muestra.estado_muestra !== 'Certificada' && 
                      muestra.estado_muestra !== 'Descartada' &&
                      asignacionEnProceso && 
                      asignacionEnProceso.numero_fase_asignacion === 1;
  const puedeDescartar = user.id_rol_usuario === 1 && muestra.estado_muestra !== 'Certificada';
  const puedeToggleValidacion = user.id_rol_usuario === 4 && muestra.estado_muestra === 'Evaluada';

  const mostrarBotonVolver = !isEditing && (user.id_rol_usuario === 1 || user.id_rol_usuario === 5);
  const mostrarBotonAsignacion = !isEditing && (user.id_rol_usuario === 2 || user.id_rol_usuario === 3 || user.id_rol_usuario === 4) && asignacionEnProceso;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Datos de Muestra</h1>
          <h2 style={styles.subtitle}>{muestra.codigo_muestra}</h2>
        </div>
        <div style={styles.headerRight}>
          {mostrarBotonVolver && (
            <button onClick={handleVolver} style={styles.backButton}>
              ← Volver
            </button>
          )}
          {mostrarBotonAsignacion && (
            <button onClick={handleVolverAsignacion} style={styles.backButton}>
              ← Tu Asignación
            </button>
          )}
          {!isEditing && puedeEditar && (
            <button onClick={handleEdit} style={styles.editButton}>
              ✏️ Editar Muestra
            </button>
          )}
          {!isEditing && puedeDescartar && (
            <button onClick={handleDescartar} style={styles.deleteButton}>
              🗑️ Descartar Muestra
            </button>
          )}
          {!isEditing && puedeToggleValidacion && (
            <button 
              onClick={handleToggleValidacion} 
              style={muestra.muestra_validada ? styles.invalidateButton : styles.validateButton}
            >
              {muestra.muestra_validada ? '✗ Invalidar Muestra' : '✓ Validar Muestra'}
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Vista de solo lectura */}
      {!isEditing && (
        <div style={styles.content}>
          {/* Estado y Validación */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Estado y Validación</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Estado:</label>
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
              <div style={styles.field}>
                <label style={styles.label}>En Proceso:</label>
                <span style={styles.value}>{formatBoolean(muestra.muestra_en_proceso)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Apta para Consumo:</label>
                <span style={styles.value}>{formatBoolean(muestra.muestra_apta_para_consumo)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Validada:</label>
                <span style={styles.value}>{formatBoolean(muestra.muestra_validada)}</span>
              </div>
            </div>
          </div>

          {/* Información Básica */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Información Básica</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Solicitante:</label>
                <span style={styles.value}>{formatValue(muestra.nombre_solicitante)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Tipo de Muestra:</label>
                <span style={styles.value}>{formatValue(muestra.nombre_tipo_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nombre del Producto:</label>
                <span style={styles.value}>{formatValue(muestra.nombre_producto_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Condición de la Muestra:</label>
                <span style={styles.value}>{formatValue(muestra.condicion_muestra)}</span>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Fechas</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de Recepción:</label>
                <span style={styles.value}>{formatDateShort(muestra.fecha_recepcion_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de Vencimiento:</label>
                <span style={styles.value}>{formatDateShort(muestra.fecha_vencimiento_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de Creación:</label>
                <span style={styles.value}>{formatDateShort(muestra.fecha_creacion_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Última Actualización:</label>
                <span style={styles.value}>{formatDateShort(muestra.fecha_actualizacion_muestra)}</span>
              </div>
            </div>
          </div>

          {/* Empresas y Laboratorio */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Empresas y Laboratorio</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Fabricante:</label>
                <span style={styles.value}>{formatValue(muestra.nombre_fabricante)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Distribuidor:</label>
                <span style={styles.value}>{formatValue(muestra.nombre_distribuidor)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Laboratorio:</label>
                <span style={styles.value}>{formatValue(muestra.nombre_lab)}</span>
              </div>
            </div>
          </div>

          {/* Condiciones */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Condiciones</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Condición de Transporte:</label>
                <span style={styles.value}>{formatValue(muestra.condicion_transp_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Condición de Almacenamiento:</label>
                <span style={styles.value}>{formatValue(muestra.condicion_almac_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Temperatura:</label>
                <span style={styles.value}>{formatValue(muestra.temperatura_muestra, ' °C')}</span>
              </div>
            </div>
          </div>

          {/* Características Físicas */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Características Físicas</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Color:</label>
                <span style={styles.value}>{formatValue(muestra.color_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Olor:</label>
                <span style={styles.value}>{formatValue(muestra.olor_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Sabor:</label>
                <span style={styles.value}>{formatValue(muestra.sabor_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Aspecto:</label>
                <span style={styles.value}>{formatValue(muestra.aspecto_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Textura:</label>
                <span style={styles.value}>{formatValue(muestra.textura_muestra)}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Peso Neto:</label>
                <span style={styles.value}>{formatValue(muestra.peso_neto_muestra, ' g')}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {muestra.observaciones_muestra && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Observaciones</h3>
              <p style={styles.observaciones}>{muestra.observaciones_muestra}</p>
            </div>
          )}
        </div>
      )}

      {/* Vista de edición */}
      {isEditing && (
        <div style={styles.content}>
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
                  disabled
                  style={{...styles.input, ...styles.inputDisabled}}
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
                  max={dbToDateInput(muestra.fecha_creacion_muestra)}
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

          {/* Empresas y Laboratorio */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Empresas y Laboratorio</h3>
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

          {/* Condiciones */}
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

          {/* Botones de acción */}
          <div style={styles.buttonGroup}>
            <button onClick={handleCancelEdit} style={styles.cancelButton}>
              Cancelar
            </button>
            <button onClick={handleSaveEdit} style={styles.saveButton}>
              Guardar Cambios
            </button>
          </div>
        </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#3b82f6',
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
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  editButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  validateButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  invalidateButton: {
    backgroundColor: '#f97316',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
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
  content: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  section: {
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '25px',
    marginBottom: '25px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280'
  },
  value: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '500'
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    width: 'fit-content'
  },
  observaciones: {
    color: '#374151',
    lineHeight: '1.6',
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    margin: 0,
    fontSize: '15px'
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
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
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed'
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
  saveButton: {
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
  }
};