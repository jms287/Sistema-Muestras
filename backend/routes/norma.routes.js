const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/norma/get', async (req, res) => {
  try {
    const data = await callSP('spGetNorma', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetNorma error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/norma/set', async (req, res) => {
  try {
    const data = await callSP('spSetNorma', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetNorma error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;