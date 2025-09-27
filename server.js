require('dotenv').config();

const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const cons = require('consolidate');
const path = require('path');

const app = express();

// motor de vistas (swig via consolidate)
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// archivos estáticos
app.use('/static', express.static(path.join(__dirname, 'static')));

// configuración de Auth0 (lee desde .env)
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
};

// monta las rutas de login/logout/callback
app.use(auth(config));

// Rutas
app.get('/', (req, res) => {
  // pasamos isAuthenticated y user a la vista por conveniencia
  res.render('index', {
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user || {}
  });
});

app.get('/dashboard', requiresAuth(), (req, res) => {
  res.render('dashboard', { user: req.oidc.user });
});

// levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
