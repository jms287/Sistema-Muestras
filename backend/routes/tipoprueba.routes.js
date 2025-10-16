const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/tipoprueba/get', async (req, res) => {
  try {
    const data = await callSP('spGetTipoPrueba', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetTipoPrueba error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/tipoprueba/set', async (req, res) => {
  try {
    const data = await callSP('spSetTipoPrueba', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetTipoPrueba error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;