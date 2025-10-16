const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/usuario/get', async (req, res) => {
  try {
    const data = await callSP('spGetUsuario', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetUsuario error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/usuario/set', async (req, res) => {
  try {
    const data = await callSP('spSetUsuario', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetUsuario error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;