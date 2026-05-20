const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();

async function assertSolicitanteResultadoAccess(req, args) {
  const role = Number(req.user?.id_rol_usuario);
  if (role !== ROLE.SOLICITANTE) return { ok: true };

  const userId = Number(req.user?.id_usuario);
  const idPrueba = args[0];
  if (!idPrueba) return { ok: false, status: 403, message: 'No autorizado' };

  const pruebaData = await callSP('spGetPrueba', [
    idPrueba, null, null, null, null, null, null, null, null, null,
  ]);
  const prueba = Array.isArray(pruebaData) ? pruebaData[0] : null;
  if (!prueba?.id_muestra) return { ok: false, status: 403, message: 'No autorizado' };

  const muestraData = await callSP('spGetMuestra', [
    prueba.id_muestra, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null,
  ]);
  const muestra = Array.isArray(muestraData) ? muestraData[0] : null;
  if (!muestra || Number(muestra.id_solicitante_muestra) !== userId) {
    return { ok: false, status: 403, message: 'No autorizado' };
  }

  return { ok: true };
}


router.post('/resultado/get', requireRoles([ROLE.ADMIN, ROLE.ANALISTA, ROLE.EVALUADOR, ROLE.SOLICITANTE]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    const access = await assertSolicitanteResultadoAccess(req, args);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }
    const data = await callSP('spGetResultado', args);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetResultado error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/resultado/set', requireRoles([ROLE.ADMIN, ROLE.ANALISTA]), async (req, res) => {
  try {
    const data = await callSP('spSetResultado', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetResultado error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;