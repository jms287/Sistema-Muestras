const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST || '148.101.247.103',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'webreto',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  // Activa SSL solo si el servidor lo requiere (configura DB_SSL=true)
  ssl: process.env.DB_SSL === 'true'
    ? (process.env.DB_SSL_CA
        ? { ca: fs.readFileSync(process.env.DB_SSL_CA) }
        : { rejectUnauthorized: false }) // Solo para pruebas
    : undefined,
});

db.getConnection((err, conn) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos (pool)');
    conn.release();
  }
});

// Ruta para verificar credenciales usando el stored procedure
app.post('/api/login', (req, res) => {
  const { correo_usuario, password_usuario } = req.body;

  if (!correo_usuario || !password_usuario) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  const query = `CALL spGetUsuario(NULL, NULL, NULL, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)`;

  db.query(query, [correo_usuario, password_usuario], (err, results) => {
    if (err) {
      console.error('Error al ejecutar el procedimiento almacenado:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results[0].length > 0) {
      const user = results[0][0];
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: {
          id_usuario: user.id_usuario,
          nombre_usuario: user.nombre_usuario,
          correo_usuario: user.correo_usuario,
          id_rol_usuario: user.id_rol_usuario, // Devuelve el ID del rol
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  });
});

app.get('/api/muestra/:id', (req, res) => {
  const { id } = req.params;

  db.query('CALL spGetMuestra(?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)', [id], (err, results) => {
    if (err) {
      console.error('Error al obtener muestra:', err);
      return res.status(500).json({ error: 'Error al obtener muestra' });
    }
    res.json(results[0][0]); // Devuelve la primera muestra encontrada
  });
});

// Obtener pruebas asociadas a una muestra
app.get('/api/pruebas/:id_muestra', (req, res) => {
  const { id_muestra } = req.params;

  db.query('CALL spGetPrueba(NULL, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL)', [id_muestra], (err, results) => {
    if (err) {
      console.error('Error al obtener pruebas:', err);
      return res.status(500).json({ error: 'Error al obtener pruebas' });
    }
    res.json(results[0]); // Devuelve todas las pruebas asociadas
  });
});

// app.post('/api/spGetAsignacion', async (req, res) => {
//   const {
//     p_id_asignacion,
//     p_id_usuario,
//     p_id_muestra,
//     p_estado_asignacion,
//     p_fecha_inicio_asignacion,
//     p_fecha_limite_asignacion,
//     p_fecha_fin_asignacion,
//     p_comentarios_a_fase_anterior,
//     p_comentarios_a_fase_siguiente,
//     p_fecha_creacion_asignacion,
//     p_fecha_actualizacion_asignacion,
//   } = req.body;

//   try {
//     const [results] = await db.query(
//       'CALL spGetAsignacion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//       [
//         p_id_asignacion,
//         p_id_usuario,
//         p_id_muestra,
//         p_estado_asignacion,
//         p_fecha_inicio_asignacion,
//         p_fecha_limite_asignacion,
//         p_fecha_fin_asignacion,
//         p_comentarios_a_fase_anterior,
//         p_comentarios_a_fase_siguiente,
//         p_fecha_creacion_asignacion,
//         p_fecha_actualizacion_asignacion,
//       ]
//     );
//     res.json(results[0]);
//   } catch (error) {
//     console.error('Error calling spGetAsignacion:', error);
//     res.status(500).send({ message: 'Error interno', detail: error.message });
//   }
// });

app.post('/api/spGetAsignacion', async (req, res) => {
  const {
    p_id_asignacion,
    p_id_usuario,
    p_id_muestra,
    p_estado_asignacion,
    p_fecha_inicio_asignacion,
    p_fecha_limite_asignacion,
    p_fecha_fin_asignacion,
    p_comentarios_a_fase_anterior,
    p_comentarios_a_fase_siguiente,
    p_fecha_creacion_asignacion,
    p_fecha_actualizacion_asignacion,
  } = req.body;

  try {
    const [results] = await db.query(
      'CALL spGetAsignacion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        p_id_asignacion ?? null,
        p_id_usuario ?? null,
        p_id_muestra ?? null,
        p_estado_asignacion ?? null,
        p_fecha_inicio_asignacion ?? null,
        p_fecha_limite_asignacion ?? null,
        p_fecha_fin_asignacion ?? null,
        p_comentarios_a_fase_anterior ?? null,
        p_comentarios_a_fase_siguiente ?? null,
        p_fecha_creacion_asignacion ?? null,
        p_fecha_actualizacion_asignacion ?? null,
      ]
    );
    // Para CALL, mysql2 retorna un array de recordsets; el primero suele ser el deseado
    const data = Array.isArray(results) && Array.isArray(results[0]) ? results[0] : results;
    res.json(data);
  } catch (err) {
    console.error('Error calling spGetAsignacion:', err);
    res.status(500).json({ message: 'Error interno', detail: err?.message || String(err) });
  }
});

app.get('/api/rol/:id', (req, res) => {
  const { id } = req.params;

  const query = `CALL spGetRolUsuario(?, NULL, NULL)`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al ejecutar el procedimiento almacenado:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results[0].length > 0) {
      res.json({ success: true, rol: results[0][0].nombre_rol_usuario });
    } else {
      res.status(404).json({ success: false, message: 'Rol no encontrado' });
    }
  });
});

app.get('/api/enum/:tabla/:columna', (req, res) => {
  const { tabla, columna } = req.params;
  db.query('CALL spGetEnumValues(?, ?)', [tabla, columna], (err, results) => {
    if (err) {
      console.error('Error al ejecutar spGetEnumValues:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (results[0] && !results[0][0]?.error) {
      res.json(results[0].map(r => r[columna]));
    } else {
      res.status(400).json({ error: results[0][0]?.error || 'Error desconocido' });
    }
  });
});

app.post('/api/muestra', (req, res) => {
  const f = req.body;

  const params = [
    f.id_solicitante,
    f.id_emp_fabricante_muestra,
    f.id_emp_distribuidor_muestra,
    f.id_tipo_muestra,
    f.condicion_muestra,
    f.fecha_recepcion_muestra,
    f.id_lab_muestra,
    f.condicion_transp_muestra,
    f.condicion_almac_muestra,
    f.temperatura_muestra || null,
    f.color_muestra || null,
    f.olor_muestra || null,
    f.sabor_muestra || null,
    f.aspecto_muestra || null,
    f.textura_muestra || null,
    f.peso_neto_muestra || null,
    f.fecha_vencimiento_muestra || null,
    f.observaciones_muestra || null
  ];

  db.query(
    'CALL spSetMuestra(1,NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,NULL,NULL);',
    params,
    (err, results) => {
      if (err) {
        console.error('Error al ejecutar spSetMuestra:', err);
        return res.status(500).json({ error: 'Error al registrar la muestra' });
      }

      db.query('CALL spGetLastInsertId()', (err2, result2) => {
        if (err2) {
          console.error('Error al obtener último ID:', err2);
          return res.status(500).json({
            error: 'Muestra registrada pero no se pudo obtener el ID.'
          });
        }
        const idMuestra = result2[0][0].last_id;
        res.json({ success: true, id_muestra: idMuestra });
      });
    }
  );
});

app.get('/api/solicitantes', (req, res) => {
  db.query('CALL spGetSolicitante(NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL)', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener solicitantes' });
    res.json(results[0]);
  });
});

app.get('/api/empresas', (req, res) => {
  db.query('CALL spGetEmpresa(NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL)', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener empresas' });
    res.json(results[0]);
  });
});

app.get('/api/tipos-muestra', (req, res) => {
  db.query('CALL spGetTipoMuestra(NULL, NULL, NULL, 1)', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener tipos de muestra' });
    res.json(results[0]);
  });
});

app.get('/api/laboratorios', (req, res) => {
  db.query('CALL spGetLaboratorio(NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL)', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener laboratorios' });
    res.json(results[0]);
  });
});

app.post('/api/asignacion', (req, res) => {
  const { id_usuario, id_muestra } = req.body;
  if (!id_usuario || !id_muestra) {
    return res.status(400).json({ message: 'Faltan datos para la asignación.' });
  }
  db.query(
    'CALL spSetAsignacion(1, NULL, ?, ?, NULL, NULL, NULL)',
    [id_usuario, id_muestra],
    (err, results) => {
      if (err) {
        console.error('Error al registrar asignación:', err);
        return res.status(500).json({ message: 'Error al registrar la asignación.' });
      }
      res.json({ success: true });
    }
  );
});

app.put('/api/asignacion', (req, res) => {
  const {
    id_asignacion,
    estado_asignacion,
    comentarios_a_fase_anterior,
    comentarios_a_fase_siguiente
  } = req.body;

  if (!id_asignacion || !estado_asignacion) {
    return res.status(400).json({ message: 'Faltan datos obligatorios.' });
  }

  db.query(
    'CALL spSetAsignacion(2, ?, NULL, NULL, ?, ?, ?)',
    [
      id_asignacion,
      estado_asignacion,
      comentarios_a_fase_anterior || null,
      comentarios_a_fase_siguiente || null
    ],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar asignación:', err);
        return res.status(500).json({ message: 'Error al actualizar la asignación.' });
      }
      res.json({ success: true });
    }
  );
});

app.get('/api/usuarios/menos-cargado', (req, res) => {
  const id_rol_usuario = parseInt(req.query.rol, 10);
  if (!id_rol_usuario) {
    return res.status(400).json({ message: 'Falta el parámetro rol.' });
  }
  db.query(
    'CALL spGetUsuarioMenosCargado(?)',
    [id_rol_usuario],
    (err, results) => {
      if (err) {
        console.error('Error al buscar usuario menos cargado:', err);
        return res.status(500).json({ message: 'Error en la consulta.' });
      }
      if (!results[0] || !results[0][0]) {
        return res.status(404).json({ message: 'No hay usuarios activos con ese rol.' });
      }
      res.json({ id_usuario: results[0][0].id_usuario });
    }
  );
});

// Crear documento (usa spSetDocumento, operación 1)
app.post('/api/documento', (req, res) => {
  const { id_muestra, tipo_documento, ruta_archivo_documento, id_usuario_emisor } = req.body;
  const query = 'CALL spSetDocumento(1, NULL, ?, ?, ?, ?)';
  db.query(query, [id_muestra, tipo_documento, ruta_archivo_documento, id_usuario_emisor], (err, results) => {
    if (err) {
      console.error('Error al crear documento:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json({ success: true, message: 'Documento creado correctamente' });
  });
});

// Ver documentos (usa spGetDocumento)
app.get('/api/documentos', (req, res) => {
  const { id_muestra, tipo_documento } = req.query;
  const query = 'CALL spGetDocumento(NULL, ?, ?, NULL, NULL, NULL, NULL)';
  db.query(query, [id_muestra || null, tipo_documento || null], (err, results) => {
    if (err) {
      console.error('Error al obtener documentos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results[0]);
  });
});

app.get('/api/muestra/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'CALL spGetMuestra(?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)',
    [id],
    (err, results) => {
      if (err) {
        console.error('Error al obtener muestra:', err);
        return res.status(500).json({ error: 'Error al obtener muestra' });
      }
      if (results[0] && results[0][0]) {
        res.json(results[0][0]); // Devuelve la muestra encontrada
      } else {
        res.status(404).json({ error: 'No existe la muestra' });
      }
    }
  );
});

// ...existing code...

app.get('/api/buscar-muestra-por-id/:id', (req, res) => {
  const { id } = req.params;
  const query = 'CALL spGetMuestra(?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (results[0].length > 0) {
      res.json({ existe: true, muestra: results[0][0] });
    } else {
      res.json({ existe: false });
    }
  });
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});