const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/solicitante/get', async (req, res) => {
  try {
    const data = await callSP('spGetSolicitante', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetSolicitante error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/solicitante/set', async (req, res) => {
  try {
    const data = await callSP('spSetSolicitante', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetSolicitante error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;