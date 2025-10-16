const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/notificacion/get', async (req, res) => {
  try {
    const data = await callSP('spGetNotificacion', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetNotificacion error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/notificacion/set', async (req, res) => {
  try {
    const data = await callSP('spSetNotificacion', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetNotificacion error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;