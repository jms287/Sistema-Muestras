const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/muestra/get', async (req, res) => {
  try {
    const data = await callSP('spGetMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetMuestra error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/muestra/set', async (req, res) => {
  try {
    const data = await callSP('spSetMuestra', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetMuestra error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;