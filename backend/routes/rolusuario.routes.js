const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/rolusuario/get', async (req, res) => {
  try {
    const data = await callSP('spGetRolUsuario', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetRolUsuario error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/rolusuario/set', async (req, res) => {
  try {
    const data = await callSP('spSetRolUsuario', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetRolUsuario error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;