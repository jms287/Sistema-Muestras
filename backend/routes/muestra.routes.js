const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();

async function assertSolicitanteMuestraAccess(req, args) {
  const role = Number(req.user?.id_rol_usuario);
  if (role !== ROLE.SOLICITANTE) return { ok: true };

  const userId = Number(req.user?.id_usuario);
  const idMuestra = args[0];
  const idSolicitante = args[2];

  if (idSolicitante) {
    if (Number(idSolicitante) !== userId) {
      return { ok: false, status: 403, message: 'No autorizado' };
    }
    return { ok: true };
  }

  if (idMuestra) {
    const data = await callSP('spGetMuestra', [
      idMuestra, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null,
    ]);
    const muestra = Array.isArray(data) ? data[0] : null;
    if (!muestra || Number(muestra.id_solicitante_muestra) !== userId) {
      return { ok: false, status: 403, message: 'No autorizado' };
    }
    return { ok: true };
  }

  return { ok: false, status: 403, message: 'No autorizado' };
}

router.post('/muestra/get', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR, ROLE.SOLICITANTE]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    const access = await assertSolicitanteMuestraAccess(req, args);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }
    const data = await callSP('spGetMuestra', args);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetMuestra error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/muestra/set', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.EVALUADOR]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    const role = Number(req.user?.id_rol_usuario);
    if (role === ROLE.REGISTRADOR) {
      const operacion = args[0];
      const idUsuarioRegistro = args[22];
      if (operacion === 1 && Number(idUsuarioRegistro) !== Number(req.user?.id_usuario)) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }
    }
    const data = await callSP('spSetMuestra', args);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetMuestra error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;