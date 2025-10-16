const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/resultado/get', async (req, res) => {
  try {
    const data = await callSP('spGetResultado', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetResultado error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/resultado/set', async (req, res) => {
  try {
    const data = await callSP('spSetResultado', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetResultado error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;