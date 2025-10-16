const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/limitesdeconfianza/get', async (req, res) => {
  try {
    const data = await callSP('spGetLimitesDeConfianza', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetLimitesDeConfianza error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/limitesdeconfianza/set', async (req, res) => {
  try {
    const data = await callSP('spSetLimitesDeConfianza', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetLimitesDeConfianza error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;