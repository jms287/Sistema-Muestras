const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();

router.post('/coleccionnormas/get', async (req, res) => {
  try {
    const data = await callSP('spGetColeccionNormas', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetColeccionNormas error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/coleccionnormas/set', async (req, res) => {
  try {
    const data = await callSP('spSetColeccionNormas', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetColeccionNormas error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;