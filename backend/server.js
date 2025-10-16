const app = require('./app');
const db = require('./db');

(async () => {
  try {
    const conn = await db.getConnection();
    console.log('Conexión exitosa a la base de datos (pool)');
    conn.release();
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
})();

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Backend escuchando en http://localhost:${PORT}`));