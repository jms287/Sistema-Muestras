const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();


router.post('/rolusuario/get', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spGetRolUsuario', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetRolUsuario error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/rolusuario/set', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spSetRolUsuario', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetRolUsuario error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;