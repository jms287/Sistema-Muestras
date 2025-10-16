const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/empresa/get', async (req, res) => {
  try {
    const data = await callSP('spGetEmpresa', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetEmpresa error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/empresa/set', async (req, res) => {
  try {
    const data = await callSP('spSetEmpresa', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetEmpresa error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;