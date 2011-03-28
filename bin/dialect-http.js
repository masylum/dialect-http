
/*
 * Dialect
 * Copyright(c) Pau Ramon <masylum@gmail.com>
 * (MIT Licensed)
 */

require('colors');

var DIALECT_HTTP = {},
    express = require('express'),
    connect_auth = require('connect-auth'),
    dialect = require('../../dialect'),

    _lib_path = require('path').join(__dirname, '..', 'lib'),
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
    };

DIALECT_HTTP.options = {
  title: 'dialect-http',
  username: 'admin',
  password: 'admin',
  port: 3001,
  dialect: {
    locales: ['en', 'es', 'de', 'fr', 'pt'],
    store: {mongodb: {}}
  }
};

DIALECT_HTTP.app = express.createServer();
DIALECT_HTTP.dialect = dialect.dialect(DIALECT_HTTP.options.dialect);

DIALECT_HTTP.run = function () {
  var app = DIALECT_HTTP.app,
      dialect = DIALECT_HTTP.dialect,
      options = DIALECT_HTTP.options,
      express_dialect = {dynamic_helpers: {}};

  app.configure(function () {
    app.set('views', _lib_path + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    //app.use(express.compiler({
    //  src: _lib_path + '/public/stylesheets',
    //  dest: 'public',
    //  enable: ['less'],
    //  autocompile: true
    //}));
    app.use(express.cookieParser());
    app.use(express.session({secret: _generateRandomSecret()}));
    app.use(express.favicon());
    app.use(express['static'](_lib_path + '/public'));
    app.use(app.router);
    // auth
    //app.use(connect_auth([connect_auth.Basic({validatePassword: function (username, password, cool, fail) {
    //  if (username === options.username && password === options.password) {
    //    cool();
    //  } else {
    //    fail();
    //  }
    //}})]));
  });

  app.helpers(require(_lib_path + '/helpers/helpers')({dialect: dialect, title: options.title}));
  app.dynamicHelpers(require(_lib_path + '/helpers/dynamic'));

  require(_lib_path + '/app')(DIALECT_HTTP);

  console.log('Setting up the store ...'.grey);

  dialect.connect(function (error, data) {
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
