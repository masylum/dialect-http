module.exports = function (DIALECT_HTTP) {
  var app = DIALECT_HTTP.app,
      dialect = DIALECT_HTTP.dialect,
      options = DIALECT_HTTP.options,
      title = options.title + ' | ',

      _authenticate = function (req, res, next) {
        //req.authenticate(['basic'], function (error, authenticated) {
        //  if (!authenticated) {
        //    res.writeHead(200, {'Content-Type': 'text/html'});
        //    res.end("<html><h1>Acces denied</h1></html>");
        //  } else {
        //    next();
        //  }
        //});
        next();
      };

  app.get('/', _authenticate, function (req, res) {
    // TODO: Dashboard
    res.render('index', {
      title: title + 'Edit your translations',
      translations: [],
      locale: null
    });
  });

  app.get('/:locale', _authenticate, function (req, res) {
    var funk = require('funk')(),
        query = [{locale: req.param('locale')}, {locale: 'pending-' + req.param('locale')}];

    dialect.store.get({'$or': query}, funk.result('translations'));

    dialect.store.count({'$or': query}, funk.result('count'));
    dialect.store.count(
      {locale: req.param('locale'), translation: {'$ne': null}},
      funk.result('count_ok')
    );
    dialect.store.count(
      {locale: 'pending-' + req.param('locale'), translation: {'$ne': null}},
      funk.result('count_pending')
    );

    funk.parallel(function () {
      res.render('locale', {
        title: title + 'Translate ' + req.param('locale'),
        translations: this.translations || [],
        count: this.count,
        count_pending: this.count_pending,
        count_ok: this.count_ok,
        category: 'All',
        locale: req.param('locale')
      });
    });
  });

  app.get('/:locale/translated', _authenticate, function (req, res) {
    dialect.store.get(
      {locale: req.param('locale'), translation: {'$ne': null}},
      function (error, translations) {
        res.render('locale', {
          title: title + 'Translated ' + req.param('locale'),
          translations: translations,
          category: 'Translated',
          locale: req.param('locale')
        });
      }
    );
  });

  app.get('/:locale/untranslated', _authenticate, function (req, res) {
    dialect.store.get({locale: req.param('locale'), translation: null}, function (error, translations) {
      res.render('locale', {
        title: title + 'Untranslated ' + req.param('locale'),
        translations: translations,
        category: 'Untranslated',
        locale: req.param('locale')
      });
    });
  });

  app.post('/:locale/translate', _authenticate, function (req, res) {
    dialect.set(
      {original: req.param('original'), locale: 'pending-' + req.param('locale')},
      req.param('translation'),
      function () {
        res.writeHead(200);
        res.end('ok');
      }
    );
  });

  app.get('/:locale/autotranslate', _authenticate, function (req, res) {
    dialect.set(
      {original: req.param('original'), locale: req.param('locale')},
      req.param('translation'),
      function () {
        res.writeHead(200);
        res.end('ok');
      }
    );
  });
};
