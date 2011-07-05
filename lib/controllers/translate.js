module.exports = function (DIALECT_HTTP) {
  var app = DIALECT_HTTP.app,
      dialect = DIALECT_HTTP.dialect,
      options = DIALECT_HTTP.options,
      title = options.title + ' | ',
      ObjectID = dialect.store.db.bson_serializer.ObjectID,
      results_per_page = 30,
      authenticate = DIALECT_HTTP.authenticate;

  app.get('/:locale/all/:page?', authenticate, function (req, res) {
    var funk = require('funk')(),
        locale = req.param('locale'),
        query = {locale: locale},
        authorized_locales = app.dynamicViewHelpers.authorized_locales(req, res),
        check_locale = function (el) {
          return el === locale;
        };

    if (authorized_locales.some(check_locale)) {
      dialect.store.collection.find(
        query,
        {skip: (req.param('page') - 1) * results_per_page, limit: results_per_page},
        function (err, cursor) {
          cursor.toArray(funk.result('translations'));
        }
      );
      dialect.store.count(query, funk.result('count'));
      dialect.store.count({locale: locale, translation: {'$ne': null}, approved: true}, funk.result('count_ok'));
      dialect.store.count({locale: locale, translation: {'$ne': null}, approved: false}, funk.result('count_pending'));
      dialect.store.count({locale: locale, translation: null}, funk.result('count_missing'));

      funk.parallel(function () {
        var paginator = require('paginate-js')({elements_per_page: results_per_page, count_elements: this.count});

        res.render('locale', {
          title: title + 'Translate ' + req.param('locale'),
          translations: this.translations || [],
          count: this.count,
          count_pending: this.count_pending,
          count_missing: this.count_missing,
          paginator: paginator.render({url: '/' + req.param('locale') + '/%N', page: req.param('page')}),
          page: req.param('page'),
          count_ok: this.count_ok,
          category: 'All',
          locale: req.param('locale')
        });
      });
    } else {
      req.flash('error', "You don't have acces to the locale `" + locale + "`");
      res.redirect('/');
    }
  });


  ['ok', 'pending', 'missing'].forEach(function (el) {
    app.get('/:locale/' + el + '/:page?', authenticate, function (req, res) {
      var funk = require('funk')(),
          locale = req.param('locale'),
          query = {locale: locale},
          authorized_locales = app.dynamicViewHelpers.authorized_locales(req, res),
          check_locale = function (el) {
            return el === locale;
          };


      if (authorized_locales.some(check_locale)) {

        query.translation = (el === 'missing' ? null : {'$ne': null});
        if (el !== 'missing') {
          query.approved = (el === 'ok');
        }

        dialect.store.collection.find(
          query,
          {skip: (req.param('page') - 1) * results_per_page, limit: results_per_page},
          function (err, cursor) {
            cursor.toArray(funk.result('translations'));
          }
        );
        dialect.store.count({locale: locale}, funk.result('count'));
        dialect.store.count({locale: locale, translation: {'$ne': null}, approved: true}, funk.result('count_ok'));
        dialect.store.count({locale: locale, translation: {'$ne': null}, approved: false}, funk.result('count_pending'));
        dialect.store.count({locale: locale, translation: null}, funk.result('count_missing'));

        funk.parallel(function () {
          var paginator = require('paginate-js')({elements_per_page: results_per_page, count_elements: this.count});

          res.render('locale', {
            title: title + 'Translate ' + req.param('locale'),
            translations: this.translations || [],
            count: this.count,
            paginator: paginator.render({url: '/' + req.param('locale') + '/' + el + '/%N', page: req.param('page')}),
            page: req.param('page'),
            category: el,
            locale: req.param('locale'),
            count_pending: this.count_pending,
            count_missing: this.count_missing,
            count_ok: this.count_ok
          });
        });
      } else {
        req.flash('error', "You don't have acces to the locale `" + locale + "`");
        res.redirect('/');
      }
    });
  });


  app.post('/:locale/translate', authenticate, function (req, res) {
    dialect.store.collection.update(
      {_id: ObjectID.createFromHexString(req.param('id'))},
      {'$set': {
        translation: req.param('translation') ? req.param('translation') : null,
        locale: req.param('locale'),
        approved: false
      }},
      {upsert: true},
      function () {
        res.writeHead(200);
        res.end('ok');
      }
    );
  });


  app.post('/:locale/approve', authenticate, function (req, res) {
    if (app.dynamicViewHelpers.can_approve(req, res)) {
      dialect.store.collection.update(
        {_id: ObjectID.createFromHexString(req.param('id'))},
        {'$set': {approved: req.param('approved') === 'true'}},
        {upsert: false},
        function () {
          res.writeHead(200);
          res.end('ok');
        }
      );
    } else {
      res.writeHead(403);
      res.end('you are not authorized to perform that operation');
    }
  });
  
  app.post("/:locale/delete", authenticate, function (req, res) {
    if (app.dynamicViewHelpers.can_approve(req, res)) {
      dialect.store.collection.remove(
        {_id: ObjectID.createFromHexString(req.param('id'))},
        function () {
          res.writeHead(200);
          res.end('ok');
        }
      );
    } else {
      res.writeHead(403);
      res.end('you are not authorized to perform that operation');
    }
  });

};
