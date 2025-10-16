const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/documento/get', async (req, res) => {
  try {
    const data = await callSP('spGetDocumento', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetDocumento error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/documento/set', async (req, res) => {
  try {
    const data = await callSP('spSetDocumento', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetDocumento error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;