const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/logeventossistema/get', async (req, res) => {
  try {
    const data = await callSP('spGetLogEventosSistema', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetLogEventosSistema error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/logeventossistema/set', async (req, res) => {
  try {
    const data = await callSP('spSetLogEventosSistema', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetLogEventosSistema error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;