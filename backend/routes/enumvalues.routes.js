const express = require('express');
const { callSP } = require('../utils/sp');
const router = express.Router();


router.post('/enumvalues/get', async (req, res) => {
  try {
    const data = await callSP('spGetEnumValues', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    console.error('spGetEnumValues error:', err);
    res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;