const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();


router.post('/logeventossistema/get', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spGetLogEventosSistema', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetLogEventosSistema error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/logeventossistema/set', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spSetLogEventosSistema', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetLogEventosSistema error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;