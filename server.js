require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { auth, requiresAuth } = require('express-openid-connect');
const cons = require('consolidate');
const path = require('path');
const ExpressOIDC  = require('@okta/oidc-middleware').ExpressOIDC;

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
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};


let oidc = new ExpressOIDC({
  issuer: process.env.ISSUER_BASE_URL + '/',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
  appBaseURL: process.env.BASE_URL || 'http://localhost:3000',
  routes: { callback: {defaultRedirect: process.env.REDIRECT_URI } },
  scope: 'openid profile'
});

// monta las rutas de login/logout/callback
app.use(auth(config));

app.use(session({
  secret: process.env.SECRET,
  cookie: { httpOnly: true },
}));

app.use(oidc.router);

// Rutas
app.get('/', (req, res) => {
  
  if (req.oidc.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  res.render('index');
});

app.get('/dashboard', requiresAuth(), (req, res) => {

  var payload = Buffer.from(req.appSession.id_token.split('.')[1], 'base64').toString('utf-8');
  const userInfo = JSON.parse(payload);


  res.render('dashboard', { user: userInfo });
});


const openid = require('openid-client');
openid.Issuer.defaultHttpOptions.timeout = 20000;

// levantar servidor
const PORT = process.env.PORT || 3000;

oidc.on('ready', () => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});

oidc.on('error', err => {
  console.error('OIDC error: ', err);
});
