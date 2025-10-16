const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/municipio/get', async (req, res) => {
  try {
    const data = await callSP('spGetMunicipio', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetMunicipio error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/municipio/set', async (req, res) => {
  try {
    const data = await callSP('spSetMunicipio', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetMunicipio error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;