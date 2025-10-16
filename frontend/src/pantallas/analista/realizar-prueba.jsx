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

// ==================== HELPER FUNCTIONS ====================
const formatSentenceCase = (texto) => {
  if (!texto) return '';
  
  const palabrasMinusculas = ['de', 'del', 'la', 'el', 'los', 'las', 'y', 'o', 'a', 'en'];
  const palabras = texto.toLowerCase().split(' ');
  
  return palabras.map((palabra) => {
    if (palabrasMinusculas.includes(palabra)) {
      return palabra;
    }
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
  }).join(' ');
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function RealizarPrueba({ idMuestra, idTipoPrueba, idAsignacion, idPrueba, user, onBack }) {
  console.log('Props recibidas en RealizarPrueba:', {
    idMuestra,
    idTipoPrueba,
    idAsignacion,
    idPrueba
  });

  const [prueba, setPrueba] = useState(null);
  const [tipoPrueba, setTipoPrueba] = useState(null);
  const [muestra, setMuestra] = useState(null);
  const [parametros, setParametros] = useState([]);
  const [resultados, setResultados] = useState({});
  const [resultadosExistentes, setResultadosExistentes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPrueba();
  }, [idPrueba]);

  const loadPrueba = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener datos de la prueba
      const pruebaData = await apiCall('/prueba/get', [
        idPrueba, null, null, null, null, null, null, null, null, null
      ]);

      if (pruebaData && pruebaData.length > 0) {
        setPrueba(pruebaData[0]);
      } else {
        setError('Prueba no encontrada');
        return;
      }

      // Obtener tipo de prueba
      const tipoPruebaData = await apiCall('/tipoprueba/get', [
        idTipoPrueba, null, null, null
      ]);

      if (tipoPruebaData && tipoPruebaData.length > 0) {
        setTipoPrueba(tipoPruebaData[0]);
      }

      // Obtener muestra
      const muestraData = await apiCall('/muestra/get', [
        idMuestra, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null
      ]);

      if (muestraData && muestraData.length > 0) {
        setMuestra(muestraData[0]);

        // Obtener parámetros del tipo de muestra
        const parametrosDelTipoMuestra = await apiCall('/parametrodetipomuestra/get', [
          muestraData[0].id_tipo_muestra, null
        ]);

        if (parametrosDelTipoMuestra && parametrosDelTipoMuestra.length > 0) {
          // Obtener detalles completos de cada parámetro con sus límites
          const parametrosCompletos = [];
          
          for (const ptm of parametrosDelTipoMuestra) {
            const parametroData = await apiCall('/parametro/get', [
              ptm.id_parametro, null, null, null, null, null, null, true, null, null
            ]);

            if (parametroData && parametroData.length > 0) {
              const param = parametroData[0];
              
              // Filtrar por tipo de prueba
              if (param.id_tipo_prueba === idTipoPrueba || param.id_tipo_prueba === null) {
        
                // Obtener límites de confianza para este parámetro
                const limitesData = await apiCall('/limitesdeconfianza/get', [
                  param.id_parametro, null, null, null, null, true, null, null
                ]);
        
                // Agregar límites al parámetro
                param.limites = limitesData || [];
        
                parametrosCompletos.push(param);
              }
            }
          }

          setParametros(parametrosCompletos);

          // Cargar resultados existentes
          const resultadosTemp = {};
          const resultadosExistTemp = {};
  
          for (const param of parametrosCompletos) {
            const resultadoData = await apiCall('/resultado/get', [
              idPrueba, param.id_parametro, null, null, null, null, null, null
            ]);

            if (resultadoData && resultadoData.length > 0) {
              const res = resultadoData[0];
              resultadosExistTemp[param.id_parametro] = true;
              
              if (param.tipo_parametro === 'Numérico') {
                resultadosTemp[param.id_parametro] = {
                  valor: res.resultado_numerico !== null ? res.resultado_numerico : '',
                  observaciones: res.observaciones_resultado || ''
                };
              } else {
                // Para tipo texto, cargar los checkboxes marcados
                const valoresSeleccionados = res.resultado_texto ? res.resultado_texto.split('; ') : [];
                resultadosTemp[param.id_parametro] = {
                  valor: valoresSeleccionados,
                  observaciones: res.observaciones_resultado || ''
                };
              }
            } else {
              resultadosTemp[param.id_parametro] = {
                valor: param.tipo_parametro === 'Texto' ? [] : '',
                observaciones: ''
              };
            }
          }

          setResultados(resultadosTemp);
          setResultadosExistentes(resultadosExistTemp);
        }
      }

    } catch (err) {
      setError('Error al cargar prueba: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleResultadoChange = (idParametro, field, value) => {
    setResultados(prev => ({
      ...prev,
      [idParametro]: {
        ...prev[idParametro],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (idParametro, opcion, isChecked) => {
    setResultados(prev => {
      const currentValores = prev[idParametro]?.valor || [];
      let newValores;
    
      if (isChecked) {
        newValores = [...currentValores, opcion];
      } else {
        newValores = currentValores.filter(v => v !== opcion);
      }
    
      return {
        ...prev,
        [idParametro]: {
          ...prev[idParametro],
          valor: newValores
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');

      // Validar que todos los parámetros tengan valor
      for (const param of parametros) {
        const resultado = resultados[param.id_parametro];
        
        if (param.tipo_parametro === 'Numérico') {
          if (!resultado || !resultado.valor || resultado.valor === '') {
            setError(`El parámetro "${param.nombre_parametro}" es obligatorio`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          
          const numero = parseFloat(resultado.valor);
          if (isNaN(numero)) {
            setError(`El parámetro "${param.nombre_parametro}" debe ser un número válido`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        } else {
          // Para tipo texto, validar que al menos una opción esté seleccionada
          if (!resultado || !resultado.valor || resultado.valor.length === 0) {
            setError(`Debe seleccionar al menos una opción para "${param.nombre_parametro}"`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      }

      console.log('=== INICIO GUARDADO ===');
      console.log('ID Prueba:', idPrueba);

      // Guardar cada resultado
      for (const param of parametros) {
        const resultado = resultados[param.id_parametro];
        const operacion = resultadosExistentes[param.id_parametro] ? 2 : 1;

        let resultadoNumerico = null;
        let resultadoTexto = null;

        if (param.tipo_parametro === 'Numérico') {
          resultadoNumerico = parseFloat(resultado.valor);
        } else {
          // Construir el string para tipo texto con formato: SÍ/NO - opción
          const todasLasOpciones = [];
          
          // Obtener todas las opciones posibles de los límites
          if (param.limites && param.limites.length > 0) {
            param.limites.forEach(limite => {
              if (limite.valor_texto_limite_parametro) {
                const opciones = limite.valor_texto_limite_parametro.split('; ');
                todasLasOpciones.push(...opciones);
              }
            });
          }

          // Construir array con formato "SÍ - opcion" o "NO - opcion"
          const resultadosFormateados = todasLasOpciones.map(opcion => {
            const estaCotejado = resultado.valor.includes(opcion);
            return estaCotejado ? `SÍ - ${opcion}` : `NO - ${opcion}`;
          });

          resultadoTexto = resultadosFormateados.join('; ');
        }

        console.log(`\nGuardando parámetro: ${param.nombre_parametro}`);
        console.log('Operación:', operacion === 1 ? 'CREAR' : 'ACTUALIZAR');
        console.log('Datos a enviar:', {
          operacion,
          idPrueba,
          idParametro: param.id_parametro,
          resultadoNumerico,
          resultadoTexto,
          observaciones: resultado.observaciones || null
        });

        const response = await apiCall('/resultado/set', [
          operacion,
          idPrueba,
          param.id_parametro,
          resultadoNumerico,
          resultadoTexto,
          resultado.observaciones || null
        ]);

        console.log('Respuesta del backend:', response);
      }

      console.log('=== FIN GUARDADO ===');

      setSuccess('Resultados guardados exitosamente. Redirigiendo...');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        if (onBack) {
          onBack();
        }
      }, 2000);

    } catch (err) {
      setError('Error al guardar resultados: ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error('Error completo:', err);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando datos de la prueba...</div>;
  if (error && !prueba) return <div style={styles.error}>{error}</div>;
  if (!prueba) return <div style={styles.error}>Prueba no encontrada</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            Realización de Prueba {tipoPrueba ? formatSentenceCase(tipoPrueba.nombre_tipo_prueba) : ''}
          </h1>
          <h2 style={styles.subtitle}>{prueba.codigo_prueba}</h2>
        </div>
        <div style={styles.headerRight}>
          <button onClick={handleVolver} style={styles.backButton}>
            ← Tu Asignación
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.content}>
        <form onSubmit={handleSubmit}>
          {/* Formulario de Parámetros */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Parámetros de la Prueba</h3>
            
            {parametros.length === 0 && (
              <div style={styles.placeholderBox}>
                <p style={styles.placeholderText}>
                  No hay parámetros configurados para esta prueba
                </p>
              </div>
            )}

            <div style={styles.formGrid}>
              {parametros.map((param) => {
                const resultado = resultados[param.id_parametro] || { valor: '', observaciones: '' };
                
                return (
                  <div key={param.id_parametro} style={styles.parametroCard}>
                    <div style={styles.parametroHeader}>
                      <h4 style={styles.parametroTitle}>{param.nombre_parametro} *</h4>
                      <span style={styles.parametroTipo}>
                        {param.tipo_parametro}
                        {param.unidad_medida_parametro && ` (${param.unidad_medida_parametro})`}
                      </span>
                    </div>
                    
                    {param.descripcion_parametro && (
                      <p style={styles.parametroDescripcion}>{param.descripcion_parametro}</p>
                    )}

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Valor {param.unidad_medida_parametro ? `(${param.unidad_medida_parametro})` : ''} *
                      </label>
                      
                      {param.tipo_parametro === 'Numérico' ? (
                        <input
                          type="number"
                          step="0.01"
                          value={resultado.valor}
                          onChange={(e) => handleResultadoChange(param.id_parametro, 'valor', e.target.value)}
                          required
                          style={styles.input}
                          placeholder="Ingrese valor numérico"
                        />
                      ) : (
                        <div style={styles.checkboxContainer}>
                          {param.limites && param.limites.length > 0 ? (
                            param.limites.map((limite, index) => {
                              if (limite.valor_texto_limite_parametro) {
                                const opciones = limite.valor_texto_limite_parametro.split('; ');
                                return opciones.map((opcion, optIndex) => {
                                  const isChecked = resultado.valor && resultado.valor.includes(opcion);
                                  return (
                                    <div key={`${index}-${optIndex}`} style={styles.checkboxItem}>
                                      <input
                                        type="checkbox"
                                        id={`param-${param.id_parametro}-opt-${index}-${optIndex}`}
                                        checked={isChecked}
                                        onChange={(e) => handleCheckboxChange(param.id_parametro, opcion, e.target.checked)}
                                        style={styles.checkbox}
                                      />
                                      <label 
                                        htmlFor={`param-${param.id_parametro}-opt-${index}-${optIndex}`}
                                        style={styles.checkboxLabel}
                                      >
                                        {opcion}
                                      </label>
                                    </div>
                                  );
                                });
                              }
                              return null;
                            })
                          ) : (
                            <p style={styles.noOptionsText}>No hay opciones configuradas para este parámetro</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Observaciones</label>
                      <textarea
                        value={resultado.observaciones}
                        onChange={(e) => handleResultadoChange(param.id_parametro, 'observaciones', e.target.value)}
                        rows="3"
                        style={styles.textarea}
                        placeholder="(Opcional) Observaciones sobre el resultado..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón Guardar */}
          {parametros.length > 0 && (
            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitButton}>
                💾 Guardar Prueba
              </button>
            </div>
          )}
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px'
  },
  parametroCard: {
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px'
  },
  parametroHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    gap: '10px'
  },
  parametroTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    flex: 1
  },
  parametroTipo: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    padding: '4px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap'
  },
  parametroDescripcion: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px'
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
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box'
  },
  placeholderBox: {
    backgroundColor: '#f9fafb',
    padding: '40px',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
    textAlign: 'center'
  },
  placeholderText: {
    fontSize: '18px',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: 0
  },
  buttonGroup: {
    display: 'flex',
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
  },
  checkboxContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px'
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#3b82f6'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
    flex: 1
  },
  noOptionsText: {
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  }
};