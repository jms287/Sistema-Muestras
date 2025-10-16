const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/tipomuestra/get', async (req, res) => {
  try {
    const data = await callSP('spGetTipoMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetTipoMuestra error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/tipomuestra/set', async (req, res) => {
  try {
    const data = await callSP('spSetTipoMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetTipoMuestra error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;