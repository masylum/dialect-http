var fs = require('fs'),
    express = require('express'),
    connect = require('connect'),
    auth = require('connect-auth'),
    i18n = require('connect-i18n'),
    utils = require('./utils'),
    Dialect = require('dialect');

module.exports = function (options, callback) {
  var app = express.createServer(),
      express_dialect = {dynamic_helpers: {}},
      dialect = null;

  options = options || {};

  // Instantiate a dialect object
  dialect = Dialect.dialect({
    path: options.path,
    base_locale: options.base_locale || 'en',
    locales: options.locales || ['en', 'es']
  });

  // Attach i18n to the parent app
  if (options.app) {
    options.app.use(i18n({}, function (req_locales) {
      var locales = utils.intersect(req_locales, dialect.config('locales'));
      if (locales.length !== 0) {
        dialect.config('current_locale', locales[0]);
      } else {
        dialect.config('current_locale', dialect.config('base_locale'));
      }
    }));
  }

  app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(connect.bodyDecoder());
    app.use(connect.compiler({src: './public/stylesheets', dest: '/public', enable: ['less'], autocompile: true}));
    app.use(connect.staticProvider('./public'));
    app.use(connect.cookieDecoder());
    app.use(connect.session());
    app.use(connect.staticProvider(__dirname + '/public'));

    // auth
    app.use(auth([auth.Basic({validatePassword: function (username, password, cool, fail) {
      if (username === (options.username || 'admin') && password === (options.password || 'admin')) {
        cool();
      } else {
        fail();
      }
    }})]));

    app.use(app.router);
  });

  app.helpers(require('./helpers/helpers')({dialect: dialect, title: options.title}));
  app.dynamicHelpers(require('./helpers/dynamic'));

  require('./app')(app, dialect, options);

  // Configure and open the store
  Dialect.store({store: options.store, database: options.database}, function (error, store) {
    dialect.config('store', store);

    dialect.regenerateJSON(function () {

      // Expose Helper t()
      express_dialect.dynamic_helpers[options.helper || 't'] = function (req, res) {
        var locales = utils.intersect(req.locales, dialect.config('locales'));

        if (locales) {
          dialect.config('current_locale', locales[0]);
        }

        return function (str) {
          return dialect.getTranslation(str);
        };
      };

      // Expose app
      express_dialect.app = app;

      // Expose dialect
      express_dialect.dialect = dialect;

      callback(null, express_dialect);
    });
  });
};
