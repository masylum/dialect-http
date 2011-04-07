/*
 * dialect-http
 * Copyright(c) Pau Ramon <masylum@gmail.com>
 * (MIT Licensed)
 */

require('colors');

var DIALECT_HTTP = {},
    express = require('express'),
    connect_auth = require('connect-auth'),
    dialect = require('../../dialect'),

    _lib_path = require('path').join(__dirname, '..', 'lib'),
    _controllers_path = require('path').join(_lib_path, 'controllers'),
    _utils = require(_lib_path + '/utils'),
    _usage = 'Usage:'.bold + ' dialect-http [options]\n' +
             'Options'.bold + ':\n' +
             '  -c, --config PATH    Config file path\n' +
             '  -v, --version        Output version number\n' +
             '  -h, --help           Display help information\n',

    _version = '0.9.0',
    _args = process.argv.slice(2),

    _generateRandomSecret = function () {
      var s = '',
          randomChar = function () {
            var n = Math.floor(Math.random() * 62);
            return (n < 10 ? n : String.fromCharCode(n + (n < 36 ? 55 : 61)));
          };

      while (s.length < 20) {
        s += randomChar();
      }

      return s;
    },

    _authenticateStrategy = function (options) {
      return function (req, res, callback) {
        var STRATEGY = {name: 'form'},

            failed_validation = function (req, res, uri) {
              res.redirect('/auth/form?redirect_url=' + uri, 303);
            },

            validate_credentials = function (scope, req, res, callback) {
              console.log(options.users);
              var user = options.users.some(function (user) {
                return user.username === req.param('username') && user.password === req.param('password');
              });
              console.log(user);

              if (user) {
                scope.success(user, callback);
              } else {
                scope.fail(callback);
              }
            };

        STRATEGY.authenticate = function (req, res, callback) {
          console.log(req);
          if (req.param('username') && req.param('password')) {
            validate_credentials(this, req, res, callback);
          } else {
            failed_validation(req, res, req.url);
          }
        };

        return STRATEGY;
      };
    };

DIALECT_HTTP.options = {
  title: 'dialect-http',
  users: [
    {
      username: 'admin',
      password: 'admin'
    }
  ],
  port: 3001,
  dialect: {
    locales: ['en', 'es', 'de', 'fr', 'pt'],
    store: {mongodb: {}}
  }
};

DIALECT_HTTP.app = express.createServer();
DIALECT_HTTP.dialect = dialect.dialect(DIALECT_HTTP.options.dialect);

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
      dialect = DIALECT_HTTP.dialect,
      options = DIALECT_HTTP.options,
      express_dialect = {dynamic_helpers: {}};

  app.configure(function () {
    app.use(express.favicon());
    app.set('views', _lib_path + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    app.use(express.session({
      cookie: {maxAge: 60000 * 20}, // 20 minutes
      secret: _generateRandomSecret(),
      store: require('connect-mongodb')(options.dialect.store.mongodb)
    }));

    app.use(express['static'](_lib_path + '/public'));
    app.use(connect_auth([_authenticateStrategy(options)]));
    app.use(app.router);

  });

  app.helpers(require(_lib_path + '/helpers/helpers')({dialect: dialect, title: options.title}));
  app.dynamicHelpers(require(_lib_path + '/helpers/dynamic'));

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

// parse options
while (_args.length) {
  var arg = _args.shift();

  switch (arg) {
  case '-h':
  case '--help':
    console.log(_usage);
    process.exit(1);
    break;
  case '-v':
  case '--version':
    console.log(_version);
    process.exit(1);
    break;
  case '-c':
  case '--config':
    arg = _args.shift();
    if (arg) {
      DIALECT_HTTP.options = _utils.merge(DIALECT_HTTP.options, require(arg));
    } else {
      throw Error('--config requires an path');
    }
    break;
  default:
    console.log('`' + arg + '`'.yellow + ' is not a valid option'.red);
    console.log(_usage);
    process.exit(1);
  }
}

DIALECT_HTTP.run();
