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
app.use('/static', express.static('static'));

// configuración de Auth0 (lee desde .env)
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

// monta las rutas de login/logout/callback
app.use(auth(config));

// Rutas
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('index');
});

app.get('/dashboard', requiresAuth(), (req, res) => {
  const user = req.oidc.user;
  res.render('dashboard', { user: user });
});

// levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});