const express = require('express');
const db = require('../db'); // Tu módulo de conexión MySQL
const router = express.Router();

router.get('/metadata/:tabla', async (req, res) => {
    try {
      const tabla = req.params.tabla;
      if (!/^[a-zA-Z0-9_]+$/.test(tabla)) {
        return res.status(400).json({ success: false, columns: [], message: 'Nombre de tabla inválido' });
      }
      const [rows] = await db.query(
        `SELECT COLUMN_NAME, DATA_TYPE 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? 
         ORDER BY ORDINAL_POSITION`, // <-- Aquí está el cambio
        ['webreto', tabla]
      );
      res.json({ success: true, columns: rows });
    } catch (err) {
      res.status(500).json({ success: false, columns: [], message: err.message });
    }
  });

module.exports = router;