const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();


router.post('/parametrodetipomuestra/get', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR]), async (req, res) => {
  try {
    const data = await callSP('spGetParametroDeTipoMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetParametroDeTipoMuestra error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/parametrodetipomuestra/set', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spSetParametroDeTipoMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetParametroDeTipoMuestra error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;