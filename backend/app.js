const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { requestInputValidation } = require('./utils/validation');
const { requireAuth } = require('./utils/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(requestInputValidation);

const publicPaths = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/empresa/get',
  '/api/provincia/get',
  '/api/municipio/get',
]);

app.use((req, res, next) => {
  if (publicPaths.has(req.path)) return next();
  return requireAuth(req, res, next);
});

// Monta automáticamente todos los *.routes.js en /routes bajo /api
const routesDir = path.join(__dirname, 'routes');
fs.readdirSync(routesDir)
  .filter(f => f.endsWith('.routes.js'))
  .forEach(f => {
    const router = require(path.join(routesDir, f));
    app.use('/api', router);
  });

module.exports = app;