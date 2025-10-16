const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/parametrodetipomuestra/get', async (req, res) => {
  try {
    const data = await callSP('spGetParametroDeTipoMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetParametroDeTipoMuestra error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/parametrodetipomuestra/set', async (req, res) => {
  try {
    const data = await callSP('spSetParametroDeTipoMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetParametroDeTipoMuestra error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;