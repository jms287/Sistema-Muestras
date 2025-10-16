const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/prueba/get', async (req, res) => {
  try {
    const data = await callSP('spGetPrueba', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetPrueba error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/prueba/set', async (req, res) => {
  try {
    const data = await callSP('spSetPrueba', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetPrueba error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;