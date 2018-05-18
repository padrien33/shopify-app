/* eslint no-console: 0 */
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const path = require('path');
const ejs = require('ejs');
const logger = require('morgan');
require('isomorphic-fetch') ;

const ShopifyAPIClient = require('shopify-api-node');
const ShopifyExpress = require('@shopify/shopify-express');
const { MemoryStrategy } = require('@shopify/shopify-express/strategies');

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
} = process.env;

const registerWebhook = function registerWebhook(shopDomain, accessToken, webhook) {
  const shopify = new ShopifyAPIClient({ shopName: shopDomain, accessToken });
  shopify.webhook.create(webhook).then(
    () => console.log(`webhook '${webhook.topic}' created`),
    err => console.log(`Error creating webhook '${webhook.topic}'. ${JSON.stringify(err.response.body)}`),
  );
};

const shopifyConfig = {
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,
  scope: ['write_orders, write_products'],
  shopStore: new MemoryStrategy(),
  afterAuth(request, response) {
    const { session: { accessToken, shop } } = request;

    registerWebhook(shop, accessToken, {
      topic: 'orders/create',
      address: `${SHOPIFY_APP_HOST}/order-create`,
      format: 'json',
    });

    return response.redirect('/');
  },
};

const app = express();
const isDevelopment = NODE_ENV !== 'production';

const viewPath = isDevelopment ? '../public/' : '../build/';
app.set('views', path.join(__dirname, viewPath));
app.set('view engine', 'html');
ejs.delimiter = '?';
app.engine('html', ejs.renderFile);
app.use(logger('dev'));
app.use(session({
  store: isDevelopment ? undefined : new RedisStore(),
  secret: SHOPIFY_APP_SECRET,
  resave: true,
  saveUninitialized: false,
}));

// Run webpack hot reloading in dev

const buildPath = path.resolve(__dirname, '../build');
const staticPath = path.resolve(__dirname, '../build/static');
app.use('/build', express.static(buildPath));
app.use('/static', express.static(staticPath));

// Install
app.get('/install', (req, res) => res.render('install'));

// Create shopify middlewares and router
const shopify = ShopifyExpress(shopifyConfig);

// Mount Shopify Routes
const { routes, middleware } = shopify;
const { withShop, withWebhook } = middleware;

app.use('/shopify', routes);

// Client
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/service-worker.js'));
});

app.post('/order-create', withWebhook((error, request) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log('We got a webhook!');
  console.log('Details: ', request.webhook);
  console.log('Body:', request.body);
}));


app.get('/*', withShop({ authBaseUrl: 'shopify' }), (request, response) => {
  const { session: { shop, accessToken } } = request;
  response.render('index', {
    title: 'Shopify Node App',
    apiKey: shopifyConfig.apiKey,
    isDevelopment,
    shop,
  });
});

// Error Handlers
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((error, request, response, next) => {
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  response.status(error.status || 500);
  response.render('error');
});

module.exports = app;
