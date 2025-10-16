const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/laboratorio/get', async (req, res) => {
  try {
    const data = await callSP('spGetLaboratorio', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetLaboratorio error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/laboratorio/set', async (req, res) => {
  try {
    const data = await callSP('spSetLaboratorio', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetLaboratorio error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;