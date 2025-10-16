const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Monta automáticamente todos los *.routes.js en /routes bajo /api
const routesDir = path.join(__dirname, 'routes');
fs.readdirSync(routesDir)
  .filter(f => f.endsWith('.routes.js'))
  .forEach(f => {
    const router = require(path.join(routesDir, f));
    app.use('/api', router);
  });

module.exports = app;