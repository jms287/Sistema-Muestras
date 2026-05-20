const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

const PASSWORD_MIN_LENGTH = Number(process.env.PASSWORD_MIN_LENGTH) || 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOGIN_ATTEMPT_WINDOW_MS = Number(process.env.LOGIN_ATTEMPT_WINDOW_MS) || 15 * 60 * 1000;

const loginAttempts = new Map();

const ROLE = Object.freeze({
  ADMIN: 1,
  REGISTRADOR: 2,
  ANALISTA: 3,
  EVALUADOR: 4,
  SOLICITANTE: 5,
});

function buildKey(email, ip) {
  return `${String(email || '').toLowerCase()}|${ip || ''}`;
}

function recordFailedLogin(email, ip) {
  const key = buildKey(email, ip);
  const now = Date.now();
  const entry = loginAttempts.get(key) || { count: 0, firstAt: now };
  if (now - entry.firstAt > LOGIN_ATTEMPT_WINDOW_MS) {
    entry.count = 0;
    entry.firstAt = now;
  }
  entry.count += 1;
  loginAttempts.set(key, entry);
  return entry.count;
}

function clearLoginAttempts(email, ip) {
  loginAttempts.delete(buildKey(email, ip));
}

function isLoginBlocked(email, ip) {
  const key = buildKey(email, ip);
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > LOGIN_ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_LOGIN_ATTEMPTS;
}

function validatePasswordPolicy(password) {
  if (typeof password !== 'string') {
    return { ok: false, message: 'La contraseña es requerida.' };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return { ok: false, message: 'La contraseña debe incluir mayusculas, minusculas, numeros y un caracter especial.' };
  }
  return { ok: true };
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalido' });
  }
}

function requireRoles(roles) {
  const allowed = Array.isArray(roles) ? roles : [];
  return (req, res, next) => {
    const role = Number(req.user?.id_rol_usuario);
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    return next();
  };
}

module.exports = {
  ROLE,
  validatePasswordPolicy,
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  requireRoles,
  isLoginBlocked,
  recordFailedLogin,
  clearLoginAttempts,
};
