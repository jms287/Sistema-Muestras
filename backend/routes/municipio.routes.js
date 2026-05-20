const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();


router.post('/municipio/get',  async (req, res) => {
  try {
    const data = await callSP('spGetMunicipio', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetMunicipio error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/municipio/set', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const data = await callSP('spSetMunicipio', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetMunicipio error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;