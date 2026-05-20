const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();

router.post('/coleccionnormas/get', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR]), async (req, res) => {
  try {
    const data = await callSP('spGetColeccionNormas', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetColeccionNormas error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/coleccionnormas/set', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spSetColeccionNormas', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetColeccionNormas error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;