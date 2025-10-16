const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/parametro/get', async (req, res) => {
  try {
    const data = await callSP('spGetParametro', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetParametro error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/parametro/set', async (req, res) => {
  try {
    const data = await callSP('spSetParametro', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetParametro error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;