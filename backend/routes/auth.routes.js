const express = require('express');
const { callSP } = require('../utils/sp');
const {
  validatePasswordPolicy,
  hashPassword,
  verifyPassword,
  signToken,
  isLoginBlocked,
  recordFailedLogin,
  clearLoginAttempts,
} = require('../utils/auth');

const router = express.Router();

function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return user;
  const { password_usuario, ...rest } = user;
  return rest;
}

router.post('/auth/login', async (req, res) => {
  try {
    const { correo_usuario, password_usuario } = req.body || {};
    if (!correo_usuario || !password_usuario) {
      return res.status(400).json({ success: false, message: 'Credenciales invalidas' });
    }

    const ip = req.ip;
    if (isLoginBlocked(correo_usuario, ip)) {
      return res.status(429).json({ success: false, message: 'Demasiados intentos. Intente mas tarde.' });
    }

    const args = [
      null,
      null,
      null,
      correo_usuario,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];

    const data = await callSP('spGetUsuario', args);
    const user = Array.isArray(data) ? data[0] : null;

    if (!user || !user.password_usuario) {
      recordFailedLogin(correo_usuario, ip);
      return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
    }

    const isValid = await verifyPassword(password_usuario, user.password_usuario);
    if (!isValid) {
      recordFailedLogin(correo_usuario, ip);
      return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
    }

    clearLoginAttempts(correo_usuario, ip);
    const safeUser = sanitizeUser(user);
    const token = signToken({
      id_usuario: safeUser.id_usuario,
      correo_usuario: safeUser.correo_usuario,
      id_rol_usuario: safeUser.id_rol_usuario,
    });

    return res.json({ success: true, user: safeUser, token });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const args = Array.isArray(req.body?.args) ? [...req.body.args] : null;
    if (!args) {
      return res.status(400).json({ success: false, message: 'Datos invalidos' });
    }

    const password = args[5];
    const policy = validatePasswordPolicy(password);
    if (!policy.ok) {
      return res.status(400).json({ success: false, message: policy.message });
    }

    const hashed = await hashPassword(password);
    args[5] = hashed;

    const data = await callSP('spSetUsuario', args);
    return res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: 'Error interno', detail: err?.message || String(err) });
  }
});

module.exports = router;
