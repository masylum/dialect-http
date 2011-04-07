module.exports = function (DIALECT_HTTP) {
  var app = DIALECT_HTTP.app,
      dialect = DIALECT_HTTP.dialect,
      options = DIALECT_HTTP.options,
      title = options.title + ' | ',
      authenticate = DIALECT_HTTP.authenticate;

  app.get('/:locale/:page?', authenticate, function (req, res) {
    var funk = require('funk')(),
        results_per_page = 30,
        query = {locale: req.param('locale')};

    dialect.store.collection.find(
      query,
      {skip: (req.param('page') - 1) * results_per_page, limit: results_per_page},
      function (err, cursor) {
        cursor.toArray(funk.result('translations'));
      }
    );

    dialect.store.count(query, funk.result('count'));
    dialect.store.count(
      {locale: req.param('locale'), approved: true},
      funk.result('count_ok')
    );
    dialect.store.count(
      {locale: req.param('locale'), translation: {'$ne': null}, approved: false},
      funk.result('count_pending')
    );

    funk.parallel(function () {
      var paginator = require('paginate-js')({
        elements_per_page: results_per_page,
        count_elements: this.count
      });

      res.render('locale', {
        title: title + 'Translate ' + req.param('locale'),
        translations: this.translations || [],
        count: this.count,
        count_pending: this.count_pending,
        paginator: paginator.render({url: '/' + req.param('locale') + '/%N', page: req.param('page')}),
        page: req.param('page'),
        count_ok: this.count_ok,
        category: 'All',
        locale: req.param('locale')
      });
    });
  });


  app.get('/:locale/translated', authenticate, function (req, res) {
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


  app.get('/:locale/untranslated', authenticate, function (req, res) {
    dialect.store.get({locale: req.param('locale'), translation: null}, function (error, translations) {
      res.render('locale', {
        title: title + 'Untranslated ' + req.param('locale'),
        translations: translations,
        category: 'Untranslated',
        locale: req.param('locale')
      });
    });
  });


  app.post('/:locale/translate', authenticate, function (req, res) {
    dialect.store.collection.update(
      {original: req.param('original'), locale: req.param('locale')},
      {'$set': {translation: req.param('translation') ? req.param('translation') : null, locale: req.param('locale')}},
      {upsert: true},
      function () {
        res.writeHead(200);
        res.end('ok');
      }
    );
  });

};
