const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/provincia/get', async (req, res) => {
  try {
    const data = await callSP('spGetProvincia', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetProvincia error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/provincia/set', async (req, res) => {
  try {
    const data = await callSP('spSetProvincia', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spSetProvincia error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;