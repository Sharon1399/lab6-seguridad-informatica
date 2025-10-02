require('dotenv').config();

const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const cons = require('consolidate');
const path = require('path');

const app = express();

// Motor de vistas
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// Archivos estáticos
app.use('/static', express.static('static'));

// Configuración de Auth0 CORREGIDA
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
};

// Middleware de Auth0
app.use(auth(config));

// Rutas
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('index');
});

app.get('/dashboard', requiresAuth(), (req, res) => {
  // Acceder al usuario de forma correcta
  const user = req.oidc.user;
  res.render('dashboard', { 
    user: {
      email: user.email,
      nickname: user.nickname || user.name,
      name: user.name
    }
  });
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${process.env.BASE_URL}`);
});
