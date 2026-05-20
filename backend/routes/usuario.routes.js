const express = require('express');
const { callSP } = require('../utils/sp');
const { validatePasswordPolicy, hashPassword, requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();


router.post('/usuario/get', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR, ROLE.SOLICITANTE]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    if (Number(req.user?.id_rol_usuario) === ROLE.SOLICITANTE) {
      const requestedId = args[0];
      if (!requestedId || Number(requestedId) !== Number(req.user?.id_usuario)) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }
    }
    const data = await callSP('spGetUsuario', args);
    const sanitized = Array.isArray(data)
      ? data.map(({ password_usuario, ...rest }) => rest)
      : data;
    res.json({ success: true, data: sanitized });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetUsuario error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/usuario/set', requireRoles([ROLE.ADMIN]), async (req, res) => {
  try {
    const args = Array.isArray(req.body?.args) ? [...req.body.args] : [];
    const password = args[5];
    if (password) {
      const policy = validatePasswordPolicy(password);
      if (!policy.ok) {
        return res.status(400).json({ success: false, message: policy.message });
      }
      if (!String(password).startsWith('$2')) {
        args[5] = await hashPassword(password);
      }
    }
    const data = await callSP('spSetUsuario', args);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetUsuario error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;