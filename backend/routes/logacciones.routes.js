const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/logacciones/get', async (req, res) => {
  try {
    const data = await callSP('spGetLogAcciones', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetLogAcciones error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/logacciones/set', async (req, res) => {
  try {
    const data = await callSP('spSetLogAcciones', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetLogAcciones error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;