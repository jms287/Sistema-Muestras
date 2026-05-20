const express = require('express');
const { callSP } = require('../utils/sp');
const { requireRoles, ROLE } = require('../utils/auth');
const router = express.Router();

async function assertSolicitantePruebaAccess(req, args) {
  const role = Number(req.user?.id_rol_usuario);
  if (role !== ROLE.SOLICITANTE) return { ok: true };

  const userId = Number(req.user?.id_usuario);
  const idPrueba = args[0];
  const idMuestra = args[2];

  const resolveMuestraId = async () => {
    if (idMuestra) return idMuestra;
    if (!idPrueba) return null;
    const pruebaData = await callSP('spGetPrueba', [
      idPrueba, null, null, null, null, null, null, null, null, null,
    ]);
    const prueba = Array.isArray(pruebaData) ? pruebaData[0] : null;
    return prueba?.id_muestra || null;
  };

  const muestraId = await resolveMuestraId();
  if (!muestraId) return { ok: false, status: 403, message: 'No autorizado' };

  const muestraData = await callSP('spGetMuestra', [
    muestraId, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null,
  ]);
  const muestra = Array.isArray(muestraData) ? muestraData[0] : null;
  if (!muestra || Number(muestra.id_solicitante_muestra) !== userId) {
    return { ok: false, status: 403, message: 'No autorizado' };
  }

  return { ok: true };
}


router.post('/prueba/get', requireRoles([ROLE.ADMIN, ROLE.REGISTRADOR, ROLE.ANALISTA, ROLE.EVALUADOR, ROLE.SOLICITANTE]), async (req, res) => {
  try {
    const args = req.body?.args || [];
    const access = await assertSolicitantePruebaAccess(req, args);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }
    const data = await callSP('spGetPrueba', args);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spGetPrueba error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/prueba/set', requireRoles([ROLE.ADMIN, ROLE.ANALISTA, ROLE.EVALUADOR]), async (req, res) => {
  try {
    const data = await callSP('spSetPrueba', req.body?.args || []);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('spSetPrueba error:', err);
    res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;