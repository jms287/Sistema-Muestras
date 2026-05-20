const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();

async function assertAsignacionAccess(req, idAsignacion, idUsuario, idMuestra) {
  const role = Number(req.user?.id_rol_usuario);
  if (role === ROLE.ADMIN) return { ok: true };

  const userId = Number(req.user?.id_usuario);
  if (idUsuario && Number(idUsuario) !== userId) {
    return { ok: false, status: 403, message: 'No autorizado' };
  }

  if (idAsignacion) {
    const data = await callSP('spGetAsignacion', [
      idAsignacion, null, null, null, null, null, null, null, null, null, null, null,
    ]);
    const asignacion = Array.isArray(data) ? data[0] : null;
    if (!asignacion || Number(asignacion.id_usuario) !== userId) {
      return { ok: false, status: 403, message: 'No autorizado' };
    }
    return { ok: true };
  }

  if (idMuestra) {
    const data = await callSP('spGetAsignacion', [
      null, userId, idMuestra, null, null, null, null, null, null, null, null, null,
    ]);
    const asignacion = Array.isArray(data) ? data[0] : null;
    if (!asignacion) {
      return { ok: false, status: 403, message: 'No autorizado' };
    }
    return { ok: true };
  }

  if (idUsuario) return { ok: true };

  return { ok: false, status: 403, message: 'No autorizado' };
}

router.post('/asignacion/get', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    const access = await assertAsignacionAccess(req, args[0], args[1], args[2]);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }
    const data = await callSP('spGetAsignacion', args);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetAsignacion error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/asignacion/set', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    const access = await assertAsignacionAccess(req, args[1], args[2], args[3]);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }
    const inParams = args.slice(0, 7); // Solo los 7 parámetros IN
    const data = await callSP('spSetAsignacion', inParams, true); // true para hasOutParam
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetAsignacion error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;