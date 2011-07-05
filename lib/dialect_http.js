var DIALECT_HTTP = {},
    express = require('express'),
    connect_auth = require('connect-auth'),
    mongodb = require('mongodb'),

    _lib_path = require('path').join(__dirname, '..', 'lib'),
    _controllers_path = require('path').join(_lib_path, 'controllers'),

    _authenticateStrategy = function (options) {
      var STRATEGY = {name: 'form'},

          failed_validation = function (req, res, uri) {
            res.redirect('/auth/form?redirect_url=' + uri, 303);
          },

          validate_credentials = function (scope, req, res, callback) {
            var user = options.users.filter(function (user) {
              return user.username === req.param('username') && user.password === req.param('password');
            });

            if (user) {
              scope.success(user[0], callback);
            } else {
              scope.fail(callback);
            }
          };

      STRATEGY.authenticate = function (req, res, callback) {
        if (req.param('username') && req.param('password')) {
          validate_credentials(this, req, res, callback);
        } else {
          failed_validation(req, res, req.url);
        }
      };

      return STRATEGY;
    };

// Default options
DIALECT_HTTP.options = {
  title: 'dialect-http',
  session: {
    secret: 'jimi-hendrix-drinks-hendricks-with-cucumber',
    cookie: {maxAge: 60000 * 20} // 20 minutes
  },
  users: [
    {
      username: 'admin',
      password: 'admin'
    }
  ],
  port: 3001,
  dialect: {
    locales: ['en', 'es', 'de', 'fr', 'pt'],
    store: {mongodb: {database: 'dialect'}}
  }
};

DIALECT_HTTP.app = express.createServer();
DIALECT_HTTP.dialect = {};

DIALECT_HTTP.authenticate = function (req, res, next) {
  if (req.session.auth && req.session.auth.user) {
    req.user = req.session.auth.user;
    next();
  } else {
    req.flash('error', 'Please, login');
    res.redirect('/public/users/login?redirect_url=' + req.url, 303);
  }
};

DIALECT_HTTP.run = function () {
  var app = DIALECT_HTTP.app,
      options = DIALECT_HTTP.options,
      dialect = DIALECT_HTTP.dialect = require('dialect').dialect(options.dialect),
      mongo_server = new mongodb.Server(
        options.dialect.store.mongodb.host || 'localhost'
      , options.dialect.store.mongodb.port || 27017
      , {auto_reconnect: true}
      ),
      db_connector = new mongodb.Db(options.dialect.store.mongodb.database, mongo_server, {});

  app.configure(function () {
    app.use(express.favicon());
    app.set('views', _lib_path + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    app.use(express.session({
      cookie: options.session.cookie,
      secret: options.session.secret,
      store: new require('connect-mongodb')({db: db_connector})
    }));

    app.use(express['static'](_lib_path + '/public'));
    app.use(connect_auth([_authenticateStrategy(options)]));
    app.use(app.router);

  });

  app.helpers(require(_lib_path + '/helpers/helpers')({dialect: dialect, title: options.title}));
  app.dynamicHelpers(require(_lib_path + '/helpers/dynamic')(DIALECT_HTTP));

  // Controllers
  require(_controllers_path + '/app')(DIALECT_HTTP);
  require(_controllers_path + '/auth')(DIALECT_HTTP);
  require(_controllers_path + '/translate')(DIALECT_HTTP);

  console.log('Setting up the store ...'.grey);

  dialect.connect(function (error, data) {
    if (error) {
      return console.error(('Error connecting to the dialect store: "' + error.message + '"').red);
    }
    app.listen(options.port);
    console.log('Listening port '.green + (options.port).toString().yellow);
  });
};

module.exports = DIALECT_HTTP;
