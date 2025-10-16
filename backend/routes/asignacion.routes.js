const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();

router.post('/asignacion/get', async (req, res) => {
  try {
    const data = await callSP('spGetAsignacion', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetAsignacion error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/asignacion/set', async (req, res) => {
  try {
    const args = req.body?.args || [];
    const inParams = args.slice(0, 7); // Solo los 7 parámetros IN
    const data = await callSP('spSetAsignacion', inParams, true); // true para hasOutParam
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetAsignacion error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;