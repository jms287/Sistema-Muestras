import React, { useState, useEffect } from 'react';
import { formatDateTime, formatDateShort } from '../../utils/dateUtils';

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

// ==================== COMPONENTE PRINCIPAL ====================
export default function VerAsignacion({ asignacionId, user, onBack, onVerMuestra, onRealizarPrueba, vieneDeVerMuestra = false, refreshToken = 0 }) {
  const [asignacion, setAsignacion] = useState(null);
  const [muestra, setMuestra] = useState(null);
  const [codigoMuestra, setCodigoMuestra] = useState('');
  const [tipoMuestra, setTipoMuestra] = useState('');
  const [nombreSolicitante, setNombreSolicitante] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para acciones completadas
  const [accionCompletada, setAccionCompletada] = useState(false);
  
  // Estados para fase 2 - Pruebas
  const [tiposPrueba, setTiposPrueba] = useState([]);
  const [estadosPruebas, setEstadosPruebas] = useState({});
  
  // Estados para contexto de fase anterior/posterior
  const [motivosDevolucion, setMotivosDevolucion] = useState(null);
  const [comentariosFaseAnterior, setComentariosFaseAnterior] = useState(null);
  
  // Estados para modales
  const [showDevolverModal, setShowDevolverModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [motivosDevolucionInput, setMotivosDevolucionInput] = useState('');
  const [comentariosSiguienteFaseInput, setComentariosSiguienteFaseInput] = useState('');
  const [confirmarDevolver, setConfirmarDevolver] = useState(false);
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false);

  const getEtiquetasContexto = (faseOverride = null) => {
    const rol = user?.id_rol_usuario;
    const fase = faseOverride ?? asignacion?.numero_fase_asignacion;

    if (rol === 2 || fase === 1) {
      return {
        titulo: 'Muestra',
        plural: 'Muestras',
        volver: 'Ver Muestras Registradas',
        fechas: 'Fechas del Registro',
        loading: 'Cargando datos de la muestra...',
        notFound: 'Muestra no encontrada',
        errorLoad: 'Error al cargar muestra',
        devolver: 'Devolver Muestra',
        finalizar: 'Finalizar Registro'
      };
    }

    if (rol === 3 || fase === 2) {
      return {
        titulo: 'Muestra',
        plural: 'Pruebas',
        volver: 'Ver Pruebas',
        fechas: 'Fechas de las Pruebas',
        loading: 'Cargando datos de la muestra...',
        notFound: 'Muestra no encontrada',
        errorLoad: 'Error al cargar muestra',
        devolver: 'Devolver Muestra',
        finalizar: 'Finalizar Muestra'
      };
    }

    if (rol === 4 || fase === 3) {
      return {
        titulo: 'Evaluación',
        plural: 'Evaluaciones',
        volver: 'Evaluar Muestras',
        fechas: 'Fechas de la Evaluación',
        loading: 'Cargando datos de la evaluación...',
        notFound: 'Evaluación no encontrada',
        errorLoad: 'Error al cargar evaluación',
        devolver: 'Devolver Evaluación',
        finalizar: 'Finalizar Evaluación'
      };
    }

    return {
      titulo: 'Actividad',
      plural: 'Actividades',
      volver: 'Ver Actividades',
      fechas: 'Fechas de la Actividad',
      loading: 'Cargando datos de la actividad...',
      notFound: 'Actividad no encontrada',
      errorLoad: 'Error al cargar actividad',
      devolver: 'Devolver Actividad',
      finalizar: 'Finalizar Actividad'
    };
  };

  // Establecer estado completado si viene de ver-muestra y es fase 1
  useEffect(() => {
    if (vieneDeVerMuestra && asignacion && asignacion.numero_fase_asignacion === 1) {
      setAccionCompletada(true);
    }
  }, [vieneDeVerMuestra, asignacion]);

  useEffect(() => {
    loadAsignacion();
  }, [asignacionId, refreshToken]);

  const loadAsignacion = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Obtener asignación actual
      const data = await apiCall('/asignacion/get', [
        asignacionId, null, null, null, null, null, null, null, null, null, null, null
      ]);

      if (data && data.length > 0) {
        const asignacionData = data[0];
        setAsignacion(asignacionData);

        // Obtener muestra completa
        const muestraData = await apiCall('/muestra/get', [
          asignacionData.id_muestra, null, null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null
        ]);
        
        if (muestraData && muestraData.length > 0) {
          setMuestra(muestraData[0]);
          setCodigoMuestra(muestraData[0].codigo_muestra);

          // Obtener tipo de muestra
          if (muestraData[0].id_tipo_muestra) {
            const tipoData = await apiCall('/tipomuestra/get', [
              muestraData[0].id_tipo_muestra, null, null, null
            ]);
            if (tipoData && tipoData.length > 0) {
              setTipoMuestra(tipoData[0].nombre_tipo_muestra);
            }
          }

          // Obtener nombre del solicitante
          if (muestraData[0].id_solicitante_muestra) {
            const solicitanteData = await apiCall('/usuario/get', [
              muestraData[0].id_solicitante_muestra, 
              null, null, null, null, null, null, null, null, null, null, null, null, null
            ]);
            if (solicitanteData && solicitanteData.length > 0) {
              setNombreSolicitante(solicitanteData[0].nombre_usuario || '–');
            }
          }

          // Si es fase 2 o 3, cargar tipos de prueba y estado de cada prueba
          if (asignacionData.numero_fase_asignacion === 2 || asignacionData.numero_fase_asignacion === 3) {
            await loadPruebasInfo(asignacionData.id_muestra, asignacionData.numero_fase_asignacion);
          }
        }

        // Si es fase 1 o 2, buscar motivos de devolución de fase posterior
        if (asignacionData.numero_fase_asignacion === 1 || asignacionData.numero_fase_asignacion === 2) {
          const asignacionesPosterior = await apiCall('/asignacion/get', [
            null,
            null,
            asignacionData.id_muestra,
            asignacionData.numero_fase_asignacion + 1,
            'Devuelta',
            null, null, null, null, null, null, null
          ]);

          if (asignacionesPosterior && asignacionesPosterior.length > 0) {
            const asignacionMasReciente = asignacionesPosterior.sort((a, b) => 
              new Date(b.fecha_creacion_asignacion) - new Date(a.fecha_creacion_asignacion)
            )[0];
            setMotivosDevolucion(asignacionMasReciente.motivos_devolucion);
          }
        }

        // Si es fase 2 o 3, buscar comentarios de fase anterior
        if (asignacionData.numero_fase_asignacion === 2 || asignacionData.numero_fase_asignacion === 3) {
          const asignacionesAnterior = await apiCall('/asignacion/get', [
            null,
            null,
            asignacionData.id_muestra,
            asignacionData.numero_fase_asignacion - 1,
            null,
            null, null, null, null, null, null, null
          ]);

          if (asignacionesAnterior && asignacionesAnterior.length > 0) {
            const finalizadas = asignacionesAnterior.filter(a => 
              a.estado_asignacion === 'Finalizada' || a.estado_asignacion === 'Finalizada y última'
            ).sort((a, b) => 
              new Date(b.fecha_creacion_asignacion) - new Date(a.fecha_creacion_asignacion)
            );

            if (finalizadas.length > 0) {
              setComentariosFaseAnterior(finalizadas[0].comentarios_a_siguiente_fase);
            }
          }
        }

      } else {
        setError(getEtiquetasContexto().notFound);
      }
    } catch (err) {
      setError(`${getEtiquetasContexto().errorLoad}: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPruebasInfo = async (idMuestra, numeroFase) => {
    try {
      // Obtener todos los tipos de prueba activos
      const tiposPruebaData = await apiCall('/tipoprueba/get', [
        null, null, null, true
      ]);

      if (tiposPruebaData && tiposPruebaData.length > 0) {
        setTiposPrueba(tiposPruebaData);

        // Para cada tipo de prueba, verificar si existe una prueba
        const estadosTemp = {};
        
        for (const tipoPrueba of tiposPruebaData) {
          console.log(`\n=== Verificando tipo de prueba: ${tipoPrueba.nombre_tipo_prueba} ===`);

          const parametrosData = await apiCall('/parametro/get', [
            null,
            null,
            tipoPrueba.id_tipo_prueba,
            null,
            null,
            null,
            null,
            true,
            null,
            null
          ]);

          const parametros = parametrosData || [];
          let resultadosMap = {};
          
          // Buscar si existe una prueba activa para este tipo de prueba y muestra
          const pruebasExistentes = await apiCall('/prueba/get', [
            null, // id_prueba
            null, // codigo_prueba
            idMuestra, // id_muestra
            tipoPrueba.id_tipo_prueba, // id_tipo_prueba
            null, // notas_prueba
            null, // prueba_aprobada
            null, // prueba_validada
            true, // estado_activo_prueba = true
            null, // fecha_creacion_prueba
            null  // fecha_actualizacion_prueba
          ]);

          console.log('Pruebas encontradas:', pruebasExistentes);

          if (pruebasExistentes && pruebasExistentes.length > 0) {
            const prueba = pruebasExistentes[0];
            console.log('Prueba ID:', prueba.id_prueba);
            console.log('Prueba validada (campo):', prueba.prueba_validada);
            
            // Verificar si tiene resultados
            const resultados = await apiCall('/resultado/get', [
              prueba.id_prueba, // id_prueba
              null, // id_parametro
              null, // resultado_numerico
              null, // resultado_texto
              null, // observaciones_resultado
              null, // resultado_dentro_de_limites
              null, // fecha_creacion_resultado
              null  // fecha_actualizacion_resultado
            ]);

            console.log('Resultados encontrados:', resultados);
            const tieneResultados = resultados && resultados.length > 0;
            console.log('¿Tiene resultados?:', tieneResultados);

            resultadosMap = (resultados || []).reduce((acc, resultado) => {
              acc[resultado.id_parametro] = resultado;
              return acc;
            }, {});
            
            // La prueba está validada si el campo prueba_validada es true
            const validada = prueba.prueba_validada === true || prueba.prueba_validada === 1;
            console.log('¿Está validada?:', validada);
            
            estadosTemp[tipoPrueba.id_tipo_prueba] = {
              existe: true,
              tieneResultados: tieneResultados,
              validada: validada,
              idPrueba: prueba.id_prueba,
              parametrosDetalle: parametros.map((parametro) => {
                const resultado = resultadosMap[parametro.id_parametro];
                const valorNumerico = resultado?.resultado_numerico;
                const valorTexto = resultado?.resultado_texto;
                const valor = valorNumerico !== null && valorNumerico !== undefined
                  ? valorNumerico
                  : (valorTexto || null);
                const valorFallback = tieneResultados ? '-' : 'Pendiente';

                return {
                  id: parametro.id_parametro,
                  nombre: parametro.nombre_parametro,
                  valor: valor ?? valorFallback
                };
              })
            };
            
            console.log('Estado final para esta prueba:', estadosTemp[tipoPrueba.id_tipo_prueba]);
          } else {
            console.log('No existe prueba');
            estadosTemp[tipoPrueba.id_tipo_prueba] = {
              existe: false,
              tieneResultados: false,
              validada: false,
              idPrueba: null,
              parametrosDetalle: []
            };
          }
        }

        console.log('\n=== ESTADOS FINALES DE TODAS LAS PRUEBAS ===');
        console.log(estadosTemp);

        setEstadosPruebas(estadosTemp);

        // Determinar si todas las pruebas están completadas
        // Para fase 3: verificar que todas las pruebas EXISTENTES estén validadas
        // Para fase 2: verificar que todas las pruebas EXISTENTES tengan resultados
        let todasCompletadas = false;
        
        if (numeroFase === 3) {
          // En fase 3, verificar que TODAS las pruebas existentes estén validadas
          const pruebasExistentes = tiposPruebaData.filter(tp => 
            estadosTemp[tp.id_tipo_prueba]?.existe === true
          );
          
          console.log('Pruebas existentes:', pruebasExistentes.length);
          
          if (pruebasExistentes.length > 0) {
            todasCompletadas = pruebasExistentes.every(tp => 
              estadosTemp[tp.id_tipo_prueba]?.validada === true
            );
          } else {
            todasCompletadas = false;
          }
          
          console.log('¿Todas las pruebas validadas?:', todasCompletadas);
          
          // En fase 3, también verificar si la muestra está validada
          if (muestra) {
            const muestraValidada = muestra.muestra_validada === true || muestra.muestra_validada === 1;
            console.log('¿Muestra validada?:', muestraValidada);
            const accionFinalCompletada = todasCompletadas && muestraValidada;
            console.log('Acción completada (pruebas + muestra):', accionFinalCompletada);
            setAccionCompletada(accionFinalCompletada);
          } else {
            setAccionCompletada(todasCompletadas);
          }
          
        } else if (numeroFase === 2) {
          // En fase 2, verificar que todas las pruebas tengan resultados
          todasCompletadas = tiposPruebaData.every(tp => {
            const estado = estadosTemp[tp.id_tipo_prueba];
            return estado?.existe && estado?.tieneResultados === true;
          });
          
          console.log('¿Todas completadas (fase 2)?:', todasCompletadas);
          setAccionCompletada(todasCompletadas);
        }
        
      }
    } catch (err) {
      console.error('Error al cargar información de pruebas:', err);
    }
  };

  const verificarPuedeValidarPrueba = async (idPrueba) => {
    try {
      // Obtener la prueba
      const pruebasData = await apiCall('/prueba/get', [
        idPrueba, null, null, null, null, null, null, null, null, null
      ]);

      if (!pruebasData || pruebasData.length === 0) return false;

      const prueba = pruebasData[0];

      // 1. Si ya está validada, retornar true
      if (prueba.prueba_validada === true) return true;

      // 2. Debe tener fecha de ejecución y analista
      if (!prueba.fecha_ejecucion_prueba || !prueba.id_analista_prueba) return false;

      // 3. Obtener parámetros del tipo de prueba
      const parametrosData = await apiCall('/parametro/get', [
        null, null, prueba.id_tipo_prueba, null, null, null, null, null, null, null
      ]);

      if (!parametrosData || parametrosData.length === 0) return false;

      // 4. Verificar que cada parámetro tenga un resultado válido
      for (const parametro of parametrosData) {
        const resultadosData = await apiCall('/resultado/get', [
          null, idPrueba, parametro.id_parametro, null, null, null, null, null
        ]);

        if (!resultadosData || resultadosData.length === 0) return false;

        const resultado = resultadosData[0];

        // Validar que tenga valor, método e incertidumbre
        if (resultado.valor_obtenido_resultado === null || 
            resultado.valor_obtenido_resultado === undefined ||
            !resultado.metodo_usado_resultado ||
            resultado.incertidumbre_resultado === null ||
            resultado.incertidumbre_resultado === undefined) {
          return false;
        }
      }

      return true;

    } catch (err) {
      console.error('Error al verificar si puede validar prueba:', err);
      return false;
    }
  };

  const handleRealizarPrueba = async (idTipoPrueba) => {
    if (!onRealizarPrueba || !muestra) return;

    const estadoPrueba = estadosPruebas[idTipoPrueba];

    // Si ya existe la prueba, navegar directamente con el ID de la prueba existente
    if (estadoPrueba && estadoPrueba.existe && !estadoPrueba.tieneResultados) {
      // Caso "Seguir Prueba" - ya existe pero sin resultados
      onRealizarPrueba({
        idMuestra: muestra.id_muestra,
        idTipoPrueba: idTipoPrueba,
        idAsignacion: asignacionId,
        idPrueba: estadoPrueba.idPrueba
      });
      return;
    }

    // Si no existe, crear la prueba
    try {
      setError('');
      setSuccess('');

      // Crear la prueba (operación 1)
      await apiCall('/prueba/set', [
        1, // operación: crear
        null, // id_prueba (null para crear)
        muestra.id_muestra,
        idTipoPrueba,
        null, // notas_prueba
        false // prueba_validada
      ]);

      setSuccess('Prueba creada exitosamente. Redirigiendo...');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(async () => {
        try {
          // Buscar la prueba recién creada
          const pruebasData = await apiCall('/prueba/get', [
            null, // id_prueba
            null, // codigo_prueba
            muestra.id_muestra, // id_muestra
            idTipoPrueba, // id_tipo_prueba
            null, // notas_prueba
            null, // prueba_aprobada
            null, // prueba_validada
            true, // estado_activo_prueba = true
            null, // fecha_creacion_prueba
            null  // fecha_actualizacion_prueba
          ]);

          if (pruebasData && pruebasData.length > 0) {
            // Ordenar por id_prueba descendente y tomar la primera (última creada)
            const pruebasOrdenadas = pruebasData.sort((a, b) => b.id_prueba - a.id_prueba);
            const ultimaPrueba = pruebasOrdenadas[0];

            // Navegar a realizar-prueba
            onRealizarPrueba({
              idMuestra: muestra.id_muestra,
              idTipoPrueba: idTipoPrueba,
              idAsignacion: asignacionId,
              idPrueba: ultimaPrueba.id_prueba
            });
          } else {
            setError('Error: No se pudo obtener el ID de la prueba creada');
          }
        } catch (err) {
          setError('Error al obtener la prueba creada: ' + err.message);
          console.error(err);
        }
      }, 2000);

    } catch (err) {
      setError('Error al crear prueba: ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handleDevolverClick = () => {
    setMotivosDevolucionInput('');
    setConfirmarDevolver(false);
    setShowDevolverModal(true);
  };

  const handleFinalizarClick = () => {
    if (!accionCompletada) {
      return;
    }
    setComentariosSiguienteFaseInput('');
    setConfirmarFinalizar(false);
    setShowFinalizarModal(true);
  };

  const handleConfirmarDevolver = async () => {
    if (!motivosDevolucionInput.trim()) {
      alert('Debe ingresar los motivos de devolución');
      return;
    }

    if (!confirmarDevolver) {
      alert('Debe confirmar la devolución');
      return;
    }

    try {
      setError('');
      setSuccess('');

      await apiCall('/asignacion/set', [
        2, asignacionId, null, null, 'Devuelta', motivosDevolucionInput, null
      ]);

      setShowDevolverModal(false);
      setSuccess(`${etiquetas.titulo} devuelta exitosamente - Codigo de muestra: ${codigoMuestra}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);

    } catch (err) {
      setShowDevolverModal(false);
      setError(`Error al devolver ${etiquetas.titulo.toLowerCase()}: ${err.message}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handleConfirmarFinalizar = async () => {
    if (!confirmarFinalizar) {
      alert('Debe confirmar la finalización');
      return;
    }

    try {
      setError('');
      setSuccess('');

      await apiCall('/asignacion/set', [
        2, asignacionId, null, null, 'Finalizada', null, comentariosSiguienteFaseInput.trim() || null
      ]);

      setShowFinalizarModal(false);
      setSuccess(`${etiquetas.titulo} finalizada exitosamente - Codigo de muestra: ${codigoMuestra}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);

    } catch (err) {
      setShowFinalizarModal(false);
      setError(`Error al finalizar ${etiquetas.titulo.toLowerCase()}: ${err.message}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handleVerMuestra = () => {
    if (onVerMuestra) {
      onVerMuestra(muestra.id_muestra);
    }
  };

  // Función para obtener los datos del resumen según la fase
  const getResumenDatos = () => {
    if (!muestra) return [];

    const fase = asignacion.numero_fase_asignacion;

    if (fase === 1) {
      return [
        { label: 'Tipo', value: tipoMuestra || '–' },
        { label: 'Producto', value: muestra.nombre_producto_muestra || '–' },
        { label: 'Solicitante', value: nombreSolicitante || '–' },
        { 
          label: 'Fecha de Recepción', 
          value: formatDateShort(muestra.fecha_recepcion_muestra)
        }
      ];
    } else if (fase === 2) {
      return [
        { label: 'Tipo', value: tipoMuestra || '–' },
        { label: 'Producto', value: muestra.nombre_producto_muestra || '–' },
        { label: 'Condición', value: muestra.condicion_muestra || '–' },
        { label: 'Estado', value: muestra.estado_muestra || '–' }
      ];
    } else if (fase === 3) {
      return [
        { label: 'Tipo', value: tipoMuestra || '–' },
        { label: 'Producto', value: muestra.nombre_producto_muestra || '–' },
        { label: 'Solicitante', value: nombreSolicitante || '–' },
        { label: 'Estado', value: muestra.estado_muestra || '–' }
      ];
    }

    return [];
  };

  const etiquetas = getEtiquetasContexto();

  if (loading) return <div style={styles.loading}>{etiquetas.loading}</div>;
  if (error && !asignacion) return <div style={styles.error}>{error}</div>;
  if (!asignacion) return <div style={styles.error}>{etiquetas.notFound}</div>;

  const estadoColor = 
    asignacion.estado_asignacion === 'Pendiente' ? '#94a3b8' :
    asignacion.estado_asignacion === 'En proceso' ? '#f59e0b' :
    asignacion.estado_asignacion === 'Finalizada' ? '#10b981' :
    asignacion.estado_asignacion === 'Finalizada y última' ? '#059669' :
    asignacion.estado_asignacion === 'Devuelta' ? '#ef4444' : '#6b7280';

  const puedeDevolver = (asignacion.numero_fase_asignacion === 2 || asignacion.numero_fase_asignacion === 3) &&
                        asignacion.estado_asignacion === 'En proceso';
  
  const puedeFinalizar = asignacion.estado_asignacion === 'En proceso';

  const mostrarComentarios = comentariosFaseAnterior && !motivosDevolucion;
  const mostrarMotivos = motivosDevolucion && !comentariosFaseAnterior;

  const asignacionFinalizada = asignacion.estado_asignacion === 'Finalizada' || 
                               asignacion.estado_asignacion === 'Finalizada y última' ||
                               asignacion.estado_asignacion === 'Devuelta';

  const mostrarMiMotivo = asignacionFinalizada && 
                         asignacion.estado_asignacion === 'Devuelta' &&
                         (asignacion.numero_fase_asignacion === 2 || asignacion.numero_fase_asignacion === 3) &&
                         asignacion.motivos_devolucion;

  const mostrarMisComentarios = asignacionFinalizada &&
                             (asignacion.estado_asignacion === 'Finalizada' || asignacion.estado_asignacion === 'Finalizada y última') &&
                             (asignacion.numero_fase_asignacion === 1 || asignacion.numero_fase_asignacion === 2) &&
                             asignacion.comentarios_a_siguiente_fase;

  const enProceso = asignacion.estado_asignacion === 'En proceso';

  const resumenDatos = getResumenDatos();

  const todasPruebasValidadas = asignacion.numero_fase_asignacion === 3
    ? tiposPrueba.every(tp => estadosPruebas[tp.id_tipo_prueba]?.validada === true)
    : accionCompletada;

  const accionCompletadaFinal = asignacion.numero_fase_asignacion === 3
    ? (todasPruebasValidadas && (muestra?.muestra_validada === true || muestra?.muestra_validada === 1))
    : accionCompletada;

  const textoPendienteFinalizar = asignacion.numero_fase_asignacion === 1
    ? 'el registro'
    : (user?.id_rol_usuario === 3
        ? 'la evaluación'
        : (asignacion.numero_fase_asignacion === 2 ? 'todas las pruebas' : 'la acción'));

  // Obtener nombre de la acción según la fase
  const getNombreAccion = () => {
    if (asignacion.numero_fase_asignacion === 1) return 'Confirmar Muestra';
    if (asignacion.numero_fase_asignacion === 2) return 'Realizar Pruebas';
    if (asignacion.numero_fase_asignacion === 3) return 'Evaluar Muestra';
    return 'Acción';
  };

  // Función helper para formatear a capitalizar la primera letra de cada palabra
  const formatSentenceCase = (texto) => {
  if (!texto) return '';
  
    const palabrasMinusculas = ['de', 'del', 'la', 'el', 'los', 'las', 'y', 'o', 'a', 'en'];
    
    const palabras = texto.toLowerCase().split(' ');
    
    return palabras.map((palabra, index) => {
        // Si la palabra está en la lista de excepciones, dejarla en minúscula
        if (palabrasMinusculas.includes(palabra)) {
        return palabra;
        }
        
        // Resto de palabras con primera letra mayúscula
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }).join(' ');
  };

  const handleValidarPrueba = async (idPrueba, nombrePrueba) => {
    if (!window.confirm(`¿Está seguro de validar la prueba "${nombrePrueba}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      // Obtener datos actuales de la prueba
      const pruebasData = await apiCall('/prueba/get', [
        idPrueba, null, null, null, null, null, null, null, null, null
      ]);

      if (!pruebasData || pruebasData.length === 0) {
        setError('Prueba no encontrada');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const prueba = pruebasData[0];

      // Validar la prueba (operación 2)
      await apiCall('/prueba/set', [
        2, // operación: actualizar
        idPrueba,
        prueba.id_muestra,
        prueba.id_tipo_prueba,
        prueba.notas_prueba,
        true // prueba_validada = true
      ]);

      setSuccess(`Prueba "${nombrePrueba}" validada exitosamente`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Recargar información de pruebas y verificar si todas están validadas
      setTimeout(async () => {
        await loadPruebasInfo(muestra.id_muestra, asignacion.numero_fase_asignacion);
        
        // Verificar si la muestra también debe actualizarse
        const muestraActualizada = await apiCall('/muestra/get', [
          muestra.id_muestra, null, null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null
        ]);
        
        if (muestraActualizada && muestraActualizada.length > 0) {
          setMuestra(muestraActualizada[0]);
        }
        
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError('Error al validar prueba: ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            {etiquetas.titulo} - <span style={{ color: estadoColor }}>{asignacion.estado_asignacion}</span>
          </h1>
          <h2 style={styles.subtitle}>{codigoMuestra} - Fase #{asignacion.numero_fase_asignacion}</h2>
        </div>
        <div style={styles.headerRight}>
          <button onClick={onBack} style={styles.backButton}>
            ← {etiquetas.volver}
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.content}>
        {/* Fechas */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{etiquetas.fechas}</h3>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Fecha de Inicio:</label>
              <span style={styles.value}>{formatDateTime(asignacion.fecha_inicio_asignacion)}</span>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Fecha Límite:</label>
              <span style={styles.value}>{formatDateTime(asignacion.fecha_limite_asignacion)}</span>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Fecha de Finalización:</label>
              <span style={styles.value}>{formatDateTime(asignacion.fecha_fin_asignacion)}</span>
            </div>
          </div>
        </div>

        {/* Motivos de devolución desde fase posterior */}
        {mostrarMotivos && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Motivos de devolución desde la fase #{asignacion.numero_fase_asignacion + 1}:
            </h3>
            <div style={styles.infoBox}>
              <p style={styles.infoText}>{motivosDevolucion || '–'}</p>
            </div>
          </div>
        )}

        {/* Comentarios desde fase anterior */}
        {mostrarComentarios && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Comentarios proporcionados desde la fase #{asignacion.numero_fase_asignacion - 1}:
            </h3>
            <div style={styles.infoBox}>
              <p style={styles.infoText}>{comentariosFaseAnterior || '–'}</p>
            </div>
          </div>
        )}

        {/* SECCIÓN DE ACCIONES - FASE 1 */}
        {enProceso && asignacion.numero_fase_asignacion === 1 && (
          <div style={styles.section}>
            <div style={styles.accionHeader}>
              <h3 style={styles.sectionTitle}>{getNombreAccion()}</h3>
              <span style={accionCompletadaFinal ? styles.estadoCompletado : styles.estadoPendiente}>
                {accionCompletadaFinal ? '✓ Completada' : '✗ Pendiente'}
              </span>
            </div>
            
            {muestra && (
              <div style={styles.accionCard}>
                <div style={styles.accionContent}>
                  <h5 style={styles.accionCardTitle}>{codigoMuestra}</h5>
                  <div style={styles.resumenGrid}>
                    {resumenDatos.map((dato, index) => (
                      <div key={index} style={styles.resumenItem}>
                        <strong>{dato.label}:</strong> {dato.value}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.accionButton}>
                  <button onClick={handleVerMuestra} style={styles.verMuestraButton}>
                    👁️ Ver Muestra
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN DE ACCIONES - FASE 2 (Múltiples pruebas) */}
        {enProceso && asignacion.numero_fase_asignacion === 2 && (
          <div style={styles.section}>
            <div style={styles.accionHeader}>
              <h3 style={styles.sectionTitle}>{getNombreAccion()}</h3>
              <span style={accionCompletada ? styles.estadoCompletado : styles.estadoPendiente}>
                {accionCompletada ? '✓ Completadas' : '✗ Pendientes'}
              </span>
            </div>

            {tiposPrueba.length === 0 && (
              <div style={styles.placeholderBox}>
                <p style={styles.placeholderText}>
                  No hay tipos de prueba configurados
                </p>
              </div>
            )}

            {tiposPrueba.map((tipoPrueba) => {
              const estadoPrueba = estadosPruebas[tipoPrueba.id_tipo_prueba] || { 
                existe: false, 
                tieneResultados: false, 
                validada: false,
                idPrueba: null
              };

              const pruebaCompletada = estadoPrueba.tieneResultados === true;
              
              // Determinar el texto, estilo y funcionalidad del botón
              let textoBoton = '➕ Crear Prueba';
              let estiloBoton = styles.crearPruebaButton;
              let puedeClickear = true;
              let onClickHandler = () => handleRealizarPrueba(tipoPrueba.id_tipo_prueba);
              
              if (estadoPrueba.existe) {
                if (estadoPrueba.tieneResultados) {
                  // Si tiene resultados, permitir ver la prueba
                  textoBoton = '👁️ Ver Prueba';
                  estiloBoton = styles.verPruebaButton;
                  puedeClickear = true;
                  onClickHandler = () => onRealizarPrueba({
                    idMuestra: muestra.id_muestra,
                    idTipoPrueba: tipoPrueba.id_tipo_prueba,
                    idAsignacion: asignacionId,
                    idPrueba: estadoPrueba.idPrueba
                  });
                } else {
                  // Si existe pero no tiene resultados, mostrar "Seguir Prueba"
                  textoBoton = '▶️ Seguir Prueba';
                  estiloBoton = styles.seguirPruebaButton;
                  puedeClickear = true;
                  onClickHandler = () => handleRealizarPrueba(tipoPrueba.id_tipo_prueba);
                }
              }
              
              return (
                <div key={tipoPrueba.id_tipo_prueba} style={{...styles.accionCard, marginBottom: '15px'}}>
                  <div style={styles.accionContent}>
                    <div style={styles.pruebaHeader}>
                      <h5 style={styles.accionCardTitle}>
                        Realizar Prueba {formatSentenceCase(tipoPrueba.nombre_tipo_prueba)}
                      </h5>
                      <span style={pruebaCompletada ? styles.estadoCompletadoSmall : styles.estadoPendienteSmall}>
                        {pruebaCompletada ? '✓ Completada' : '✗ Pendiente'}
                      </span>
                    </div>
                    <div style={styles.resumenGrid}>
                      {estadoPrueba.existe ? (
                        estadoPrueba.parametrosDetalle?.length ? (
                          estadoPrueba.parametrosDetalle.map((parametro) => (
                            <div key={parametro.id} style={styles.resumenItem}>
                              <strong>{parametro.nombre}:</strong> {parametro.valor}
                            </div>
                          ))
                        ) : (
                          <div style={styles.resumenItem}>Sin parametros configurados</div>
                        )
                      ) : null}
                    </div>
                  </div>
                  <div style={styles.accionButton}>
                    <button 
                      onClick={puedeClickear ? onClickHandler : null}
                      style={{
                        ...estiloBoton,
                        cursor: puedeClickear ? 'pointer' : 'not-allowed',
                        opacity: puedeClickear ? 1 : 0.7
                      }}
                      disabled={!puedeClickear}
                    >
                      {textoBoton}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SECCIÓN DE ACCIONES - FASE 3 (Evaluar Muestra y Pruebas) */}
        {enProceso && asignacion.numero_fase_asignacion === 3 && (
          <div style={styles.section}>
            <div style={styles.accionHeader}>
              <h3 style={styles.sectionTitle}>{getNombreAccion()}</h3>
              <span style={accionCompletada ? styles.estadoCompletado : styles.estadoPendiente}>
                {accionCompletada ? '✓ Completada' : '✗ Pendiente'}
              </span>
            </div>

            {/* Card de Muestra */}
            {muestra && (
              <div style={{...styles.accionCard, marginBottom: '25px'}}>
                <div style={styles.accionContent}>
                  <div style={styles.pruebaHeader}>
                    <h5 style={styles.accionCardTitle}>Validar Muestra: {codigoMuestra}</h5>
                    <span style={muestra.muestra_validada ? styles.estadoCompletadoSmall : styles.estadoPendienteSmall}>
                      {muestra.muestra_validada ? '✓ Validada' : '✗ Pendiente'}
                    </span>
                  </div>
                  <div style={styles.resumenGrid}>
                    {resumenDatos.map((dato, index) => (
                      <div key={index} style={styles.resumenItem}>
                        <strong>{dato.label}:</strong> {dato.value}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.accionButton}>
                  <button onClick={handleVerMuestra} style={styles.verMuestraButton}>
                    👁️ Ver Muestra
                  </button>
                </div>
              </div>
            )}

            {/* Cards de Pruebas */}
            <h4 style={{...styles.sectionTitle, fontSize: '18px', marginBottom: '15px', marginTop: '10px'}}>
              Validar Pruebas
            </h4>

            {tiposPrueba.length === 0 && (
              <div style={styles.placeholderBox}>
                <p style={styles.placeholderText}>
                  No hay tipos de prueba configurados
                </p>
              </div>
            )}

            {tiposPrueba.map((tipoPrueba) => {
              const estadoPrueba = estadosPruebas[tipoPrueba.id_tipo_prueba] || { 
                existe: false, 
                tieneResultados: false, 
                validada: false,
                idPrueba: null
              };
              
              // Solo mostrar si la prueba existe
              if (!estadoPrueba.existe) {
                return null;
              }

              return (
                <div key={tipoPrueba.id_tipo_prueba} style={{...styles.accionCard, marginBottom: '15px'}}>
                  <div style={styles.accionContent}>
                    <div style={styles.pruebaHeader}>
                      <h5 style={styles.accionCardTitle}>
                        Prueba {formatSentenceCase(tipoPrueba.nombre_tipo_prueba)}
                      </h5>
                      <span style={estadoPrueba.validada ? styles.estadoCompletadoSmall : styles.estadoPendienteSmall}>
                        {estadoPrueba.validada ? '✓ Validada' : '✗ Pendiente'}
                      </span>
                    </div>
                    <div style={styles.resumenGrid}>
                      <div style={styles.resumenItem}>
                        <strong>Estado:</strong> {estadoPrueba.tieneResultados ? 'Con resultados' : 'Sin resultados'}
                      </div>
                      <div style={styles.resumenItem}>
                        <strong>ID Prueba:</strong> {estadoPrueba.idPrueba || '–'}
                      </div>
                      {estadoPrueba.parametrosDetalle?.length ? (
                        estadoPrueba.parametrosDetalle.map((parametro) => (
                          <div key={parametro.id} style={styles.resumenItem}>
                            <strong>{parametro.nombre}:</strong> {parametro.valor}
                          </div>
                        ))
                      ) : (
                        <div style={styles.resumenItem}>Sin parametros configurados</div>
                      )}
                    </div>
                  </div>
                  <div style={styles.accionButton}>
                    {estadoPrueba.validada ? (
                      <button 
                        disabled
                        style={{
                          ...styles.verPruebaButton,
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }}
                      >
                        ✓ Ya Validada
                      </button>
                    ) : estadoPrueba.tieneResultados ? (
                      <button 
                        onClick={() => handleValidarPrueba(estadoPrueba.idPrueba, formatSentenceCase(tipoPrueba.nombre_tipo_prueba))}
                        style={styles.validarPruebaButton}
                      >
                        ✓ Validar Prueba
                      </button>
                    ) : (
                      <button 
                        disabled
                        style={{
                          ...styles.verPruebaButton,
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }}
                      >
                        Sin resultados
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {tiposPrueba.every(tp => {
              const estado = estadosPruebas[tp.id_tipo_prueba];
              return !estado || !estado.existe;
            }) && (
              <div style={styles.placeholderBox}>
                <p style={styles.placeholderText}>
                  No hay pruebas creadas para esta muestra
                </p>
              </div>
            )}
          </div>
        )}

        {/* MI MOTIVO DE DEVOLUCIÓN */}
        {mostrarMiMotivo && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Mi motivo de devolución:</h3>
            <div style={{...styles.infoBox, backgroundColor: '#fef3c7', borderColor: '#fbbf24'}}>
              <p style={styles.infoText}>{asignacion.motivos_devolucion}</p>
            </div>
          </div>
        )}

        {/* MIS COMENTARIOS A SIGUIENTE FASE */}
        {mostrarMisComentarios && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Mis comentarios a la siguiente fase:</h3>
            <div style={{...styles.infoBox, backgroundColor: '#dbeafe', borderColor: '#60a5fa'}}>
              <p style={styles.infoText}>{asignacion.comentarios_a_siguiente_fase}</p>
            </div>
          </div>
        )}

        {/* Botones de acción (solo si está En proceso) */}
        {enProceso && (
          <div style={styles.buttonGroup}>
            {puedeDevolver && (
              <button onClick={handleDevolverClick} style={styles.devolverButton}>
                ↩️ {etiquetas.devolver}
              </button>
            )}
            {puedeFinalizar && (
              <div style={styles.finalizarContainer}>
                <button 
                  onClick={handleFinalizarClick} 
                  style={accionCompletadaFinal ? styles.finalizarButton : styles.finalizarButtonDisabled}
                  disabled={!accionCompletadaFinal}
                >
                  ✓ {etiquetas.finalizar}
                </button>
                {!accionCompletadaFinal && (
                  <div style={styles.warningMessage}>
                    Debe completar {textoPendienteFinalizar} antes de finalizar
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Devolver */}
      {showDevolverModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>{etiquetas.devolver}</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Motivos de devolución: *</label>
              <textarea
                value={motivosDevolucionInput}
                onChange={(e) => setMotivosDevolucionInput(e.target.value)}
                rows="4"
                style={styles.textarea}
                placeholder="Escriba los motivos de la devolución..."
              />
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={confirmarDevolver}
                onChange={(e) => setConfirmarDevolver(e.target.checked)}
                style={styles.checkbox}
              />
              <label style={styles.checkboxLabel}>
                Confirmo que deseo devolver la {etiquetas.titulo.toLowerCase()} <strong>{codigoMuestra}</strong>
              </label>
            </div>

            <div style={styles.modalButtonGroup}>
              <button 
                onClick={() => setShowDevolverModal(false)} 
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarDevolver} 
                style={styles.confirmButton}
              >
                Confirmar Devolución
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Finalizar */}
      {showFinalizarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>{etiquetas.finalizar}</h3>
            
            {(asignacion.numero_fase_asignacion === 1 || asignacion.numero_fase_asignacion === 2) && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Comentarios a siguiente fase:</label>
                <textarea
                  value={comentariosSiguienteFaseInput}
                  onChange={(e) => setComentariosSiguienteFaseInput(e.target.value)}
                  rows="4"
                  style={styles.textarea}
                  placeholder="(Opcional) Escriba comentarios para la siguiente fase..."
                />
              </div>
            )}

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={confirmarFinalizar}
                onChange={(e) => setConfirmarFinalizar(e.target.checked)}
                style={styles.checkbox}
              />
              <label style={styles.checkboxLabel}>
                Confirmo que deseo finalizar la {etiquetas.titulo.toLowerCase()} <strong>{codigoMuestra}</strong>
              </label>
            </div>

            <div style={styles.modalButtonGroup}>
              <button 
                onClick={() => setShowFinalizarModal(false)} 
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarFinalizar} 
                style={styles.confirmButton}
              >
                Confirmar Finalización
              </button>
            </div>
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
    marginBottom: '20px',
    marginTop: 0
  },
  accionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  pruebaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  estadoCompletado: {
    color: '#10b981',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  estadoPendiente: {
    color: '#ef4444',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  estadoCompletadoSmall: {
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  estadoPendienteSmall: {
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  accionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'border-color 0.2s'
  },
  accionContent: {
    flex: 1
  },
  accionCardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 0,
    marginBottom: '15px'
  },
  resumenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  resumenItem: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.5'
  },
  accionButton: {
    flexShrink: 0
  },
  verMuestraButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  },
  realizarPruebaButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  },
  crearPruebaButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  },
  seguirPruebaButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  },
  placeholderBox: {
    backgroundColor: '#f9fafb',
    padding: '40px',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
    textAlign: 'center'
  },
  placeholderText: {
    fontSize: '16px',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: 0
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
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  infoText: {
    color: '#374151',
    lineHeight: '1.6',
    margin: 0,
    fontSize: '15px',
    whiteSpace: 'pre-wrap'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: '20px'
  },
  finalizarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    marginLeft: 'auto'
  },
  warningMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #fecaca',
    textAlign: 'right',
    whiteSpace: 'nowrap'
  },
  devolverButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  finalizarButton: {
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
  finalizarButtonDisabled: {
    backgroundColor: '#d1d5db',
    color: '#9ca3af',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'not-allowed',
    fontWeight: '600',
    opacity: 0.6
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '90%'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '20px'
  },
  checkbox: {
    marginTop: '4px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.5'
  },
  modalButtonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  validarPruebaButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  },
  verPruebaButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  }
};