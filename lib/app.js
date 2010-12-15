module.exports = function (app, dialect, options) {
  var title = options.title + ' | ',
      authenticate = function (req, res, next) {
        req.authenticate(['basic'], function (error, authenticated) {
          if (!authenticated) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end("<html><h1>Acces denied</h1></html>");
          } else {
            next();
          }
        });
      };

  app.get('', authenticate, function (req, res) {
    res.render('index', {
      locals: {
        title: 'Edit your translations',
        locale: null
      }
    });
  });

  app.get('/:locale', authenticate, function (req, res) {
    dialect.config('store').get({locale: req.param('locale')}, function (error, translations) {
      dialect.config('store').count({locale: req.param('locale'), translation: {'$ne' : null}}, function (error, count) {
        res.render('locale', {
          locals: {
            title: title + 'Translate ' + req.param('locale'),
            translations: translations,
            count: count,
            category: 'All',
            locale: req.param('locale')
          }
        });
      });
    });
  });

  app.get('/:locale/translated', authenticate, function (req, res) {
    dialect.config('store').get({locale: req.param('locale'), translation: {'$ne': null}}, function (error, translations) {
      res.render('locale', {
        locals: {
          title: title + 'Translated ' + req.param('locale'),
          translations: translations,
          category: 'Translated',
          locale: req.param('locale')
        }
      });
    });
  });

  app.get('/:locale/untranslated', authenticate, function (req, res) {
    dialect.config('store').get({locale: req.param('locale'), translation: null}, function (error, translations) {
      res.render('locale', {
        locals: {
          title: title + 'Untranslated ' + req.param('locale'),
          translations: translations,
          category: 'Untranslated',
          locale: req.param('locale')
        }
      });
    });
  });

  app.post('/:locale/translate', authenticate, function (req, res) {
    dialect.setTranslation(
      {original: req.param('original'), locale: req.param('locale')},
      req.param('translation'),
      function () {
        res.redirect('/' + req.param('locale') + '/');
      }
    );
  });
};
